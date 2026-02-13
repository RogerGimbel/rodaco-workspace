const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(process.env.HOME, '.openclaw/agents/main/sessions');

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
        usage.push({
          timestamp: obj.timestamp,
          model,
          input: u.input || u.inputTokens || 0,
          output: u.output || u.outputTokens || 0,
          cacheRead: u.cacheRead || u.cacheReadTokens || 0,
          cacheWrite: u.cacheWrite || u.cacheWriteTokens || 0,
          cost: u.cost ? (u.cost.total || 0) : 0
        });
      }
    }
  } catch {}
  return usage;
}

module.exports = { getSessionFiles, parseSessionEvents, parseSessionUsage, SESSIONS_DIR };
