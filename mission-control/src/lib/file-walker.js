const fs = require('fs');
const path = require('path');

function walkDir(dir, opts = {}) {
  const { extensions = ['.md', '.json'], exclude = ['node_modules', '.git'], maxDepth = 10 } = opts;
  const results = [];

  function walk(d, depth) {
    if (depth > maxDepth) return;
    try {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const entry of entries) {
        if (exclude.includes(entry.name)) continue;
        const fullPath = path.join(d, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath, depth + 1);
        } else if (extensions.some(ext => entry.name.endsWith(ext))) {
          try {
            const stat = fs.statSync(fullPath);
            results.push({ path: fullPath, name: entry.name, size: stat.size, mtime: stat.mtimeMs });
          } catch {}
        }
      }
    } catch {}
  }

  walk(dir, 0);
  return results;
}

function searchFiles(query, dir) {
  const results = [];
  if (!query || query.length < 2) return results;
  const lowerQuery = query.toLowerCase();

  const files = walkDir(dir);
  for (const file of files) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const lines = content.split('\n');
      let matchCount = 0;
      const matches = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(lowerQuery)) {
          matchCount++;
          const contextStart = Math.max(0, i - 2);
          const contextEnd = Math.min(lines.length - 1, i + 2);
          matches.push({
            lineNum: i + 1,
            line: lines[i],
            context: lines.slice(contextStart, contextEnd + 1).join('\n')
          });
        }
      }

      if (matchCount > 0) {
        results.push({
          file: file.path.replace('/home/node/workspace/', ''),
          matchCount,
          matches: matches.slice(0, 10),
          mtime: file.mtime
        });
      }
    } catch {}
  }

  results.sort((a, b) => b.matchCount !== a.matchCount ? b.matchCount - a.matchCount : b.mtime - a.mtime);
  return results;
}

module.exports = { walkDir, searchFiles };
