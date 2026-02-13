const fs = require('fs');
const path = require('path');

const SESSIONS_DIR = path.join(process.env.HOME, '.openclaw/agents/main/sessions');
const CRON_FILE = path.join(process.env.HOME, '.openclaw/cron/jobs.json');

module.exports = function(app) {
  app.get('/api/sessions/active', (req, res) => {
    const result = { sessions: [], cronJobs: [], timestamp: new Date().toISOString() };

    // Parse recent session files for active/recent sessions
    try {
      const files = fs.readdirSync(SESSIONS_DIR)
        .filter(f => f.endsWith('.jsonl') && !f.includes('.lock') && !f.includes('.deleted'))
        .map(f => {
          const stat = fs.statSync(path.join(SESSIONS_DIR, f));
          return { name: f, path: path.join(SESSIONS_DIR, f), mtime: stat.mtimeMs, size: stat.size };
        })
        .sort((a, b) => b.mtime - a.mtime)
        .slice(0, 20);

      // Check for lock files to determine active sessions
      const lockFiles = new Set(
        fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.lock')).map(f => f.replace('.lock', ''))
      );

      for (const file of files) {
        const sessionId = file.name.replace('.jsonl', '');
        const isActive = lockFiles.has(file.name);

        // Read first few and last few lines for metadata
        let label = '', kind = 'unknown', model = 'unknown', startTime = null, lastActivity = null;
        let messageCount = 0;
        try {
          const content = fs.readFileSync(file.path, 'utf8');
          const lines = content.split('\n').filter(l => l.trim());

          for (const line of lines.slice(0, 10)) {
            try {
              const obj = JSON.parse(line);
              if (obj.type === 'session') {
                startTime = obj.timestamp;
                if (obj.label) label = obj.label;
                if (obj.kind) kind = obj.kind;
                if (obj.id) {
                  // Infer kind from session ID pattern
                  if (obj.id.includes('cron')) kind = 'cron';
                  else if (obj.id.includes('subagent') || obj.id.includes('spawn')) kind = 'spawn';
                }
              }
              if (obj.type === 'model_change' && obj.modelId) model = obj.modelId;
              if (obj.type === 'session_target') {
                if (obj.target) {
                  // Parse target for kind info
                  const t = obj.target;
                  if (t.includes('cron')) kind = 'cron';
                  else if (t.includes('subagent') || t.includes('spawn')) kind = 'spawn';
                  else if (t.includes('telegram') || t.includes('discord')) kind = 'main';
                  if (!label && t) label = t;
                }
              }
            } catch {}
          }

          // Count messages and get last timestamp
          for (const line of lines) {
            try {
              const obj = JSON.parse(line);
              if (obj.type === 'message') messageCount++;
              if (obj.timestamp) lastActivity = obj.timestamp;
              // Try to get label from session key in first user message
              if (!label && obj.type === 'message' && obj.message?.role === 'user') {
                const text = typeof obj.message.content === 'string' ? obj.message.content :
                  Array.isArray(obj.message.content) ? obj.message.content.filter(c => c.type === 'text').map(c => c.text).join(' ') : '';
                if (text) label = text.substring(0, 80);
              }
              // Infer kind from session key pattern in content
              if (obj.sessionKey) {
                if (obj.sessionKey.includes('cron')) kind = 'cron';
                else if (obj.sessionKey.includes('subagent')) kind = 'spawn';
                else if (obj.sessionKey.includes('telegram') || obj.sessionKey.includes('direct')) kind = 'main';
                if (!label) label = obj.sessionKey;
              }
            } catch {}
          }
        } catch {}

        // Determine status
        const ageMins = (Date.now() - file.mtime) / 60000;
        let status = 'idle';
        if (isActive) status = 'running';
        else if (ageMins < 5) status = 'running';
        else if (ageMins > 1440) status = 'completed';

        result.sessions.push({
          id: sessionId.substring(0, 8),
          fullId: sessionId,
          label: label || sessionId.substring(0, 8),
          kind,
          model: model.split('/').pop(),
          status,
          startTime,
          lastActivity,
          messageCount,
          sizeMb: (file.size / 1024 / 1024).toFixed(2),
          ageMins: Math.round(ageMins)
        });
      }
    } catch (e) {
      result.sessionError = e.message;
    }

    // Cron jobs
    try {
      const data = JSON.parse(fs.readFileSync(CRON_FILE, 'utf8'));
      const jobs = data.jobs || [];
      result.cronJobs = jobs.map(j => ({
        id: j.id,
        name: j.name,
        enabled: j.enabled !== false,
        schedule: j.schedule?.expr || '',
        tz: j.schedule?.tz || '',
        sessionTarget: j.sessionTarget || '',
        nextRun: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs).toISOString() : null,
        lastRun: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
        lastStatus: j.state?.lastStatus || null,
        lastDuration: j.state?.lastDurationMs || null,
        consecutiveErrors: j.state?.consecutiveErrors || 0
      }));
    } catch (e) {
      result.cronError = e.message;
    }

    res.json(result);
  });
};
