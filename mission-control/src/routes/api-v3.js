const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');
const https = require('https');
const { getSessionFiles, parseSessionEvents, parseSessionUsage, SESSIONS_DIR } = require('../lib/session-parser');
const { walkDir, searchFiles } = require('../lib/file-walker');
const Cache = require('../lib/cache');

// ─── Constants ─────────────────────────────────────
const WORKSPACE = '/home/node/workspace';
const KNOWLEDGE_DIR = path.join(WORKSPACE, 'knowledge');
const MEMORY_DIR = path.join(WORKSPACE, 'memory');
const cache = new Cache(30000); // 30s cache for expensive operations

// ─── Helpers ───────────────────────────────────────
function apiGet(url, headers = {}) {
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

function sshCommand(host, command) {
  const cached = cache.get(`ssh:${host}:${command}`);
  if (cached) return cached;
  try {
    const result = execSync(`ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${host} "${command}"`, 
      { encoding: 'utf8', timeout: 10000 }).trim();
    cache.set(`ssh:${host}:${command}`, result);
    return result;
  } catch (e) {
    return null;
  }
}

function parseMarkdown(content) {
  const meta = { title: '', tags: [], links: [], sections: [], excerpt: '', frontmatter: {} };
  
  // YAML frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (fmMatch) {
    const fm = fmMatch[1];
    fm.split('\n').forEach(line => {
      const match = line.match(/^(\w+):\s*(.+)/);
      if (match) {
        const [, key, value] = match;
        meta.frontmatter[key] = value.replace(/^["']|["']$/g, '');
        if (key === 'title') meta.title = meta.frontmatter[key];
        if (key === 'tags') meta.tags = value.match(/\[([^\]]+)\]/) 
          ? value.match(/\[([^\]]+)\]/)[1].split(',').map(t => t.trim().replace(/["']/g, ''))
          : [value];
      }
    });
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
  
  // Excerpt: first non-empty, non-header, non-frontmatter paragraph
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

function parseActiveTasks() {
  try {
    const content = fs.readFileSync(path.join(MEMORY_DIR, 'active-tasks.md'), 'utf8');
    const tasks = [];
    const taskBlocks = content.split(/^##\s+/m).slice(1);
    
    for (const block of taskBlocks) {
      const lines = block.trim().split('\n');
      const title = lines[0].trim();
      const task = { title, status: 'active', started: null, plan: [], nextStep: '' };
      
      let currentSection = '';
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('**Status:**')) task.status = line.replace('**Status:**', '').trim();
        else if (line.startsWith('**Started:**')) task.started = line.replace('**Started:**', '').trim();
        else if (line.startsWith('**Next:**')) task.nextStep = line.replace('**Next:**', '').trim();
        else if (line.startsWith('**Plan:**')) currentSection = 'plan';
        else if (currentSection === 'plan' && line.startsWith('-')) task.plan.push(line.substring(1).trim());
      }
      
      tasks.push(task);
    }
    
    return tasks;
  } catch {
    return [];
  }
}

function parseGoals() {
  try {
    const content = fs.readFileSync(path.join(WORKSPACE, 'GOALS.md'), 'utf8');
    const goals = { role: '', projects: [], antiGoals: [], overnightTasks: [] };
    
    // Extract role
    const roleMatch = content.match(/##\s*Role[\s\S]*?###\s*Primary Directive[:\s]*(.+?)(?=\n\n|\n###)/);
    if (roleMatch) goals.role = roleMatch[1].trim();
    
    // Extract projects
    const projectsMatch = content.match(/##\s*Active Projects[\s\S]*?((?:###\s+.+[\s\S]*?)+?)(?=##|$)/);
    if (projectsMatch) {
      const projectBlocks = projectsMatch[1].match(/###\s+(.+?)\n([\s\S]*?)(?=###|$)/g);
      if (projectBlocks) {
        projectBlocks.forEach(block => {
          const titleMatch = block.match(/###\s+(.+)/);
          const items = block.match(/^[-*]\s+(.+)$/gm);
          if (titleMatch) {
            goals.projects.push({
              name: titleMatch[1].trim(),
              items: items ? items.map(i => i.replace(/^[-*]\s+/, '').trim()) : []
            });
          }
        });
      }
    }
    
    // Extract anti-goals
    const antiMatch = content.match(/##\s*Anti-Goals[\s\S]*?((?:[-*]\s+.+\n?)+)/);
    if (antiMatch) {
      goals.antiGoals = antiMatch[1].match(/^[-*]\s+(.+)$/gm)
        .map(line => line.replace(/^[-*]\s+/, '').trim());
    }
    
    // Extract overnight tasks
    const overnightMatch = content.match(/##\s*Overnight Build Tasks[\s\S]*?((?:[-*]\s+.+\n?)+)/);
    if (overnightMatch) {
      goals.overnightTasks = overnightMatch[1].match(/^[-*]\s+(.+)$/gm)
        .map(line => line.replace(/^[-*]\s+/, '').trim());
    }
    
    return goals;
  } catch {
    return { role: '', projects: [], antiGoals: [], overnightTasks: [] };
  }
}

function parseOvernightLog(date) {
  try {
    const fileName = date || new Date().toISOString().split('T')[0];
    const content = fs.readFileSync(path.join(MEMORY_DIR, `${fileName}.md`), 'utf8');
    
    const log = { date: fileName, task: '', findings: [], issues: [], nextActions: [] };
    
    // Find overnight build section
    const overnightMatch = content.match(/##\s*Overnight Build[\s\S]*?(?=\n##|$)/);
    if (!overnightMatch) return log;
    
    const section = overnightMatch[0];
    const taskMatch = section.match(/\*\*Task:\*\*\s*(.+)/);
    if (taskMatch) log.task = taskMatch[1].trim();
    
    const findingsMatch = section.match(/\*\*Findings:\*\*([\s\S]*?)(?=\*\*|$)/);
    if (findingsMatch) {
      log.findings = findingsMatch[1].match(/^[-*]\s+(.+)$/gm)
        ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
    }
    
    const issuesMatch = section.match(/\*\*Issues:\*\*([\s\S]*?)(?=\*\*|$)/);
    if (issuesMatch) {
      log.issues = issuesMatch[1].match(/^[-*]\s+(.+)$/gm)
        ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
    }
    
    const nextMatch = section.match(/\*\*Next:\*\*([\s\S]*?)(?=\n##|$)/);
    if (nextMatch) {
      log.nextActions = nextMatch[1].match(/^[-*]\s+(.+)$/gm)
        ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
    }
    
    return log;
  } catch {
    return { date, task: '', findings: [], issues: [], nextActions: [] };
  }
}

function parseIdentity() {
  try {
    const identity = fs.readFileSync(path.join(WORKSPACE, 'IDENTITY.md'), 'utf8');
    const soul = fs.existsSync(path.join(WORKSPACE, 'SOUL.md')) 
      ? fs.readFileSync(path.join(WORKSPACE, 'SOUL.md'), 'utf8') : '';
    
    const agent = { name: 'Rodaco', model: 'unknown', uptime: process.uptime(), capabilities: [] };
    
    const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/);
    if (nameMatch) agent.name = nameMatch[1].trim();
    
    const modelMatch = identity.match(/\*\*Default Model:\*\*\s*(.+)/);
    if (modelMatch) agent.model = modelMatch[1].trim();
    
    const capMatch = identity.match(/##\s*My Capabilities[\s\S]*?((?:###\s+.+[\s\S]*?)+?)(?=##|$)/);
    if (capMatch) {
      const caps = capMatch[1].match(/###\s+(.+)/g);
      if (caps) agent.capabilities = caps.map(c => c.replace(/###\s+/, '').trim());
    }
    
    // Extract personality from SOUL.md
    if (soul) {
      const vibeMatch = soul.match(/##\s*Vibe[\s\S]*?(.+?)(?=\n##|$)/);
      if (vibeMatch) agent.personality = vibeMatch[1].trim();
    }
    
    return agent;
  } catch {
    return { name: 'Rodaco', model: 'unknown', uptime: process.uptime(), capabilities: [] };
  }
}

function parseModelArsenal() {
  try {
    const identity = fs.readFileSync(path.join(WORKSPACE, 'IDENTITY.md'), 'utf8');
    const models = [];
    
    const arsenalMatch = identity.match(/##\s*Model Arsenal[\s\S]*?\|(.+)\|[\s\S]*?((?:\|.+\|\n)+)/);
    if (!arsenalMatch) return models;
    
    const rows = arsenalMatch[2].trim().split('\n').filter(l => l.includes('|'));
    for (const row of rows) {
      if (row.includes('---')) continue;
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 3) {
        models.push({
          alias: cells[0],
          model: cells[1],
          bestFor: cells[2],
          cost: cells[3] || 'unknown'
        });
      }
    }
    
    return models;
  } catch {
    return [];
  }
}

function buildKnowledgeGraph() {
  const cached = cache.get('knowledge-graph');
  if (cached) return cached;
  
  const nodes = [];
  const edges = [];
  const nodeMap = {};
  
  const files = walkDir(KNOWLEDGE_DIR, { extensions: ['.md'] });
  
  for (const file of files) {
    try {
      const content = fs.readFileSync(file.path, 'utf8');
      const meta = parseMarkdown(content);
      const relPath = file.path.replace(KNOWLEDGE_DIR + '/', '');
      const id = relPath.replace(/\.md$/, '');
      
      const parts = relPath.split('/');
      const category = parts.length > 1 ? parts[0] : 'root';
      
      const node = {
        id,
        label: meta.title || file.name.replace('.md', ''),
        category,
        path: relPath,
        tags: meta.tags,
        sections: meta.sections.map(s => s.title),
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
      if (node.label && !nodeMap[node.label]) nodeMap[node.label] = node;
      if (node.label) {
        const lower = node.label.toLowerCase();
        if (!nodeMap[lower]) nodeMap[lower] = node;
        const slug = lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        if (!nodeMap[slug]) nodeMap[slug] = node;
      }
      const idParts = id.split('/');
      if (idParts.length >= 2) {
        const dirName = idParts[idParts.length - 2];
        if (!nodeMap[dirName]) nodeMap[dirName] = node;
      }
    } catch {}
  }
  
  // Build edges from links
  const edgeSet = new Set();
  for (const node of nodes) {
    for (const link of node.links) {
      const target = nodeMap[link] || nodeMap[link.toLowerCase()] || 
        nodeMap[link.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')];
      if (target && target.id !== node.id) {
        const key = [node.id, target.id].sort().join('|');
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({ source: node.id, target: target.id });
        }
      }
    }
  }
  
  const graph = { nodes, edges, categories: [...new Set(nodes.map(n => n.category))] };
  cache.set('knowledge-graph', graph);
  return graph;
}

// ─── API v3 Routes ─────────────────────────────────
module.exports = function(app) {
  console.log('📡 Registering Mission Control v3 API endpoints...');
  
  // CORS for cross-origin frontend access
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/v3')) {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') return res.sendStatus(200);
    }
    next();
  });
  
  // ═══════════════════════════════════════════════════
  // SYSTEM & HEALTH
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/health', (req, res) => {
    console.log('v3/health hit');
    const health = {
      status: 'ok',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    // Container health from /proc
    try {
      const loadAvg = fs.readFileSync('/proc/loadavg', 'utf8').trim().split(' ');
      health.loadAvg = { '1m': parseFloat(loadAvg[0]), '5m': parseFloat(loadAvg[1]), '15m': parseFloat(loadAvg[2]) };
    } catch {}
    
    try {
      const df = execSync('df -h / | tail -1', { encoding: 'utf8' });
      const parts = df.trim().split(/\s+/);
      health.disk = { total: parts[1], used: parts[2], available: parts[3], usePct: parts[4] };
    } catch {}
    
    res.json(health);
  });
  
  app.get('/api/v3/cron-status', async (req, res) => {
    try {
      // Read from memory/cron-status.json first
      let jobs = [];
      try {
        const cronStatus = JSON.parse(fs.readFileSync(path.join(MEMORY_DIR, 'cron-status.json'), 'utf8'));
        jobs = cronStatus.jobs || [];
      } catch {}
      
      // Augment with live OpenClaw cron API if available
      try {
        const gateway = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
        const token = process.env.OPENCLAW_GATEWAY_TOKEN || '';
        const cronList = await apiGet(`${gateway}/api/cron/list`, { 'Authorization': `Bearer ${token}` });
        
        if (cronList.status === 200 && cronList.data.jobs) {
          const liveJobs = cronList.data.jobs.map(j => ({
            id: j.id,
            name: j.name,
            schedule: j.schedule,
            lastRun: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
            status: j.state?.lastStatus || 'unknown',
            enabled: j.enabled !== false,
            consecutiveErrors: j.state?.consecutiveErrors || 0
          }));
          jobs = liveJobs;
        }
      } catch {}
      
      res.json({ jobs, timestamp: new Date().toISOString() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/system-overview', async (req, res) => {
    try {
      const overview = {
        health: { status: 'ok' },
        cronJobs: { total: 0, healthy: 0, failing: 0 },
        activeTaskCount: 0,
        subAgentCount: 0,
        lastBackup: null,
        timestamp: new Date().toISOString()
      };
      
      // Health check
      try {
        const gateway = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
        const healthRes = await apiGet(`${gateway}/health`);
        overview.health = healthRes.status === 200 ? healthRes.data : { status: 'unhealthy' };
      } catch {}
      
      // Cron jobs
      try {
        const cronStatus = JSON.parse(fs.readFileSync(path.join(MEMORY_DIR, 'cron-status.json'), 'utf8'));
        const jobs = cronStatus.jobs || [];
        overview.cronJobs.total = jobs.length;
        overview.cronJobs.healthy = jobs.filter(j => j.consecutiveErrors === 0).length;
        overview.cronJobs.failing = jobs.filter(j => j.consecutiveErrors > 0).length;
      } catch {}
      
      // Active tasks
      try {
        const tasks = parseActiveTasks();
        overview.activeTaskCount = tasks.filter(t => t.status === 'active').length;
      } catch {}
      
      // Sub-agents
      try {
        const sessions = fs.readdirSync(SESSIONS_DIR).filter(f => f.endsWith('.jsonl'));
        overview.subAgentCount = sessions.length;
      } catch {}
      
      // Last backup
      try {
        const backupLog = execSync('ls -lt /home/node/workspace/backups/*.tar.gz 2>/dev/null | head -1', { encoding: 'utf8' });
        const match = backupLog.match(/(\w{3}\s+\d+\s+\d+:\d+)/);
        if (match) overview.lastBackup = match[1];
      } catch {}
      
      res.json(overview);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/device/macbook', async (req, res) => {
    const device = {
      cpu: { model: 'unknown', cores: 0, usagePercent: 0, loadAvg: {} },
      temperature: { celsius: 0, fahrenheit: 0 },
      ram: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
      disk: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
      uptime: 0,
      hostname: 'rogers-macbook-pro'
    };
    
    const host = 'rogergimbel@100.124.209.59';
    
    // CPU info
    const cpuModel = sshCommand(host, 'sysctl -n machdep.cpu.brand_string');
    if (cpuModel) device.cpu.model = cpuModel;
    
    const cpuCores = sshCommand(host, 'sysctl -n hw.ncpu');
    if (cpuCores) device.cpu.cores = parseInt(cpuCores);
    
    // CPU usage via top
    const topOutput = sshCommand(host, "top -l 2 -n 0 | grep 'CPU usage' | tail -1");
    if (topOutput) {
      const match = topOutput.match(/(\d+\.\d+)% user/);
      if (match) device.cpu.usagePercent = parseFloat(match[1]);
    }
    
    // Load average
    const uptime = sshCommand(host, 'uptime');
    if (uptime) {
      const loadMatch = uptime.match(/load averages?:\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
      if (loadMatch) {
        device.cpu.loadAvg = {
          '1m': parseFloat(loadMatch[1]),
          '5m': parseFloat(loadMatch[2]),
          '15m': parseFloat(loadMatch[3])
        };
      }
      const uptimeMatch = uptime.match(/up\s+(.+?),\s+\d+\s+user/);
      if (uptimeMatch) device.uptime = uptimeMatch[1].trim();
    }
    
    // Temperature (convert C to F)
    const temp = sshCommand(host, 'sudo powermetrics --samplers smc -i1 -n1 2>/dev/null | grep "CPU die temperature"');
    if (temp) {
      const match = temp.match(/([\d.]+)\s*C/);
      if (match) {
        device.temperature.celsius = parseFloat(match[1]);
        device.temperature.fahrenheit = Math.round(device.temperature.celsius * 9/5 + 32);
      }
    }
    
    // RAM
    const vmStat = sshCommand(host, 'vm_stat');
    if (vmStat) {
      const pageSize = 4096;
      const free = (vmStat.match(/Pages free:\s+(\d+)/) || [0, 0])[1];
      const active = (vmStat.match(/Pages active:\s+(\d+)/) || [0, 0])[1];
      const inactive = (vmStat.match(/Pages inactive:\s+(\d+)/) || [0, 0])[1];
      const speculative = (vmStat.match(/Pages speculative:\s+(\d+)/) || [0, 0])[1];
      const wired = (vmStat.match(/Pages wired down:\s+(\d+)/) || [0, 0])[1];
      
      const freeBytes = (parseInt(free) + parseInt(speculative)) * pageSize;
      const usedBytes = (parseInt(active) + parseInt(inactive) + parseInt(wired)) * pageSize;
      const totalBytes = freeBytes + usedBytes;
      
      device.ram.totalGB = (totalBytes / 1024 / 1024 / 1024).toFixed(2);
      device.ram.usedGB = (usedBytes / 1024 / 1024 / 1024).toFixed(2);
      device.ram.availableGB = (freeBytes / 1024 / 1024 / 1024).toFixed(2);
      device.ram.usagePercent = ((usedBytes / totalBytes) * 100).toFixed(1);
    }
    
    // Disk
    const df = sshCommand(host, 'df -h /');
    if (df) {
      const lines = df.split('\n');
      if (lines.length > 1) {
        const parts = lines[1].trim().split(/\s+/);
        device.disk.totalGB = parts[1];
        device.disk.usedGB = parts[2];
        device.disk.availableGB = parts[3];
        device.disk.usagePercent = parts[4];
      }
    }
    
    res.json(device);
  });
  
  app.get('/api/v3/device/pi', async (req, res) => {
    const device = {
      cpu: { model: 'Raspberry Pi 5', cores: 4, usagePercent: 0, loadAvg: {} },
      temperature: { celsius: 0, fahrenheit: 0 },
      ram: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
      storage: {
        root: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
        docker: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 },
        media: { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0 }
      },
      uptime: 0,
      hostname: 'media-pi'
    };
    
    const host = 'rogergimbel@100.83.169.87';
    
    // Temperature
    const temp = sshCommand(host, 'vcgencmd measure_temp');
    if (temp) {
      const match = temp.match(/temp=([\d.]+)/);
      if (match) {
        device.temperature.celsius = parseFloat(match[1]);
        device.temperature.fahrenheit = Math.round(device.temperature.celsius * 9/5 + 32);
      }
    }
    
    // CPU usage via top
    const topOutput = sshCommand(host, "top -bn1 | grep 'Cpu(s)'");
    if (topOutput) {
      const match = topOutput.match(/([\d.]+)\s*us/);
      if (match) device.cpu.usagePercent = parseFloat(match[1]);
    }
    
    // Load average
    const uptime = sshCommand(host, 'uptime');
    if (uptime) {
      const loadMatch = uptime.match(/load average:\s+([\d.]+),\s+([\d.]+),\s+([\d.]+)/);
      if (loadMatch) {
        device.cpu.loadAvg = {
          '1m': parseFloat(loadMatch[1]),
          '5m': parseFloat(loadMatch[2]),
          '15m': parseFloat(loadMatch[3])
        };
      }
      const uptimeMatch = uptime.match(/up\s+(.+?),\s+\d+\s+user/);
      if (uptimeMatch) device.uptime = uptimeMatch[1].trim();
    }
    
    // RAM
    const free = sshCommand(host, 'free -m');
    if (free) {
      const lines = free.split('\n');
      const memLine = lines.find(l => l.startsWith('Mem:'));
      if (memLine) {
        const parts = memLine.split(/\s+/);
        device.ram.totalGB = (parseInt(parts[1]) / 1024).toFixed(2);
        device.ram.usedGB = (parseInt(parts[2]) / 1024).toFixed(2);
        device.ram.availableGB = (parseInt(parts[6]) / 1024).toFixed(2);
        device.ram.usagePercent = ((parseInt(parts[2]) / parseInt(parts[1])) * 100).toFixed(1);
      }
    }
    
    // Disk (three drives)
    const df = sshCommand(host, 'df -h');
    if (df) {
      const lines = df.split('\n');
      
      const rootLine = lines.find(l => l.match(/\s+\/$/));
      if (rootLine) {
        const parts = rootLine.trim().split(/\s+/);
        device.storage.root = { totalGB: parts[1], usedGB: parts[2], availableGB: parts[3], usagePercent: parts[4] };
      }
      
      const dockerLine = lines.find(l => l.includes('/mnt/docker'));
      if (dockerLine) {
        const parts = dockerLine.trim().split(/\s+/);
        device.storage.docker = { totalGB: parts[1], usedGB: parts[2], availableGB: parts[3], usagePercent: parts[4] };
      }
      
      const mediaLine = lines.find(l => l.includes('/mnt/media'));
      if (mediaLine) {
        const parts = mediaLine.trim().split(/\s+/);
        device.storage.media = { totalGB: parts[1], usedGB: parts[2], availableGB: parts[3], usagePercent: parts[4] };
      }
    }
    
    res.json(device);
  });
  
  // ═══════════════════════════════════════════════════
  // ACTIVITY FEED
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/activity', (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const files = getSessionFiles(10);
      const events = [];
      
      for (const file of files) {
        const fileEvents = parseSessionEvents(file.path);
        events.push(...fileEvents);
      }
      
      events.sort((a, b) => {
        const ta = typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
        const tb = typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
        return tb - ta;
      });
      
      const mapped = events.slice(0, limit).map(e => ({
        timestamp: typeof e.timestamp === 'number' ? new Date(e.timestamp).toISOString() : e.timestamp,
        type: e.type,
        subtype: e.subtype,
        summary: e.description,
        source: e.sessionId,
        details: { model: e.model }
      }));
      
      res.json({ events: mapped, total: events.length });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════
  // USAGE & COSTS
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/usage', async (req, res) => {
    try {
      const files = getSessionFiles(30);
      const usage = {
        byModel: {},
        byDay: {},
        totals: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalCost: 0 }
      };
      
      for (const file of files) {
        const entries = parseSessionUsage(file.path);
        
        for (const u of entries) {
          const day = typeof u.timestamp === 'number'
            ? new Date(u.timestamp).toISOString().split('T')[0]
            : typeof u.timestamp === 'string' ? u.timestamp.split('T')[0] : 'unknown';
          
          if (!usage.byModel[u.model]) {
            usage.byModel[u.model] = { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, cost: 0, calls: 0 };
          }
          usage.byModel[u.model].input += u.input;
          usage.byModel[u.model].output += u.output;
          usage.byModel[u.model].cacheRead += u.cacheRead;
          usage.byModel[u.model].cacheWrite += u.cacheWrite;
          usage.byModel[u.model].cost += u.cost;
          usage.byModel[u.model].calls++;
          
          if (!usage.byDay[day]) usage.byDay[day] = { input: 0, output: 0, cost: 0 };
          usage.byDay[day].input += u.input;
          usage.byDay[day].output += u.output;
          usage.byDay[day].cost += u.cost;
          
          usage.totals.input += u.input;
          usage.totals.output += u.output;
          usage.totals.cacheRead += u.cacheRead;
          usage.totals.cacheWrite += u.cacheWrite;
          usage.totals.totalCost += u.cost;
        }
      }
      
      res.json(usage);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/usage/providers', async (req, res) => {
    try {
      const providers = {};
      
      const keys = ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'XAI_API_KEY', 'GEMINI_API_KEY', 'VOYAGE_API_KEY'];
      for (const key of keys) {
        const value = process.env[key];
        const provider = key.replace('_API_KEY', '').toLowerCase();
        providers[provider] = {
          available: !!value,
          key: value ? value.substring(0, 8) + '...' : null,
          usage: null
        };
      }
      
      // Try to fetch OpenAI usage
      if (providers.openai.available) {
        const url = 'https://api.openai.com/v1/usage?date=' + new Date().toISOString().split('T')[0];
        const result = await apiGet(url, { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` });
        if (result.status === 200) providers.openai.usage = result.data;
      }
      
      res.json(providers);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════
  // TASKS & GOALS
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/active-tasks', (req, res) => {
    try {
      const tasks = parseActiveTasks();
      res.json({ tasks });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/goals', (req, res) => {
    try {
      const goals = parseGoals();
      res.json(goals);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/overnight-log', (req, res) => {
    try {
      const date = req.query.date;
      const log = parseOvernightLog(date);
      res.json(log);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/suggested-tasks', (req, res) => {
    try {
      const suggestedPath = path.join(MEMORY_DIR, 'suggested-tasks.json');
      if (!fs.existsSync(suggestedPath)) {
        return res.json({ tasks: [] });
      }
      const data = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));
      res.json({ tasks: data.tasks || [] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.post('/api/v3/suggested-tasks/:id/approve', (req, res) => {
    try {
      const taskId = req.params.id;
      const suggestedPath = path.join(MEMORY_DIR, 'suggested-tasks.json');
      const data = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));
      const task = data.tasks.find(t => t.id === taskId);
      
      if (task) {
        task.status = 'approved';
        task.approvedAt = new Date().toISOString();
        fs.writeFileSync(suggestedPath, JSON.stringify(data, null, 2));
        res.json({ success: true, task });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.post('/api/v3/suggested-tasks/:id/reject', (req, res) => {
    try {
      const taskId = req.params.id;
      const suggestedPath = path.join(MEMORY_DIR, 'suggested-tasks.json');
      const data = JSON.parse(fs.readFileSync(suggestedPath, 'utf8'));
      const task = data.tasks.find(t => t.id === taskId);
      
      if (task) {
        task.status = 'rejected';
        task.rejectedAt = new Date().toISOString();
        fs.writeFileSync(suggestedPath, JSON.stringify(data, null, 2));
        res.json({ success: true, task });
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════
  // AGENT
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/agent', (req, res) => {
    try {
      const agent = parseIdentity();
      res.json(agent);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/agent/models', (req, res) => {
    try {
      const models = parseModelArsenal();
      res.json({ models });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/agent/sessions', async (req, res) => {
    try {
      const gateway = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
      const token = process.env.OPENCLAW_GATEWAY_TOKEN || '';
      const result = await apiGet(`${gateway}/api/sessions/list`, { 'Authorization': `Bearer ${token}` });
      
      if (result.status === 200) {
        res.json(result.data);
      } else {
        // Fallback to local session files
        const files = getSessionFiles(20);
        const sessions = files.map(f => ({
          id: f.name.replace('.jsonl', ''),
          path: f.path,
          mtime: new Date(f.mtime).toISOString()
        }));
        res.json({ active: sessions.slice(0, 5), recent: sessions });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/agent/cron-jobs', async (req, res) => {
    try {
      const gateway = process.env.OPENCLAW_GATEWAY_URL || 'http://127.0.0.1:18789';
      const token = process.env.OPENCLAW_GATEWAY_TOKEN || '';
      const result = await apiGet(`${gateway}/api/cron/list`, { 'Authorization': `Bearer ${token}` });
      
      if (result.status === 200 && result.data.jobs) {
        const jobs = result.data.jobs.map(j => ({
          id: j.id,
          name: j.name,
          schedule: j.schedule,
          enabled: j.enabled !== false,
          lastRun: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
          lastStatus: j.state?.lastStatus || 'unknown',
          consecutiveErrors: j.state?.consecutiveErrors || 0
        }));
        res.json({ jobs });
      } else {
        res.json({ jobs: [] });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════
  // PROJECTS
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/projects/beerpair', (req, res) => {
    try {
      const project = {
        name: 'BeerPair',
        status: 'active',
        credits: { used: 0, total: 10 },
        testResults: [],
        appStoreStatus: 'in-progress',
        marketingAssets: []
      };
      
      // Read from knowledge/projects/beerpair/summary.md
      const summaryPath = path.join(KNOWLEDGE_DIR, 'projects/beerpair/summary.md');
      if (fs.existsSync(summaryPath)) {
        const content = fs.readFileSync(summaryPath, 'utf8');
        const meta = parseMarkdown(content);
        project.summary = meta.excerpt;
        
        // Extract credits if mentioned
        const creditsMatch = content.match(/Credits:\s*(\d+)\/(\d+)/);
        if (creditsMatch) {
          project.credits.used = parseInt(creditsMatch[1]);
          project.credits.total = parseInt(creditsMatch[2]);
        }
        
        // Extract status
        const statusMatch = content.match(/\*\*Status:\*\*\s*(.+)/);
        if (statusMatch) project.status = statusMatch[1].trim();
      }
      
      // Test results from memory files
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md')).sort().reverse().slice(0, 30);
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const testMatch = content.match(/##\s*BeerPair Test[\s\S]*?(?=\n##|$)/g);
          if (testMatch) {
            testMatch.forEach(section => {
              const dateMatch = file.match(/(\d{4}-\d{2}-\d{2})/);
              project.testResults.push({
                date: dateMatch ? dateMatch[1] : 'unknown',
                summary: section.substring(0, 300)
              });
            });
          }
        } catch {}
      }
      
      res.json(project);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/projects/beerpair/test-results', (req, res) => {
    try {
      const tests = [];
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md')).sort().reverse();
      
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const sections = content.match(/##\s*BeerPair Test[\s\S]*?(?=\n##|$)/g);
          if (sections) {
            sections.forEach(section => {
              const test = {
                date: file.replace('.md', ''),
                image: null,
                preference: null,
                resultCount: 0,
                issues: [],
                notes: []
              };
              
              const imageMatch = section.match(/Image:\s*(.+)/);
              if (imageMatch) test.image = imageMatch[1].trim();
              
              const resultMatch = section.match(/(\d+)\s+result/);
              if (resultMatch) test.resultCount = parseInt(resultMatch[1]);
              
              const issuesMatch = section.match(/Issues:([\s\S]*?)(?=\n\*\*|$)/);
              if (issuesMatch) {
                test.issues = issuesMatch[1].match(/^[-*]\s+(.+)$/gm)
                  ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
              }
              
              tests.push(test);
            });
          }
        } catch {}
      }
      
      res.json({ tests });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/projects/ocean-one', (req, res) => {
    try {
      const project = {
        name: 'Ocean One Marine',
        status: 'active',
        seoFindings: [],
        contentGaps: [],
        expansionNotes: []
      };
      
      // Read from knowledge/chat-history/ocean-one.md
      const historyPath = path.join(KNOWLEDGE_DIR, 'chat-history/ocean-one.md');
      if (fs.existsSync(historyPath)) {
        const content = fs.readFileSync(historyPath, 'utf8');
        
        const seoMatch = content.match(/##\s*SEO[\s\S]*?((?:[-*]\s+.+\n?)+)/);
        if (seoMatch) {
          project.seoFindings = seoMatch[1].match(/^[-*]\s+(.+)$/gm)
            ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
        }
        
        const gapsMatch = content.match(/##\s*Content Gaps[\s\S]*?((?:[-*]\s+.+\n?)+)/);
        if (gapsMatch) {
          project.contentGaps = gapsMatch[1].match(/^[-*]\s+(.+)$/gm)
            ?.map(l => l.replace(/^[-*]\s+/, '').trim()) || [];
        }
      }
      
      res.json(project);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════
  // KNOWLEDGE
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/knowledge/graph', (req, res) => {
    try {
      const graph = buildKnowledgeGraph();
      res.json(graph);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/knowledge/search', (req, res) => {
    try {
      const query = req.query.q;
      if (!query) return res.status(400).json({ error: 'Query required' });
      
      const knowledgeResults = searchFiles(query, KNOWLEDGE_DIR);
      const memoryResults = searchFiles(query, MEMORY_DIR);
      
      const results = [...knowledgeResults, ...memoryResults].map(r => ({
        path: r.file,
        matchCount: r.matchCount,
        snippet: r.matches[0]?.line || '',
        score: r.matchCount,
        mtime: r.mtime
      }));
      
      res.json({ results });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/knowledge/entity', (req, res) => {
    try {
      const entityPath = req.query.path;
      if (!entityPath) return res.status(400).json({ error: 'path query parameter required' });
      const fullPath = path.join(KNOWLEDGE_DIR, entityPath + '.md');
      
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: 'Entity not found' });
      }
      
      const content = fs.readFileSync(fullPath, 'utf8');
      const meta = parseMarkdown(content);
      const stat = fs.statSync(fullPath);
      
      res.json({
        content,
        metadata: {
          ...meta,
          path: entityPath,
          lastModified: stat.mtime,
          size: stat.size
        }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/knowledge/tree', (req, res) => {
    try {
      function buildTree(dir, depth = 0) {
        if (depth > 5) return null;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        const tree = { name: path.basename(dir), type: 'directory', children: [] };
        
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            const subtree = buildTree(fullPath, depth + 1);
            if (subtree) tree.children.push(subtree);
          } else if (entry.name.endsWith('.md')) {
            tree.children.push({
              name: entry.name,
              type: 'file',
              path: fullPath.replace(KNOWLEDGE_DIR + '/', '').replace(/\.md$/, '')
            });
          }
        }
        
        return tree;
      }
      
      const tree = buildTree(KNOWLEDGE_DIR);
      res.json({ tree });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/knowledge/timeline', (req, res) => {
    try {
      const days = [];
      const memoryFiles = fs.readdirSync(MEMORY_DIR)
        .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
        .sort()
        .reverse()
        .slice(0, 90); // Last 90 days
      
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const wordCount = content.split(/\s+/).length;
          const sections = content.match(/^##\s+(.+)$/gm)?.map(h => h.replace(/^##\s+/, '')) || [];
          
          days.push({
            date: file.replace('.md', ''),
            wordCount,
            sections,
            size: content.length
          });
        } catch {}
      }
      
      res.json({ days });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  // ═══════════════════════════════════════════════════
  // RESEARCH
  // ═══════════════════════════════════════════════════
  
  app.get('/api/v3/research/openclaw', (req, res) => {
    try {
      const entries = [];
      const researchPath = path.join(MEMORY_DIR, 'openclaw-research.md');
      
      if (fs.existsSync(researchPath)) {
        const content = fs.readFileSync(researchPath, 'utf8');
        const blocks = content.split(/^##\s+/m).slice(1);
        
        for (const block of blocks) {
          const lines = block.trim().split('\n');
          const dateMatch = lines[0].match(/(\d{4}-\d{2}-\d{2})/);
          
          entries.push({
            date: dateMatch ? dateMatch[1] : 'unknown',
            title: lines[0].replace(/\d{4}-\d{2}-\d{2}/, '').trim(),
            content: lines.slice(1).join('\n').trim(),
            actionable: block.includes('TODO') || block.includes('Action:')
          });
        }
      }
      
      res.json({ entries });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/research/competitive', (req, res) => {
    try {
      const analyses = [];
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md')).sort().reverse().slice(0, 30);
      
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const sections = content.match(/##\s*Competitive Analysis[\s\S]*?(?=\n##|$)/g);
          
          if (sections) {
            sections.forEach(section => {
              const competitorMatch = section.match(/\*\*Competitor:\*\*\s*(.+)/);
              analyses.push({
                date: file.replace('.md', ''),
                competitor: competitorMatch ? competitorMatch[1].trim() : 'unknown',
                findings: section.substring(0, 500)
              });
            });
          }
        } catch {}
      }
      
      res.json({ analyses });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  app.get('/api/v3/research/marketing', (req, res) => {
    try {
      const ideas = [];
      const memoryFiles = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith('.md')).sort().reverse().slice(0, 30);
      
      for (const file of memoryFiles) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), 'utf8');
          const sections = content.match(/##\s*Marketing Idea[\s\S]*?(?=\n##|$)/g);
          
          if (sections) {
            sections.forEach(section => {
              const titleMatch = section.match(/##\s*Marketing Idea[:\s]*(.+)/);
              const platformMatch = section.match(/\*\*Platform:\*\*\s*(.+)/);
              const statusMatch = section.match(/\*\*Status:\*\*\s*(.+)/);
              
              ideas.push({
                date: file.replace('.md', ''),
                title: titleMatch ? titleMatch[1].trim() : 'Untitled',
                platform: platformMatch ? platformMatch[1].trim() : 'unknown',
                status: statusMatch ? statusMatch[1].trim() : 'idea',
                content: section.substring(0, 300)
              });
            });
          }
        } catch {}
      }
      
      res.json({ ideas });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
};
