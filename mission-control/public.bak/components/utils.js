// Shared utilities
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${(d.getMonth()+1).toString().padStart(2,'0')}/${d.getDate().toString().padStart(2,'0')} ${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
}

function formatUptime(seconds) {
  if (!seconds) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatTokens(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

function formatCost(n) {
  if (n === 0) return '$0.00';
  if (n < 0.01) return '<$0.01';
  return '$' + n.toFixed(2);
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function getIcon(type, subtype) {
  if (subtype === 'user') return '👤';
  if (subtype === 'web_search') return '🌐';
  if (subtype === 'web_fetch') return '🌐';
  if (subtype === 'browser') return '🖥️';
  if (subtype === 'Write') return '✏️';
  if (subtype === 'Edit') return '✏️';
  if (subtype === 'Read') return '📖';
  if (subtype === 'tts') return '🔊';
  if (subtype === 'nodes') return '📡';
  const icons = { exec: '⚙️', message: '💬', file: '📄', search: '🔍', error: '❌', tool: '🔧' };
  return icons[type] || '•';
}
