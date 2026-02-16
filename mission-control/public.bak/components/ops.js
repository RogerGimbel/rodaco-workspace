// Ops Dashboard
function initOps() {
  loadOps();
}

async function loadOps() {
  try {
    const res = await fetch('/api/ops');
    const data = await res.json();
    renderOps(data);
  } catch (err) {
    document.getElementById('ops-grid').innerHTML = `<div class="loading">❌ ${err.message}</div>`;
  }
}

function renderOps(data) {
  const grid = document.getElementById('ops-grid');
  let html = '';

  // Gateway status
  const gwOk = data.gateway.status === 'ok';
  html += `<div class="ops-card ${gwOk ? 'ops-ok' : 'ops-error'}">
    <div class="ops-card-icon">${gwOk ? '✅' : '❌'}</div>
    <div class="ops-card-title">Gateway</div>
    <div class="ops-card-value">${data.gateway.status}</div>
    <div class="ops-card-sub">Port 18789</div>
  </div>`;

  // System metrics
  if (data.system.memory) {
    const memPct = ((data.system.memory.usedMb / data.system.memory.totalMb) * 100).toFixed(0);
    const memOk = memPct < 85;
    html += `<div class="ops-card ${memOk ? 'ops-ok' : 'ops-warn'}">
      <div class="ops-card-icon">🧠</div>
      <div class="ops-card-title">Memory</div>
      <div class="ops-card-value">${memPct}%</div>
      <div class="ops-card-sub">${data.system.memory.usedMb}MB / ${data.system.memory.totalMb}MB</div>
      <div class="ops-bar"><div class="ops-bar-fill" style="width:${memPct}%;background:${memOk ? '#4ecdc4' : '#ff6b6b'}"></div></div>
    </div>`;
  }

  if (data.system.disk) {
    const diskPct = parseInt(data.system.disk.usePct);
    const diskOk = diskPct < 85;
    html += `<div class="ops-card ${diskOk ? 'ops-ok' : 'ops-warn'}">
      <div class="ops-card-icon">💾</div>
      <div class="ops-card-title">Disk</div>
      <div class="ops-card-value">${data.system.disk.usePct}</div>
      <div class="ops-card-sub">${data.system.disk.used} / ${data.system.disk.total}</div>
      <div class="ops-bar"><div class="ops-bar-fill" style="width:${diskPct}%;background:${diskOk ? '#4ecdc4' : '#ff6b6b'}"></div></div>
    </div>`;
  }

  if (data.system.loadAvg) {
    html += `<div class="ops-card ops-ok">
      <div class="ops-card-icon">📈</div>
      <div class="ops-card-title">Load Avg</div>
      <div class="ops-card-value">${data.system.loadAvg['1m']}</div>
      <div class="ops-card-sub">5m: ${data.system.loadAvg['5m']} · 15m: ${data.system.loadAvg['15m']}</div>
    </div>`;
  }

  // Sessions
  html += `<div class="ops-card ops-ok">
    <div class="ops-card-icon">📊</div>
    <div class="ops-card-title">Sessions</div>
    <div class="ops-card-value">${data.sessions.count || 0}</div>
    <div class="ops-card-sub">${data.sessions.totalSizeMb || 0} MB total${data.sessions.staleLocks ? ` · ⚠️ ${data.sessions.staleLocks} stale locks` : ''}</div>
  </div>`;

  // Processes
  if (data.system.processes) {
    html += `<div class="ops-card ops-ok">
      <div class="ops-card-icon">⚙️</div>
      <div class="ops-card-title">Processes</div>
      <div class="ops-card-value">${data.system.processes}</div>
      <div class="ops-card-sub">Running</div>
    </div>`;
  }

  // Cron
  if (data.cron) {
    html += `<div class="ops-card ops-ok">
      <div class="ops-card-icon">⏰</div>
      <div class="ops-card-title">Cron Jobs</div>
      <div class="ops-card-value">${data.cron.enabled || 0} active</div>
      <div class="ops-card-sub">${data.cron.total || 0} total · ${data.cron.disabled || 0} disabled</div>
    </div>`;
  }

  // Health check results
  if (data.healthCheck) {
    const hc = data.healthCheck;
    const severity = hc.severity || 'unknown';
    const sClass = severity === 'ok' ? 'ops-ok' : severity === 'warn' ? 'ops-warn' : 'ops-error';
    html += `<div class="ops-card ${sClass}">
      <div class="ops-card-icon">${severity === 'ok' ? '💚' : severity === 'warn' ? '💛' : '❤️'}</div>
      <div class="ops-card-title">Health Check</div>
      <div class="ops-card-value">${severity.toUpperCase()}</div>
      <div class="ops-card-sub">${hc.issues ? hc.issues.join(', ') : 'All clear'}</div>
    </div>`;
  }

  // Recent cron runs
  if (data.cron && data.cron.lastRuns && data.cron.lastRuns.length) {
    html += `<div class="ops-card ops-wide">
      <div class="ops-card-title">⏰ Recent Cron Runs</div>
      <div class="ops-cron-list">
        ${data.cron.lastRuns.map(r => {
          const statusIcon = r.status === 'ok' ? '✅' : r.status === 'error' ? '❌' : '⏳';
          const duration = r.duration ? `${(r.duration / 1000).toFixed(1)}s` : '—';
          return `<div class="ops-cron-item">
            <span>${statusIcon}</span>
            <span class="ops-cron-name">${escapeHtml(r.name)}</span>
            <span class="ops-cron-time">${formatTime(r.lastRun)}</span>
            <span class="ops-cron-dur">${duration}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  }

  grid.innerHTML = html;
}
