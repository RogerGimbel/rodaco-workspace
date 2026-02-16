// System Metrics Bar — persistent across all tabs
function initSystemBar() {
  loadSystemBar();
  setInterval(loadSystemBar, 30000);
}

async function loadSystemBar() {
  try {
    const res = await fetch('/api/ops');
    const data = await res.json();
    renderSystemBar(data);
  } catch {}
}

function sbarColor(pct) {
  if (pct < 70) return 'var(--success)';
  if (pct < 90) return 'var(--warn)';
  return 'var(--error)';
}

function renderSystemBar(data) {
  // Load
  if (data.system.loadAvg) {
    document.getElementById('sbar-load-val').textContent = data.system.loadAvg['1m'];
  }

  // RAM
  if (data.system.memory) {
    const m = data.system.memory;
    const pct = ((m.usedMb / m.totalMb) * 100).toFixed(0);
    const gb = (v) => (v / 1024).toFixed(1);
    const el = document.getElementById('sbar-ram-val');
    el.textContent = `${pct}% (${gb(m.usedMb)}/${gb(m.totalMb)} GB)`;
    el.style.color = sbarColor(parseFloat(pct));
  }

  // Disk
  if (data.system.disk) {
    const d = data.system.disk;
    const pct = parseInt(d.usePct);
    const el = document.getElementById('sbar-disk-val');
    el.textContent = `${d.usePct} (${d.used}/${d.total})`;
    el.style.color = sbarColor(pct);
  }

  // Uptime
  if (data.system.uptime) {
    const s = data.system.uptime;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    document.getElementById('sbar-uptime-val').textContent = h > 0 ? `${h}h ${m}m` : `${m}m`;
  }
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', initSystemBar);
