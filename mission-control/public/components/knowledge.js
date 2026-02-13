// Knowledge Graph — Canvas-based force-directed layout with category clustering
let kgData = null;
let kgNodes = [];
let kgEdges = [];
let kgSelected = null;
let kgSimRunning = false;
let kgAnimFrame = null;
let kgDragging = null;
let kgPan = { x: 0, y: 0 };
let kgZoom = 1;
let kgDragStart = null;
let kgIsPanning = false;

const CATEGORY_COLORS = {
  people: '#ff6b6b',
  projects: '#4ecdc4',
  infrastructure: '#45b7d1',
  companies: '#96ceb4',
  system: '#ffd93d',
  memory: '#b388ff',
  knowledge: '#4da6ff',
  prompts: '#ff9ff3',
  root: '#888',
};

function initKnowledge() {
  document.getElementById('kg-category-filter').addEventListener('change', () => {
    renderKgList();
    drawKgCanvas();
  });
  loadKnowledge();
}

async function loadKnowledge() {
  try {
    const res = await fetch('/api/knowledge');
    kgData = await res.json();

    const select = document.getElementById('kg-category-filter');
    select.innerHTML = '<option value="">All Categories</option>';
    for (const cat of kgData.categories.sort()) {
      const count = kgData.nodes.filter(n => n.category === cat).length;
      select.innerHTML += `<option value="${cat}">${cat} (${count})</option>`;
    }

    document.getElementById('kg-stats').innerHTML = `
      <div class="kg-stat">${kgData.nodes.length} entities</div>
      <div class="kg-stat">${kgData.edges.length} connections</div>
      <div class="kg-stat">${kgData.categories.length} categories</div>
    `;

    renderKgList();
    initKgCanvas();
  } catch (err) {
    document.getElementById('kg-list').innerHTML = `<div class="loading">❌ ${err.message}</div>`;
  }
}

function renderKgList() {
  const filter = document.getElementById('kg-category-filter').value;
  let nodes = kgData.nodes;
  if (filter) nodes = nodes.filter(n => n.category === filter);
  nodes.sort((a, b) => b.mtime - a.mtime);

  document.getElementById('kg-list').innerHTML = nodes.slice(0, 100).map(n => {
    const color = CATEGORY_COLORS[n.category] || '#888';
    return `<div class="kg-item${kgSelected === n.id ? ' selected' : ''}" data-id="${n.id}" onclick="selectKgNode('${n.id.replace(/'/g, "\\'")}')">
      <span class="kg-dot" style="background:${color}"></span>
      <span class="kg-item-label">${escapeHtml(n.label)}</span>
      <span class="kg-item-cat">${n.category}</span>
    </div>`;
  }).join('') + (nodes.length > 100 ? `<div class="kg-item" style="color:var(--text-muted)">...${nodes.length - 100} more</div>` : '');
}

function selectKgNode(id) {
  kgSelected = id;
  renderKgList();

  const node = kgData.nodes.find(n => n.id === id);
  if (!node) return;

  const color = CATEGORY_COLORS[node.category] || '#888';
  const connections = kgData.edges.filter(e => e.source === id || e.target === id);
  const connectedIds = connections.map(e => e.source === id ? e.target : e.source);

  document.getElementById('kg-detail').innerHTML = `
    <div class="kg-detail-header">
      <span class="kg-dot-lg" style="background:${color}"></span>
      <div>
        <h3>${escapeHtml(node.label)}</h3>
        <span class="kg-detail-cat">${node.category}${node.status ? ' · ' + node.status : ''}${node.type ? ' · ' + node.type : ''}</span>
      </div>
    </div>
    ${node.excerpt ? `<p class="kg-excerpt">${escapeHtml(node.excerpt)}</p>` : ''}
    ${node.tags && node.tags.length ? `<div class="kg-tags">${node.tags.map(t => `<span class="kg-tag">${t}</span>`).join('')}</div>` : ''}
    <div class="kg-meta">
      <span>📄 ${node.path}</span>
      <span>📏 ${node.wordCount} words</span>
      <span>🔗 ${connections.length} connections</span>
      <span>📅 ${new Date(node.mtime).toLocaleDateString()}</span>
    </div>
    ${node.sections && node.sections.length ? `
      <div class="kg-sections">
        <h4>Sections</h4>
        ${node.sections.map(s => `<div class="kg-section" style="padding-left:${(s.level-1)*12}px">${'#'.repeat(s.level)} ${escapeHtml(s.title)}</div>`).join('')}
      </div>
    ` : ''}
    ${connectedIds.length ? `
      <div class="kg-connections">
        <h4>Connected To</h4>
        ${connectedIds.map(cid => {
          const cn = kgData.nodes.find(n => n.id === cid);
          return cn ? `<div class="kg-conn" onclick="selectKgNode('${cid.replace(/'/g, "\\'")}')">→ ${escapeHtml(cn.label)}</div>` : '';
        }).join('')}
      </div>
    ` : ''}
  `;

  // Center canvas on selected node
  const kn = kgNodes.find(n => n.id === id);
  if (kn) {
    const canvas = document.getElementById('kg-canvas');
    if (canvas) {
      kgPan.x = (canvas._cssW || canvas.width) / 2 - kn.x * kgZoom;
      kgPan.y = (canvas._cssH || canvas.height) / 2 - kn.y * kgZoom;
    }
  }

  drawKgCanvas();
}

// Category cluster centers — arranged in a circle
function getCategoryCenter(category, canvas) {
  const cats = kgData ? kgData.categories : [];
  const idx = cats.indexOf(category);
  const total = cats.length || 1;
  const angle = (idx / total) * Math.PI * 2 - Math.PI / 2;
  const w = canvas._cssW || canvas.width;
  const h = canvas._cssH || canvas.height;
  const radiusX = w * 0.3;
  const radiusY = h * 0.3;
  return {
    x: w / 2 + Math.cos(angle) * radiusX,
    y: h / 2 + Math.sin(angle) * radiusY
  };
}

function initKgCanvas() {
  const canvas = document.getElementById('kg-canvas');
  if (!canvas || !kgData) return;

  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const cssW = container.clientWidth;
  const cssH = Math.max(400, container.clientHeight - 200);
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  canvas._dpr = dpr;
  canvas._cssW = cssW;
  canvas._cssH = cssH;

  // Initialize positions near category cluster centers
  kgNodes = kgData.nodes.map(n => {
    const center = getCategoryCenter(n.category, canvas);
    return {
      ...n,
      x: center.x + (Math.random() - 0.5) * 120,
      y: center.y + (Math.random() - 0.5) * 120,
      vx: 0, vy: 0
    };
  });

  kgEdges = kgData.edges.map(e => ({
    source: kgNodes.findIndex(n => n.id === e.source),
    target: kgNodes.findIndex(n => n.id === e.target)
  })).filter(e => e.source >= 0 && e.target >= 0);

  // Reset pan/zoom — start zoomed out on mobile to fit all clusters
  const isMobile = cssW < 600;
  kgZoom = isMobile ? 0.5 : 1;
  kgPan = { x: isMobile ? cssW * 0.25 : 0, y: isMobile ? cssH * 0.1 : 0 };

  // Run simulation
  kgSimRunning = true;
  let iterations = 0;
  const maxIter = 300;

  function simulate() {
    if (!kgSimRunning || iterations > maxIter) {
      kgSimRunning = false;
      drawKgCanvas();
      return;
    }
    iterations++;

    const alpha = Math.max(0.001, 1 - iterations / maxIter);
    const N = kgNodes.length;

    // Category clustering force — pull toward cluster center
    for (const n of kgNodes) {
      const center = getCategoryCenter(n.category, canvas);
      const dx = center.x - n.x;
      const dy = center.y - n.y;
      n.vx += dx * 0.008 * alpha;
      n.vy += dy * 0.008 * alpha;
    }

    // Repulsion between nodes (use grid optimization for large graphs)
    const cellSize = 60;
    const grid = {};
    for (let i = 0; i < N; i++) {
      const cx = Math.floor(kgNodes[i].x / cellSize);
      const cy = Math.floor(kgNodes[i].y / cellSize);
      const key = `${cx},${cy}`;
      if (!grid[key]) grid[key] = [];
      grid[key].push(i);
    }

    for (let i = 0; i < N; i++) {
      const n = kgNodes[i];
      const cx = Math.floor(n.x / cellSize);
      const cy = Math.floor(n.y / cellSize);

      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const key = `${cx+dx},${cy+dy}`;
          const cell = grid[key];
          if (!cell) continue;
          for (const j of cell) {
            if (j <= i) continue;
            let ddx = kgNodes[j].x - n.x;
            let ddy = kgNodes[j].y - n.y;
            let dist = Math.sqrt(ddx * ddx + ddy * ddy) || 1;
            if (dist > 150) continue;
            // Stronger repulsion within same category (keep them spread but grouped)
            const sameCat = kgNodes[j].category === n.category;
            const repulse = sameCat ? 80 : 120;
            let force = (repulse * alpha) / dist;
            n.vx -= ddx / dist * force;
            n.vy -= ddy / dist * force;
            kgNodes[j].vx += ddx / dist * force;
            kgNodes[j].vy += ddy / dist * force;
          }
        }
      }
    }

    // Attraction (edges)
    for (const e of kgEdges) {
      const s = kgNodes[e.source], t = kgNodes[e.target];
      let dx = t.x - s.x;
      let dy = t.y - s.y;
      let dist = Math.sqrt(dx * dx + dy * dy) || 1;
      let force = (dist - 60) * 0.06 * alpha;
      s.vx += dx / dist * force;
      s.vy += dy / dist * force;
      t.vx -= dx / dist * force;
      t.vy -= dy / dist * force;
    }

    // Apply velocity + damping
    for (const n of kgNodes) {
      n.vx *= 0.8;
      n.vy *= 0.8;
      n.x += n.vx;
      n.y += n.vy;
    }

    drawKgCanvas();
    kgAnimFrame = requestAnimationFrame(simulate);
  }
  simulate();

  // Mouse interaction
  let mouseDown = false;
  let mouseStart = { x: 0, y: 0 };

  canvas.onmousedown = (e) => {
    mouseDown = true;
    mouseStart = { x: e.clientX, y: e.clientY };
    const { nx, ny } = canvasToWorld(e, canvas);

    // Check if clicking a node
    for (const n of kgNodes) {
      const dx = nx - n.x, dy = ny - n.y;
      if (dx * dx + dy * dy < 200) {
        kgDragging = n;
        return;
      }
    }
    kgIsPanning = true;
  };

  canvas.onmousemove = (e) => {
    if (!mouseDown) return;
    if (kgDragging) {
      const { nx, ny } = canvasToWorld(e, canvas);
      kgDragging.x = nx;
      kgDragging.y = ny;
      kgDragging.vx = 0;
      kgDragging.vy = 0;
      drawKgCanvas();
    } else if (kgIsPanning) {
      kgPan.x += e.clientX - mouseStart.x;
      kgPan.y += e.clientY - mouseStart.y;
      mouseStart = { x: e.clientX, y: e.clientY };
      drawKgCanvas();
    }
  };

  canvas.onmouseup = (e) => {
    if (kgDragging && !kgIsPanning) {
      const dist = Math.abs(e.clientX - mouseStart.x) + Math.abs(e.clientY - mouseStart.y);
      if (dist < 5) selectKgNode(kgDragging.id);
    }
    mouseDown = false;
    kgDragging = null;
    kgIsPanning = false;
  };

  canvas.onwheel = (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const oldZoom = kgZoom;
    kgZoom *= e.deltaY > 0 ? 0.92 : 1.08;
    kgZoom = Math.max(0.08, Math.min(5, kgZoom));
    // Zoom toward cursor
    kgPan.x = mx - (mx - kgPan.x) * (kgZoom / oldZoom);
    kgPan.y = my - (my - kgPan.y) * (kgZoom / oldZoom);
    drawKgCanvas();
  };

  // Touch support for mobile
  let lastTouchDist = 0;
  let lastTouchCenter = null;

  canvas.ontouchstart = (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      mouseDown = true;
      mouseStart = { x: t.clientX, y: t.clientY };
      const { nx, ny } = canvasToWorld(t, canvas);
      kgDragging = null;
      kgIsPanning = false;
      for (const n of kgNodes) {
        const dx = nx - n.x, dy = ny - n.y;
        if (dx * dx + dy * dy < 400) { // Bigger hit area for touch
          kgDragging = n;
          return;
        }
      }
      kgIsPanning = true;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDist = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  };

  canvas.ontouchmove = (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && mouseDown) {
      const t = e.touches[0];
      if (kgDragging) {
        const { nx, ny } = canvasToWorld(t, canvas);
        kgDragging.x = nx;
        kgDragging.y = ny;
        kgDragging.vx = 0;
        kgDragging.vy = 0;
        drawKgCanvas();
      } else if (kgIsPanning) {
        kgPan.x += t.clientX - mouseStart.x;
        kgPan.y += t.clientY - mouseStart.y;
        mouseStart = { x: t.clientX, y: t.clientY };
        drawKgCanvas();
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const center = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };

      if (lastTouchDist > 0) {
        const rect = canvas.getBoundingClientRect();
        const mx = center.x - rect.left;
        const my = center.y - rect.top;
        const oldZoom = kgZoom;
        kgZoom *= dist / lastTouchDist;
        kgZoom = Math.max(0.08, Math.min(5, kgZoom));
        kgPan.x = mx - (mx - kgPan.x) * (kgZoom / oldZoom);
        kgPan.y = my - (my - kgPan.y) * (kgZoom / oldZoom);
      }
      // Also pan with two fingers
      if (lastTouchCenter) {
        kgPan.x += center.x - lastTouchCenter.x;
        kgPan.y += center.y - lastTouchCenter.y;
      }
      lastTouchDist = dist;
      lastTouchCenter = center;
      drawKgCanvas();
    }
  };

  canvas.ontouchend = (e) => {
    if (e.touches.length === 0) {
      if (kgDragging && !kgIsPanning) selectKgNode(kgDragging.id);
      mouseDown = false;
      kgDragging = null;
      kgIsPanning = false;
      lastTouchDist = 0;
      lastTouchCenter = null;
    }
  };
}

function canvasToWorld(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    nx: (e.clientX - rect.left - kgPan.x) / kgZoom,
    ny: (e.clientY - rect.top - kgPan.y) / kgZoom
  };
}

function drawKgCanvas() {
  const canvas = document.getElementById('kg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const filter = document.getElementById('kg-category-filter').value;

  const dpr = canvas._dpr || 1;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.scale(dpr, dpr);
  ctx.translate(kgPan.x, kgPan.y);
  ctx.scale(kgZoom, kgZoom);

  // Draw category cluster backgrounds
  const catNodes = {};
  for (const n of kgNodes) {
    if (filter && n.category !== filter) continue;
    if (!catNodes[n.category]) catNodes[n.category] = [];
    catNodes[n.category].push(n);
  }

  for (const [cat, nodes] of Object.entries(catNodes)) {
    if (nodes.length < 2) continue;
    const cx = nodes.reduce((s, n) => s + n.x, 0) / nodes.length;
    const cy = nodes.reduce((s, n) => s + n.y, 0) / nodes.length;
    let maxR = 0;
    for (const n of nodes) {
      const d = Math.sqrt((n.x - cx) ** 2 + (n.y - cy) ** 2);
      if (d > maxR) maxR = d;
    }
    const r = maxR + 40;
    const color = CATEGORY_COLORS[cat] || '#888';

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = color.replace(')', ',0.04)').replace('rgb', 'rgba').replace('#', '');
    // Convert hex to rgba for fill
    ctx.fillStyle = hexToRgba(color, 0.04);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(color, 0.12);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Category label
    ctx.fillStyle = hexToRgba(color, 0.5);
    ctx.font = 'bold 13px -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(cat.toUpperCase(), cx, cy - r + 14);
    ctx.textAlign = 'start';
  }

  // Edges
  for (const e of kgEdges) {
    const s = kgNodes[e.source], t = kgNodes[e.target];
    if (!s || !t) continue;
    if (filter && s.category !== filter && t.category !== filter) continue;
    const isHighlight = kgSelected && (s.id === kgSelected || t.id === kgSelected);
    ctx.strokeStyle = isHighlight ? 'rgba(233,69,96,0.6)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = isHighlight ? 2.5 : 1;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);
    ctx.stroke();
  }

  // Nodes
  const connectedToSelected = new Set();
  if (kgSelected) {
    for (const e of kgEdges) {
      const s = kgNodes[e.source], t = kgNodes[e.target];
      if (s && s.id === kgSelected) connectedToSelected.add(t.id);
      if (t && t.id === kgSelected) connectedToSelected.add(s.id);
    }
  }

  for (const n of kgNodes) {
    if (filter && n.category !== filter) continue;
    const color = CATEGORY_COLORS[n.category] || '#888';
    const isSelected = n.id === kgSelected;
    const isConnected = connectedToSelected.has(n.id);
    const radius = isSelected ? 8 : isConnected ? 6 : 4;
    const alpha = (kgSelected && !isSelected && !isConnected) ? 0.3 : 1;

    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(n.x, n.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isSelected ? '#fff' : color;
    ctx.fill();

    if (isSelected || isConnected) {
      ctx.strokeStyle = isSelected ? color : '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Labels: show for selected, connected, or when zoomed in enough
    const showLabel = isSelected || isConnected || kgZoom > 1.5 || kgNodes.length < 40;
    if (showLabel) {
      ctx.fillStyle = isSelected ? '#fff' : isConnected ? '#ddd' : 'rgba(255,255,255,0.6)';
      ctx.font = isSelected ? 'bold 11px -apple-system, sans-serif' : '10px -apple-system, sans-serif';
      const label = n.label.length > 30 ? n.label.substring(0, 28) + '…' : n.label;
      ctx.fillText(label, n.x + radius + 4, n.y + 4);
    }
    ctx.globalAlpha = 1;
  }

  ctx.restore();

  // Zoom indicator
  ctx.fillStyle = 'rgba(255,255,255,0.3)';
  ctx.font = '10px -apple-system, sans-serif';
  ctx.fillText(`${Math.round(kgZoom * 100)}%`, 8, (canvas._cssH || canvas.height) - 8);
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
