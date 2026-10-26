// tests/physics.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  GRAVITY, NEAR_DEPTH_M, makeParams,
  waveSpeed, waveLength, greenFactor, waveHeightAtDepth,
  travelTimeKm, compareArrival, waveElevation,
} from '../src/physics/tsunami.js';
import { makeBathymetry, depthAt, chapterForTime } from '../src/physics/bathymetry.js';

const approx = (a, b, eps = 1e-2) => Math.abs(a - b) <= eps;

test('GRAVITY 固定为 9.81', () => {
  assert.equal(GRAVITY, 9.81);
});

test('波速 c=√(gh)：4000m 与 10m', () => {
  const c4000 = waveSpeed(4000);
  assert.ok(approx(c4000, 198.09, 0.05), `c4000=${c4000}`);
  const kmh = c4000 * 3.6;
  assert.ok(kmh >= 712.9 && kmh <= 713.3, `km/h=${kmh}`);
  const c10 = waveSpeed(10);
  assert.ok(approx(c10, 9.9045, 0.01), `c10=${c10}`);
});

test('波长 λ=cT：T=600s', () => {
  const lam4000 = waveLength(4000, 600) / 1000; // km
  assert.ok(approx(lam4000, 118.86, 0.05), `λ4000=${lam4000} km`);
  const lam10 = waveLength(10, 600) / 1000;
  assert.ok(approx(lam10, 5.94, 0.02), `λ10=${lam10} km`);
});

test('Green 定律 4000→10 ≈ 4.4721', () => {
  const g = greenFactor(4000, 10);
  assert.ok(approx(g, 4.4721, 0.001), `green=${g}`);
});

test('波高随水深：默认参数 H0=0.25m 在 10m 处约 1.118m', () => {
  const H10 = waveHeightAtDepth(0.25, 4000, 10);
  assert.ok(approx(H10, 1.118, 0.002), `H10=${H10}`);
  // 浅水波高必然大于深水（正比于 h^-1/4）
  assert.ok(H10 > 0.25);
});

test('非法输入抛 RangeError', () => {
  assert.throws(() => waveSpeed(0), RangeError);
  assert.throws(() => waveSpeed(-1), RangeError);
  assert.throws(() => waveLength(4000, 0), RangeError);
  assert.throws(() => waveLength(4000, -5), RangeError);
  assert.throws(() => waveHeightAtDepth(-0.1, 4000, 10), RangeError);
  assert.throws(() => waveSpeed(NaN), RangeError);
});

test('travelTimeKm 在均匀水深等于距离/速度', () => {
  const c = waveSpeed(4000);
  const t = travelTimeKm(0, 400, () => 4000, 0.5);
  assert.ok(approx(t, (400 * 1000) / c, 1.0), `t=${t}`);
});

test('travelTimeKm 步长收敛（1/0.5/0.25 km 误差逐级减小）', () => {
  const lookup = (x) => depthAt(x, 4000);
  const t05 = travelTimeKm(0, 800, lookup, 0.5);
  const t025 = travelTimeKm(0, 800, lookup, 0.25);
  const t0125 = travelTimeKm(0, 800, lookup, 0.125);
  const d1 = Math.abs(t05 - t025);
  const d2 = Math.abs(t025 - t0125);
  assert.ok(d2 < d1, `d1=${d1} d2=${d2}`);
  assert.ok(Number.isFinite(t05) && t05 > 0);
});

test('compareArrival：地震波 300km/6km/s = 50s；海啸更慢，gap>0', () => {
  const r = compareArrival(4000, 300, 6);
  assert.equal(r.seismicSec, 50);
  assert.ok(r.tsunamiSec > r.seismicSec);
  assert.ok(approx(r.gapSec, r.tsunamiSec - r.seismicSec, 1e-9));
  assert.ok(r.tsunamiSec > 1000);
});

test('waveElevation 未抵达时为 0；相位决定首波正负', () => {
  const paramsT = makeParams({ upliftM: 1.5, phaseMode: 'trough-first' });
  const paramsC = makeParams({ upliftM: 1.5, phaseMode: 'crest-first' });
  const bathyT = makeBathymetry(paramsT);
  const bathyC = makeBathymetry(paramsC);
  const env = (b) => ({ hAt: b.hAt, tauAt: b.tauAt, H: b.H });
  const x = 400;
  const early = waveElevation(x, 0, paramsT, env(bathyT));
  assert.equal(early, 0);
  const tCenter = bathyT.tauAt(x) + 60;
  const etaT = waveElevation(x, tCenter, paramsT, env(bathyT));
  const etaC = waveElevation(x, tCenter, paramsC, env(bathyC));
  assert.ok(etaT < 0, `trough-first 首波应为负，收到 ${etaT}`);
  assert.ok(etaC > 0, `crest-first 首波应为正，收到 ${etaC}`);
  assert.ok(approx(etaT, -etaC, 1e-6), '两相位应关于 0 对称');
});

test('waveElevation 振幅随 uplift 变化，但不改变波速', () => {
  const low = makeBathymetry(makeParams({ upliftM: 0.5 }));
  const high = makeBathymetry(makeParams({ upliftM: 3.0 }));
  const pLow = makeParams({ upliftM: 0.5 });
  const pHigh = makeParams({ upliftM: 3.0 });
  const x = 400;
  const t = low.tauAt(x) + 60;
  const eLow = Math.abs(waveElevation(x, t, pLow, { hAt: low.hAt, tauAt: low.tauAt, H: low.H }));
  const eHigh = Math.abs(waveElevation(x, t, pHigh, { hAt: high.hAt, tauAt: high.tauAt, H: high.H }));
  assert.ok(eHigh > eLow, `高抬升振幅应更大：${eHigh} vs ${eLow}`);
  const cLow = waveSpeed(low.hAt(x));
  const cHigh = waveSpeed(high.hAt(x));
  assert.equal(cLow, cHigh);
});

test('章节锚点严格递增，且 chapterForTime 越界正确', () => {
  const bathy = makeBathymetry(makeParams());
  const cuts = bathy.cuts;
  for (let i = 1; i < cuts.length; i++) {
    assert.ok(cuts[i] > cuts[i - 1], `cuts[${i}] 未严格递增`);
  }
  assert.equal(chapterForTime(cuts, 0), 0);
  assert.equal(chapterForTime(cuts, 100), 1);
  assert.equal(chapterForTime(cuts, cuts[6] + 10), 6);
  assert.equal(chapterForTime(cuts, 1e12), 6);
});

test('NEAR_DEPTH_M 固定为 10', () => {
  assert.equal(NEAR_DEPTH_M, 10);
});
