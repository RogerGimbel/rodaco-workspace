// Search
function initSearch() {
  document.getElementById('btn-search').addEventListener('click', doSearch);
  document.getElementById('search-input').addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}

async function doSearch() {
  const query = document.getElementById('search-input').value.trim();
  if (!query || query.length < 2) return;

  const resultsEl = document.getElementById('search-results');
  const summaryEl = document.getElementById('search-summary');
  resultsEl.innerHTML = '<div class="loading">🔍 Searching...</div>';

  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();

    if (!data.results.length) {
      summaryEl.textContent = `No results for "${query}"`;
      resultsEl.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No matches found</p></div>';
      return;
    }

    const totalMatches = data.results.reduce((sum, r) => sum + r.matchCount, 0);
    summaryEl.textContent = `${totalMatches} matches across ${data.results.length} files`;

    resultsEl.innerHTML = data.results.map(r => {
      const matchesHtml = r.matches.map(m => {
        const highlighted = highlightText(escapeHtml(m.context), query);
        return `<div class="search-match"><span class="line-num">L${m.lineNum}</span>${highlighted}</div>`;
      }).join('');
      return `<div class="search-result">
        <div class="search-result-header">
          <span class="search-result-file">📄 ${escapeHtml(r.file)}</span>
          <span class="search-result-count">${r.matchCount}</span>
        </div>
        ${matchesHtml}
      </div>`;
    }).join('');
  } catch (err) {
    resultsEl.innerHTML = `<div class="loading">❌ ${err.message}</div>`;
  }
}

function highlightText(html, query) {
  if (!query) return html;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return html.replace(new RegExp(`(${escaped})`, 'gi'), '<span class="search-highlight">$1</span>');
}
