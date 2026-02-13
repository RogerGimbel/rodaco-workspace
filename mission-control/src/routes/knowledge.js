const fs = require('fs');
const path = require('path');
const { walkDir } = require('../lib/file-walker');
const Cache = require('../lib/cache');

const KNOWLEDGE_DIR = '/home/node/workspace/knowledge';
const cache = new Cache(60000);

function parseMarkdownMeta(content) {
  const meta = { title: '', tags: [], links: [], sections: [], excerpt: '' };

  // YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    const titleMatch = fm.match(/title:\s*["']?(.+?)["']?\s*$/m);
    if (titleMatch) meta.title = titleMatch[1];
    const tagsMatch = fm.match(/tags:\s*\[([^\]]+)\]/);
    if (tagsMatch) meta.tags = tagsMatch[1].split(',').map(t => t.trim().replace(/["']/g, ''));
    const statusMatch = fm.match(/status:\s*(.+)/);
    if (statusMatch) meta.status = statusMatch[1].trim();
    const typeMatch = fm.match(/type:\s*(.+)/);
    if (typeMatch) meta.type = typeMatch[1].trim();
  }

  // Title from first H1 if not in frontmatter
  if (!meta.title) {
    const h1 = content.match(/^#\s+(.+)$/m);
    if (h1) meta.title = h1[1];
  }

  // Wikilinks [[target]]
  const wikilinks = content.matchAll(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g);
  for (const m of wikilinks) meta.links.push(m[1].trim());

  // Markdown links to local files
  const mdlinks = content.matchAll(/\[([^\]]+)\]\((?!https?:\/\/)([^)]+\.md)\)/g);
  for (const m of mdlinks) meta.links.push(m[2].replace(/\.md$/, ''));

  // Section headers
  const headers = content.matchAll(/^(#{1,3})\s+(.+)$/gm);
  for (const h of headers) meta.sections.push({ level: h[1].length, title: h[2] });

  // Excerpt: first non-empty, non-header, non-frontmatter line
  const lines = content.replace(/^---\n[\s\S]*?\n---\n?/, '').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---') && !trimmed.startsWith('|')) {
      meta.excerpt = trimmed.substring(0, 200);
      break;
    }
  }

  return meta;
}

function buildGraph() {
  const cached = cache.get('graph');
  if (cached) return cached;

  const nodes = [];
  const edges = [];
  const nodeMap = {};

  const files = walkDir(KNOWLEDGE_DIR, { extensions: ['.md'] });

  for (const file of files) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const meta = parseMarkdownMeta(content);
      const relPath = file.path.replace(KNOWLEDGE_DIR + '/', '');
      const id = relPath.replace(/\.md$/, '');

      // Determine category from path
      const parts = relPath.split('/');
      const category = parts.length > 1 ? parts[0] : 'root';

      const node = {
        id,
        label: meta.title || file.name.replace('.md', ''),
        category,
        path: relPath,
        tags: meta.tags,
        status: meta.status,
        type: meta.type,
        sections: meta.sections,
        excerpt: meta.excerpt,
        links: meta.links,
        size: file.size,
        mtime: file.mtime,
        wordCount: content.split(/\s+/).length
      };

      nodes.push(node);
      nodeMap[id] = node;
      // Index by multiple keys for flexible wikilink resolution
      const baseName = file.name.replace('.md', '');
      if (!nodeMap[baseName]) nodeMap[baseName] = node;
      // Index by title (exact and lowercase)
      if (node.label && !nodeMap[node.label]) nodeMap[node.label] = node;
      if (node.label) {
        const lower = node.label.toLowerCase();
        if (!nodeMap[lower]) nodeMap[lower] = node;
        // Index by slugified title: "Roger Gimbel" -> "roger-gimbel"
        const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!nodeMap[slug]) nodeMap[slug] = node;
      }
      // Index by last path segment: "people/roger-gimbel/summary" -> "roger-gimbel"
      const idParts = id.split('/');
      if (idParts.length >= 2) {
        const dirName = idParts[idParts.length - 2];
        if (!nodeMap[dirName]) nodeMap[dirName] = node;
      }
    } catch {}
  }

  // Build edges from links (deduplicated)
  const edgeSet = new Set();
  for (const node of nodes) {
    for (const link of node.links) {
      const target = nodeMap[link] || nodeMap[link.toLowerCase()] || nodeMap[link.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')];
      if (target && target.id !== node.id) {
        const key = [node.id, target.id].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: node.id, target: target.id });
        }
      }
    }
  }

  // Also add workspace root files
  const rootFiles = [
    { path: '/home/node/workspace/MEMORY.md', category: 'system' },
    { path: '/home/node/workspace/SOUL.md', category: 'system' },
    { path: '/home/node/workspace/AGENTS.md', category: 'system' },
    { path: '/home/node/workspace/HEARTBEAT.md', category: 'system' },
  ];

  for (const rf of rootFiles) {
    try {
      const content = fs.readFileSync(rf.path, 'utf8');
      const meta = parseMarkdownMeta(content);
      const name = path.basename(rf.path, '.md');
      nodes.push({
        id: `_root/${name}`,
        label: name,
        category: rf.category,
        path: path.basename(rf.path),
        tags: meta.tags,
        sections: meta.sections,
        excerpt: meta.excerpt,
        links: [],
        size: content.length,
        mtime: fs.statSync(rf.path).mtimeMs,
        wordCount: content.split(/\s+/).length
      });
    } catch {}
  }

  const graph = { nodes, edges, categories: [...new Set(nodes.map(n => n.category))] };
  cache.set('graph', graph);
  return graph;
}

module.exports = function(app) {
  app.get('/api/knowledge', (req, res) => {
    try {
      res.json(buildGraph());
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/knowledge/file', (req, res) => {
    try {
      const id = req.query.id;
      if (!id) return res.status(400).json({ error: 'id required' });
      const filePath = path.join(KNOWLEDGE_DIR, id + '.md');
      if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Not found' });
      const content = fs.readFileSync(filePath, 'utf8');
      const meta = parseMarkdownMeta(content);
      res.json({ ...meta, content, path: id });
    } catch (err) { res.status(500).json({ error: err.message }); }
  });
};
