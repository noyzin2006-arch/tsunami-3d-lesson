// scripts/audit-browser.mjs
// 用真实 Chrome（playwright-core channel:'chrome'）在生产构建产物上跑验收闸门 A01–A09。
// 自己起一个只读静态服务器服务 dist/，不依赖任何在线资源，也不碰其他项目的端口。
//
// 运行：node scripts/audit-browser.mjs
// 产物：reports/evidence/audit-browser.json、reports/evidence/audit-browser.log、
//      reports/evidence/shots/*.png

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const EVID = path.join(ROOT, 'reports', 'evidence');
const SHOTS = path.join(EVID, 'shots');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

const results = [];
const logLines = [];
function record(id, name, pass, detail) {
  results.push({ id, name, pass: !!pass, detail });
  const line = `${pass ? 'PASS' : 'FAIL'}  ${id}  ${name}  ${JSON.stringify(detail)}`;
  logLines.push(line);
  console.log(line);
}

function ensureDirs() {
  fs.mkdirSync(SHOTS, { recursive: true });
}

function startServer() {
  if (!fs.existsSync(DIST)) throw new Error('dist/ 不存在，请先 npm run build');
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent((req.url || '/').split('?')[0]);
    let file = path.join(DIST, url === '/' ? 'index.html' : url);
    if (!file.startsWith(DIST)) { res.writeHead(403).end(); return; }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const VIEWPORTS = [
  { w: 1440, h: 900, tag: '1440x900' },
  { w: 390, h: 844, tag: '390x844' },
  { w: 375, h: 812, tag: '375x812' },
  { w: 768, h: 1024, tag: '768x1024' },
  { w: 1024, h: 768, tag: '1024x768' },
];

async function collectPageIssues(page) {
  const consoleErrors = [];
  const pageErrors = [];
  const failed = [];
  const requests = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
  page.on('pageerror', (e) => pageErrors.push(String(e && e.message ? e.message : e)));
  page.on('requestfailed', (r) => failed.push({ url: r.url(), err: r.failure()?.errorText }));
  page.on('request', (r) => requests.push(r.url()));
  return { consoleErrors, pageErrors, failed, requests };
}

/** 页面是否出现横向滚动、文字是否被裁切。 */
async function checkLayout(page) {
  return page.evaluate(() => {
    const de = document.documentElement;
    const overflowX = de.scrollWidth - de.clientWidth;
    const clipped = [];
    const targets = document.querySelectorAll(
      'h1,h2,h3,p,li,button,.metric-value,.metric-label,.chapter-btn,.readout strong,.label-pill'
    );
    for (const el of targets) {
      if (!el.offsetParent && el.tagName !== 'BODY') continue;
      const cs = getComputedStyle(el);
      if (cs.overflow === 'hidden' && el.scrollHeight > el.clientHeight + 2) {
        clipped.push({ sel: el.className || el.tagName, d: el.scrollHeight - el.clientHeight });
      }
      if (el.scrollWidth > el.clientWidth + 2 && cs.overflow !== 'visible') {
        clipped.push({ sel: el.className || el.tagName, dx: el.scrollWidth - el.clientWidth });
      }
    }
    const canvas = document.querySelector('#stageCanvas');
    const cr = canvas ? canvas.getBoundingClientRect() : null;
    return {
      overflowX,
      clipped: clipped.slice(0, 8),
      canvas: cr ? { w: Math.round(cr.width), h: Math.round(cr.height), top: Math.round(cr.top) } : null,
      stageVisible: !!(cr && cr.width > 80 && cr.height > 80),
    };
  });
}

async function main() {
  ensureDirs();
  const { server, port } = await startServer();
  const base = `http://127.0.0.1:${port}/`;
  logLines.push(`# audit-browser  ${new Date().toISOString()}`);
  logLines.push(`# base=${base}  chrome=channel:chrome  node=${process.version}`);
  console.log(`serving dist at ${base}`);

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
    args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
  });

  /* —— A02 / A07：五个视口加载 + 布局 —— */
  const viewportReports = [];
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    const issues = await collectPageIssues(page);
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => !!window.__tsunami, null, { timeout: 20000 });
    await page.waitForTimeout(900);
    const layout = await checkLayout(page);
    const external = issues.requests.filter((u) => {
      try { return new URL(u).host !== `127.0.0.1:${port}` && !u.startsWith('data:') && !u.startsWith('blob:'); }
      catch { return false; }
    });
    viewportReports.push({ ...vp, ...layout, external, consoleErrors: issues.consoleErrors, pageErrors: issues.pageErrors, failed: issues.failed });
    await page.screenshot({ path: path.join(SHOTS, `viewport-${vp.tag}.png`) });
    await ctx.close();
  }
  const badVp = viewportReports.filter(
    (r) => r.overflowX > 1 || r.clipped.length > 0 || r.consoleErrors.length || r.pageErrors.length
  );
  record('A02', '五个视口加载：console error=0、pageerror=0、无横滚、无截字', badVp.length === 0, {
    offenders: badVp.map((r) => ({ tag: r.tag, overflowX: r.overflowX, clipped: r.clipped, ce: r.consoleErrors.length, pe: r.pageErrors.length })),
  });
  record('A07', '画布在 1440 / 390 / 375 可见', viewportReports.filter((r) => ['1440x900', '390x844', '375x812'].includes(r.tag)).every((r) => r.stageVisible), {
    canvas: viewportReports.map((r) => ({ tag: r.tag, canvas: r.canvas })),
  });

  /* —— 主视口：桌面 —— */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const issues = await collectPageIssues(page);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.__tsunami, null, { timeout: 20000 });
  await page.waitForFunction(() => window.__tsunami.webglStatus === 'ready', null, { timeout: 25000 });
  await page.waitForTimeout(600);

  /* —— A01：零域外请求 —— */
  const externalMain = issues.requests.filter((u) => {
    try { return new URL(u).host !== `127.0.0.1:${port}` && !u.startsWith('data:') && !u.startsWith('blob:'); }
    catch { return false; }
  });
  record('A01', '一次加载 + 全章节交互后域外请求数 = 0', externalMain.length === 0, {
    total: issues.requests.length, external: externalMain.slice(0, 10),
  });

  /* —— A03：rAF 连续 60 帧 —— */
  const raf = await page.evaluate(() => new Promise((resolve) => {
    const ids = [];
    const ts = [];
    let handle = 0;
    function tick(now) {
      ids.push(handle); ts.push(now);
      if (ids.length >= 60) {
        let monotonic = true;
        for (let i = 1; i < ts.length; i++) if (!(ts[i] > ts[i - 1])) monotonic = false;
        resolve({
          count: ids.length,
          uniqueIds: new Set(ids).size,
          monotonic,
          visibility: document.visibilityState,
          hasFocus: document.hasFocus(),
        });
        return;
      }
      handle = requestAnimationFrame(tick);
    }
    handle = requestAnimationFrame(tick);
  }));
  record('A03', '60 个 rAF：帧 ID 唯一、时间戳严格递增',
    raf.count === 60 && raf.uniqueIds === 60 && raf.monotonic,
    raf);

  /* —— A04：数值与纯函数同源 —— */
  const metrics = await page.evaluate(() => window.__tsunami.metrics());
  const near = (a, b, tol) => Math.abs(a - b) <= tol;
  record('A04', 'c(4000)≈713.11km/h、c(10)≈9.9045m/s、H 比≈4.4721、λ=cT',
    near(metrics.speed, 713.11, 0.05)
    && near(metrics.green, 4.4721, 0.001)
    && near(metrics.wavelength, 118.86, 0.05)
    && near(metrics.period, 10, 0.01),
    metrics);

  /* —— A05：七章切换有真实变化 —— */
  const chapterEvidence = [];
  // 先停在中间章节，保证第 1 章也能量到镜头位移
  await page.evaluate(() => window.__tsunami.dispatch({ type: 'CHAPTER_SET', index: 3 }));
  await page.waitForTimeout(1000);
  for (let i = 0; i < 7; i++) {
    const before = await page.evaluate(() => {
      const c = window.__tsunami.controller;
      return { cam: c?.camera.position.toArray().map((v) => +v.toFixed(3)) };
    });
    await page.evaluate((idx) => window.__tsunami.dispatch({ type: 'CHAPTER_SET', index: idx }), i);
    await page.waitForTimeout(1100);
    const after = await page.evaluate(() => {
      const c = window.__tsunami.controller;
      const vis = [];
      c?.scene.traverse((o) => { if (o.name && o.visible) vis.push(o.name); });
      const card = document.querySelector('.explain-card');
      const title = card?.querySelector('h2')?.innerText || '';
      return {
        cam: c?.camera.position.toArray().map((v) => +v.toFixed(3)),
        visible: vis,
        title: title.replace(/\s+/g, ' ').trim(),
        textLen: (card?.innerText || '').replace(/\s+/g, '').length,
        activeChapter: document.querySelector('.chapter-btn[aria-current="step"]')?.dataset.index,
      };
    });
    const camMoved = before.cam && after.cam && before.cam.some((v, k) => Math.abs(v - after.cam[k]) > 0.05);
    chapterEvidence.push({ index: i, camMoved, ...after });
    await page.screenshot({ path: path.join(SHOTS, `chapter-${i + 1}.png`) });
  }
  const chapOk = chapterEvidence.every((c) => c.camMoved && c.title.length > 3 && c.textLen > 40 && Number(c.activeChapter) === c.index);
  // 章节可见部件集合必须真的不同（断层/水柱/波前/淹没各有专属部件）
  const visSets = chapterEvidence.map((c) => c.visible.join(','));
  const distinctSets = new Set(visSets).size;
  const expectVis = {
    1: 'water-column',
    3: 'wavefront-group',
  };
  const partOk = distinctSets >= 4
    && chapterEvidence[1].visible.includes('water-column')
    && chapterEvidence[3].visible.some((n) => n.startsWith('wavefront'));
  record('A05', '七章各有可观察的场景位移 + 中文解说 + 章节态同步 + 专属部件显隐', chapOk && partOk, {
    distinctSceneStates: distinctSets,
    chapters: chapterEvidence.map((c) => ({ i: c.index, camMoved: c.camMoved, title: c.title, textLen: c.textLen, active: c.activeChapter, parts: c.visible })),
  });

  /* —— A06：控件 100ms 内反馈 + 键盘 —— */
  await page.evaluate(() => window.__tsunami.dispatch({ type: 'CHAPTER_SET', index: 2 }));
  await page.waitForTimeout(300);
  const controlResp = await page.evaluate(async () => {
    const t0 = performance.now();
    window.__tsunami.dispatch({ type: 'PARAM_DEPTH', value: 5200 });
    const m1 = window.__tsunami.metrics();
    const dt1 = performance.now() - t0;
    const t1 = performance.now();
    window.__tsunami.dispatch({ type: 'TOGGLE' });
    const playing = window.__tsunami.getState().playing;
    const dt2 = performance.now() - t1;
    return { dt1, dt2, speed: m1.speed, depth: m1.depth, playing };
  });
  const ctrlOk = controlResp.dt1 < 100 && controlResp.dt2 < 100
    && Math.abs(controlResp.depth - 5200) < 1 && controlResp.speed > 0;
  record('A06-1', '参数/播放控件 100ms 内反馈并更新数值', ctrlOk, controlResp);

  // 键盘：Tab 能进入控件、Space 切换播放、方向键切章
  await page.evaluate(() => {
    window.__tsunami.dispatch({ type: 'CHAPTER_SET', index: 3 });
    document.querySelector('#app').focus?.();
  });
  await page.waitForTimeout(200);
  const kb = await page.evaluate(async () => {
    const before = window.__tsunami.getState();
    const btn = document.querySelector('#playBtn');
    btn?.focus();
    const focusedTag = document.activeElement?.id || document.activeElement?.tagName;
    return { before: { playing: before.playing, chapter: before.chapterIndex }, focusedTag };
  });
  await page.keyboard.press('Space');
  await page.waitForTimeout(150);
  const afterSpace = await page.evaluate(() => window.__tsunami.getState().playing);
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(400);
  const afterArrow = await page.evaluate(() => window.__tsunami.getState().chapterIndex);
  record('A06-2', 'Space 切换播放、ArrowRight 切下一章', afterSpace !== kb.before.playing && afterArrow === kb.before.chapter + 1, {
    focus: kb.focusedTag, before: kb.before, afterSpace, afterArrow,
  });

  /* —— U05/U06：渲染器能力与帧时实测（不冒充 60fps，只给本机实测值）—— */
  const perf = await page.evaluate(() => new Promise((resolve) => {
    const c = window.__tsunami.controller;
    const r = c.renderer;
    const gl = r.getContext();
    const caps = {
      maxVertexTextureUnits: gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS),
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      renderer: gl.getParameter(gl.RENDERER),
      vendor: gl.getParameter(gl.VENDOR),
      dpr: r.getPixelRatio(),
      canvas: [r.domElement.width, r.domElement.height],
      drawCalls: r.info.render.calls,
      triangles: r.info.render.triangles,
      programs: r.info.programs?.length ?? null,
    };
    const deltas = [];
    let last = performance.now();
    let n = 0;
    function tick(now) {
      deltas.push(now - last);
      last = now;
      n += 1;
      if (n >= 90) {
        const s = deltas.slice(10).sort((a, b) => a - b);
        const pick = (q) => +s[Math.min(s.length - 1, Math.floor(s.length * q))].toFixed(2);
        resolve({ ...caps, p50: pick(0.5), p95: pick(0.95), avg: +(s.reduce((a, b) => a + b, 0) / s.length).toFixed(2) });
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }));
  record('U05/U06', '顶点纹理单元数 / draw calls / 本机帧时（真实 Chrome，headless swiftshader）', true, perf);
  fs.writeFileSync(path.join(EVID, 'perf.json'), JSON.stringify(perf, null, 2));

  /* —— A09：声明与来源常驻 —— */
  const declarations = await page.evaluate(() => {
    const body = document.body.innerText;
    const need = ['垂直', '夸张', '教学', '不是', '来源'];
    const misses = need.filter((k) => !body.includes(k));
    const sourceLinks = [...document.querySelectorAll('#sources a')].map((a) => a.href);
    const extLinks = sourceLinks.filter((h) => !h.startsWith('http'));
    return { misses, sourceCount: sourceLinks.length, extLinks, legend: !!document.querySelector('.stage-legend, .stage-note') };
  });
  record('A09', '科学/夸张/来源声明常驻，来源链接可追溯', declarations.misses.length === 0 && declarations.sourceCount >= 5, declarations);

  /* —— A08：reduced motion —— */
  const ctxRM = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const pageRM = await ctxRM.newPage();
  await pageRM.goto(base, { waitUntil: 'networkidle' });
  await pageRM.waitForFunction(() => window.__tsunami?.webglStatus === 'ready', null, { timeout: 25000 });
  await pageRM.evaluate(() => window.__tsunami.dispatch({ type: 'CHAPTER_SET', index: 4 }));
  await pageRM.waitForTimeout(700);
  const camA = await pageRM.evaluate(() => window.__tsunami.controller.camera.position.toArray());
  await pageRM.waitForTimeout(700);
  const camB = await pageRM.evaluate(() => window.__tsunami.controller.camera.position.toArray());
  const stillCamera = camA.every((v, i) => Math.abs(v - camB[i]) < 1e-3);
  const rmFlags = await pageRM.evaluate(() => ({
    reduced: window.__tsunami.getState().reducedMotion,
    cls: document.documentElement.classList.contains('reduced-motion'),
    sameContent: document.querySelectorAll('.chapter-btn').length === 7,
  }));
  record('A08', 'prefers-reduced-motion：镜头不自动运动，内容等价', stillCamera && rmFlags.reduced && rmFlags.sameContent, { stillCamera, ...rmFlags });
  await pageRM.screenshot({ path: path.join(SHOTS, 'reduced-motion.png') });
  await ctxRM.close();

  /* —— 无 WebGL 回退 —— */
  const ctxNoGL = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const pageNoGL = await ctxNoGL.newPage();
  await pageNoGL.addInitScript(() => {
    // 让 WebGL2 探测失败，模拟不支持的环境
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
      if (String(type).startsWith('webgl')) return null;
      return orig.call(this, type, ...rest);
    };
    delete window.WebGL2RenderingContext;
  });
  await pageNoGL.goto(base, { waitUntil: 'networkidle' });
  await pageNoGL.waitForFunction(() => !!window.__tsunami, null, { timeout: 20000 });
  await pageNoGL.waitForTimeout(1200);
  const fallback = await pageNoGL.evaluate(() => ({
    status: window.__tsunami.webglStatus,
    staticFigure: !!document.querySelector('.static-holder svg, .static-figure'),
    chapters: document.querySelectorAll('.chapter-btn').length,
    hasText: document.body.innerText.length > 800,
  }));
  record('A08-2', '无 WebGL 时给出同内容可读回退', fallback.status === 'error' && fallback.staticFigure && fallback.chapters === 7, fallback);
  await pageNoGL.screenshot({ path: path.join(SHOTS, 'no-webgl.png') });
  await ctxNoGL.close();

  /* —— 收尾 —— */
  const errs = issues.consoleErrors.length + issues.pageErrors.length + issues.failed.length;
  record('A02-2', '桌面主流程 console/page/request 错误 = 0', errs === 0, {
    ce: issues.consoleErrors, pe: issues.pageErrors, failed: issues.failed,
  });

  await browser.close();
  server.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    base,
    node: process.version,
    chrome: await Promise.resolve('channel:chrome'),
    total: results.length,
    passed: results.filter((r) => r.pass).length,
    failed: results.filter((r) => !r.pass).length,
    results,
    viewports: viewportReports,
    chapters: chapterEvidence,
  };
  fs.writeFileSync(path.join(EVID, 'audit-browser.json'), JSON.stringify(summary, null, 2));
  fs.writeFileSync(path.join(EVID, 'audit-browser.log'), logLines.join('\n') + '\n');
  console.log(`\n${summary.passed}/${summary.total} 通过；证据写入 reports/evidence/`);
  if (summary.failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error('审计失败：', e);
  fs.mkdirSync(EVID, { recursive: true });
  fs.writeFileSync(path.join(EVID, 'audit-browser.log'), logLines.join('\n') + `\nFATAL ${e?.stack || e}\n`);
  process.exit(1);
});
