// ─── Mission Control v2 — App Shell ────────────────
const tabInits = {
  activity: initActivity,
  knowledge: initKnowledge,
  memory: initMemory,
  ops: initOps,
  calendar: initCalendar,
  usage: initUsage,
  search: initSearch,
};

const tabLoaded = {};

function switchTab(tabName) {
  // Update top tabs
  document.querySelectorAll('.tabs-top .tab').forEach(t => t.classList.remove('active'));
  const topTab = document.querySelector(`.tabs-top .tab[data-tab="${tabName}"]`);
  if (topTab) topTab.classList.add('active');

  // Update bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(b => b.classList.remove('active'));
  const bottomTab = document.querySelector(`.bottom-nav-item[data-tab="${tabName}"]`);
  if (bottomTab) bottomTab.classList.add('active');

  // Update overflow items
  document.querySelectorAll('.bottom-nav-overflow-item').forEach(b => b.classList.remove('active'));
  const overflowTab = document.querySelector(`.bottom-nav-overflow-item[data-tab="${tabName}"]`);
  if (overflowTab) {
    overflowTab.classList.add('active');
    // If selecting an overflow tab, highlight the "More" button
    const moreBtn = document.getElementById('bottom-nav-more-btn');
    if (moreBtn) moreBtn.classList.add('active');
  }

  // Switch panels
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tabName).classList.add('active');

  // Lazy-init
  if (!tabLoaded[tabName] && tabInits[tabName]) {
    tabInits[tabName]();
    tabLoaded[tabName] = true;
  }

  if (tabName === 'search') document.getElementById('search-input').focus();

  // Close overflow menu
  const overflow = document.getElementById('bottom-nav-overflow');
  if (overflow) overflow.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', () => {
  // Top tab switching
  document.querySelectorAll('.tabs-top .tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Bottom nav switching
  document.querySelectorAll('.bottom-nav-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Bottom nav overflow items
  document.querySelectorAll('.bottom-nav-overflow-item[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // More button toggle
  const moreBtn = document.getElementById('bottom-nav-more-btn');
  const overflow = document.getElementById('bottom-nav-overflow');
  if (moreBtn && overflow) {
    moreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      overflow.classList.toggle('open');
    });
    // Close on outside click
    document.addEventListener('click', () => overflow.classList.remove('open'));
    overflow.addEventListener('click', (e) => e.stopPropagation());
  }

  // Mobile header expand/collapse
  const expandBtn = document.getElementById('header-expand-btn');
  const headerStats = document.getElementById('header-stats');
  if (expandBtn && headerStats) {
    expandBtn.addEventListener('click', () => {
      headerStats.classList.toggle('expanded');
      expandBtn.textContent = headerStats.classList.contains('expanded') ? '▲' : '▼';
    });
  }

  // System bar tap-to-expand on mobile
  const systemBar = document.getElementById('system-bar');
  if (systemBar) {
    // Start collapsed on mobile
    if (window.innerWidth < 640) {
      systemBar.classList.add('collapsed');
    }
    systemBar.addEventListener('click', () => {
      if (window.innerWidth < 640) {
        systemBar.classList.toggle('collapsed');
      }
    });
  }

  // Init default tab
  loadStatus();
  tabInits.activity();
  tabLoaded.activity = true;
});

// ─── Header Status ─────────────────────────────────
async function loadStatus() {
  try {
    const res = await fetch('/api/status');
    const data = await res.json();
    const modelName = (data.currentModel || 'unknown').split('/').pop();
    document.getElementById('current-model').textContent = modelName;
    document.getElementById('header-model-compact').textContent = modelName;
    document.getElementById('session-count').textContent = data.sessionCount || '0';
    document.getElementById('uptime').textContent = formatUptime(data.uptime);
    document.getElementById('status-text').textContent = 'Online';
    document.getElementById('status-dot').classList.add('online');
    const dotDesktop = document.getElementById('status-dot-desktop');
    if (dotDesktop) dotDesktop.classList.add('online');
  } catch {
    document.getElementById('status-text').textContent = 'Offline';
  }
}

// Refresh status every 60s
setInterval(loadStatus, 60000);
