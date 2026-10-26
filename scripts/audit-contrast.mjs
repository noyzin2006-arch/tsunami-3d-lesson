// scripts/audit-contrast.mjs
// A08 的颜色证据：从 tokens.css 读真实色值（单一真源），按 WCAG 2.2 计算对比度，
// 逐对判定：正文 ≥4.5、大字 ≥3、非文字（边框/焦点环）≥3、禁用态 ≥2。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVID = path.join(ROOT, 'reports', 'evidence');
fs.mkdirSync(EVID, { recursive: true });

const css = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'tokens.css'), 'utf8');
const raw = {};
for (const m of css.matchAll(/(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})/g)) raw[m[1]] = m[2];

function hex(h) {
  let s = h.replace('#', '');
  if (s.length === 3) s = s.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
function lum(h) {
  const [r, g, b] = hex(h).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const la = lum(raw[a] || a);
  const lb = lum(raw[b] || b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

// [前景, 背景, 阈值, 用途]
const PAIRS = [
  ['--text-1', '--bg-0', 4.5, '正文/标题（主背景）'],
  ['--text-2', '--bg-0', 4.5, '次级正文（主背景）'],
  ['--text-3', '--bg-0', 4.5, '辅助说明（主背景）'],
  ['--text-1', '--bg-1', 4.5, '正文（卡片底）'],
  ['--text-2', '--bg-1', 4.5, '次级正文（卡片底）'],
  ['--text-3', '--bg-1', 4.5, '辅助说明（卡片底）'],
  ['--text-disabled', '--bg-1', 2.0, '禁用态文字（自定 ≥2）'],
  ['--accent', '--bg-0', 4.5, '强调文字（链接/编号）'],
  ['--accent', '--bg-1', 4.5, '强调文字（卡片底）'],
  ['--text-inverse', '--accent', 4.5, '主按钮文字（青底深字）'],
  ['--warning', '--bg-0', 4.5, '警示文字'],
  ['--danger', '--bg-0', 4.5, '危险文字'],
  ['--success', '--bg-0', 4.5, '成功文字'],
  ['--border-1', '--bg-0', 3.0, '非文字：常规边框'],
  ['--border-1', '--bg-1', 3.0, '非文字：卡片边框'],
  ['--border-2', '--bg-1', 3.0, '非文字：选中边框'],
  ['--focus', '--bg-0', 3.0, '非文字：焦点环'],
];

const rows = PAIRS.map(([fg, bg, min, use]) => {
  const r = ratio(fg, bg);
  const ok = r >= min;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${fg} on ${bg}  ${r.toFixed(2)}:1  (需要 ≥${min})  ${use}`);
  return { fg, bg, ratio: +r.toFixed(2), min, ok, use, fgHex: raw[fg], bgHex: raw[bg] };
});

// 大字（≥24px 或 ≥18.66px 粗体）阈值 3:1，这里单独复核 text-3 作为大字的用法
const big = ratio('--text-3', '--bg-0');
rows.push({ fg: '--text-3', bg: '--bg-0', ratio: +big.toFixed(2), min: 3, ok: big >= 3, use: '大字（≥24px）', fgHex: raw['--text-3'], bgHex: raw['--bg-0'] });

const failed = rows.filter((r) => !r.ok);
const out = {
  generatedAt: new Date().toISOString(),
  standard: 'WCAG 2.2 AA：正文 4.5:1、大字 3:1、非文字 3:1、禁用态自定 2:1',
  tokensSource: 'src/styles/tokens.css',
  total: rows.length,
  passed: rows.length - failed.length,
  failed: failed.length,
  rows,
};
fs.writeFileSync(path.join(EVID, 'audit-contrast.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(
  path.join(EVID, 'audit-contrast.log'),
  rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.fg} on ${r.bg}  ${r.ratio}:1 (≥${r.min})  ${r.use}`).join('\n') + '\n'
);
console.log(`\n${out.passed}/${out.total} 通过`);
if (failed.length) process.exitCode = 1;
