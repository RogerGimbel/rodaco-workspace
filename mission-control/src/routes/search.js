const { searchFiles } = require('../lib/file-walker');

const MEMORY_DIR = '/home/node/workspace/memory';
const KNOWLEDGE_DIR = '/home/node/workspace/knowledge';

module.exports = function(app) {
  app.get('/api/search', (req, res) => {
    const query = req.query.q || '';
    if (query.length < 2) return res.json({ results: [], query });

    const memoryResults = searchFiles(query, MEMORY_DIR);
    const knowledgeResults = searchFiles(query, KNOWLEDGE_DIR);
    const allResults = [...memoryResults, ...knowledgeResults]
      .sort((a, b) => b.matchCount !== a.matchCount ? b.matchCount - a.matchCount : b.mtime - a.mtime);

    res.json({ results: allResults.slice(0, 50), query });
  });
};
