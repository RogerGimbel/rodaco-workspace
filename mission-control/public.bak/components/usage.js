// Token Usage
function initUsage() {
  loadUsage();
}

async function loadUsage() {
  try {
    const res = await fetch('/api/usage');
    const data = await res.json();
    renderUsage(data);
  } catch (err) {
    console.error('Usage load error:', err);
  }
}

function renderUsage(data) {
  const totalIn = data.totals.input, totalOut = data.totals.output, totalCache = data.totals.cacheRead;
  document.getElementById('total-tokens').textContent = formatTokens(totalIn + totalOut);
  document.getElementById('total-breakdown').textContent = `In: ${formatTokens(totalIn)} · Out: ${formatTokens(totalOut)}`;
  document.getElementById('total-cost').textContent = formatCost(data.totals.totalCost);
  const totalCalls = Object.values(data.byModel).reduce((s, m) => s + m.calls, 0);
  document.getElementById('total-calls').textContent = `${totalCalls} API calls`;

  const totalInput = totalIn + totalCache;
  const cacheRate = totalInput > 0 ? ((totalCache / totalInput) * 100).toFixed(1) : '0';
  document.getElementById('cache-efficiency').textContent = cacheRate + '%';
  document.getElementById('cache-detail').textContent = `${formatTokens(totalCache)} cached of ${formatTokens(totalInput)} total`;

  // Providers
  const providerGrid = document.getElementById('provider-grid');
  if (data.providers) {
    const configs = [
      { key: 'anthropic', name: '🟣 Anthropic', desc: 'Claude' },
      { key: 'openai', name: '🟢 OpenAI', desc: 'GPT/Embeddings' },
      { key: 'xai', name: '⚡ xAI', desc: 'Grok' },
      { key: 'voyage', name: '🚢 Voyage', desc: 'Embeddings' },
      { key: 'gemini', name: '🔵 Google', desc: 'Gemini' },
    ];
    providerGrid.innerHTML = configs.map(pc => {
      const p = data.providers[pc.key];
      if (!p) return '';
      return `<div class="provider-card ${p.available ? 'active' : 'inactive'}">
        <div class="provider-name">${pc.name}</div>
        <div class="provider-status ${p.available ? 'ok' : 'no'}">${p.available ? '✅ Connected' : '❌ No Key'}</div>
        ${p.key ? `<div class="provider-key">${p.key}</div>` : ''}
        <div class="provider-detail">${pc.desc}</div>
      </div>`;
    }).join('');
  }

  // Model table
  const tbody = document.querySelector('#model-table tbody');
  tbody.innerHTML = '';
  const models = Object.entries(data.byModel).sort((a, b) => (b[1].input + b[1].output) - (a[1].input + a[1].output));
  for (const [model, stats] of models) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="model-name">${model.split('/').pop()}</td><td class="num">${stats.calls}</td><td class="num">${formatTokens(stats.input)}</td><td class="num">${formatTokens(stats.output)}</td><td class="num">${formatTokens(stats.cacheRead)}</td><td class="num cost">${formatCost(stats.cost)}</td>`;
    tbody.appendChild(tr);
  }

  // Daily chart
  const chartEl = document.getElementById('daily-chart');
  const days = Object.entries(data.byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-7);
  if (!days.length) { chartEl.innerHTML = '<div style="color:#666;text-align:center">No data yet</div>'; return; }
  const maxTokens = Math.max(...days.map(([, d]) => d.input + d.output), 1);

  chartEl.innerHTML = days.map(([day, stats]) => {
    const total = stats.input + stats.output;
    const heightPct = Math.max((total / maxTokens) * 100, 2);
    const inputPct = stats.input / Math.max(total, 1) * heightPct;
    const outputPct = stats.output / Math.max(total, 1) * heightPct;
    const dayName = new Date(day + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' });
    return `<div class="day-bar-group">
      <div class="day-bar input-bar" style="height:${inputPct}%" title="Input: ${formatTokens(stats.input)}"></div>
      <div class="day-bar output-bar" style="height:${outputPct}%" title="Output: ${formatTokens(stats.output)}"></div>
      <div class="day-bar-label">${dayName}<br>${day.slice(5)}</div>
      <div class="day-bar-value">${formatTokens(total)}</div>
    </div>`;
  }).join('') + `<div class="chart-legend"><span><span class="legend-dot" style="background:#4ecdc4"></span> Input</span><span><span class="legend-dot" style="background:#ff6b6b"></span> Output</span></div>`;

  // Recent
  const recentBody = document.querySelector('#recent-table tbody');
  recentBody.innerHTML = '';
  for (const msg of data.recentMessages.slice(0, 25)) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${formatTime(msg.timestamp)}</td><td class="model-name">${(msg.model||'').split('/').pop()}</td><td class="num">${formatTokens(msg.input)}</td><td class="num">${formatTokens(msg.output)}</td><td class="num">${formatTokens(msg.cacheRead)}</td><td class="num cost">${formatCost(msg.cost)}</td>`;
    recentBody.appendChild(tr);
  }
}
