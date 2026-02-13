const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

module.exports = function(app) {
  app.get('/api/ops', async (req, res) => {
    const status = {
      gateway: { status: 'unknown' },
      system: {},
      sessions: {},
      cron: {},
      selfHealing: {},
      timestamp: new Date().toISOString()
    };

    // Gateway health
    try {
      const http = require('http');
      const health = await new Promise((resolve) => {
        const r = http.get('http://127.0.0.1:18789/health', { timeout: 5000 }, (res) => {
          let d = '';
          res.on('data', c => d += c);
          res.on('end', () => { try { resolve(JSON.parse(d)); } catch { resolve({ status: 'ok' }); } });
        });
        r.on('error', () => resolve({ status: 'unreachable' }));
        r.on('timeout', () => { r.destroy(); resolve({ status: 'timeout' }); });
      });
      status.gateway = { status: 'ok', ...health };
    } catch { status.gateway = { status: 'error' }; }

    // System metrics
    try {
      const uptime = parseFloat(execSync('cat /proc/uptime 2>/dev/null || echo "0"', { encoding: 'utf8' }).split(' ')[0]);
      status.system.uptime = uptime;
    } catch {}

    try {
      const memInfo = execSync('free -m 2>/dev/null || echo ""', { encoding: 'utf8' });
      const memLine = memInfo.split('\n').find(l => l.startsWith('Mem:'));
      if (memLine) {
        const parts = memLine.split(/\s+/);
        status.system.memory = { totalMb: parseInt(parts[1]), usedMb: parseInt(parts[2]), freeMb: parseInt(parts[3]) };
      }
    } catch {}

    try {
      const df = execSync('df -h / 2>/dev/null | tail -1', { encoding: 'utf8' });
      const parts = df.trim().split(/\s+/);
      status.system.disk = { total: parts[1], used: parts[2], available: parts[3], usePct: parts[4] };
    } catch {}

    try {
      const loadAvg = fs.readFileSync('/proc/loadavg', 'utf8').trim().split(' ');
      status.system.loadAvg = { '1m': parseFloat(loadAvg[0]), '5m': parseFloat(loadAvg[1]), '15m': parseFloat(loadAvg[2]) };
    } catch {}

    // Process count
    try {
      const procs = execSync('ps aux | wc -l', { encoding: 'utf8' }).trim();
      status.system.processes = parseInt(procs) - 1;
    } catch {}

    // Session info
    try {
      const sessDir = path.join(process.env.HOME, '.openclaw/agents/main/sessions');
      const sessions = fs.readdirSync(sessDir).filter(f => f.endsWith('.jsonl') && !f.includes('.lock'));
      status.sessions.count = sessions.length;
      const totalSize = sessions.reduce((sum, f) => {
        try { return sum + fs.statSync(path.join(sessDir, f)).size; } catch { return sum; }
      }, 0);
      status.sessions.totalSizeMb = (totalSize / 1024 / 1024).toFixed(2);

      // Check for stale locks
      const locks = fs.readdirSync(sessDir).filter(f => f.endsWith('.lock'));
      status.sessions.staleLocks = locks.length;
    } catch {}

    // Cron job health
    try {
      const cronFile = path.join(process.env.HOME, '.openclaw/cron/jobs.json');
      const data = JSON.parse(fs.readFileSync(cronFile, 'utf8'));
      const jobs = data.jobs || [];
      status.cron.total = jobs.length;
      status.cron.enabled = jobs.filter(j => j.enabled !== false).length;
      status.cron.disabled = jobs.filter(j => j.enabled === false).length;
      status.cron.lastRuns = jobs
        .filter(j => j.state?.lastRunAtMs)
        .map(j => ({ name: j.name, lastRun: new Date(j.state.lastRunAtMs).toISOString(), status: j.state.lastStatus, duration: j.state.lastDurationMs }))
        .sort((a, b) => b.lastRun.localeCompare(a.lastRun))
        .slice(0, 10);
    } catch {}

    // Heartbeat state
    try {
      const hbState = JSON.parse(fs.readFileSync('/home/node/workspace/memory/heartbeat-state.json', 'utf8'));
      status.selfHealing = { heartbeatState: hbState };
    } catch {}

    // Health check script
    try {
      const healthOutput = execSync('/home/node/workspace/bin/health-check 2>/dev/null', { encoding: 'utf8', timeout: 10000 });
      status.healthCheck = JSON.parse(healthOutput);
    } catch {}

    res.json(status);
  });
};
