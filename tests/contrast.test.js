// tests/contrast.test.js
// 从 tokens.css 解析真实色值，按 WCAG 2.2 相对亮度计算对比度（单一真源，不手抄）。
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const tokensPath = resolve(__dirname, '../src/styles/tokens.css');
const css = readFileSync(tokensPath, 'utf8');

// 提取 --name: #hex 与 var(--other) 引用，做一层解析
const raw = {};
const re = /(--[\w-]+)\s*:\s*(#[0-9A-Fa-f]{6}|var\([^)]+\))/g;
let m;
while ((m = re.exec(css))) raw[m[1]] = m[2];

function resolveColor(v) {
  if (v.startsWith('#')) return v;
  if (v.startsWith('var(')) {
    const name = v.slice(4, -1).trim();
    return resolveColor(raw[name]);
  }
  return null;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}
function relLum(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const la = relLum(a);
  const lb = relLum(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
function pair(nameA, nameB) {
  const a = resolveColor(raw[nameA]);
  const b = resolveColor(raw[nameB]);
  if (!a || !b) throw new Error(`无法解析颜色：${nameA}=${raw[nameA]} ${nameB}=${raw[nameB]}`);
  return contrast(a, b);
}

test('所有关键颜色 token 均可解析', () => {
  for (const k of ['--text-1', '--text-2', '--text-3', '--text-disabled', '--accent',
    '--bg-0', '--bg-1', '--bg-overlay', '--border-1', '--focus', '--danger', '--text-inverse']) {
    assert.ok(resolveColor(raw[k]), `未解析 ${k}`);
  }
});

test('正文文本对比度 ≥ 4.5:1', () => {
  assert.ok(pair('--text-1', '--bg-0') >= 4.5, `text-1/bg-0=${pair('--text-1', '--bg-0')}`);
  assert.ok(pair('--text-2', '--bg-1') >= 4.5, `text-2/bg-1=${pair('--text-2', '--bg-1')}`);
  assert.ok(pair('--text-3', '--bg-1') >= 4.5, `text-3/bg-1=${pair('--text-3', '--bg-1')}`);
});

test('强调色作为文本 ≥ 4.5:1', () => {
  assert.ok(pair('--accent', '--bg-1') >= 4.5, `accent/bg-1=${pair('--accent', '--bg-1')}`);
  assert.ok(pair('--text-inverse', '--accent') >= 4.5, `text-inverse/accent=${pair('--text-inverse', '--accent')}`);
});

test('danger 作为文本/图标 ≥ 4.5:1', () => {
  assert.ok(pair('--danger', '--bg-1') >= 4.5, `danger/bg-1=${pair('--danger', '--bg-1')}`);
});

test('非文字元素（边框/焦点环）≥ 3:1', () => {
  assert.ok(pair('--border-1', '--bg-1') >= 3, `border-1/bg-1=${pair('--border-1', '--bg-1')}`);
  assert.ok(pair('--focus', '--bg-1') >= 3, `focus/bg-1=${pair('--focus', '--bg-1')}`);
});

test('禁用态 ≥ 2:1', () => {
  assert.ok(pair('--text-disabled', '--bg-1') >= 2, `text-disabled/bg-1=${pair('--text-disabled', '--bg-1')}`);
});
