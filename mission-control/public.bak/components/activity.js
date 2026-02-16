// Activity Feed
let refreshInterval = null;
let refreshCountdown = 30;

function initActivity() {
  document.getElementById('btn-refresh').addEventListener('click', () => loadActivity(true));
  document.getElementById('filter-type').addEventListener('change', loadActivity);
  document.getElementById('filter-from').addEventListener('change', loadActivity);
  document.getElementById('filter-to').addEventListener('change', loadActivity);
  loadActivity();
  startAutoRefresh();
}

async function loadActivity(force = false) {
  const type = document.getElementById('filter-type').value;
  const from = document.getElementById('filter-from').value;
  const to = document.getElementById('filter-to').value;

  let url = `/api/activity?limit=300`;
  if (force) url += `&refresh=true`;
  if (type) url += `&type=${type}`;
  if (from) url += `&from=${new Date(from).toISOString()}`;
  if (to) url += `&to=${new Date(to + 'T23:59:59').toISOString()}`;

  try {
    const res = await fetch(url);
    const events = await res.json();
    document.getElementById('event-count').textContent = `${events.length} events`;
    const timeline = document.getElementById('timeline');

    if (events.length === 0) {
      timeline.innerHTML = `<div class="empty-state"><div class="icon">📡</div><p>No activity found</p></div>`;
      return;
    }

    timeline.innerHTML = events.map(e => {
      const icon = getIcon(e.type, e.subtype);
      const time = formatTime(e.timestamp);
      const modelShort = (e.model || '').replace('anthropic/', '').replace('claude-', 'c-');
      return `<div class="event type-${e.type}">
        <div class="event-top-row">
          <span class="event-time">${time}</span>
          <span class="event-icon">${icon}</span>
          <span class="event-model" title="${e.model || ''}">${modelShort}</span>
        </div>
        <span class="event-desc" title="${escapeHtml(e.description)}">${escapeHtml(e.description)}</span>
      </div>`;
    }).join('');
  } catch (err) {
    document.getElementById('timeline').innerHTML = `<div class="loading">❌ Failed: ${err.message}</div>`;
  }
}

function startAutoRefresh() {
  refreshCountdown = 30;
  if (refreshInterval) clearInterval(refreshInterval);
  refreshInterval = setInterval(() => {
    refreshCountdown--;
    const el = document.getElementById('refresh-timer');
    if (refreshCountdown <= 0) {
      el.textContent = 'Refreshing...';
      loadActivity();
      refreshCountdown = 30;
    } else {
      el.textContent = `${refreshCountdown}s`;
    }
  }, 1000);
}
