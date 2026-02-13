const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const app = express();
const PORT = 3333;

// Paths
const SESSIONS_DIR = path.join(process.env.HOME, '.openclaw/agents/main/sessions');
const CRON_FILE = path.join(process.env.HOME, '.openclaw/cron/jobs.json');
const MEMORY_DIR = '/home/node/workspace/memory';
const KNOWLEDGE_DIR = '/home/node/workspace/knowledge';

// Cache
let activityCache = { data: null, timestamp: 0 };
const CACHE_TTL = 30000; // 30 seconds

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ─── Health ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// ─── System Status ─────────────────────────────────
app.get('/api/status', async (req, res) => {
  try {
    const sessions = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
    // Read first session line of most recent session to get model
    let currentModel = 'unknown';
    if (sessions.length > 0) {
      // Sort by mtime desc
      const sorted = sessions
        .map(f => ({ name: f, mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs }))
        .sort((a, b) => b.mtime - a.mtime);
      const latest = sorted[0].name;
      const firstLines = fs.readFileSync(path.join(SESSIONS_DIR, latest), 'utf8').split('\n').slice(0, 5);
      for (const line of firstLines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.type === 'model_change' && obj.modelId) {
            currentModel = obj.modelId;
            break;
          }
        } catch {}
      }
    }

    res.json({
      sessionCount: sessions.length,
      currentModel,
      uptime: process.uptime(),
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.json({ sessionCount: 0, currentModel: 'unknown', uptime: process.uptime(), error: err.message });
  }
});

// ─── Activity Feed ─────────────────────────────────
async function parseSessionFile(filePath) {
  const events = [];
  const sessionId = path.basename(filePath, '.jsonl');

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let sessionModel = 'unknown';
    let sessionTimestamp = null;

    for (const line of lines) {
      if (!line.trim()) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }

      // Track model
      if (obj.type === 'model_change' && obj.modelId) {
        sessionModel = obj.modelId;
      }

      // Session start
      if (obj.type === 'session' && !sessionTimestamp) {
        sessionTimestamp = obj.timestamp;
      }

      // Messages with tool calls
      if (obj.type === 'message' && obj.message) {
        const msg = obj.message;

        // User messages
        if (msg.role === 'user' && msg.content) {
          const textContent = Array.isArray(msg.content)
            ? msg.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
            : typeof msg.content === 'string' ? msg.content : '';
          if (textContent && !textContent.startsWith('[{')) {
            // Trim timestamp prefix like "[Fri 2026-02-06 14:58 EST]"
            let clean = textContent.replace(/^\[.*?\]\s*/, '').substring(0, 200);
            events.push({
              timestamp: obj.timestamp,
              type: 'message',
              subtype: 'user',
              description: `User: ${clean}`,
              model: sessionModel,
              sessionId
            });
          }
        }

        // Assistant messages with tool calls
        if (msg.role === 'assistant' && Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === 'toolCall') {
              const toolName = block.name || 'unknown';
              let desc = '';
              let eventType = 'tool';
              const args = block.arguments || {};

              switch (toolName) {
                case 'exec':
                  eventType = 'exec';
                  desc = `exec: ${(args.command || '').substring(0, 150)}`;
                  break;
                case 'web_search':
                  eventType = 'search';
                  desc = `search: ${args.query || ''}`;
                  break;
                case 'web_fetch':
                  eventType = 'search';
                  desc = `fetch: ${args.url || ''}`;
                  break;
                case 'message':
                  eventType = 'message';
                  desc = `message(${args.action || ''}): ${(args.message || args.text || '').substring(0, 100)}`;
                  break;
                case 'Read':
                  eventType = 'file';
                  desc = `read: ${args.file_path || args.path || ''}`;
                  break;
                case 'Write':
                  eventType = 'file';
                  desc = `write: ${args.file_path || args.path || ''}`;
                  break;
                case 'Edit':
                  eventType = 'file';
                  desc = `edit: ${args.file_path || args.path || ''}`;
                  break;
                case 'browser':
                  eventType = 'search';
                  desc = `browser(${args.action || ''}): ${args.targetUrl || args.url || ''}`;
                  break;
                case 'tts':
                  eventType = 'message';
                  desc = `tts: ${(args.text || '').substring(0, 100)}`;
                  break;
                case 'nodes':
                  eventType = 'exec';
                  desc = `nodes(${args.action || ''}): ${args.node || ''}`;
                  break;
                default:
                  desc = `${toolName}: ${JSON.stringify(args).substring(0, 100)}`;
              }

              events.push({
                timestamp: obj.timestamp,
                type: eventType,
                subtype: toolName,
                description: desc,
                model: sessionModel,
                sessionId
              });
            }
          }

          // Track model from usage
          if (msg.model) {
            sessionModel = msg.model;
          }

          // Track errors
          if (msg.stopReason === 'error') {
            events.push({
              timestamp: obj.timestamp,
              type: 'error',
              subtype: 'error',
              description: `Error in response`,
              model: sessionModel,
              sessionId
            });
          }
        }

        // Tool results with errors
        if (msg.role === 'toolResult' && msg.isError) {
          events.push({
            timestamp: obj.timestamp,
            type: 'error',
            subtype: 'tool_error',
            description: `Error in ${msg.toolName || 'tool'}: ${(Array.isArray(msg.content) ? msg.content.map(c => c.text).join('') : '').substring(0, 150)}`,
            model: sessionModel,
            sessionId
          });
        }
      }
    }
  } catch (err) {
    // Skip unreadable files
  }

  return events;
}

app.get('/api/activity', async (req, res) => {
  try {
    const now = Date.now();
    const forceRefresh = req.query.refresh === 'true';
    const limit = parseInt(req.query.limit) || 200;
    const typeFilter = req.query.type || null;
    const dateFrom = req.query.from || null;
    const dateTo = req.query.to || null;

    if (!forceRefresh && activityCache.data && (now - activityCache.timestamp) < CACHE_TTL) {
      let filtered = activityCache.data;
      if (typeFilter) filtered = filtered.filter(e => e.type === typeFilter);
      if (dateFrom) filtered = filtered.filter(e => e.timestamp >= dateFrom);
      if (dateTo) filtered = filtered.filter(e => e.timestamp <= dateTo);
      return res.json(filtered.slice(0, limit));
    }

    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.lock') && !f.includes('.deleted'))
      .map(f => ({
        name: f,
        path: path.join(SESSIONS_DIR, f),
        mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 20); // Only parse 20 most recent sessions

    let allEvents = [];
    for (const file of files) {
      const events = await parseSessionFile(file.path);
      allEvents = allEvents.concat(events);
    }

    // Sort by timestamp desc
    allEvents.sort((a, b) => {
      if (a.timestamp > b.timestamp) return -1;
      if (a.timestamp < b.timestamp) return 1;
      return 0;
    });

    activityCache = { data: allEvents, timestamp: now };

    let filtered = allEvents;
    if (typeFilter) filtered = filtered.filter(e => e.type === typeFilter);
    if (dateFrom) filtered = filtered.filter(e => e.timestamp >= dateFrom);
    if (dateTo) filtered = filtered.filter(e => e.timestamp <= dateTo);

    res.json(filtered.slice(0, limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Cron Jobs / Calendar ──────────────────────────
app.get('/api/cron', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(CRON_FILE, 'utf8'));
    res.json(data.jobs || []);
  } catch (err) {
    res.json([]);
  }
});

// ─── Search ────────────────────────────────────────
function searchFiles(query, dir, pattern = '*.md') {
  const results = [];
  if (!query || query.length < 2) return results;

  function walkDir(d) {
    try {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(d, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.json')) {
          try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split('\n');
            const lowerQuery = query.toLowerCase();
            let matchCount = 0;
            const matches = [];

            for (let i = 0; i < lines.length; i++) {
              if (lines[i].toLowerCase().includes(lowerQuery)) {
                matchCount++;
                const contextStart = Math.max(0, i - 2);
                const contextEnd = Math.min(lines.length - 1, i + 2);
                matches.push({
                  lineNum: i + 1,
                  line: lines[i],
                  context: lines.slice(contextStart, contextEnd + 1).join('\n')
                });
              }
            }

            if (matchCount > 0) {
              const stat = fs.statSync(fullPath);
              results.push({
                file: fullPath.replace('/home/node/workspace/', ''),
                matchCount,
                matches: matches.slice(0, 10), // Cap matches per file
                mtime: stat.mtimeMs
              });
            }
          } catch {}
        }
      }
    } catch {}
  }

  walkDir(dir);
  return results;
}

app.get('/api/search', (req, res) => {
  const query = req.query.q || '';
  if (query.length < 2) {
    return res.json({ results: [], query });
  }

  const memoryResults = searchFiles(query, MEMORY_DIR);
  const knowledgeResults = searchFiles(query, KNOWLEDGE_DIR);
  const allResults = [...memoryResults, ...knowledgeResults];

  // Sort by match count desc, then recency
  allResults.sort((a, b) => {
    if (b.matchCount !== a.matchCount) return b.matchCount - a.matchCount;
    return b.mtime - a.mtime;
  });

  res.json({ results: allResults.slice(0, 50), query });
});

// ─── Provider API Usage (direct from providers) ────
async function fetchProviderUsage() {
  const results = {};
  const https = require('https');
  const http = require('http');

  function apiGet(url, headers) {
    return new Promise((resolve) => {
      const mod = url.startsWith('https') ? https : http;
      const req = mod.get(url, { headers, timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
          catch { resolve({ status: res.statusCode, data: data }); }
        });
      });
      req.on('error', (e) => resolve({ status: 0, error: e.message }));
      req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    });
  }

  // OpenAI Usage
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      // Get organization usage for current billing period
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      // Try the usage endpoint
      const usage = await apiGet(
        `https://api.openai.com/v1/usage?date=${endDate}`,
        { 'Authorization': `Bearer ${openaiKey}` }
      );
      
      // Also try the billing/usage endpoint  
      const billing = await apiGet(
        `https://api.openai.com/v1/organization/usage/completions?start_time=${Math.floor(new Date(startDate).getTime()/1000)}&end_time=${Math.floor(now.getTime()/1000)}&limit=1`,
        { 'Authorization': `Bearer ${openaiKey}` }
      );

      results.openai = {
        available: true,
        usage: usage.status === 200 ? usage.data : null,
        billing: billing.status === 200 ? billing.data : null,
        key: openaiKey.substring(0, 8) + '...'
      };
    } catch (e) {
      results.openai = { available: false, error: e.message };
    }
  } else {
    results.openai = { available: false, reason: 'no key' };
  }

  // Voyage AI Usage
  const voyageKey = process.env.VOYAGE_API_KEY || (() => {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.openclaw/openclaw.json'), 'utf8'));
      return cfg?.agents?.defaults?.memorySearch?.remote?.apiKey;
    } catch { return null; }
  })();
  if (voyageKey) {
    try {
      const usage = await apiGet(
        'https://api.voyageai.com/v1/usage',
        { 'Authorization': `Bearer ${voyageKey}`, 'Content-Type': 'application/json' }
      );
      results.voyage = {
        available: true,
        usage: usage.status === 200 ? usage.data : null,
        statusCode: usage.status,
        key: voyageKey.substring(0, 8) + '...'
      };
    } catch (e) {
      results.voyage = { available: false, error: e.message };
    }
  } else {
    results.voyage = { available: false, reason: 'no key' };
  }

  // Google/Gemini - check for API key
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) {
    results.gemini = {
      available: true,
      note: 'Gemini usage tracked per-request (no usage dashboard API)',
      key: geminiKey.substring(0, 8) + '...'
    };
  } else {
    results.gemini = { available: false, reason: 'no key' };
  }

  // Anthropic
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) {
    results.anthropic = {
      available: true,
      note: 'Usage tracked in session logs (see model table)',
      key: anthropicKey.substring(0, 8) + '...'
    };
  }

  // xAI
  const xaiKey = process.env.XAI_API_KEY;
  if (xaiKey) {
    results.xai = {
      available: true,
      note: 'Usage tracked in session logs (see model table)',
      key: xaiKey.substring(0, 8) + '...'
    };
  }

  return results;
}

// ─── Token Usage ───────────────────────────────────
app.get('/api/usage', async (req, res) => {
  try {
    const files = fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.lock') && !f.includes('.deleted'))
      .map(f => ({
        name: f,
        path: path.join(SESSIONS_DIR, f),
        mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, 30);

    const usage = {
      byModel: {},
      byDay: {},
      bySession: {},
      totals: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalCost: 0 },
      recentMessages: []
    };

    for (const file of files) {
      try {
        const content = fs.readFileSync(file.path, 'utf8');
        const lines = content.split('\n');
        let sessionModel = 'unknown';

        for (const line of lines) {
          if (!line.trim()) continue;
          let obj;
          try { obj = JSON.parse(line); } catch { continue; }

          if (obj.type === 'model_change' && obj.modelId) {
            sessionModel = obj.modelId;
          }

          if (obj.type === 'message' && obj.message && obj.message.usage) {
            const u = obj.message.usage;
            const model = obj.message.model || sessionModel;
            const ts = obj.timestamp;
            const day = typeof ts === 'number' 
              ? new Date(ts).toISOString().split('T')[0]
              : typeof ts === 'string' ? ts.split('T')[0] : 'unknown';

            const input = u.input || u.inputTokens || 0;
            const output = u.output || u.outputTokens || 0;
            const cacheRead = u.cacheRead || u.cacheReadTokens || 0;
            const cacheWrite = u.cacheWrite || u.cacheWriteTokens || 0;
            const cost = u.cost ? (u.cost.total || 0) : 0;

            // By model
            if (!usage.byModel[model]) {
              usage.byModel[model] = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, calls: 0 };
            }
            usage.byModel[model].input += input;
            usage.byModel[model].output += output;
            usage.byModel[model].cacheRead += cacheRead;
            usage.byModel[model].cacheWrite += cacheWrite;
            usage.byModel[model].cost += cost;
            usage.byModel[model].calls++;

            // By day
            if (!usage.byDay[day]) {
              usage.byDay[day] = { input: 0, output: 0, cost: 0, calls: 0 };
            }
            usage.byDay[day].input += input;
            usage.byDay[day].output += output;
            usage.byDay[day].cost += cost;
            usage.byDay[day].calls++;

            // By session
            const sid = file.name.replace('.jsonl', '').substring(0, 8);
            if (!usage.bySession[sid]) {
              usage.bySession[sid] = { model, input: 0, output: 0, cost: 0, calls: 0 };
            }
            usage.bySession[sid].input += input;
            usage.bySession[sid].output += output;
            usage.bySession[sid].cost += cost;
            usage.bySession[sid].calls++;

            // Totals
            usage.totals.input += input;
            usage.totals.output += output;
            usage.totals.cacheRead += cacheRead;
            usage.totals.cacheWrite += cacheWrite;
            usage.totals.totalCost += cost;

            // Recent (last 50)
            if (usage.recentMessages.length < 50) {
              usage.recentMessages.push({
                timestamp: ts,
                model,
                input,
                output,
                cacheRead,
                cacheWrite,
                cost
              });
            }
          }
        }
      } catch {}
    }

    // Sort recent by timestamp desc
    usage.recentMessages.sort((a, b) => {
      const ta = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
      const tb = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
      return tb - ta;
    });

    // Add provider status
    try {
      usage.providers = await fetchProviderUsage();
    } catch (e) {
      usage.providers = { error: e.message };
    }

    res.json(usage);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Separate provider usage endpoint
app.get('/api/providers', async (req, res) => {
  try {
    const providers = await fetchProviderUsage();
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start ─────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Mission Control running on http://0.0.0.0:${PORT}`);
});
