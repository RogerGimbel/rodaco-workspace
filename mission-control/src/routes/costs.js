const fs = require('fs');
const path = require('path');
const { getSessionFiles, parseSessionUsage } = require('../lib/session-parser');

// Cost rates per 1K tokens (estimates)
const COST_RATES = {
  'claude-opus-4-6':       { input: 0.015, output: 0.075, cacheRead: 0.00375 },
  'claude-sonnet-4-6':     { input: 0.003, output: 0.015, cacheRead: 0.00075 },
  'claude-sonnet-4-5-20250514': { input: 0.003, output: 0.015, cacheRead: 0.00075 },
  'claude-3-5-sonnet':     { input: 0.003, output: 0.015, cacheRead: 0.00075 },
  'claude-3-haiku':        { input: 0.00025, output: 0.00125, cacheRead: 0.0000625 },
  'grok-3':                { input: 0.003, output: 0.015, cacheRead: 0.00075 },
  'grok-3-mini':           { input: 0.0003, output: 0.0005, cacheRead: 0.0001 },
  'grok-4-1':              { input: 0.003, output: 0.015, cacheRead: 0.00075 },
};

function getRate(model) {
  // Exact match first
  if (COST_RATES[model]) return COST_RATES[model];
  // Partial match
  const key = Object.keys(COST_RATES).find(k => model.includes(k) || k.includes(model));
  if (key) return COST_RATES[key];
  // Default: sonnet-like pricing
  return { input: 0.003, output: 0.015, cacheRead: 0.00075 };
}

function estimateCost(entry) {
  // If session parser already computed cost, use it (if non-zero)
  if (entry.cost && entry.cost > 0) return entry.cost;
  const rate = getRate(entry.model);
  return (entry.input * rate.input + entry.output * rate.output + entry.cacheRead * rate.cacheRead) / 1000;
}

module.exports = function(app) {
  app.get('/api/usage/costs', (req, res) => {
    try {
      const files = getSessionFiles(60); // last 60 sessions
      const now = Date.now();
      const dayMs = 86400000;

      const result = {
        today: { total: 0, byModel: {} },
        day7: { total: 0, byModel: {} },
        day30: { total: 0, byModel: {} },
        models: {},
        timestamp: new Date().toISOString()
      };

      for (const file of files) {
        const entries = parseSessionUsage(file.path);
        for (const u of entries) {
          const ts = typeof u.timestamp === 'number' ? u.timestamp : new Date(u.timestamp).getTime();
          const age = now - ts;
          const cost = estimateCost(u);
          const model = (u.model || 'unknown').split('/').pop();

          if (!result.models[model]) {
            result.models[model] = { input: 0, output: 0, cacheRead: 0, cost: 0, calls: 0 };
          }

          const addTo = (bucket) => {
            bucket.total += cost;
            if (!bucket.byModel[model]) bucket.byModel[model] = { cost: 0, calls: 0, input: 0, output: 0 };
            bucket.byModel[model].cost += cost;
            bucket.byModel[model].calls++;
            bucket.byModel[model].input += u.input;
            bucket.byModel[model].output += u.output;
          };

          if (age <= dayMs) addTo(result.today);
          if (age <= 7 * dayMs) addTo(result.day7);
          if (age <= 30 * dayMs) addTo(result.day30);

          if (age <= 30 * dayMs) {
            result.models[model].input += u.input;
            result.models[model].output += u.output;
            result.models[model].cacheRead += u.cacheRead;
            result.models[model].cost += cost;
            result.models[model].calls++;
          }
        }
      }

      res.json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
