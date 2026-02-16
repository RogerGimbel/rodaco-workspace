// Memory Timeline
let memData = null;

function initMemory() {
  loadMemory();
}

async function loadMemory() {
  try {
    const res = await fetch('/api/memory');
    memData = await res.json();

    // Stats
    document.getElementById('mem-stats').innerHTML = `
      <div class="mem-stat-card"><div class="mem-stat-val">${memData.totalDays}</div><div class="mem-stat-label">Days Logged</div></div>
      <div class="mem-stat-card"><div class="mem-stat-val">${formatTokens(memData.totalWords)}</div><div class="mem-stat-label">Total Words</div></div>
      <div class="mem-stat-card"><div class="mem-stat-val">${memData.dateRange ? memData.dateRange.oldest : '—'}</div><div class="mem-stat-label">First Entry</div></div>
      <div class="mem-stat-card"><div class="mem-stat-val">${memData.dateRange ? memData.dateRange.newest : '—'}</div><div class="mem-stat-label">Latest Entry</div></div>
    `;

    renderHeatmap();
    renderDayList();
  } catch (err) {
    document.getElementById('mem-stats').innerHTML = `<div class="loading">❌ ${err.message}</div>`;
  }
}

function renderHeatmap() {
  const container = document.getElementById('mem-heatmap');
  if (!memData || !memData.days.length) {
    container.innerHTML = '<div class="empty-state"><p>No memory files yet</p></div>';
    return;
  }

  // Build 90-day heatmap
  const today = new Date();
  const cells = [];
  const maxWords = Math.max(...memData.days.map(d => d.wordCount), 1);

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const day = memData.days.find(d => d.date === dateStr);

    let intensity = 0;
    if (day) intensity = Math.min(4, Math.ceil((day.wordCount / maxWords) * 4));

    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const title = day ? `${dateStr}: ${day.wordCount} words, ${day.sections.length} sections` : dateStr;

    cells.push(`<div class="hm-cell hm-${intensity}" title="${title}" data-date="${dateStr}" onclick="loadMemoryDay('${dateStr}')">${date.getDate()}</div>`);
  }

  // Group by weeks
  let html = '<div class="hm-grid">';
  // Month labels
  let currentMonth = '';
  html += '<div class="hm-months">';
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    if (month !== currentMonth) {
      html += `<span class="hm-month">${month}</span>`;
      currentMonth = month;
    }
  }
  html += '</div>';
  html += '<div class="hm-cells">' + cells.join('') + '</div>';
  html += '<div class="hm-legend"><span>Less</span>';
  for (let i = 0; i <= 4; i++) html += `<div class="hm-cell hm-${i} hm-legend-cell"></div>`;
  html += '<span>More</span></div>';
  html += '</div>';

  container.innerHTML = html;
}

function renderDayList() {
  // Show recent days below heatmap
  if (!memData || !memData.days.length) return;

  const recent = memData.days.slice(0, 14);
  let html = '<div class="mem-day-list"><h3>Recent Days</h3>';
  for (const day of recent) {
    const sectionNames = day.sections.map(s => s.title).join(', ');
    html += `<div class="mem-day-item" onclick="loadMemoryDay('${day.date}')">
      <span class="mem-day-date">${day.date}</span>
      <span class="mem-day-words">${day.wordCount} words</span>
      <span class="mem-day-sections">${sectionNames || 'No sections'}</span>
    </div>`;
  }
  html += '</div>';

  document.getElementById('mem-heatmap').innerHTML += html;
}

async function loadMemoryDay(date) {
  const container = document.getElementById('mem-content');
  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const res = await fetch(`/api/memory/${date}`);
    if (!res.ok) { container.innerHTML = `<div class="empty-state"><p>No notes for ${date}</p></div>`; return; }
    const data = await res.json();

    // Simple markdown rendering
    const html = renderMarkdown(data.content);
    container.innerHTML = `
      <div class="mem-day-header">
        <h2>📝 ${date}</h2>
        <button onclick="loadLongTermMemory()" class="btn-sm">View MEMORY.md</button>
      </div>
      <div class="mem-day-content">${html}</div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="loading">❌ ${err.message}</div>`;
  }
}

async function loadLongTermMemory() {
  const container = document.getElementById('mem-content');
  container.innerHTML = '<div class="loading">Loading...</div>';

  try {
    const res = await fetch('/api/memory-long-term');
    const data = await res.json();
    const html = renderMarkdown(data.content);
    container.innerHTML = `
      <div class="mem-day-header"><h2>🧠 MEMORY.md (Long-Term)</h2></div>
      <div class="mem-day-content">${html}</div>
    `;
  } catch (err) {
    container.innerHTML = `<div class="loading">❌ ${err.message}</div>`;
  }
}

function renderMarkdown(text) {
  if (!text) return '';
  return escapeHtml(text)
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^(?:&gt;)\s*(.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n/g, '<br>');
}
