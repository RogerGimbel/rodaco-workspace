// Calendar
let calendarWeekOffset = 0;

function initCalendar() {
  document.getElementById('cal-prev').addEventListener('click', () => { calendarWeekOffset--; loadCalendar(); });
  document.getElementById('cal-next').addEventListener('click', () => { calendarWeekOffset++; loadCalendar(); });
  document.getElementById('cal-today').addEventListener('click', () => { calendarWeekOffset = 0; loadCalendar(); });
  loadCalendar();
}

async function loadCalendar() {
  try {
    const res = await fetch('/api/cron');
    const jobs = await res.json();

    const today = new Date();
    const dayOfWeek = today.getDay();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - dayOfWeek + (calendarWeekOffset * 7));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const opts = { month: 'short', day: 'numeric' };
    document.getElementById('calendar-title').textContent =
      `Week of ${weekStart.toLocaleDateString('en-US', opts)} – ${weekEnd.toLocaleDateString('en-US', opts)}, ${weekEnd.getFullYear()}`;

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let gridHtml = dayNames.map(d => `<div class="day-header">${d}</div>`).join('');

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const isToday = date.toDateString() === today.toDateString();
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      let jobsHtml = '';
      for (const job of jobs) {
        if (doesJobOccurOnDay(job, date)) {
          const enabled = job.enabled !== false;
          const cls = !enabled ? 'disabled' : (job.schedule.kind === 'at' ? 'one-shot' : 'enabled');
          const time = getJobTimeForDay(job, date);
          const isPast = date < today && !isToday;
          const statusIcon = isPast ? '✅' : '⏳';
          jobsHtml += `<div class="cron-job ${cls}" title="${escapeHtml(job.payload?.message?.substring(0, 200) || job.name)}">
            <span class="job-status">${enabled ? statusIcon : '⛔'}</span>
            ${escapeHtml(job.name)}
            <div class="job-time">${time}</div>
          </div>`;
        }
      }

      gridHtml += `<div class="day-cell${isToday ? ' today' : ''}">
        <div class="day-date">${dateStr}</div>
        ${jobsHtml}
      </div>`;
    }

    document.getElementById('week-grid').innerHTML = gridHtml;

    // Job cards
    let cardsHtml = '<h2 style="margin-bottom:16px;font-size:18px">📋 All Scheduled Jobs</h2>';
    for (const job of jobs) {
      const enabled = job.enabled !== false;
      const scheduleText = job.schedule.kind === 'cron'
        ? `Cron: ${job.schedule.expr} (${job.schedule.tz || 'UTC'})`
        : `One-shot: ${new Date(job.schedule.at).toLocaleString()}`;
      const lastRun = job.state?.lastRunAtMs ? new Date(job.state.lastRunAtMs).toLocaleString() : 'Never';
      const nextRun = job.state?.nextRunAtMs ? new Date(job.state.nextRunAtMs).toLocaleString() : 'N/A';
      const lastDuration = job.state?.lastDurationMs ? `${(job.state.lastDurationMs / 1000).toFixed(1)}s` : '—';

      cardsHtml += `<div class="job-card">
        <h3>${enabled ? '🟢' : '⚫'} ${escapeHtml(job.name)}
          <span class="badge ${enabled ? 'badge-enabled' : 'badge-disabled'}">${enabled ? 'Enabled' : 'Disabled'}</span>
          ${job.state?.lastStatus === 'ok' ? '<span class="badge badge-ok">OK</span>' : ''}
        </h3>
        <div class="job-meta">
          <span><span class="label">Schedule:</span> <span class="value">${scheduleText}</span></span>
          <span><span class="label">Last:</span> <span class="value">${lastRun}</span></span>
          <span><span class="label">Next:</span> <span class="value">${nextRun}</span></span>
          <span><span class="label">Duration:</span> <span class="value">${lastDuration}</span></span>
          <span><span class="label">Model:</span> <span class="value">${job.payload?.model || 'default'}</span></span>
        </div>
      </div>`;
    }
    document.getElementById('job-cards').innerHTML = cardsHtml;
  } catch (err) {
    document.getElementById('week-grid').innerHTML = `<div class="loading">❌ ${err.message}</div>`;
  }
}

function doesJobOccurOnDay(job, date) {
  if (job.schedule.kind === 'at') return new Date(job.schedule.at).toDateString() === date.toDateString();
  if (job.schedule.kind === 'cron') {
    const parts = job.schedule.expr.split(' ');
    if (parts.length < 5) return false;
    const [, , dom, month, dow] = parts;
    if (dow !== '*' && !dow.split(',').map(Number).includes(date.getDay())) return false;
    if (dom !== '*' && !dom.split(',').map(Number).includes(date.getDate())) return false;
    if (month !== '*' && !month.split(',').map(Number).includes(date.getMonth() + 1)) return false;
    return true;
  }
  return false;
}

function getJobTimeForDay(job, date) {
  if (job.schedule.kind === 'at') return new Date(job.schedule.at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (job.schedule.kind === 'cron') {
    const parts = job.schedule.expr.split(' ');
    const h = parseInt(parts[1] || '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    return `${h12}:${(parts[0] || '0').padStart(2, '0')} ${ampm}`;
  }
  return '';
}
