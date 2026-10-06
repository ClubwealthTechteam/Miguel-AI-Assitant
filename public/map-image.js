// Draws a process-map tree (the same shape the form builds) onto a canvas and
// returns a PNG data URL. Layout mirrors the on-screen map: steps left to right,
// arrows between them, and a bracket that splits into YES (top) / NO (bottom).
(() => {
  'use strict';

  const C = {
    bg: '#ffffff', dot: '#e4e1d9', ink: '#14181f', ink2: '#2b313c', muted: '#50565f',
    box: '#9a9ea6', line: '#8a8f98', yes: '#2f6a3c', no: '#a3322c', accent: '#b08d4a', navy: '#0b1b3d',
  };
  const NODE_W = 200;
  const PAD_X = 12;
  const TOOL_LINE = 18;
  const DESC_LINE = 18;
  const BOX_GAP = 8;
  const MIN_DESC_H = 72;
  const LINK_W = 56;
  const STEM_W = 30;
  const ARM_W = 58;
  const BRANCH_GAP = 44;
  const MARGIN = 48;
  const HEADER_H = 96;
  const FOOTER_H = 44;
  const SANS = "'Geist', 'Helvetica Neue', Helvetica, Arial, sans-serif";
  const MONO = "'Geist Mono', ui-monospace, monospace";

  function wrap(ctx, text, maxW, maxLines) {
    const words = String(text || '').split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (ctx.measureText(test).width <= maxW || !line) line = test;
      else { lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    if (maxLines && lines.length > maxLines) {
      const kept = lines.slice(0, maxLines);
      let last = kept[maxLines - 1];
      while (last && ctx.measureText(`${last}…`).width > maxW) last = last.slice(0, -1);
      kept[maxLines - 1] = `${last}…`;
      return kept;
    }
    return lines;
  }

  // ---- measure: annotate each path/step with sizes ----
  function measure(ctx, path) {
    ctx.font = `600 14px ${SANS}`;
    path.steps.forEach((s) => {
      s._tool = wrap(ctx, s.tool || '—', NODE_W - PAD_X * 2, 2);
    });
    ctx.font = `400 13px ${SANS}`;
    path.steps.forEach((s) => {
      s._desc = wrap(ctx, s.description, NODE_W - PAD_X * 2, 8);
      s._toolH = 20 + s._tool.length * TOOL_LINE;
      s._descH = Math.max(MIN_DESC_H, 22 + s._desc.length * DESC_LINE);
      s._h = s._toolH + BOX_GAP + s._descH;
    });
    let w = path.steps.length * NODE_W + Math.max(0, path.steps.length - 1) * LINK_W;
    let h = Math.max(0, ...path.steps.map((s) => s._h));
    const kids = [path.yes, path.no].filter(Boolean);
    kids.forEach((k) => measure(ctx, k));
    if (kids.length) {
      const forkH = kids.reduce((a, k) => a + k._h, 0) + (kids.length - 1) * BRANCH_GAP;
      w += STEM_W + ARM_W + Math.max(...kids.map((k) => k._w));
      h = Math.max(h, forkH);
      path._forkH = forkH;
    }
    path._w = w;
    path._h = h;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function arrowHead(ctx, x, y) {
    ctx.beginPath();
    ctx.moveTo(x - 7, y - 6);
    ctx.lineTo(x, y);
    ctx.lineTo(x - 7, y + 6);
    ctx.stroke();
  }

  function hLink(ctx, x1, x2, y) {
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(x1 + 8, y);
    ctx.lineTo(x2 - 8, y);
    ctx.stroke();
    arrowHead(ctx, x2 - 8, y);
  }

  function drawStep(ctx, s, x, cy) {
    const top = cy - s._h / 2;
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = C.box;
    ctx.fillStyle = C.bg;
    roundRect(ctx, x, top, NODE_W, s._toolH, 8); ctx.fill(); ctx.stroke();
    roundRect(ctx, x, top + s._toolH + BOX_GAP, NODE_W, s._descH, 8); ctx.fill(); ctx.stroke();

    ctx.fillStyle = C.ink;
    ctx.font = `600 14px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const t0 = top + s._toolH / 2 - ((s._tool.length - 1) * TOOL_LINE) / 2;
    s._tool.forEach((ln, i) => ctx.fillText(ln, x + NODE_W / 2, t0 + i * TOOL_LINE));

    ctx.fillStyle = s.description ? C.ink2 : C.muted;
    ctx.font = `400 13px ${SANS}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const d0 = top + s._toolH + BOX_GAP + 12;
    s._desc.forEach((ln, i) => ctx.fillText(ln, x + PAD_X, d0 + i * DESC_LINE));
  }

  function drawPath(ctx, path, x, cy) {
    path.steps.forEach((s, i) => {
      if (i > 0) { hLink(ctx, x, x + LINK_W, cy); x += LINK_W; }
      drawStep(ctx, s, x, cy);
      x += NODE_W;
    });
    const kids = [['yes', path.yes], ['no', path.no]].filter(([, k]) => k);
    if (!kids.length) return;

    const stemX = x + STEM_W;
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(x, cy); ctx.lineTo(stemX, cy); ctx.stroke();

    let y = cy - path._forkH / 2;
    const centers = kids.map(([branch, k]) => {
      const c = y + k._h / 2;
      y += k._h + BRANCH_GAP;
      return { branch, k, c };
    });
    const r = 14;
    const top = centers[0].c;
    const bottom = centers[centers.length - 1].c;
    ctx.strokeStyle = C.line;
    ctx.beginPath();
    if (centers.length === 2) {
      ctx.moveTo(stemX + ARM_W - 12, top);
      ctx.arcTo(stemX, top, stemX, top + r, r);
      ctx.lineTo(stemX, bottom - r);
      ctx.arcTo(stemX, bottom, stemX + r, bottom, r);
      ctx.lineTo(stemX + ARM_W - 12, bottom);
    } else {
      // Only one path: a single elbow from the stem to it.
      const c = centers[0].c;
      ctx.moveTo(stemX, cy);
      if (Math.abs(c - cy) > r) {
        const dir = c < cy ? -1 : 1;
        ctx.lineTo(stemX, c - dir * r);
        ctx.arcTo(stemX, c, stemX + r, c, r);
      }
      ctx.lineTo(stemX + ARM_W - 12, c);
    }
    ctx.stroke();

    if (path.decision) {
      const label = path.decision.length > 32 ? `${path.decision.slice(0, 31)}…` : path.decision;
      ctx.font = `600 11px ${MONO}`;
      const lw = ctx.measureText(label).width + 16;
      ctx.fillStyle = '#fbf6ea';
      ctx.strokeStyle = '#e6d6b3';
      ctx.lineWidth = 1;
      // The band between the YES and NO paths is empty, so the pill sits there, right of the bracket.
      roundRect(ctx, stemX + 8, cy - 11, lw, 22, 11); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.accent;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, stemX + 16, cy + 0.5);
      ctx.strokeStyle = C.line;
      ctx.lineWidth = 1.8;
    }

    centers.forEach(({ branch, k, c }) => {
      arrowHead(ctx, stemX + ARM_W - 12, c);
      ctx.font = `600 10px ${MONO}`;
      ctx.fillStyle = branch === 'yes' ? C.yes : C.no;
      ctx.textAlign = 'left';
      ctx.textBaseline = branch === 'yes' ? 'bottom' : 'top';
      ctx.fillText(branch.toUpperCase(), stemX + 10, branch === 'yes' ? c - 6 : c + 6);
      drawPath(ctx, k, stemX + ARM_W, c);
    });
  }

  function clonePath(p) {
    if (!p) return null;
    return {
      steps: (p.steps || []).map((s) => ({ tool: s.tool || '', description: s.description || '' })),
      decision: p.decision || '',
      yes: clonePath(p.yes),
      no: clonePath(p.no),
    };
  }

  /**
   * @param {object} path  tree: { steps:[{tool,description}], decision, yes, no }
   * @param {object} meta  { title, flowLabel, name, date }
   * @returns {string|null} PNG data URL
   */
  function renderMapPNG(path, meta = {}) {
    const tree = clonePath(path);
    if (!tree) return null;
    const probe = document.createElement('canvas').getContext('2d');
    measure(probe, tree);

    const width = Math.max(640, tree._w + MARGIN * 2);
    const height = tree._h + MARGIN * 2 + HEADER_H + FOOTER_H;
    // Stay well inside browser canvas limits and keep the file a reasonable size.
    const scale = Math.max(1, Math.min(2, 8000 / width, 8000 / height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = C.dot;
    for (let gx = 8; gx < width; gx += 16) {
      for (let gy = HEADER_H + 8; gy < height - FOOTER_H; gy += 16) ctx.fillRect(gx, gy, 1.2, 1.2);
    }

    // Header
    ctx.fillStyle = C.navy;
    ctx.fillRect(0, 0, width, HEADER_H);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = `500 11px ${MONO}`;
    ctx.fillText((meta.flowLabel || 'Process map').toUpperCase(), MARGIN, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = `700 24px ${SANS}`;
    ctx.fillText(meta.title || 'Untitled task', MARGIN, 68);
    ctx.textAlign = 'right';
    ctx.font = `400 13px ${SANS}`;
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText([meta.name, meta.date].filter(Boolean).join('  ·  '), width - MARGIN, 68);

    drawPath(ctx, tree, MARGIN, HEADER_H + MARGIN + tree._h / 2);

    // Footer
    ctx.textAlign = 'left';
    ctx.fillStyle = C.muted;
    ctx.font = `400 11px ${SANS}`;
    ctx.fillText('Club Wealth® AI Task Hub · Workflow Process Form', MARGIN, height - 18);

    return canvas.toDataURL('image/png');
  }

  window.renderMapPNG = renderMapPNG;
})();
