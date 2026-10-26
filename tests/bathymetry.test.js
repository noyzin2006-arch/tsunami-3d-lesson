// tests/bathymetry.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeBathymetry, depthAt, chapterForTime } from '../src/physics/bathymetry.js';
import { waveSpeed, greenFactor, makeParams } from '../src/physics/tsunami.js';

test('depthAt 分段：深水常数、过渡平滑、近岸恒为 10m', () => {
  assert.equal(depthAt(0, 4000), 4000);
  assert.equal(depthAt(620, 4000), 4000);
  assert.equal(depthAt(795, 4000), 10);
  assert.equal(depthAt(800, 4000), 10);
  // 过渡段单调递减
  const a = depthAt(650, 4000);
  const b = depthAt(750, 4000);
  assert.ok(a > b && b > 10, `过渡应递减：a=${a} b=${b}`);
});

test('depthAt 不随深水端变化而破坏近岸 10m', () => {
  for (const d of [2000, 4000, 6000]) {
    assert.equal(depthAt(800, d), 10);
    assert.ok(depthAt(700, d) > 10 && depthAt(700, d) < d);
  }
});

test('时间表 tau 单调不减，且 tau(0)=0', () => {
  const b = makeBathymetry(makeParams({ deepDepthM: 4000 }));
  assert.equal(b.tauAt(0), 0);
  let prev = -1;
  for (let x = 0; x <= 800; x += 10) {
    const t = b.tauAt(x);
    assert.ok(t >= prev, `tau 在 x=${x} 非单调`);
    prev = t;
  }
});

test('不同深海水深下章节锚点均严格递增', () => {
  for (const d of [2000, 4000, 6000]) {
    const b = makeBathymetry(makeParams({ deepDepthM: d }));
    for (let i = 1; i < b.cuts.length; i++) {
      assert.ok(b.cuts[i] > b.cuts[i - 1], `deep=${d} cuts[${i}] 未递增`);
    }
  }
});

test('H(x)：深水等于 H0，近岸放大 Green 倍', () => {
  const p = makeParams({ deepDepthM: 4000, upliftM: 1.5 });
  const b = makeBathymetry(p);
  assert.ok(Math.abs(b.H(100) - p.initialWaveHeightM) < 1e-9);
  const hNear = b.H(800);
  const expect = p.initialWaveHeightM * greenFactor(4000, 10);
  assert.ok(Math.abs(hNear - expect) < 1e-9, `近岸 H=${hNear} 期望 ${expect}`);
  assert.ok(hNear > p.initialWaveHeightM);
});

test('参数改变（深水/抬升）后 H 随抬升变化、c 不变', () => {
  const b1 = makeBathymetry(makeParams({ upliftM: 0.5, deepDepthM: 4000 }));
  const b2 = makeBathymetry(makeParams({ upliftM: 3.0, deepDepthM: 4000 }));
  assert.ok(b2.H(800) > b1.H(800));
  assert.equal(waveSpeed(b1.hAt(400)), waveSpeed(b2.hAt(400)));
});

test('chapterForTime 边界', () => {
  const b = makeBathymetry(makeParams());
  const c = b.cuts;
  assert.equal(chapterForTime(c, c[3] - 1), 2);
  assert.equal(chapterForTime(c, c[3]), 3);
  assert.equal(chapterForTime(c, c[7] + 9999), 6);
});
