const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(process.env.HOME, '.openclaw/agents/main/sessions');

// Pricing per 1M tokens — keep in sync with api-v3.js MODEL_PRICING
const SESSION_MODEL_PRICING = {
  'claude-opus-4':   { input: 15.00, output: 75.00, cacheRead: 1.50, cacheWrite: 18.75 },
  'claude-sonnet-4': { input: 3.00,  output: 15.00, cacheRead: 0.30, cacheWrite: 3.75  },
  'claude-haiku-3':  { input: 0.25,  output: 1.25,  cacheRead: 0.03, cacheWrite: 0.30  },
  'grok-3-mini':     { input: 0.30,  output: 0.50,  cacheRead: 0.075, cacheWrite: 0    },
  'grok-3':          { input: 3.00,  output: 15.00, cacheRead: 0.75, cacheWrite: 0     },
  'grok-2':          { input: 2.00,  output: 10.00, cacheRead: 0,    cacheWrite: 0     },
  'gpt-4o-mini':     { input: 0.15,  output: 0.60,  cacheRead: 0.075, cacheWrite: 0   },
  'gpt-4o':          { input: 2.50,  output: 10.00, cacheRead: 1.25, cacheWrite: 0    },
  'o3':              { input: 10.00, output: 40.00, cacheRead: 2.50, cacheWrite: 0    },
  'codex-mini':      { input: 1.50,  output: 6.00,  cacheRead: 0.375, cacheWrite: 0   },
};

function lookupSessionPricing(modelId) {
  if (!modelId) return null;
  const id = modelId.toLowerCase();
  for (const [key, p] of Object.entries(SESSION_MODEL_PRICING)) {
    if (id.startsWith(key)) return p;
  }
  if (id.includes('opus'))   return SESSION_MODEL_PRICING['claude-opus-4'];
  if (id.includes('sonnet')) return SESSION_MODEL_PRICING['claude-sonnet-4'];
  if (id.includes('haiku'))  return SESSION_MODEL_PRICING['claude-haiku-3'];
  if (id.includes('grok-3-mini') || id.includes('grok3mini')) return SESSION_MODEL_PRICING['grok-3-mini'];
  if (id.includes('grok'))   return SESSION_MODEL_PRICING['grok-3'];
  if (id.includes('o3'))     return SESSION_MODEL_PRICING['o3'];
  if (id.includes('codex'))  return SESSION_MODEL_PRICING['codex-mini'];
  if (id.includes('4o-mini') || id.includes('4omini')) return SESSION_MODEL_PRICING['gpt-4o-mini'];
  if (id.includes('4o') || id.includes('gpt')) return SESSION_MODEL_PRICING['gpt-4o'];
  return null;
}

function calculateCost(model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens) {
  const pricing = lookupSessionPricing(model);
  if (!pricing) return 0;
  return (
    (inputTokens      || 0) * pricing.input      / 1_000_000 +
    (outputTokens     || 0) * pricing.output     / 1_000_000 +
    (cacheReadTokens  || 0) * pricing.cacheRead  / 1_000_000 +
    (cacheWriteTokens || 0) * pricing.cacheWrite / 1_000_000
  );
}

function getSessionFiles(limit = 20) {
  try {
    return fs.readdirSync(SESSIONS_DIR)
      .filter(f => f.endsWith('.jsonl') && !f.includes('.lock') && !f.includes('.deleted'))
      .map(f => ({
        name: f,
        path: path.join(SESSIONS_DIR, f),
        mtime: fs.statSync(path.join(SESSIONS_DIR, f)).mtimeMs
      }))
      .sort((a, b) => b.mtime - a.mtime)
      .slice(0, limit);
  } catch { return []; }
}

function parseSessionEvents(filePath) {
  const events = [];
  const sessionId = path.basename(filePath, '.jsonl');

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let sessionModel = 'unknown';

    for (const line of lines) {
      if (!line.trim()) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }

      if (obj.type === 'model_change' && obj.modelId) sessionModel = obj.modelId;

      if (obj.type === 'message' && obj.message) {
        const msg = obj.message;

        // User messages
        if (msg.role === 'user' && msg.content) {
          const textContent = Array.isArray(msg.content)
            ? msg.content.filter(c => c.type === 'text').map(c => c.text).join(' ')
            : typeof msg.content === 'string' ? msg.content : '';
          if (textContent && !textContent.startsWith('[{')) {
            let clean = textContent.replace(/^\[.*?\]\s*/, '').substring(0, 200);
            events.push({ timestamp: obj.timestamp, type: 'message', subtype: 'user', description: `User: ${clean}`, model: sessionModel, sessionId });
          }
        }

        // Tool calls
        if (msg.role === 'assistant' && Array.isArray(msg.content)) {
          for (const block of msg.content) {
            if (block.type === 'toolCall') {
              const toolName = block.name || 'unknown';
              const args = block.arguments || {};
              let desc = '', eventType = 'tool';

              switch (toolName) {
                case 'exec': eventType = 'exec'; desc = `exec: ${(args.command || '').substring(0, 150)}`; break;
                case 'web_search': eventType = 'search'; desc = `search: ${args.query || ''}`; break;
                case 'web_fetch': eventType = 'search'; desc = `fetch: ${args.url || ''}`; break;
                case 'message': eventType = 'message'; desc = `message(${args.action || ''}): ${(args.message || args.text || '').substring(0, 100)}`; break;
                case 'Read': eventType = 'file'; desc = `read: ${args.file_path || args.path || ''}`; break;
                case 'Write': eventType = 'file'; desc = `write: ${args.file_path || args.path || ''}`; break;
                case 'Edit': eventType = 'file'; desc = `edit: ${args.file_path || args.path || ''}`; break;
                case 'browser': eventType = 'search'; desc = `browser(${args.action || ''}): ${args.targetUrl || args.url || ''}`; break;
                case 'tts': eventType = 'message'; desc = `tts: ${(args.text || '').substring(0, 100)}`; break;
                case 'nodes': eventType = 'exec'; desc = `nodes(${args.action || ''}): ${args.node || ''}`; break;
                default: desc = `${toolName}: ${JSON.stringify(args).substring(0, 100)}`;
              }

              events.push({ timestamp: obj.timestamp, type: eventType, subtype: toolName, description: desc, model: sessionModel, sessionId });
            }
          }
          if (msg.model) sessionModel = msg.model;
          if (msg.stopReason === 'error') {
            events.push({ timestamp: obj.timestamp, type: 'error', subtype: 'error', description: 'Error in response', model: sessionModel, sessionId });
          }
        }

        // Tool result errors
        if (msg.role === 'toolResult' && msg.isError) {
          events.push({
            timestamp: obj.timestamp, type: 'error', subtype: 'tool_error',
            description: `Error in ${msg.toolName || 'tool'}: ${(Array.isArray(msg.content) ? msg.content.map(c => c.text).join('') : '').substring(0, 150)}`,
            model: sessionModel, sessionId
          });
        }
      }
    }
  } catch {}

  return events;
}

function parseSessionUsage(filePath) {
  const usage = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let sessionModel = 'unknown';

    for (const line of lines) {
      if (!line.trim()) continue;
      let obj;
      try { obj = JSON.parse(line); } catch { continue; }
      if (obj.type === 'model_change' && obj.modelId) sessionModel = obj.modelId;

      if (obj.type === 'message' && obj.message && obj.message.usage) {
        const u = obj.message.usage;
        const model = obj.message.model || sessionModel;
        const inputTokens     = u.input      || u.inputTokens      || 0;
        const outputTokens    = u.output     || u.outputTokens     || 0;
        const cacheReadTokens = u.cacheRead  || u.cacheReadTokens  || 0;
        const cacheWriteTokens = u.cacheWrite || u.cacheWriteTokens || 0;
        // Use provider-reported cost if non-zero, otherwise calculate from token counts
        const reportedCost = u.cost ? (u.cost.total || 0) : 0;
        const cost = reportedCost > 0
          ? reportedCost
          : calculateCost(model, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens);
        usage.push({
          timestamp: obj.timestamp,
          model,
          input: inputTokens,
          output: outputTokens,
          cacheRead: cacheReadTokens,
          cacheWrite: cacheWriteTokens,
          cost
        });
      }
    }
  } catch {}
  return usage;
}

module.exports = { getSessionFiles, parseSessionEvents, parseSessionUsage, SESSIONS_DIR };
