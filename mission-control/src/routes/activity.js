const { getSessionFiles, parseSessionEvents } = require('../lib/session-parser');
const Cache = require('../lib/cache');

const cache = new Cache(30000);

module.exports = function(app) {
  app.get('/api/activity', async (req, res) => {
    try {
      const forceRefresh = req.query.refresh === 'true';
      const limit = parseInt(req.query.limit) || 200;
      const typeFilter = req.query.type || null;
      const dateFrom = req.query.from || null;
      const dateTo = req.query.to || null;

      let allEvents = forceRefresh ? null : cache.get('activity');

      if (!allEvents) {
        const files = getSessionFiles(20);
        allEvents = [];
        for (const file of files) {
          allEvents = allEvents.concat(parseSessionEvents(file.path));
        }
        allEvents.sort((a, b) => (a.timestamp > b.timestamp ? -1 : a.timestamp < b.timestamp ? 1 : 0));
        cache.set('activity', allEvents);
      }

      let filtered = allEvents;
      if (typeFilter) filtered = filtered.filter(e => e.type === typeFilter);
      if (dateFrom) filtered = filtered.filter(e => e.timestamp >= dateFrom);
      if (dateTo) filtered = filtered.filter(e => e.timestamp <= dateTo);

      res.json(filtered.slice(0, limit));
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
