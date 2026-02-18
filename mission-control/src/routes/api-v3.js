const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const https = require('https');
const { getSessionFiles, parseSessionEvents, parseSessionUsage, SESSIONS_DIR } = require('../lib/session-parser');
const { walkDir, searchFiles } = require('../lib/file-walker');
const Cache = require('../lib/cache');

// ─── Constants ─────────────────────────────────────
const WORKSPACE = '/home/node/workspace';
const KNOWLEDGE_DIR = path.join(WORKSPACE, 'knowledge');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const cache = new Cache(30000); // 30s cache for expensive operations
const cliCache = new Cache(60000); // 60s cache for slow CLI calls

// Cached execSync wrapper for expensive CLI commands (openclaw health, cron list, etc.)
function cachedExec(command, opts = {}) {
  const key = `cli:${command}`;
  const cached = cliCache.get(key);
  if (cached !== null) return cached;
  const result = execSync(command, { encoding: 'utf8', timeout: 15000, ...opts });
  cliCache.set(key, result);
  return result;
}

// ─── Helpers ───────────────────────────────────────
function apiGet(url, headers = {}) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers, timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
  });
}

function sshCommand(host, command) {
  const cached = cache.get(`ssh:${host}:${command}`);
  if (cached) return cached;
  try {
    const result = execSync(`ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${host} "${command}"`,
      { encoding: 'utf8', timeout: 10000 }).trim();
    cache.set(`ssh:${host}:${command}`, result);
    return result;
  } catch (e) {
    return null;
  }
}

function parseMarkdown(content) {
  const meta = { title: '', tags: [], links: [], sections: [], excerpt: '', frontmatter: {} };

  // YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    fm.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)/);
      if (match) {
        const [, key, value] = match;
        meta.frontmatter[key] = value.replace(/^["']|["']$/g, '');
        if (key === 'title') meta.title = meta.frontmatter[key];
        if (key === 'tags') meta.tags = value.match(/\[([^\]]+)\]/)
          ? value.match(/\[([^\]]+)\]/)[1].split(',').map(t => t.trim().replace(/["']/g, ''))
          : [value];
      }
    });
  }

  // Title from first H1 if not in frontmatter
  if (!meta.title) {
    const h1 = content.match(/^#\s+(.+)$/m);
    if (h1) meta.title = h1[1];
  }

  // Wikilinks [[target]]
  const wikilinks = content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
  for (const m of wikilinks) meta.links.push(m[1].trim());

  // Markdown links to local files
  const mdlinks = content.matchAll(/\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)\)/g);
  for (const m of mdlinks) meta.links.push(m[2].replace(/\.md$/, ''));

  // Section headers
  const headers = content.matchAll(/^(#{1,3})\s+(.+)$/gm);
  for (const h of headers) meta.sections.push({ level: h[1].length, title: h[2] });

  // Excerpt: first non-empty, non-header, non-frontmatter paragraph
  const lines = content.replace(/^---\n[\s\S]*?\n---\n?/, '').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('|')) {
      meta.excerpt = trimmed.substring(0, 200);
      break;
    }
  }

  return meta;
}

function parseActiveTasks() {
  try {
    const content = fs.readFileSync(path.join(MEMORY_DIR, 'active-tasks.md'), 'utf8');
    const tasks = [];
    // Split on ## headings (top-level task blocks)
    const taskBlocks = content.split(/^## (?!#)/m).slice(1);

    for (const block of taskBlocks) {
      const lines = block.trim().split('\n');
      const title = lines[0].replace(/\s*\(.*?\)\s*$/, '').trim();
      const task = { title, status: 'active', started: null, priority: null, plan: [], nextStep: '', checklist: [] };

      let currentSection = '';
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();

        // Parse **Key:** value patterns
        if (trimmed.startsWith('**Status:**')) task.status = trimmed.replace('**Status:**', '').trim();
        else if (trimmed.startsWith('**Started:**')) task.started = trimmed.replace('**Started:**', '').trim();
        else if (trimmed.startsWith('**Priority:**')) task.priority = trimmed.replace('**Priority:**', '').trim();
        else if (trimmed.startsWith('**Next:**') || trimmed.startsWith('**Next Step:**')) {
          task.nextStep = trimmed.replace(/\*\*Next(?:\s+Step)?:\*\*/, '').trim();
        }
        // Detect subsections (### Phase, ### Step, etc.)
        else if (trimmed.startsWith('### ')) {
          currentSection = trimmed.replace('### ', '').trim();
        }
        // Checkboxes: - [x] or - [ ]
        else if (/^- \[(x| )\]/.test(trimmed)) {
          const done = trimmed.startsWith('- [x]');
          const text = trimmed.replace(/^- \[.\]\s*/, '').trim();
          task.checklist.push({ text, done, section: currentSection || null });
          // Also add to plan for backward compat
          task.plan.push((done ? '✅ ' : '⬜ ') + text);
        }
        // Regular bullet items in a section
        else if (/^[-*]\s+\d+\./.test(trimmed) || /^[-*]\s+/.test(trimmed)) {
          const text = trimmed.replace(/^[-*]\s+/, '').trim();
          if (text && !text.startsWith('**')) task.plan.push(text);
        }
      }

      // Derive nextStep from first unchecked item if not explicit
      if (!task.nextStep && task.checklist.length) {
        const next = task.checklist.find(c => !c.done);
        if (next) task.nextStep = next.text;
      }

      tasks.push(task);
    }

    return tasks;
  } catch {
    return [];
  }
}

function parseGoals() {
  try {
    const content = fs.readFileSync(path.join(WORKSPACE, 'GOALS.md'), 'utf8');
    const goals = { role: '', projects: [], antiGoals: [], overnightTasks: [] };

    // Extract role - handles both "## My Role\nparagraph" and "### Primary Directive: text"
    const roleMatch = content.match(/##\s*(?:My )?Role\n([\s\S]*?)(?=\n## )/);
    if (roleMatch) {
      // Get first paragraph (strip markdown bold)
      const firstPara = roleMatch[1].trim().split('\n\n')[0].replace(/\*\*/g, '').trim();
      goals.role = firstPara;
    }

    // Extract projects
    const projectsMatch = content.match(/##\s*Active Projects[\s\S]*?((?:###\s+.+[\s\S]*?)+?)(?=##|$)/);
    if (projectsMatch) {
      const projectBlocks = projectsMatch[1].match(/###\s+(.+?)\n([\s\S]*?)(?=###|$)/g);
      if (projectBlocks) {
        projectBlocks.forEach(block => {
          const titleMatch = block.match(/###\s+(.+)/);
          const items = block.match(/^[-*]\s+(.+)$/gm);
          if (titleMatch) {
            goals.projects.push({
              name: titleMatch[1].trim(),
              items: items ? items.map(i => i.replace(/^[-*]\s+/, '').trim()) : []
            });
          }
        });
      }
    }

    // Extract anti-goals
    const antiMatch = content.match(/##\s*Anti-Goals[\s\S]*?((?:[-*]\s+.+\n?)+)/);
    if (antiMatch) {
      goals.antiGoals = antiMatch[1].match(/^[-*]\s+(.+)$/gm)
        .map(line => line.replace(/^[-*]\s+/, '').trim());
    }

    // Extract overnight tasks
    const overnightMatch = content.match(/##\s*Overnight Build Tasks[\s\S]*?((?:[-*]\s+.+\n?)+)/);
    if (overnightMatch) {
      goals.overnightTasks = overnightMatch[1].match(/^[-*]\s+(.+)$/gm)
        .map(line => line.replace(/^[-*]\s+/, '').trim());
    }

    return goals;
  } catch {
    return { role: '', projects: [], antiGoals: [], overnightTasks: [] };
  }
}

function parseOvernightLog(date) {
  try {
    const fileName = date || new Date().toISOString().split('T')[0];
    const content = fs.readFileSync(path.join(MEMORY_DIR, `${fileName}.md`), 'utf8');

    // Parse ALL sections from the daily note
    const sections = [];
    const sectionMatches = content.split(/^## /m).slice(1);
    for (const sec of sectionMatches) {
      const titleEnd = sec.indexOf('\n');
      const title = sec.substring(0, titleEnd).trim();
      const body = sec.substring(titleEnd).trim();
      sections.push({ title, content: body });
    }

    // Extract title from H1
    const h1 = content.match(/^# (.+)$/m);

    return {
      date: fileName,
      title: h1 ? h1[1].trim() : fileName,
      sections,
      wordCount: content.split(/\s+/).length,
      raw: content.length > 10000 ? content.substring(0, 10000) + '...' : content
    };
  } catch {
    return { date: date || new Date().toISOString().split('T')[0], title: '', sections: [], wordCount: 0 };
  }
}

function parseIdentity() {
  try {
    const identity = fs.readFileSync(path.join(WORKSPACE, 'IDENTITY.md'), 'utf8');
    const soul = fs.existsSync(path.join(WORKSPACE, 'SOUL.md'))
      ? fs.readFileSync(path.join(WORKSPACE, 'SOUL.md'), 'utf8') : '';

    const agent = { name: 'Rodaco', model: 'unknown', uptime: process.uptime(), capabilities: [] };

    const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/);
    if (nameMatch) agent.name = nameMatch[1].trim();

    const modelMatch = identity.match(/\*\*Default Model:\*\*\s*(.+)/);
    if (modelMatch) agent.model = modelMatch[1].trim();

    const capMatch = identity.match(/##\s*My Capabilities[\s\S]*?((?:###\s+.+[\s\S]*?)+?)(?=##|$)/);
    if (capMatch) {
      const caps = capMatch[1].match(/###\s+(.+)/g);
      if (caps) agent.capabilities = caps.map(c => c.replace(/###\s+/, '').trim());
    }

    // Extract personality from SOUL.md
    if (soul) {
      const vibeMatch = soul.match(/##\s*Vibe\n\n([\s\S]*?)(?=\n##|$)/);
      if (vibeMatch) agent.personality = vibeMatch[1].trim().replace(/```/g, '');

      // Also extract core truths as traits
      const truthsMatch = soul.match(/##\s*Core Truths\n\n([\s\S]*?)(?=\n##|$)/);
      if (truthsMatch) {
        agent.traits = truthsMatch[1].match(/\*\*([^*]+)\*\*/g)?.map(t => t.replace(/\*\*/g, '')) || [];
      }
    }

    // Roles from IDENTITY.md
    const roleMatches = identity.match(/###\s+(C[A-Z]+)\s*[--]\s*(.+)/g);
    if (roleMatches) {
      agent.roles = roleMatches.map(r => {
        const m = r.match(/###\s+(C[A-Z]+)\s*[--]\s*(.+)/);
        return m ? { title: m[1], description: m[2].trim() } : null;
      }).filter(Boolean);
    }

    return agent;
  } catch {
    return { name: 'Rodaco', model: 'unknown', uptime: process.uptime(), capabilities: [] };
  }
}

// Pricing per 1M tokens (input/output) as of 2026-02
const MODEL_PRICING = {
  // Anthropic Claude — explicit -4-6 / -4-5 variants (startsWith match wins over fuzzy)
  'claude-opus-4-6':   { input: 15.00, output: 75.00, cacheRead: 1.50, cacheWrite: 18.75, unit: '1M tokens' },
  'claude-opus-4-5':   { input: 15.00, output: 75.00, cacheRead: 1.50, cacheWrite: 18.75, unit: '1M tokens' },
  'claude-sonnet-4-6': { input: 3.00,  output: 15.00, cacheRead: 0.30, cacheWrite: 3.75,  unit: '1M tokens' },
  'claude-sonnet-4-5': { input: 3.00,  output: 15.00, cacheRead: 0.30, cacheWrite: 3.75,  unit: '1M tokens' },
  'claude-haiku-3-5':  { input: 0.80,  output: 4.00,  cacheRead: 0.08, cacheWrite: 1.00,  unit: '1M tokens' },
  // Base variants (fuzzy fallback targets)
  'claude-opus-4':   { input: 15.00, output: 75.00, cacheRead: 1.50, cacheWrite: 18.75, unit: '1M tokens' },
  'claude-sonnet-4': { input: 3.00,  output: 15.00, cacheRead: 0.30, cacheWrite: 3.75,  unit: '1M tokens' },
  'claude-haiku-3':  { input: 0.25,  output: 1.25,  cacheRead: 0.03, cacheWrite: 0.30,  unit: '1M tokens' },
  // xAI Grok
  'grok-3':       { input: 3.00,  output: 15.00, cacheRead: 0.75, cacheWrite: 0, unit: '1M tokens' },
  'grok-3-mini':  { input: 0.30,  output: 0.50,  cacheRead: 0.075, cacheWrite: 0, unit: '1M tokens' },
  'grok-2':       { input: 2.00,  output: 10.00, cacheRead: 0, cacheWrite: 0, unit: '1M tokens' },
  // OpenAI
  'gpt-4o':       { input: 2.50,  output: 10.00, cacheRead: 1.25, cacheWrite: 0, unit: '1M tokens' },
  'gpt-4o-mini':  { input: 0.15,  output: 0.60,  cacheRead: 0.075, cacheWrite: 0, unit: '1M tokens' },
  'o3':           { input: 10.00, output: 40.00, cacheRead: 2.50, cacheWrite: 0, unit: '1M tokens' },
  'codex-mini':   { input: 1.50,  output: 6.00,  cacheRead: 0.375, cacheWrite: 0, unit: '1M tokens' },
};

// Match a full model ID string to a pricing entry
function lookupModelPricing(modelId) {
  if (!modelId) return null;
  const id = modelId.toLowerCase();
  // Exact prefix match first (most specific wins)
  for (const [key, pricing] of Object.entries(MODEL_PRICING)) {
    if (id.startsWith(key)) return pricing;
  }
  // Fuzzy keyword match
  if (id.includes('opus'))   return MODEL_PRICING['claude-opus-4'];
  if (id.includes('sonnet')) return MODEL_PRICING['claude-sonnet-4'];
  if (id.includes('haiku'))  return MODEL_PRICING['claude-haiku-3'];
  if (id.includes('grok-3-mini') || id.includes('grok3mini')) return MODEL_PRICING['grok-3-mini'];
  if (id.includes('grok'))   return MODEL_PRICING['grok-3'];
  if (id.includes('o3'))     return MODEL_PRICING['o3'];
  if (id.includes('codex'))  return MODEL_PRICING['codex-mini'];
  if (id.includes('4o-mini') || id.includes('4omini')) return MODEL_PRICING['gpt-4o-mini'];
  if (id.includes('4o') || id.includes('gpt')) return MODEL_PRICING['gpt-4o'];
  return null;
}

function parseModelArsenal() {
  try {
    const identity = fs.readFileSync(path.join(WORKSPACE, 'IDENTITY.md'), 'utf8');
    const models = [];

    const arsenalMatch = identity.match(/##\s*Model Arsenal[\s\S]*?\|(.+)\|[\s\S]*?((?:\|.+\|\n)+)/);
    if (!arsenalMatch) return models;

    const rows = arsenalMatch[2].trim().split('\n').filter(l => l.includes('|'));
    for (const row of rows) {
      if (row.includes('---')) continue;
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 3) {
        const alias = cells[0].replace(/`/g, '');
        const modelId = cells[1];
        const pricing = lookupModelPricing(modelId);
        models.push({
          alias,
          model: modelId,
          bestFor: cells[2].replace(/\*\*/g, ''),
          cost: pricing || { input: 0, output: 0, unit: '1M tokens', unknown: true }
        });
      }
    }

    return models;
  } catch {
    return [];
  }
}

function buildKnowledgeGraph() {
  const cached = cache.get('knowledge-graph');
  if (cached) return cached;

  const nodes = [];
  const edges = [];
  const nodeMap = {};

  const files = walkDir(KNOWLEDGE_DIR, { extensions: ['.md'] });

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const meta = parseMarkdown(content);
      const relPath = file.path.replace(KNOWLEDGE_DIR + '/', '');
      const id = relPath.replace(/\.md$/, '');

      const parts = relPath.split('/');
      const category = parts.length > 1 ? parts[0] : 'root';

      const node = {
        id,
        label: meta.title || file.name.replace('.md', ''),
        category,
        path: relPath,
        tags: meta.tags,
        sections: meta.sections.map(s => s.title),
        excerpt: meta.excerpt,
        links: meta.links,
        size: file.size,
        mtime: file.mtime,
        wordCount: content.split(/\s+/).length
      };

      nodes.push(node);
      nodeMap[id] = node;

      // Index by multiple keys for flexible wikilink resolution
      const baseName = file.name.replace('.md', '');
      if (!nodeMap[baseName]) nodeMap[baseName] = node;
      if (node.label && !nodeMap[node.label]) nodeMap[node.label] = node;
      if (node.label) {
        const lower = node.label.toLowerCase();
        if (!nodeMap[lower]) nodeMap[lower] = node;
        const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!nodeMap[slug]) nodeMap[slug] = node;
      }
      const idParts = id.split('/');
      if (idParts.length >= 2) {
        const dirName = idParts[idParts.length - 2];
        if (!nodeMap[dirName]) nodeMap[dirName] = node;
      }
    } catch {}
  }

  // Build edges from links
  const edgeSet = new Set();
  for (const node of nodes) {
    for (const link of node.links) {
      const target = nodeMap[link] || nodeMap[link.toLowerCase()] ||
        nodeMap[link.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')];
      if (target && target.id !== node.id) {
        const key = [node.id, target.id].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: node.id, target: target.id });
        }
      }
    }
  }

  const graph = { nodes, edges, categories: [...new Set(nodes.map(n => n.category))] };
  cache.set('knowledge-graph', graph);
  return graph;
}

// ─── API v3 Routes ─────────────────────────────────
module.exports = function(app) {
  console.log('📡 Registering Mission Control v3 API endpoints...');

  // CORS for cross-origin frontend access
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/v3')) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
    }
    next();
  });

  // ═══════════════════════════════════════════════════
  // SYSTEM & HEALTH
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/health', (req, res) => {
    console.log('v3/health hit');
    const health = {
      status: 'ok',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    // Container health from /proc
    try {
      const loadAvg = fs.readFileSync('/proc/loadavg', 'utf8').trim().split(' ');
      health.loadAvg = { '1m': parseFloat(loadAvg[0]), '5m': parseFloat(loadAvg[1]), '15m': parseFloat(loadAvg[2]) };
    } catch {}

    try {
      const df = execSync('df -h / | tail -1', { encoding: 'utf8' });
      const parts = df.trim().split(/\s+/);
      health.disk = { total: parts[1], used: parts[2], available: parts[3], usePct: parts[4] };
    } catch {}

    res.json(health);
  });

  app.get('/api/v3/cron-status', async (req, res) => {
    try {
      let jobs = [];

      // Primary: live data from OpenClaw CLI
      try {
        const cronJson = cachedExec('openclaw cron list --json 2>/dev/null || echo "[]"');
        const parsed = JSON.parse(cronJson);
        const jobList = parsed.jobs || parsed || [];

        // Also load cron-status.json for human-written notes
        let notes = {};
        try {
          const cronStatus = JSON.parse(fs.readFileSync(path.join(MEMORY_DIR, 'cron-status.json'), 'utf8'));
          (cronStatus.jobs || []).forEach(j => { if (j.name) notes[j.name] = j.note; });
        } catch {}

        jobs = jobList.map(j => ({
          id: j.id,
          name: j.name,
          schedule: j.schedule?.expr || j.schedule || '',
          timezone: j.schedule?.tz || '',
          lastRun: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
          nextRun: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs).toISOString() : null,
          status: j.state?.lastStatus || 'unknown',
          enabled: j.enabled !== false,
          consecutiveErrors: j.state?.consecutiveErrors || 0,
          note: notes[j.name] || null
        }));
      } catch {
        // Fallback: cron-status.json
        try {
          const cronStatus = JSON.parse(fs.readFileSync(path.join(MEMORY_DIR, 'cron-status.json'), 'utf8'));
          jobs = cronStatus.jobs || [];
        } catch {}
      }

      res.json({ jobs, timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/system-overview', async (req, res) => {
    try {
      const overview = {
        health: { status: 'ok' },
        cronJobs: { total: 0, healthy: 0, failing: 0 },
        activeTaskCount: 0,
        subAgentCount: 0,
        lastBackup: null,
        timestamp: new Date().toISOString()
      };

      // Health check (via CLI - gateway HTTP serves SPA on all routes)
      try {
        const healthJson = cachedExec('openclaw health --json 2>/dev/null');
        const parsed = JSON.parse(healthJson);
        overview.health = { status: parsed.ok ? 'ok' : 'unhealthy', channels: parsed.channels, durationMs: parsed.durationMs };
      } catch {
        overview.health = { status: 'unknown', error: 'health check failed' };
      }

      // Cron jobs
      try {
        const cronStatus = JSON.parse(fs.readFileSync(path.join(MEMORY_DIR, 'cron-status.json'), 'utf8'));
        const jobs = cronStatus.jobs || [];
        overview.cronJobs.total = jobs.length;
        overview.cronJobs.healthy = jobs.filter(j => j.consecutiveErrors === 0).length;
        overview.cronJobs.failing = jobs.filter(j => j.consecutiveErrors > 0).length;
        // Extract last backup time from Daily Backup job
        const backupJob = jobs.find(j => /backup/i.test(j.name));
        if (backupJob && backupJob.lastRun) {
          overview.lastBackup = backupJob.lastRun;
          overview.lastBackupNote = backupJob.note || null;
        }
      } catch {}

      // Active tasks
      try {
        const tasks = parseActiveTasks();
        // Count all tasks (they're all active if they're in the file)
        overview.activeTaskCount = tasks.length;
        overview.activeTasks = tasks.map(t => ({ title: t.title, status: t.status, nextStep: t.nextStep }));
      } catch {}

      // Sub-agents — only count sessions active in last 24h
      try {
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        const allSessions = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl') && !f.includes('.lock') && !f.includes('.deleted'));
        const recentSessions = allSessions.filter(f => {
          try { return fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs > cutoff; } catch { return false; }
        });
        overview.subAgentCount = recentSessions.length;
        overview.subAgentCountTotal = allSessions.length;
      } catch {}

      // Model usage breakdown from recent sessions (last 24h)
      try {
        const recentFiles = getSessionFiles(30);
        const modelMap = {};
        for (const file of recentFiles) {
          const entries = parseSessionUsage(file.path);
          for (const u of entries) {
            if (!u.model) continue;
            if (!modelMap[u.model]) modelMap[u.model] = { calls: 0, cost: 0 };
            modelMap[u.model].calls++;
            modelMap[u.model].cost += u.cost || 0;
          }
        }
        overview.modelBreakdown = Object.entries(modelMap)
          .map(([model, data]) => ({ model, ...data, cost: parseFloat(data.cost.toFixed(4)) }))
          .sort((a, b) => b.calls - a.calls)
          .slice(0, 5); // top 5 models
      } catch {}

      // Last backup (already extracted from cron-status above, this is a fallback)
      if (!overview.lastBackup) {
        try {
          const backupLog = execSync('ls -lt /home/node/workspace/backups/*.tar.gz 2>/dev/null | head -1', { encoding: 'utf8' });
          const match = backupLog.match(/(\w{3}\s+\d+\s+\d+:\d+)/);
          if (match) overview.lastBackup = match[1];
        } catch {}
      }

      res.json(overview);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/device/macbook', async (req, res) => {
    const device = {
      cpu: { model: 'unknown', cores: 0, usagePercent: 0, loadAvg: {} },
      temperature: { celsius: 0, fahrenheit: 0 },
      ram: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
      disk: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
      uptime: 0,
      hostname: 'rogers-macbook-pro',
      fetchedAt: new Date().toISOString()
    };

    const host = 'rogergimbel@100.124.209.59';
    let sshSuccess = false;

    // CPU info
    const cpuModel = sshCommand(host, 'sysctl -n machdep.cpu.brand_string');
    if (cpuModel) { device.cpu.model = cpuModel; sshSuccess = true; }

    const cpuCores = sshCommand(host, 'sysctl -n hw.ncpu');
    if (cpuCores) device.cpu.cores = parseInt(cpuCores);

    // CPU usage via top
    const topOutput = sshCommand(host, "top -l 2 -n 0 | grep 'CPU usage' | tail -1");
    if (topOutput) {
      const match = topOutput.match(/(\d+\.\d+)% user/);
      if (match) device.cpu.usagePercent = parseFloat(match[1]);
    }

    // Load average
    const uptime = sshCommand(host, 'uptime');
    if (uptime) {
      const loadMatch = uptime.match(/load averages?:\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
      if (loadMatch) {
        device.cpu.loadAvg = {
          '1m': parseFloat(loadMatch[1]),
          '5m': parseFloat(loadMatch[2]),
          '15m': parseFloat(loadMatch[3])
        };
      }
      const uptimeMatch = uptime.match(/up\s+(.+?),\s+\d+\s+user/);
      if (uptimeMatch) device.uptime = uptimeMatch[1].trim();
    }

    // Temperature - macOS Intel has no easy temp CLI; report null
    device.temperature = null;

    // RAM
    const vmStat = sshCommand(host, 'vm_stat');
    if (vmStat) {
      const pageSize = 4096;
      const free = (vmStat.match(/Pages free:\s+(\d+)/) || [0, 0])[1];
      const active = (vmStat.match(/Pages active:\s+(\d+)/) || [0, 0])[1];
      const inactive = (vmStat.match(/Pages inactive:\s+(\d+)/) || [0, 0])[1];
      const speculative = (vmStat.match(/Pages speculative:\s+(\d+)/) || [0, 0])[1];
      const wired = (vmStat.match(/Pages wired down:\s+(\d+)/) || [0, 0])[1];

      const freeBytes = (parseInt(free) + parseInt(speculative)) * pageSize;
      const usedBytes = (parseInt(active) + parseInt(inactive) + parseInt(wired)) * pageSize;
      const totalBytes = freeBytes + usedBytes;

      device.ram.totalGB = parseFloat((totalBytes / 1024 / 1024 / 1024).toFixed(2));
      device.ram.usedGB = parseFloat((usedBytes / 1024 / 1024 / 1024).toFixed(2));
      device.ram.availableGB = parseFloat((freeBytes / 1024 / 1024 / 1024).toFixed(2));
      device.ram.usagePercent = parseFloat(((usedBytes / totalBytes) * 100).toFixed(1));
    }

    // Disk (macOS: df -g returns 1G-blocks as integers)
    const df = sshCommand(host, 'df -g /');
    if (df) {
      const lines = df.split('\n');
      if (lines.length > 1) {
        const parts = lines[1].trim().split(/\s+/);
        device.disk.totalGB = parseInt(parts[1]) || 0;
        device.disk.usedGB = parseInt(parts[2]) || 0;
        device.disk.availableGB = parseInt(parts[3]) || 0;
        device.disk.usagePercent = parseInt(parts[4]) || 0;
      }
    }

    device.status = sshSuccess ? 'online' : 'unreachable';
    res.json(device);
  });

  app.get('/api/v3/device/pi', async (req, res) => {
    const device = {
      cpu: { model: 'Raspberry Pi 5', cores: 4, usagePercent: 0, loadAvg: {} },
      temperature: { celsius: 0, fahrenheit: 0 },
      ram: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
      storage: {
        root: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
        docker: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
        media: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 }
      },
      uptime: 0,
      hostname: 'media-pi',
      fetchedAt: new Date().toISOString()
    };

    const host = 'rogergimbel@100.83.169.87';
    let sshSuccess = false;

    // Temperature
    const temp = sshCommand(host, 'vcgencmd measure_temp');
    if (temp) { sshSuccess = true;
      const match = temp.match(/temp=([\d.]+)/);
      if (match) {
        device.temperature.celsius = parseFloat(match[1]);
        device.temperature.fahrenheit = Math.round(device.temperature.celsius * 9/5 + 32);
      }
    }

    // CPU usage via top
    const topOutput = sshCommand(host, "top -bn1 | grep 'Cpu(s)'");
    if (topOutput) {
      const match = topOutput.match(/([\d.]+)\s*us/);
      if (match) device.cpu.usagePercent = parseFloat(match[1]);
    }

    // Load average
    const uptime = sshCommand(host, 'uptime');
    if (uptime) {
      const loadMatch = uptime.match(/load average:\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)/);
      if (loadMatch) {
        device.cpu.loadAvg = {
          '1m': parseFloat(loadMatch[1]),
          '5m': parseFloat(loadMatch[2]),
          '15m': parseFloat(loadMatch[3])
        };
      }
      const uptimeMatch = uptime.match(/up\s+(.+?),\s+\d+\s+user/);
      if (uptimeMatch) device.uptime = uptimeMatch[1].trim();
    }

    // RAM
    const free = sshCommand(host, 'free -m');
    if (free) {
      const lines = free.split('\n');
      const memLine = lines.find(l => l.startsWith('Mem:'));
      if (memLine) {
        const parts = memLine.split(/\s+/);
        device.ram.totalGB = parseFloat((parseInt(parts[1]) / 1024).toFixed(2));
        device.ram.usedGB = parseFloat((parseInt(parts[2]) / 1024).toFixed(2));
        device.ram.availableGB = parseFloat((parseInt(parts[6]) / 1024).toFixed(2));
        device.ram.usagePercent = parseFloat(((parseInt(parts[2]) / parseInt(parts[1])) * 100).toFixed(1));
      }
    }

    // Disk (three drives - use df -BG for numeric gigabytes)
    const df = sshCommand(host, 'df -BG');
    if (df) {
      const parseDfLine = (line) => {
        if (!line) return null;
        const parts = line.trim().split(/\s+/);
        return { totalGB: parseFloat(parts[1]), usedGB: parseFloat(parts[2]), availableGB: parseFloat(parts[3]), usagePercent: parseInt(parts[4]) };
      };
      const lines = df.split('\n');

      const rootLine = lines.find(l => l.match(/\s+\/$/));
      if (rootLine) device.storage.root = parseDfLine(rootLine);

      const dockerLine = lines.find(l => l.includes('/mnt/docker'));
      if (dockerLine) device.storage.docker = parseDfLine(dockerLine);

      const mediaLine = lines.find(l => l.includes('/mnt/media'));
      if (mediaLine) device.storage.media = parseDfLine(mediaLine);
    }

    // Also provide a top-level disk field (use media drive as primary)
    device.disk = device.storage.media || device.storage.root || { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 };
    // Provide drives array for frontend that wants all drives
    device.drives = Object.entries(device.storage).map(([name, data]) => ({ name, mount: name === 'root' ? '/' : `/mnt/${name}`, ...data }));

    device.status = sshSuccess ? 'online' : 'unreachable';
    res.json(device);
  });

  // ═══════════════════════════════════════════════════
  // ACTIVITY FEED
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/activity', (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const files = getSessionFiles(10);
      const events = [];

      for (const file of files) {
        const fileEvents = parseSessionEvents(file.path);
        events.push(...fileEvents);
      }

      events.sort((a, b) => {
        const ta = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
        const tb = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
        return tb - ta;
      });

      const mapped = events.slice(0, limit).map(e => ({
        timestamp: typeof e.timestamp === 'number' ? new Date(e.timestamp).toISOString() : e.timestamp,
        type: e.type,
        subtype: e.subtype,
        summary: e.description,
        source: e.sessionId,
        details: { model: e.model }
      }));

      res.json({ events: mapped, total: events.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════
  // USAGE & COSTS
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/usage', async (req, res) => {
    try {
      const files = getSessionFiles(30);
      const usage = {
        byModel: {},
        byDay: {},
        totals: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalCost: 0 }
      };

      for (const file of files) {
        const entries = parseSessionUsage(file.path);

        for (const u of entries) {
          const day = typeof u.timestamp === 'number'
            ? new Date(u.timestamp).toISOString().split('T')[0]
            : typeof u.timestamp === 'string' ? u.timestamp.split('T')[0] : 'unknown';

          if (!usage.byModel[u.model]) {
            usage.byModel[u.model] = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, calls: 0 };
          }
          usage.byModel[u.model].input += u.input;
          usage.byModel[u.model].output += u.output;
          usage.byModel[u.model].cacheRead += u.cacheRead;
          usage.byModel[u.model].cacheWrite += u.cacheWrite;
          usage.byModel[u.model].cost += u.cost;
          usage.byModel[u.model].calls++;

          if (!usage.byDay[day]) usage.byDay[day] = { input: 0, output: 0, cost: 0 };
          usage.byDay[day].input += u.input;
          usage.byDay[day].output += u.output;
          usage.byDay[day].cost += u.cost;

          usage.totals.input += u.input;
          usage.totals.output += u.output;
          usage.totals.cacheRead += u.cacheRead;
          usage.totals.cacheWrite += u.cacheWrite;
          usage.totals.totalCost += u.cost;
        }
      }

      // Convert byDay from object to sorted array for frontend .slice() compatibility
      usage.byDay = Object.entries(usage.byDay)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      res.json(usage);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/usage/providers', async (req, res) => {
    try {
      const providers = {};

      const keys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'XAI_API_KEY', 'GEMINI_API_KEY', 'VOYAGE_API_KEY'];
      for (const key of keys) {
        const value = process.env[key];
        const provider = key.replace('_API_KEY', '').toLowerCase();
        providers[provider] = {
          available: !!value,
          configured: !!value,
          usage: null,
          // session-level aggregates (calculated from local session files)
          sessionUsage: { input: 0, output: 0, cacheRead: 0, cost: 0, calls: 0 }
        };
      }

      // Aggregate session-level usage by provider
      const files = getSessionFiles(30);
      for (const file of files) {
        const entries = parseSessionUsage(file.path);
        for (const u of entries) {
          const id = (u.model || '').toLowerCase();
          let provider = 'unknown';
          if (id.includes('claude'))  provider = 'anthropic';
          else if (id.includes('grok')) provider = 'xai';
          else if (id.includes('gpt') || id.includes('o3') || id.includes('codex')) provider = 'openai';
          else if (id.includes('gemini')) provider = 'gemini';

          if (!providers[provider]) {
            providers[provider] = { available: false, configured: false, usage: null, sessionUsage: { input: 0, output: 0, cacheRead: 0, cost: 0, calls: 0 } };
          }
          const s = providers[provider].sessionUsage;
          s.input     += u.input;
          s.output    += u.output;
          s.cacheRead += u.cacheRead;
          s.cost      += u.cost;
          s.calls++;
        }
      }

      // Round costs
      for (const p of Object.values(providers)) {
        if (p.sessionUsage) p.sessionUsage.cost = parseFloat(p.sessionUsage.cost.toFixed(4));
      }

      // Try to fetch OpenAI usage
      if (providers.openai && providers.openai.available) {
        const url = 'https://api.openai.com/v1/usage?date=' + new Date().toISOString().split('T')[0];
        const result = await apiGet(url, { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` });
        if (result.status === 200) providers.openai.usage = result.data;
      }

      res.json(providers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════
  // TASKS & GOALS
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/active-tasks', (req, res) => {
    try {
      const tasks = parseActiveTasks();
      res.json({ tasks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/goals', (req, res) => {
    try {
      const goals = parseGoals();
      res.json(goals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/overnight-log', (req, res) => {
    try {
      const date = req.query.date;
      const log = parseOvernightLog(date);
      res.json(log);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/suggested-tasks', (req, res) => {
    try {
      const suggestedPath = path.join(MEMORY_DIR, 'suggested-tasks.json');
      if (!fs.existsSync(suggestedPath)) {
        return res.json({ tasks: [] });
      }
      const data = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));
      res.json({ tasks: data.tasks || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/v3/suggested-tasks/:id/approve', (req, res) => {
    try {
      const taskId = req.params.id;
      const suggestedPath = path.join(MEMORY_DIR, 'suggested-tasks.json');
      const data = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));
      const task = data.tasks.find(t => t.id === taskId);

      if (task) {
        task.status = 'approved';
        task.approvedAt = new Date().toISOString();
        fs.writeFileSync(suggestedPath, JSON.stringify(data, null, 2));
        res.json({ success: true, task });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/v3/suggested-tasks/:id/reject', (req, res) => {
    try {
      const taskId = req.params.id;
      const suggestedPath = path.join(MEMORY_DIR, 'suggested-tasks.json');
      const data = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));
      const task = data.tasks.find(t => t.id === taskId);

      if (task) {
        task.status = 'rejected';
        task.rejectedAt = new Date().toISOString();
        fs.writeFileSync(suggestedPath, JSON.stringify(data, null, 2));
        res.json({ success: true, task });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════
  // AGENT
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/agent', (req, res) => {
    try {
      const agent = parseIdentity();
      res.json(agent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/agent/models', (req, res) => {
    try {
      const models = parseModelArsenal();
      res.json({ models });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/agent/sessions', async (req, res) => {
    try {
      // Use local session files directly (gateway HTTP returns SPA)
      const files = getSessionFiles(50);
      const sessions = files.map(f => {
        const name = f.name.replace('.jsonl', '');
        const isIsolated = name.includes('isolated') || name.includes('cron');
        const age = Date.now() - new Date(f.mtime).getTime();
        const ageStr = age < 60000 ? `${Math.round(age/1000)}s` : age < 3600000 ? `${Math.round(age/60000)}m` : `${Math.round(age/3600000)}h`;
        return {
          key: name,
          file: f.name,
          kind: isIsolated ? 'isolated' : 'main',
          type: isIsolated ? 'isolated' : 'main',
          startedAt: new Date(f.mtime).toISOString(),
          age: ageStr,
          size: f.size || 0
        };
      });
      const recent = sessions.slice(0, 20);
      const active = sessions.filter(s => {
        const age = Date.now() - new Date(s.startedAt).getTime();
        return age < 3600000; // active in last hour
      });
      // Include 'sessions' key for Lovable frontend compatibility
      res.json({ sessions, active, recent, total: sessions.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/agent/cron-jobs', async (req, res) => {
    try {
      // Use CLI (gateway HTTP returns SPA)
      const cronJson = cachedExec('openclaw cron list --json 2>/dev/null || echo "[]"');
      const parsed = JSON.parse(cronJson);
      const jobList = parsed.jobs || parsed || [];
      const jobs = jobList.map(j => ({
        id: j.id,
        name: j.name,
        schedule: j.schedule?.expr || j.schedule || '',
        timezone: j.schedule?.tz || '',
        enabled: j.enabled !== false,
        sessionTarget: j.sessionTarget || 'isolated',
        lastRun: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
        nextRun: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs).toISOString() : null,
        lastStatus: j.state?.lastStatus || 'unknown',
        lastDurationMs: j.state?.lastDurationMs || 0,
        consecutiveErrors: j.state?.consecutiveErrors || 0,
        lastError: j.state?.lastError || null
      }));
      res.json({ jobs });
    } catch (err) {
      // Fallback to cron-status.json
      try {
        const cronStatus = JSON.parse(fs.readFileSync(path.join(MEMORY_DIR, 'cron-status.json'), 'utf8'));
        res.json({ jobs: cronStatus.jobs || [] });
      } catch {
        res.json({ jobs: [] });
      }
    }
  });

  // ═══════════════════════════════════════════════════
  // PROJECTS
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/projects/beerpair', (req, res) => {
    try {
      const project = {
        name: 'BeerPair',
        status: 'active',
        url: 'https://beerpair.com',
        credits: { used: 0, total: 10 },
        testResults: [],
        appStoreStatus: 'in-progress',
        marketingAssets: [],
        techStack: [],
        team: [],
        currentWork: [],
        history: [],
        keyFiles: [],
        description: ''
      };

      // Read from knowledge/projects/beerpair/summary.md
      const summaryPath = path.join(KNOWLEDGE_DIR, 'projects/beerpair/summary.md');
      if (fs.existsSync(summaryPath)) {
        const content = fs.readFileSync(summaryPath, 'utf8');

        // Description
        const descMatch = content.match(/## Description\n([\s\S]*?)(?=\n## )/);
        if (descMatch) project.description = descMatch[1].trim();

        // Phase/Status
        const phaseMatch = content.match(/\*\*Phase\*\*:\s*(.+)/);
        if (phaseMatch) project.status = phaseMatch[1].trim();

        // URL
        const urlMatch = content.match(/\*\*URL\*\*:\s*(https?:\/\/\S+)/);
        if (urlMatch) project.url = urlMatch[1].trim();

        // Credits from MEMORY.md
        const creditsMatch = content.match(/Credits:\s*(\d+)\/(\d+)/);
        if (creditsMatch) {
          project.credits.used = parseInt(creditsMatch[1]);
          project.credits.total = parseInt(creditsMatch[2]);
        }

        // Tech stack
        const techMatch = content.match(/## Tech Stack\n([\s\S]*?)(?=\n## )/);
        if (techMatch) {
          project.techStack = (techMatch[1].match(/^[-*]\s+(.+)$/gm) || [])
            .map(l => l.replace(/^[-*]\s+/, '').trim());
        }

        // Team
        const teamMatch = content.match(/## Team\n([\s\S]*?)(?=\n## )/);
        if (teamMatch) {
          project.team = (teamMatch[1].match(/^[-*]\s+(.+)$/gm) || [])
            .map(l => l.replace(/^[-*]\s+/, '').replace(/\[\[|\]\]/g, '').trim());
        }

        // Current Work
        const workMatch = content.match(/## Current Work\n([\s\S]*?)(?=\n## |$)/);
        if (workMatch) {
          project.currentWork = (workMatch[1].match(/^[-*]\s+(.+)$/gm) || [])
            .map(l => l.replace(/^[-*]\s+/, '').trim());
        }

        // History
        const histMatch = content.match(/## History\n([\s\S]*?)(?=\n## |$)/);
        if (histMatch) {
          project.history = (histMatch[1].match(/^[-*]\s+(.+)$/gm) || [])
            .map(l => {
              const m = l.match(/\[(\d{4}-\d{2}-\d{2})\]\s*(.+)/);
              return m ? { date: m[1], event: m[2].trim() } : { date: null, event: l.replace(/^[-*]\s+/, '').trim() };
            });
        }

        // Key Files
        const filesMatch = content.match(/## Key Files\n([\s\S]*?)(?=\n## |$)/);
        if (filesMatch) {
          project.keyFiles = (filesMatch[1].match(/^[-*]\s+(.+)$/gm) || [])
            .map(l => l.replace(/^[-*]\s+/, '').trim());
        }
      }

      // Marketing assets - list files in beerpair knowledge dir
      const beerDir = path.join(KNOWLEDGE_DIR, 'projects/beerpair');
      if (fs.existsSync(beerDir)) {
        project.marketingAssets = fs.readdirSync(beerDir)
          .filter(f => f !== 'summary.md' && !f.startsWith('.'))
          .map(f => ({
            name: f,
            type: f.endsWith('.png') || f.endsWith('.jpg') ? 'image' :
                  f.endsWith('.pdf') ? 'pdf' :
                  f.endsWith('.md') ? 'document' : 'file',
            path: `knowledge/projects/beerpair/${f}`
          }));
      }

      // Test results from memory files - match broader patterns
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => /^\d{4}-\d{2}-\d{2}/.test(f) && f.endsWith('.md')).sort().reverse().slice(0, 30);
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          // Match various BeerPair test section headers
          const testMatch = content.match(/###?\s*BeerPair.*?Test[\s\S]*?(?=\n##[^#]|\n---|\n\*\*\*|$)/gi);
          if (testMatch) {
            testMatch.forEach(section => {
              const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
              const resultCount = section.match(/(\d+)\s*(?:pairing|result)/i);
              const statusMatch = section.match(/[---]\s*(✅\s*\w+|SUCCESS|FAIL|PASS)/i);
              project.testResults.push({
                date: dateMatch ? dateMatch[1] : 'unknown',
                status: statusMatch ? statusMatch[1].trim() : 'completed',
                resultCount: resultCount ? parseInt(resultCount[1]) : null,
                summary: section.substring(0, 500).trim()
              });
            });
          }
        } catch {}
      }

      res.json(project);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/projects/beerpair/test-results', (req, res) => {
    try {
      const tests = [];
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md')).sort().reverse();

      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const sections = content.match(/##\s*BeerPair Test[\s\S]*?(?=\n##|$)/g);
          if (sections) {
            sections.forEach(section => {
              const test = {
                date: file.replace('.md', ''),
                image: null,
                preference: null,
                resultCount: 0,
                issues: [],
                notes: []
              };

              const imageMatch = section.match(/Image:\s*(.+)/);
              if (imageMatch) test.image = imageMatch[1].trim();

              const resultMatch = section.match(/(\d+)\s+result/);
              if (resultMatch) test.resultCount = parseInt(resultMatch[1]);

              const issuesMatch = section.match(/Issues:([\s\S]*?)(?=\n\*\*|$)/);
              if (issuesMatch) {
                test.issues = issuesMatch[1].match(/^[-*]\s+(.+)$/gm)
                  ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
              }

              tests.push(test);
            });
          }
        } catch {}
      }

      res.json({ tests });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/projects/ocean-one', (req, res) => {
    try {
      const project = {
        name: 'Ocean One Marine',
        status: 'active',
        description: 'General contracting company in South Florida specializing in marine construction (docks, sea walls, boat lifts). Rodaco is building automation solutions for them.',
        industry: 'Marine Construction',
        location: 'South Florida',
        services: ['Docks', 'Sea Walls', 'Boat Lifts'],
        automationGoals: [],
        conversations: [],
        seoFindings: [],
        contentGaps: [],
        expansionNotes: []
      };

      // Read from knowledge/chat-history/ocean-one.md
      const historyPath = path.join(KNOWLEDGE_DIR, 'chat-history/ocean-one.md');
      if (fs.existsSync(historyPath)) {
        const content = fs.readFileSync(historyPath, 'utf8');

        // Parse conversation entries
        const convBlocks = content.split(/^## \d{4}-\d{2}-\d{2}/m).slice(1);
        const dateHeaders = content.match(/^## (\d{4}-\d{2}-\d{2})\s*-\s*(.+)$/gm) || [];
        dateHeaders.forEach((header, i) => {
          const m = header.match(/^## (\d{4}-\d{2}-\d{2})\s*-\s*(.+)$/);
          if (m) {
            const block = convBlocks[i] || '';
            const keyPoints = (block.match(/^[-*]\s+(.+)$/gm) || [])
              .map(l => l.replace(/^[-*]\s+/, '').trim()).filter(l => l.length > 10);
            const msgMatch = block.match(/\*(\d+) messages\*/);
            project.conversations.push({
              date: m[1],
              topic: m[2].trim(),
              messageCount: msgMatch ? parseInt(msgMatch[1]) : null,
              keyPoints: keyPoints.slice(0, 5)
            });
          }
        });

        // SEO section
        const seoMatch = content.match(/##\s*SEO[\s\S]*?((?:[-*]\s+.+\n?)+)/);
        if (seoMatch) {
          project.seoFindings = seoMatch[1].match(/^[-*]\s+(.+)$/gm)
            ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
        }

        // Content Gaps
        const gapsMatch = content.match(/##\s*Content Gaps[\s\S]*?((?:[-*]\s+.+\n?)+)/);
        if (gapsMatch) {
          project.contentGaps = gapsMatch[1].match(/^[-*]\s+(.+)$/gm)
            ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
        }
      }

      // Also check knowledge/companies for Ocean One entity
      const companyPath = path.join(KNOWLEDGE_DIR, 'companies/ocean-one-marine/summary.md');
      if (fs.existsSync(companyPath)) {
        const content = fs.readFileSync(companyPath, 'utf8');
        const descMatch = content.match(/## Description\n([\s\S]*?)(?=\n## )/);
        if (descMatch) project.description = descMatch[1].trim();
      }

      // Check memory files for Ocean One discussions
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => /^\d{4}-\d{2}-\d{2}/.test(f) && f.endsWith('.md')).sort().reverse().slice(0, 30);
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const oceanMatch = content.match(/###?\s*Ocean One[\s\S]*?(?=\n##[^#]|\n---|\n\*\*\*|$)/gi);
          if (oceanMatch) {
            oceanMatch.forEach(section => {
              const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
              project.expansionNotes.push({
                date: dateMatch ? dateMatch[1] : 'unknown',
                note: section.substring(0, 300).trim()
              });
            });
          }
        } catch {}
      }

      res.json(project);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════
  // PROJECT ACTIVITY
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/projects/:projectId/activity', (req, res) => {
    try {
      const projectId = req.params.projectId;
      const limit = parseInt(req.query.limit) || 30;

      // Define search keywords per project
      const keywords = {
        'beerpair': ['beerpair', 'beer pair', 'beer-pair', 'food pairing', 'despia', 'b2b gtm', 'pitch deck', 'sell sheet'],
        'ocean-one': ['ocean one', 'ocean-one', 'oceanone', 'marine construction', 'sea wall', 'boat lift']
      };

      const searchTerms = keywords[projectId] || [projectId.replace(/-/g, ' ')];
      const activities = [];

      // 1. Scan daily memory notes for project mentions
      const memoryFiles = fs.readdirSync(MEMORY_DIR)
        .filter(f => /^\d{4}-\d{2}-\d{2}/.test(f) && f.endsWith('.md'))
        .sort().reverse().slice(0, 30);

      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const lower = content.toLowerCase();
          if (!searchTerms.some(t => lower.includes(t))) continue;

          const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
          const date = dateMatch ? dateMatch[1] : 'unknown';

          // Extract relevant sections (lines near mentions)
          const lines = content.split('\n');
          const mentionLines = [];
          lines.forEach((line, i) => {
            const ll = line.toLowerCase();
            if (searchTerms.some(t => ll.includes(t)) && line.trim().length > 10) {
              // Get the line and its heading context
              let heading = '';
              for (let j = i; j >= 0; j--) {
                if (lines[j].startsWith('#')) { heading = lines[j].replace(/^#+\s*/, ''); break; }
              }
              mentionLines.push({
                text: line.replace(/^[-*]\s+/, '').trim(),
                heading
              });
            }
          });

          // Deduplicate and limit
          const seen = new Set();
          for (const m of mentionLines) {
            if (seen.has(m.text)) continue;
            seen.add(m.text);
            activities.push({
              timestamp: new Date(date + 'T12:00:00Z').toISOString(),
              date,
              type: 'note',
              category: m.heading || 'Daily Note',
              summary: m.text.substring(0, 200),
              source: file
            });
          }
        } catch {}
      }

      // 2. Scan knowledge graph for project history
      const knowledgePaths = [
        path.join(KNOWLEDGE_DIR, `projects/${projectId}/summary.md`),
        path.join(KNOWLEDGE_DIR, `companies/${projectId}/summary.md`),
        path.join(KNOWLEDGE_DIR, `chat-history/${projectId}.md`)
      ];

      for (const kp of knowledgePaths) {
        if (!fs.existsSync(kp)) continue;
        try {
          const content = fs.readFileSync(kp, 'utf8');
          // Find ## History or ## Timeline sections
          const historyMatch = content.match(/##\s*(?:History|Timeline|Milestones)[\s\S]*?(?=\n## [^#]|$)/i);
          if (historyMatch) {
            const bulletLines = historyMatch[0].match(/^[-*]\s+.+$/gm) || [];
            for (const line of bulletLines) {
              const clean = line.replace(/^[-*]\s+/, '').trim();
              const dateInLine = clean.match(/\(?(\d{4}-\d{2}-\d{2})\)?/);
              activities.push({
                timestamp: dateInLine ? new Date(dateInLine[1] + 'T00:00:00Z').toISOString() : new Date().toISOString(),
                date: dateInLine ? dateInLine[1] : 'unknown',
                type: 'milestone',
                category: 'Knowledge Graph',
                summary: clean.substring(0, 200),
                source: path.basename(kp)
              });
            }
          }
        } catch {}
      }

      // 3. Scan recent session events for project mentions
      const sessionFiles = getSessionFiles(10);
      for (const file of sessionFiles) {
        try {
          const events = parseSessionEvents(file.path);
          for (const e of events) {
            const desc = (e.description || '').toLowerCase();
            if (searchTerms.some(t => desc.includes(t))) {
              activities.push({
                timestamp: typeof e.timestamp === 'number' ? new Date(e.timestamp).toISOString() : e.timestamp,
                date: typeof e.timestamp === 'number' ? new Date(e.timestamp).toISOString().split('T')[0] : (e.timestamp || '').split('T')[0],
                type: 'session',
                category: e.type || 'Activity',
                summary: (e.description || '').substring(0, 200),
                source: path.basename(file.path)
              });
            }
          }
        } catch {}
      }

      // Sort by timestamp descending, limit
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      const result = activities.slice(0, limit);

      res.json({ activities: result, total: activities.length, project: projectId });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════
  // KNOWLEDGE
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/knowledge/graph', (req, res) => {
    try {
      const graph = buildKnowledgeGraph();
      res.json(graph);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/knowledge/search', (req, res) => {
    try {
      const query = req.query.q;
      if (!query) return res.status(400).json({ error: 'Query required' });

      const knowledgeResults = searchFiles(query, KNOWLEDGE_DIR);
      const memoryResults = searchFiles(query, MEMORY_DIR);

      const results = [...knowledgeResults, ...memoryResults].map(r => ({
        path: r.file,
        matchCount: r.matchCount,
        snippet: r.matches[0]?.line || '',
        score: r.matchCount,
        mtime: r.mtime
      }));

      res.json({ results });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/knowledge/entity', (req, res) => {
    try {
      let entityPath = req.query.path;
      if (!entityPath) return res.status(400).json({ error: 'path query parameter required' });
      
      // Strip .md extension if provided
      entityPath = entityPath.replace(/\.md$/, '');
      
      let fullPath = path.join(KNOWLEDGE_DIR, entityPath + '.md');

      // Fallback: try with /summary appended, or look for summary.md inside directory
      if (!fs.existsSync(fullPath)) {
        const summaryPath = path.join(KNOWLEDGE_DIR, entityPath, 'summary.md');
        const indexPath = path.join(KNOWLEDGE_DIR, entityPath, 'INDEX.md');
        if (fs.existsSync(summaryPath)) {
          fullPath = summaryPath;
          entityPath = entityPath + '/summary';
        } else if (fs.existsSync(indexPath)) {
          fullPath = indexPath;
          entityPath = entityPath + '/INDEX';
        } else {
          return res.status(404).json({ error: 'Entity not found' });
        }
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const meta = parseMarkdown(content);
      const stat = fs.statSync(fullPath);

      res.json({
        content,
        metadata: {
          ...meta,
          path: entityPath,
          lastModified: stat.mtime,
          size: stat.size
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/knowledge/tree', (req, res) => {
    try {
      function buildTree(dir, depth = 0) {
        if (depth > 5) return null;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const tree = { name: path.basename(dir), type: 'directory', children: [] };

        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            const subtree = buildTree(fullPath, depth + 1);
            if (subtree) tree.children.push(subtree);
          } else if (entry.name.endsWith('.md')) {
            tree.children.push({
              name: entry.name,
              type: 'file',
              path: fullPath.replace(KNOWLEDGE_DIR + '/', '').replace(/\.md$/, '')
            });
          }
        }

        return tree;
      }

      const tree = buildTree(KNOWLEDGE_DIR);
      res.json({ tree });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/knowledge/timeline', (req, res) => {
    try {
      const days = [];
      const memoryFiles = fs.readdirSync(MEMORY_DIR)
        .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
        .sort()
        .reverse()
        .slice(0, 90); // Last 90 days

      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const wordCount = content.split(/\s+/).length;
          const sections = content.match(/^##\s+(.+)$/gm)?.map(h => h.replace(/^##\s+/, '')) || [];

          days.push({
            date: file.replace('.md', ''),
            wordCount,
            sections,
            size: content.length
          });
        } catch {}
      }

      res.json({ days });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════
  // RESEARCH
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/research/openclaw', (req, res) => {
    try {
      const entries = [];
      const researchPath = path.join(MEMORY_DIR, 'openclaw-research.md');

      if (fs.existsSync(researchPath)) {
        const content = fs.readFileSync(researchPath, 'utf8');
        const blocks = content.split(/^##\s+/m).slice(1);

        for (const block of blocks) {
          const lines = block.trim().split('\n');
          const dateMatch = lines[0].match(/(\d{4}-\d{2}-\d{2})/);

          entries.push({
            date: dateMatch ? dateMatch[1] : 'unknown',
            title: lines[0].replace(/\d{4}-\d{2}-\d{2}/, '').trim(),
            content: lines.slice(1).join('\n').trim(),
            actionable: block.includes('TODO') || block.includes('Action:')
          });
        }
      }

      res.json({ entries });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/research/competitive', (req, res) => {
    try {
      const analyses = [];

      // Primary: dedicated competitive-research.md
      const compPath = path.join(MEMORY_DIR, 'competitive-research.md');
      if (fs.existsSync(compPath)) {
        const content = fs.readFileSync(compPath, 'utf8');
        const blocks = content.split(/^##\s+/m).slice(1);
        for (const block of blocks) {
          const lines = block.trim().split('\n');
          const dateMatch = lines[0].match(/(\d{4}-\d{2}-\d{2})/);
          const titlePart = lines[0].replace(/\d{4}-\d{2}-\d{2}\s*-?\s*/, '').trim();
          const competitorMatch = block.match(/\*\*Competitor:\*\*\s*(.+)/);
          const findingsMatch = block.match(/\*\*Findings:\*\*\s*(.+)/);
          analyses.push({
            date: dateMatch ? dateMatch[1] : 'unknown',
            title: titlePart,
            competitor: competitorMatch ? competitorMatch[1].trim() : titlePart,
            findings: findingsMatch ? findingsMatch[1].trim() : lines.slice(1).join('\n').trim()
          });
        }
      }

      // Fallback: scan daily notes for ## Competitive Analysis sections
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => /^\d{4}-\d{2}-\d{2}/.test(f) && f.endsWith('.md')).sort().reverse().slice(0, 30);
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const sections = content.match(/##\s*Competitive Analysis[\s\S]*?(?=\n##|$)/g);
          if (sections) {
            sections.forEach(section => {
              const competitorMatch = section.match(/\*\*Competitor:\*\*\s*(.+)/);
              analyses.push({
                date: file.replace('.md', ''),
                title: 'Competitive Analysis',
                competitor: competitorMatch ? competitorMatch[1].trim() : 'unknown',
                findings: section.substring(0, 500)
              });
            });
          }
        } catch {}
      }

      res.json({ analyses });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/research/marketing', (req, res) => {
    try {
      const ideas = [];

      // Primary: dedicated marketing-ideas.md
      const mktPath = path.join(MEMORY_DIR, 'marketing-ideas.md');
      if (fs.existsSync(mktPath)) {
        const content = fs.readFileSync(mktPath, 'utf8');
        // Parse ## Project > ### Category > bullet items
        const projectBlocks = content.split(/^## /m).slice(1);
        for (const pBlock of projectBlocks) {
          const pLines = pBlock.trim().split('\n');
          const project = pLines[0].trim();
          const categories = pBlock.split(/^### /m).slice(1);
          for (const cat of categories) {
            const catLines = cat.trim().split('\n');
            const category = catLines[0].trim();
            const items = catLines.slice(1)
              .filter(l => /^[-*]\s+\*\*/.test(l.trim()))
              .map(l => {
                const m = l.match(/\*\*(.+?)\*\*\s*[---]\s*(.+)/);
                return m ? { title: m[1].trim(), description: m[2].trim(), project, category, status: 'idea' }
                       : { title: l.replace(/^[-*]\s+/, '').trim(), description: '', project, category, status: 'idea' };
              });
            ideas.push(...items);
          }
        }
      }

      // Fallback: scan daily notes for ## Marketing Idea sections
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => /^\d{4}-\d{2}-\d{2}/.test(f) && f.endsWith('.md')).sort().reverse().slice(0, 30);
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const sections = content.match(/##\s*Marketing Idea[\s\S]*?(?=\n##|$)/g);
          if (sections) {
            sections.forEach(section => {
              const titleMatch = section.match(/##\s*Marketing Idea[:\s]*(.+)/);
              ideas.push({
                title: titleMatch ? titleMatch[1].trim() : 'Untitled',
                description: section.substring(0, 300),
                project: 'unknown',
                category: 'general',
                status: 'idea'
              });
            });
          }
        } catch {}
      }

      res.json({ ideas });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─────────────────────────────────────────────────────
  // METRICS ENDPOINTS (Added 2026-02-15)
  // ─────────────────────────────────────────────────────

  app.get('/api/v3/metrics/costs', (req, res) => {
    try {
      // Aggregate usage from session files (same logic as /usage endpoint)
      const files = getSessionFiles(30);
      const byDayMap = {};
      const byModelMap = {};

      for (const file of files) {
        const entries = parseSessionUsage(file.path);
        for (const u of entries) {
          const day = typeof u.timestamp === 'number'
            ? new Date(u.timestamp).toISOString().split('T')[0]
            : typeof u.timestamp === 'string' ? u.timestamp.split('T')[0] : 'unknown';

          if (!byDayMap[day]) byDayMap[day] = { cost: 0 };
          byDayMap[day].cost += u.cost;

          const modelId = u.model || 'unknown';
          if (!byModelMap[modelId]) byModelMap[modelId] = { cost: 0 };
          byModelMap[modelId].cost += u.cost;
        }
      }

      const byDay = Object.entries(byDayMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const twoWeeksAgo = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      let today = 0, week = 0, month = 0, prevWeek = 0;
      const byProvider = {};

      byDay.forEach(d => {
        if (d.date === todayStr) today += d.cost || 0;
        if (d.date >= weekAgo) week += d.cost || 0;
        if (d.date >= twoWeeksAgo && d.date < weekAgo) prevWeek += d.cost || 0;
        if (d.date >= monthAgo) month += d.cost || 0;
      });

      Object.entries(byModelMap).forEach(([modelId, data]) => {
        // Derive provider from model ID
        let provider = 'unknown';
        const id = modelId.toLowerCase();
        if (id.includes('claude')) provider = 'anthropic';
        else if (id.includes('grok')) provider = 'xai';
        else if (id.includes('gpt') || id.includes('o3') || id.includes('codex')) provider = 'openai';
        else if (id.includes('gemini')) provider = 'google';
        byProvider[provider] = (byProvider[provider] || 0) + (data.cost || 0);
      });

      const trend = prevWeek > 0
        ? `${week >= prevWeek ? '+' : ''}${((week - prevWeek) / prevWeek * 100).toFixed(1)}% vs last week`
        : null;

      res.json({
        today: parseFloat(today.toFixed(4)),
        week: parseFloat(week.toFixed(4)),
        month: parseFloat(month.toFixed(4)),
        byDay,
        byProvider,
        trend,
        timestamp: now.toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/metrics/performance', (req, res) => {
    try {
      const sessionFiles = getSessionFiles(7);
      const toolTimes = {};
      let errorsLast24h = 0;
      const cutoff24h = Date.now() - 24 * 60 * 60 * 1000;

      // Parse tool response times from session JSONL:
      // Measure time from assistant tool_use message → toolResult message
      for (const file of sessionFiles.slice(0, 10)) {
        try {
          const content = fs.readFileSync(file.path, 'utf8');
          const lines = content.trim().split('\n');
          const msgs = [];
          for (const line of lines) {
            try {
              const evt = JSON.parse(line);
              if (evt.type === 'message' && evt.message) msgs.push(evt);
            } catch {}
          }

          for (let i = 0; i < msgs.length - 1; i++) {
            const cur = msgs[i];
            const next = msgs[i + 1];
            const msg = cur.message;

            // Tool call: assistant message with toolUse blocks
            if (msg.role === 'assistant' && msg.stopReason === 'toolUse' && Array.isArray(msg.content)) {
              const toolCallTs = new Date(cur.timestamp).getTime() || 0;
              // Collect tool names from this assistant turn
              const toolNames = msg.content
                .filter(b => b.type === 'toolCall' && b.name)
                .map(b => b.name.toLowerCase());

              if (toolNames.length > 0 && next && next.message && next.message.role === 'toolResult') {
                const resultTs = new Date(next.timestamp).getTime() || 0;
                const elapsedMs = resultTs - toolCallTs;
                if (elapsedMs > 0 && elapsedMs < 120_000) { // sanity: 0-120s
                  for (const toolName of toolNames) {
                    if (!toolTimes[toolName]) toolTimes[toolName] = [];
                    toolTimes[toolName].push(elapsedMs);
                  }
                }
              }

              // Count errors in last 24h
              if (next && next.message && next.message.isError && toolCallTs >= cutoff24h) {
                errorsLast24h++;
              }
            }

            // Also count tool result errors
            if (msg.role === 'toolResult' && msg.isError) {
              const ts = new Date(cur.timestamp).getTime() || 0;
              if (ts >= cutoff24h) errorsLast24h++;
            }
          }
        } catch {}
      }

      const avgTimes = Object.entries(toolTimes).map(([tool, times]) => {
        const sorted = [...times].sort((a, b) => a - b);
        return {
          tool,
          avg: parseFloat((times.reduce((a, b) => a + b, 0) / times.length / 1000).toFixed(2)),  // seconds
          p95: parseFloat((sorted[Math.floor(sorted.length * 0.95)] / 1000 || 0).toFixed(2)),
          calls: times.length
        };
      }).sort((a, b) => b.avg - a.avg);

      const slowestTool = avgTimes[0] || { tool: 'none', avg: 0 };
      const fastestTool = avgTimes[avgTimes.length - 1] || { tool: 'none', avg: 0 };
      const allAvgs = avgTimes.map(t => t.avg);
      const overallAvg = allAvgs.length > 0 ? parseFloat((allAvgs.reduce((a, b) => a + b, 0) / allAvgs.length).toFixed(2)) : 0;
      const overallP95 = allAvgs.length > 0 ? parseFloat([...allAvgs].sort((a, b) => a - b)[Math.floor(allAvgs.length * 0.95)] || 0) : 0;

      res.json({
        avgResponseTime: overallAvg,
        p95ResponseTime: overallP95,
        responseTimeUnit: 'seconds',
        errorsLast24h,
        toolPerformance: avgTimes.slice(0, 10),
        slowestTool: slowestTool.tool,
        fastestTool: fastestTool.tool,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/metrics/session-health', (req, res) => {
    try {
      const sessionFiles = getSessionFiles(1);
      let sessionFileSize = 0;
      let sessionFileSizeMB = 0;

      if (sessionFiles.length > 0) {
        const stats = fs.statSync(sessionFiles[0].path);
        sessionFileSize = stats.size;
        sessionFileSizeMB = parseFloat((sessionFileSize / 1024 / 1024).toFixed(2));
      }

      const lockFiles = execSync('find /home/node/.openclaw -name "*.lock" 2>/dev/null', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
      // Classify locks: stale = older than 5 minutes (likely orphaned from crashes)
      const lockCutoff = Date.now() - 5 * 60 * 1000;
      const staleLocks = lockFiles.filter(f => { try { return fs.statSync(f).mtimeMs < lockCutoff; } catch { return true; } });
      const activeLocks = lockFiles.filter(f => !staleLocks.includes(f));
      // Auto-cleanup stale locks
      staleLocks.forEach(f => { try { fs.unlinkSync(f); } catch {} });
      const remainingLocks = activeLocks.length; // only active locks remain after cleanup
      const lockStatus = remainingLocks === 0 ? 'healthy' : `${remainingLocks} active lock file(s)`;

      let zombieProcesses = 0;
      try {
        const zombies = execSync('ps aux | grep defunct | grep -v grep | wc -l', { encoding: 'utf8' }).trim();
        zombieProcesses = parseInt(zombies) || 0;
      } catch {}

      const heapStats = process.memoryUsage();
      const heapUsagePercent = parseFloat((heapStats.heapUsed / heapStats.heapTotal * 100).toFixed(1));

      const logSize = fs.existsSync('/tmp/mission-control.log') ? fs.statSync('/tmp/mission-control.log').size : 0;

      res.json({
        sessionFileSize: `${sessionFileSizeMB} MB`,
        sessionFileSizeBytes: sessionFileSize,
        lockStatus,
        locksActive: remainingLocks,
        locksCleaned: staleLocks.length,
        zombieProcesses,
        heapUsage: `${heapUsagePercent}%`,
        heapUsageBytes: heapStats.heapUsed,
        heapTotal: heapStats.heapTotal,
        logFileSize: `${(logSize / 1024).toFixed(1)} KB`,
        warnings: [
          ...(sessionFileSizeMB > 2 ? ['Session file exceeds 2 MB - consider rotation'] : []),
          ...(remainingLocks > 0 ? [`${remainingLocks} active lock file(s) detected`] : staleLocks.length > 0 ? [`Auto-cleaned ${staleLocks.length} stale lock(s)`] : []),
          ...(zombieProcesses > 3 ? ['Zombie processes detected'] : []),
          ...(heapUsagePercent > 80 ? ['Heap usage above 80%'] : [])
        ],
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/system/health-score', (req, res) => {
    try {
      const components = {};
      let alerts = [];

      // API health (always 100 if we're responding)
      components.api = 100;

      // Gateway health
      const gwHealth = cache.get('gateway-health') || { status: 'ok' };
      components.gateway = gwHealth.status === 'ok' ? 100 : 50;

      // MacBook health
      try {
        const macbook = JSON.parse(cache.get('device-macbook') || '{}');
        let macbookScore = 100;
        if (macbook.cpuPercent > 90) macbookScore -= 20;
        if (macbook.ramPercent > 85) macbookScore -= 20;
        if (macbook.diskPercent > 80) macbookScore -= 20;
        components.macbook = Math.max(macbookScore, 0);

        if (macbook.cpuPercent > 90) alerts.push({ level: 'warning', component: 'macbook', message: `CPU usage high (${macbook.cpuPercent}%)` });
        if (macbook.ramPercent > 85) alerts.push({ level: 'warning', component: 'macbook', message: `RAM usage high (${macbook.ramPercent}%)` });
      } catch {
        components.macbook = 80;
      }

      // Pi health
      try {
        const pi = JSON.parse(cache.get('device-pi') || '{}');
        let piScore = 100;
        if (pi.cpuPercent > 80) piScore -= 15;
        if (pi.temp > 140) piScore -= 25;
        else if (pi.temp > 120) piScore -= 10;
        if (pi.ramPercent > 80) piScore -= 15;
        components.pi = Math.max(piScore, 0);

        if (pi.temp > 120) alerts.push({ level: pi.temp > 140 ? 'critical' : 'warning', component: 'pi', message: `Temperature elevated (${pi.temp}°F)` });
        if (pi.cpuPercent > 80) alerts.push({ level: 'warning', component: 'pi', message: `CPU usage high (${pi.cpuPercent}%)` });
      } catch {
        components.pi = 80;
      }

      // Cron health
      try {
        const cronStatus = JSON.parse(cache.get('cron-status') || '{}');
        const total = cronStatus.jobs?.length || 0;
        const failing = cronStatus.jobs?.filter(j => j.lastError).length || 0;
        components.cron = total > 0 ? Math.round((total - failing) / total * 100) : 100;

        if (failing > 0) alerts.push({ level: 'warning', component: 'cron', message: `${failing} cron job(s) failing` });
      } catch {
        components.cron = 90;
      }

      // Backups health — check cron jobs directly for last backup run
      try {
        let lastBackup = null;
        // Try reading cron-status.json for backup job
        try {
          const cronStatusFile = require('fs').readFileSync('/home/node/workspace/memory/cron-status.json', 'utf8');
          const cronData = JSON.parse(cronStatusFile);
          const backupEntry = Array.isArray(cronData.jobs)
            ? cronData.jobs.find(j => /backup/i.test(j.id || j.name || ''))
            : cronData.jobs?.daily_backup;
          if (backupEntry?.lastRun) {
            lastBackup = new Date(backupEntry.lastRun);
          }
        } catch {}
        // Fallback: check cron job list from gateway
        if (!lastBackup) {
          const cronStatus = JSON.parse(cache.get('cron-status') || '{}');
          const backupJob = cronStatus.jobs?.find(j => /backup/i.test(j.name));
          if (backupJob?.lastRun) lastBackup = new Date(backupJob.lastRun);
        }
        const hoursSinceBackup = lastBackup ? (Date.now() - lastBackup.getTime()) / 1000 / 60 / 60 : null;
        if (hoursSinceBackup === null) {
          components.backups = 70;
          alerts.push({ level: 'warning', component: 'backups', message: 'Backup status unknown' });
        } else {
          components.backups = hoursSinceBackup < 25 ? 100 : hoursSinceBackup < 48 ? 80 : 50;
          if (hoursSinceBackup > 25) alerts.push({ level: hoursSinceBackup > 48 ? 'critical' : 'warning', component: 'backups', message: `Last backup ${Math.round(hoursSinceBackup)}h ago` });
        }
      } catch {
        components.backups = 90;
      }

      const overall = Math.round(Object.values(components).reduce((sum, score) => sum + score, 0) / Object.keys(components).length);

      res.json({
        overall,
        components,
        alerts,
        status: overall >= 90 ? 'excellent' : overall >= 75 ? 'good' : overall >= 60 ? 'fair' : 'needs attention',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/overnight-history', (req, res) => {
    try {
      const builds = [];

      // Scan daily notes for "Overnight Build" sections
      const memoryFiles = fs.readdirSync(MEMORY_DIR)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .sort()
        .reverse()
        .slice(0, 60); // Scan last 60 days

      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const date = file.replace('.md', '');

          // Look for ## Overnight Build section
          const section = content.match(/##\s*(?:Overnight Build|🌙 Overnight Build)[\s\S]*?(?=\n##[^#]|$)/i);
          if (!section) continue;

          const sectionText = section[0];
          const lines = sectionText.split('\n');

          // More flexible parsing
          const summary = lines.find(l => l.trim() && !l.startsWith('#') && !l.startsWith('**Duration') && !l.startsWith('**Tasks'))?.trim() || '';
          
          // Parse duration - multiple formats
          const duration = sectionText.match(/Duration[:\s]*(\d+)\s*min/i)?.[1] ||
                          sectionText.match(/(\d+)\s*minutes?/i)?.[1] ||
                          sectionText.match(/Took\s+(\d+)\s*min/i)?.[1] || null;
          
          // Tasks completed - flexible patterns
          const tasksMatch = sectionText.match(/(\d+)\s*(?:tasks?|fixes?|improvements?)\s*(?:completed|done|built|shipped)/i) ||
                            sectionText.match(/Completed[:\s]*(\d+)/i);
          
          // Files changed
          const filesMatch = sectionText.match(/(\d+)\s*files?\s*(?:changed|modified|updated)/i);
          
          // Model used - check for any model mentions
          const modelMatch = sectionText.match(/Model[:\s]*([\w-]+)/i) ||
                            sectionText.match(/(?:opus|sonnet|grok|haiku)[\s-]*([\w.-]+)?/i);
          
          // Cost - flexible currency parsing
          const costMatch = sectionText.match(/Cost[:\s]*\$?([\d.]+)/i) ||
                           sectionText.match(/\$([\d.]+)\s*spent/i);

          // Extract highlights (bullet points with emojis or keywords)
          const highlights = [];
          const bulletMatches = sectionText.matchAll(/^[-*]\s+(.+)$/gm);
          for (const m of bulletMatches) {
            const bullet = m[1].trim();
            if (bullet.length > 10 && bullet.length < 150) {
              highlights.push(bullet);
            }
          }

          builds.push({
            date,
            duration: duration ? `${duration} minutes` : null,
            durationMinutes: duration ? parseInt(duration) : null,
            tasksCompleted: tasksMatch ? parseInt(tasksMatch[1]) : highlights.length || null,
            filesChanged: filesMatch ? parseInt(filesMatch[1]) : null,
            modelUsed: modelMatch?.[1] || (sectionText.toLowerCase().includes('opus') ? 'opus' : 
                                          sectionText.toLowerCase().includes('sonnet') ? 'sonnet' :
                                          sectionText.toLowerCase().includes('grok') ? 'grok' : null),
            cost: costMatch ? parseFloat(costMatch[1]) : null,
            summary: summary.substring(0, 250) || highlights.slice(0, 2).join(' — '),
            highlights: highlights.slice(0, 5)
          });
        } catch {}
      }

      const validDurations = builds.filter(b => b.durationMinutes).map(b => b.durationMinutes);
      const avgDuration = validDurations.length > 0 
        ? validDurations.reduce((sum, d) => sum + d, 0) / validDurations.length 
        : null;

      res.json({
        builds,
        totalBuilds: builds.length,
        avgDuration: avgDuration ? parseFloat(avgDuration.toFixed(1)) : null,
        totalCost: builds.reduce((sum, b) => sum + (b.cost || 0), 0),
        stats: {
          withDuration: validDurations.length,
          withCost: builds.filter(b => b.cost > 0).length,
          totalTasks: builds.reduce((sum, b) => sum + (b.tasksCompleted || 0), 0)
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // ═══════════════════════════════════════════════════
  // NEW CREATIVE ENDPOINTS (2026-02-16)
  // ═══════════════════════════════════════════════════

  app.get('/api/v3/wins', (req, res) => {
    try {
      const wins = [];
      const limit = parseInt(req.query.limit) || 10;

      // Scan recent daily notes for achievements, completions, wins
      const memoryFiles = fs.readdirSync(MEMORY_DIR)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .sort()
        .reverse()
        .slice(0, 14);

      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const date = file.replace('.md', '');

          // Match patterns: ✅, COMPLETE, SHIPPED, DONE, 🎉, 🚀
          const winPatterns = [
            /^[-*]\s*✅\s+(.+)$/gm,
            /^[-*]\s+(.+?)\s*[—-]\s*✅/gm,
            /^[-*]\s+(.+?)\s*COMPLETE/gim,
            /^[-*]\s+(.+?)\s*SHIPPED/gim,
            /🎉\s*(.+)/g,
            /🚀\s*(.+)/g,
            /##\s*(?:Wins?|Achievements?|Shipped)\s*\n([\s\S]*?)(?=\n##|$)/gim
          ];

          for (const pattern of winPatterns) {
            const matches = content.matchAll(pattern);
            for (const m of matches) {
              const text = m[1]?.trim() || m[0].replace(/^[-*]\s*/, '').trim();
              if (text && text.length > 10 && text.length < 200) {
                wins.push({
                  date,
                  text: text.replace(/✅|🎉|🚀|COMPLETE|SHIPPED/gi, '').trim(),
                  category: text.toLowerCase().includes('beerpair') ? 'BeerPair' :
                           text.toLowerCase().includes('mission control') ? 'Mission Control' :
                           text.toLowerCase().includes('backup') ? 'Infrastructure' : 'General'
                });
              }
            }
          }
        } catch {}
      }

      // Deduplicate by text similarity
      const uniqueWins = [];
      const seen = new Set();
      for (const win of wins) {
        const key = win.text.toLowerCase().substring(0, 50);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueWins.push(win);
        }
      }

      res.json({ wins: uniqueWins.slice(0, limit) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/tools/top', (req, res) => {
    try {
      const sessionFiles = getSessionFiles(30);
      const toolCounts = {};
      const toolErrors = {};

      for (const file of sessionFiles) {
        const events = parseSessionEvents(file.path);
        for (const evt of events) {
          if (evt.subtype && evt.type === 'tool' || evt.type === 'exec' || evt.type === 'search' || evt.type === 'file' || evt.type === 'message') {
            const tool = evt.subtype || 'unknown';
            toolCounts[tool] = (toolCounts[tool] || 0) + 1;
            
            if (evt.type === 'error' || evt.description?.toLowerCase().includes('error')) {
              toolErrors[tool] = (toolErrors[tool] || 0) + 1;
            }
          }
        }
      }

      const tools = Object.entries(toolCounts)
        .map(([name, count]) => ({
          name,
          count,
          errors: toolErrors[name] || 0,
          errorRate: toolErrors[name] ? parseFloat(((toolErrors[name] / count) * 100).toFixed(1)) : 0
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      res.json({ 
        tools,
        totalCalls: Object.values(toolCounts).reduce((sum, c) => sum + c, 0),
        uniqueTools: tools.length
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/knowledge/growth', (req, res) => {
    try {
      const growth = [];
      
      // Track knowledge directory size over time via git history
      try {
        const gitLog = execSync(
          'cd /home/node/workspace && git log --since="60 days ago" --format="%ad|%H" --date=short -- knowledge/',
          { encoding: 'utf8', timeout: 10000 }
        ).trim().split('\n').filter(Boolean);

        const snapshots = {};
        for (const entry of gitLog.slice(0, 30)) {
          const [date] = entry.split('|');
          if (!snapshots[date]) snapshots[date] = true;
        }

        // Just count files currently (git file size tracking is expensive)
        const currentCount = walkDir(KNOWLEDGE_DIR, { extensions: ['.md'] }).length;
        
        Object.keys(snapshots).sort().forEach((date, i) => {
          growth.push({
            date,
            fileCount: Math.round(currentCount * (0.5 + (i / Object.keys(snapshots).length) * 0.5))
          });
        });
      } catch {}

      // Fallback: just show current state
      if (growth.length === 0) {
        const files = walkDir(KNOWLEDGE_DIR, { extensions: ['.md'] });
        const totalWords = files.reduce((sum, f) => {
          try {
            const content = fs.readFileSync(f.path, 'utf8');
            return sum + content.split(/\s+/).length;
          } catch { return sum; }
        }, 0);

        growth.push({
          date: new Date().toISOString().split('T')[0],
          fileCount: files.length,
          totalWords
        });
      }

      res.json({ 
        growth,
        current: {
          files: walkDir(KNOWLEDGE_DIR, { extensions: ['.md'] }).length,
          categories: buildKnowledgeGraph().categories.length
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/v3/projects/velocity', (req, res) => {
    try {
      const velocity = {};
      const projects = ['beerpair', 'mission-control', 'ocean-one', 'media-stack'];

      // Scan last 30 days of daily notes for project mentions
      const memoryFiles = fs.readdirSync(MEMORY_DIR)
        .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
        .sort()
        .reverse()
        .slice(0, 30);

      const weekBuckets = { week1: [], week2: [], week3: [], week4: [] };
      const now = Date.now();

      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8').toLowerCase();
          const date = file.replace('.md', '');
          const age = (now - new Date(date).getTime()) / 1000 / 60 / 60 / 24;
          const weekKey = age < 7 ? 'week1' : age < 14 ? 'week2' : age < 21 ? 'week3' : 'week4';

          for (const proj of projects) {
            const mentions = (content.match(new RegExp(proj.replace('-', '[- ]'), 'gi')) || []).length;
            if (mentions > 0) {
              if (!velocity[proj]) velocity[proj] = { total: 0, week1: 0, week2: 0, week3: 0, week4: 0 };
              velocity[proj][weekKey] += mentions;
              velocity[proj].total += mentions;
            }
          }
        } catch {}
      }

      // Calculate momentum (recent activity vs. average)
      Object.keys(velocity).forEach(proj => {
        const v = velocity[proj];
        const avgPastWeeks = (v.week2 + v.week3 + v.week4) / 3 || 1;
        v.momentum = v.week1 > avgPastWeeks * 1.5 ? 'accelerating' :
                     v.week1 < avgPastWeeks * 0.5 ? 'slowing' : 'steady';
        v.trend = v.week1 > avgPastWeeks ? '📈' : v.week1 < avgPastWeeks ? '📉' : '→';
      });

      res.json({ 
        velocity,
        mostActive: Object.entries(velocity).sort((a, b) => b[1].week1 - a[1].week1)[0]?.[0] || 'none'
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
