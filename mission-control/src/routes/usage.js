const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { getSessionFiles, parseSessionUsage } = require('../lib/session-parser');

function apiGet(url, headers) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { headers, timeout: 10000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
  });
}

async function fetchProviderUsage() {
  const results = {};

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const now = new Date();
      const endDate = now.toISOString().split('T')[0];
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const usage = await apiGet(`https://api.openai.com/v1/usage?date=${endDate}`, { 'Authorization': `Bearer ${openaiKey}` });
      const billing = await apiGet(`https://api.openai.com/v1/organization/usage/completions?start_time=${Math.floor(new Date(startDate).getTime()/1000)}&end_time=${Math.floor(now.getTime()/1000)}&limit=1`, { 'Authorization': `Bearer ${openaiKey}` });
      results.openai = { available: true, usage: usage.status === 200 ? usage.data : null, billing: billing.status === 200 ? billing.data : null, key: openaiKey.substring(0, 8) + '...' };
    } catch (e) { results.openai = { available: false, error: e.message }; }
  } else { results.openai = { available: false, reason: 'no key' }; }

  const voyageKey = process.env.VOYAGE_API_KEY || (() => {
    try {
      const cfg = JSON.parse(fs.readFileSync(path.join(process.env.HOME, '.openclaw/openclaw.json'), 'utf8'));
      return cfg?.agents?.defaults?.memorySearch?.remote?.apiKey;
    } catch { return null; }
  })();
  if (voyageKey) {
    try {
      const usage = await apiGet('https://api.voyageai.com/v1/usage', { 'Authorization': `Bearer ${voyageKey}`, 'Content-Type': 'application/json' });
      results.voyage = { available: true, usage: usage.status === 200 ? usage.data : null, statusCode: usage.status, key: voyageKey.substring(0, 8) + '...' };
    } catch (e) { results.voyage = { available: false, error: e.message }; }
  } else { results.voyage = { available: false, reason: 'no key' }; }

  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (geminiKey) results.gemini = { available: true, note: 'Gemini usage tracked per-request', key: geminiKey.substring(0, 8) + '...' };
  else results.gemini = { available: false, reason: 'no key' };

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey) results.anthropic = { available: true, note: 'Usage tracked in session logs', key: anthropicKey.substring(0, 8) + '...' };

  const xaiKey = process.env.XAI_API_KEY;
  if (xaiKey) results.xai = { available: true, note: 'Usage tracked in session logs', key: xaiKey.substring(0, 8) + '...' };

  return results;
}

module.exports = function(app) {
  app.get('/api/usage', async (req, res) => {
    try {
      const files = getSessionFiles(30);
      const usage = { byModel: {}, byDay: {}, bySession: {}, totals: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalCost: 0 }, recentMessages: [] };

      for (const file of files) {
        const entries = parseSessionUsage(file.path);
        const sid = file.name.replace('.jsonl', '').substring(0, 8);

        for (const u of entries) {
          const day = typeof u.timestamp === 'number'
            ? new Date(u.timestamp).toISOString().split('T')[0]
            : typeof u.timestamp === 'string' ? u.timestamp.split('T')[0] : 'unknown';

          if (!usage.byModel[u.model]) usage.byModel[u.model] = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, calls: 0 };
          usage.byModel[u.model].input += u.input;
          usage.byModel[u.model].output += u.output;
          usage.byModel[u.model].cacheRead += u.cacheRead;
          usage.byModel[u.model].cacheWrite += u.cacheWrite;
          usage.byModel[u.model].cost += u.cost;
          usage.byModel[u.model].calls++;

          if (!usage.byDay[day]) usage.byDay[day] = { input: 0, output: 0, cost: 0, calls: 0 };
          usage.byDay[day].input += u.input;
          usage.byDay[day].output += u.output;
          usage.byDay[day].cost += u.cost;
          usage.byDay[day].calls++;

          if (!usage.bySession[sid]) usage.bySession[sid] = { model: u.model, input: 0, output: 0, cost: 0, calls: 0 };
          usage.bySession[sid].input += u.input;
          usage.bySession[sid].output += u.output;
          usage.bySession[sid].cost += u.cost;
          usage.bySession[sid].calls++;

          usage.totals.input += u.input;
          usage.totals.output += u.output;
          usage.totals.cacheRead += u.cacheRead;
          usage.totals.cacheWrite += u.cacheWrite;
          usage.totals.totalCost += u.cost;

          if (usage.recentMessages.length < 50) {
            usage.recentMessages.push(u);
          }
        }
      }

      usage.recentMessages.sort((a, b) => {
        const ta = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
        const tb = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
        return tb - ta;
      });

      try { usage.providers = await fetchProviderUsage(); } catch (e) { usage.providers = { error: e.message }; }

      res.json(usage);
    } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.get('/api/providers', async (req, res) => {
    try { res.json(await fetchProviderUsage()); }
    catch (err) { res.status(500).json({ error: err.message }); }
  });
};
