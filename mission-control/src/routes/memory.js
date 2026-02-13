const fs = require('fs');
const path = require('path');

const MEMORY_DIR = '/home/node/workspace/memory';
const MEMORY_FILE = '/home/node/workspace/MEMORY.md';

function getMemoryDays() {
  const days = [];
  try {
    const files = fs.readdirSync(MEMORY_DIR)
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse();

    for (const f of files) {
      const date = f.replace('.md', '');
      const filePath = path.join(MEMORY_DIR, f);
      const stat = fs.statSync(filePath);
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.split('\n');

      // Extract sections
      const sections = [];
      let currentSection = null;
      for (const line of lines) {
        const h2 = line.match(/^##\s+(.+)/);
        if (h2) {
          currentSection = { title: h2[1], lineCount: 0 };
          sections.push(currentSection);
        } else if (currentSection && line.trim()) {
          currentSection.lineCount++;
        }
      }

      // Count decisions, lessons, audit entries
      const decisions = (content.match(/\b(?:decided|decision|chose|choice)\b/gi) || []).length;
      const lessons = (content.match(/\b(?:lesson|learned|TIL|insight)\b/gi) || []).length;
      const audits = (content.match(/^\s*-\s*\[\d{1,2}:\d{2}\]/gm) || []).length;

      days.push({
        date,
        size: stat.size,
        wordCount: content.split(/\s+/).length,
        sections,
        decisions,
        lessons,
        audits,
        mtime: stat.mtimeMs
      });
    }
  } catch {}
  return days;
}

function getHeatmap() {
  const days = getMemoryDays();
  const heatmap = {};
  for (const d of days) {
    heatmap[d.date] = { wordCount: d.wordCount, sections: d.sections.length, size: d.size };
  }
  return heatmap;
}

module.exports = function(app) {
  app.get('/api/memory', (req, res) => {
    try {
      const days = getMemoryDays();
      const heatmap = getHeatmap();

      // Long-term memory summary
      let longTermExcerpt = '';
      let longTermSections = [];
      try {
        const ltContent = fs.readFileSync(MEMORY_FILE, 'utf8');
        const headers = ltContent.matchAll(/^(#{1,3})\s+(.+)$/gm);
        for (const h of headers) longTermSections.push({ level: h[1].length, title: h[2] });
        longTermExcerpt = ltContent.substring(0, 500);
      } catch {}

      res.json({
        days,
        heatmap,
        longTerm: { sections: longTermSections, excerpt: longTermExcerpt },
        totalDays: days.length,
        totalWords: days.reduce((s, d) => s + d.wordCount, 0),
        dateRange: days.length ? { oldest: days[days.length - 1].date, newest: days[0].date } : null
      });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/memory/:date', (req, res) => {
    try {
      const filePath = path.join(MEMORY_DIR, req.params.date + '.md');
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
      const content = fs.readFileSync(filePath, 'utf8');
      res.json({ date: req.params.date, content });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/memory-long-term', (req, res) => {
    try {
      const content = fs.readFileSync(MEMORY_FILE, 'utf8');
      res.json({ content });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
};
