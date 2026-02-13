const express = require('express');
const fs = require('fs');
const path = require('path');
const { getSessionFiles, SESSIONS_DIR } = require('./lib/session-parser');

const app = express();
const PORT = 3333;

// Serve static files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Health ────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ─── System Status ─────────────────────────────────
app.get('/api/status', (req, res) => {
  try {
    const sessions = getSessionFiles(1);
    let currentModel = 'unknown';
    if (sessions.length > 0) {
      const firstLines = fs.readFileSync(sessions[0].path, 'utf8').split('\n').slice(0, 5);
      for (const line of firstLines) {
        if (!line.trim()) continue;
        try {
          const obj = JSON.parse(line);
          if (obj.type === 'model_change' && obj.modelId) { currentModel = obj.modelId; break; }
        } catch {}
      }
    }
    const allSessions = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
    res.json({ sessionCount: allSessions.length, currentModel, uptime: process.uptime(), serverTime: new Date().toISOString() });
  } catch (err) {
    res.json({ sessionCount: 0, currentModel: 'unknown', uptime: process.uptime(), error: err.message });
  }
});

// ─── Mount Routes ──────────────────────────────────
require('./routes/activity')(app);
require('./routes/calendar')(app);
require('./routes/usage')(app);
require('./routes/search')(app);
require('./routes/knowledge')(app);
require('./routes/memory')(app);
require('./routes/ops')(app);
require('./routes/sessions')(app);
require('./routes/costs')(app);

// ─── Start ─────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ Mission Control v2 running on http://0.0.0.0:${PORT}`);
});
