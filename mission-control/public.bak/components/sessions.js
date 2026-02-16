// Active Sessions Panel + Cost Widget — injected into Ops tab

// Store original initOps and wrap it
const _origInitOps = typeof initOps === 'function' ? initOps : null;

function initOpsEnhanced() {
  if (_origInitOps) _origInitOps();
  loadCostWidget();
  loadActiveSessions();
  setInterval(loadActiveSessions, 60000);
}

// Override initOps
window.initOps = initOpsEnhanced;

// ─── Cost Widget ─────────────────────────────────────
async function loadCostWidget() {
  try {
    const res = await fetch('/api/usage/costs');
    const data = await res.json();
    renderCostWidget(data);
  } catch {}
}

function renderCostWidget(data) {
  const grid = document.getElementById('ops-grid');
  if (!grid) return;

  // Remove existing cost widget if present
  const existing = document.getElementById('cost-widget');
  if (existing) existing.remove();

  const cost7d = data.day7.total;
  const costToday = data.today.total;

  let breakdownHtml = '';
  const models = Object.entries(data.day7.byModel || {}).sort((a, b) => b[1].cost - a[1].cost);
  if (models.length) {
    breakdownHtml = '<div class="cost-breakdown" id="cost-breakdown" style="display:none;margin-top:8px;">';
    for (const [model, info] of models) {
      breakdownHtml += `<div class="cost-row"><span class="cost-model">${escapeHtml(model)}</span><span class="cost-amt">${formatCost(info.cost)}</span><span class="cost-calls">${info.calls} calls</span></div>`;
    }
    breakdownHtml += '</div>';
  }

  const card = document.createElement('div');
  card.id = 'cost-widget';
  card.className = 'ops-card ops-ok';
  card.style.cursor = 'pointer';
  card.innerHTML = `
    <div class="ops-card-icon">💰</div>
    <div class="ops-card-title">7D API Cost (Est.)</div>
    <div class="ops-card-value">~${formatCost(cost7d)}</div>
    <div class="ops-card-sub">Today: ~${formatCost(costToday)}</div>
    ${breakdownHtml}
  `;
  card.addEventListener('click', () => {
    const bd = card.querySelector('#cost-breakdown');
    if (bd) bd.style.display = bd.style.display === 'none' ? 'block' : 'none';
  });

  // Insert after the first row of cards
  const firstWide = grid.querySelector('.ops-wide');
  if (firstWide) grid.insertBefore(card, firstWide);
  else grid.appendChild(card);
}

// ─── Active Sessions Panel ───────────────────────────
async function loadActiveSessions() {
  try {
    const res = await fetch('/api/sessions/active');
    const data = await res.json();
    renderActiveSessions(data);
  } catch {}
}

function renderActiveSessions(data) {
  const grid = document.getElementById('ops-grid');
  if (!grid) return;

  // Remove existing panels
  const existing = document.getElementById('sessions-panel');
  if (existing) existing.remove();
  const existingCron = document.getElementById('cron-panel');
  if (existingCron) existingCron.remove();

  // Sessions table
  const kindIcon = { cron: '⏰', spawn: '🔀', main: '💬', unknown: '❓' };
  const statusIcon = { running: '🟢', idle: '⚪', completed: '✅', error: '🔴' };

  let sessHtml = '<div class="ops-cron-list">';
  for (const s of data.sessions.slice(0, 15)) {
    const dur = s.ageMins < 60 ? `${s.ageMins}m` : `${Math.floor(s.ageMins / 60)}h ${s.ageMins % 60}m`;
    const label = s.label.length > 60 ? s.label.substring(0, 57) + '...' : s.label;
    sessHtml += `<div class="ops-cron-item">
      <span>${statusIcon[s.status] || '⚪'}</span>
      <span>${kindIcon[s.kind] || '❓'}</span>
      <span class="ops-cron-name" title="${escapeHtml(s.label)}">${escapeHtml(label)}</span>
      <span class="ops-cron-dur">${s.model}</span>
      <span class="ops-cron-time">${dur}</span>
      <span class="ops-cron-dur">${s.messageCount}msg</span>
    </div>`;
  }
  sessHtml += '</div>';

  const sessPanel = document.createElement('div');
  sessPanel.id = 'sessions-panel';
  sessPanel.className = 'ops-card ops-wide';
  sessPanel.innerHTML = `<div class="ops-card-title">📡 Recent Sessions</div>${sessHtml}`;
  grid.appendChild(sessPanel);

  // Cron jobs table
  if (data.cronJobs.length) {
    let cronHtml = '<div class="ops-cron-list">';
    for (const j of data.cronJobs) {
      const statusBadge = j.enabled ? (j.lastStatus === 'ok' ? '✅' : j.lastStatus === 'error' ? '❌' : '⏳') : '⏸️';
      const nextRun = j.nextRun ? formatTime(j.nextRun) : '—';
      const lastDur = j.lastDuration ? `${(j.lastDuration / 1000).toFixed(1)}s` : '—';
      cronHtml += `<div class="ops-cron-item">
        <span>${statusBadge}</span>
        <span class="ops-cron-name">${escapeHtml(j.name)}</span>
        <span class="ops-cron-dur">${j.schedule}</span>
        <span class="ops-cron-time">next: ${nextRun}</span>
        <span class="ops-cron-dur">${lastDur}</span>
      </div>`;
    }
    cronHtml += '</div>';

    const cronPanel = document.createElement('div');
    cronPanel.id = 'cron-panel';
    cronPanel.className = 'ops-card ops-wide';
    cronPanel.innerHTML = `<div class="ops-card-title">⏰ Cron Jobs</div>${cronHtml}`;
    grid.appendChild(cronPanel);
  }
}
