const fs = require('fs');
const path = require('path');

const CRON_FILE = path.join(process.env.HOME, '.openclaw/cron/jobs.json');

module.exports = function(app) {
  app.get('/api/cron', (req, res) => {
    try {
      const data = JSON.parse(fs.readFileSync(CRON_FILE, 'utf8'));
      res.json(data.jobs || []);
    } catch { res.json([]); }
  });
};
