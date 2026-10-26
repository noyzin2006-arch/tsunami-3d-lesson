// scripts/audit-physics.mjs
// A04 的命令行证据：把关键物理量算一遍并与解析值对照，逐项打印 PASS/FAIL。
// 不依赖浏览器，输出同时写入 reports/evidence/audit-physics.log。
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  waveSpeed, waveLength, greenFactor, waveHeightAtDepth, compareArrival, makeParams,
} from '../src/physics/tsunami.js';
import { makeBathymetry, depthAt, chapterForTime } from '../src/physics/bathymetry.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EVID = path.join(ROOT, 'reports', 'evidence');
fs.mkdirSync(EVID, { recursive: true });

const rows = [];
function check(name, got, want, tol, unit = '') {
  const ok = Math.abs(got - want) <= tol;
  rows.push({ name, got, want, tol, unit, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  got=${got}${unit}  want=${want}±${tol}${unit}`);
}

const cD = waveSpeed(4000);
check('c(h=4000m) m/s', cD, Math.sqrt(9.81 * 4000), 1e-9, ' m/s');
check('c(h=4000m) km/h', cD * 3.6, 713.11, 0.05, ' km/h');
check('c(h=10m) m/s', waveSpeed(10), 9.9045, 0.001, ' m/s');
check('Green 4000→10', greenFactor(4000, 10), 4.4721, 0.001, ' ×');
check('H(h=10) 由 H0=0.25m', waveHeightAtDepth(0.25, 4000, 10), 1.1180, 0.001, ' m');
check('λ(h=4000,T=600)', waveLength(4000, 600) / 1000, 118.86, 0.05, ' km');
check('λ(h=10,T=600)', waveLength(10, 600) / 1000, 5.94, 0.02, ' km');

const arr = compareArrival(4000, 300, 6);
check('P 波 300km', arr.seismicSec, 50, 1e-6, ' s');
check('海啸 300km', arr.tsunamiSec, 300000 / cD, 1e-6, ' s');

const params = makeParams();
const bathy = makeBathymetry(params);
check('海盆水深 @0km', depthAt(0, 4000), 4000, 1e-9, ' m');
check('海盆水深 @795km', depthAt(795, 4000), 10, 1e-9, ' m');
check('章节锚点数', bathy.cuts.length, 8, 0, ' 个');
check('末锚点 > 首锚点', bathy.cuts[7] > bathy.cuts[0] ? 1 : 0, 1, 0);
check('chapterForTime(末)', chapterForTime(bathy.cuts, bathy.cuts[7]), 6, 0);

// 参数敏感性：水深变化后 c 与 λ 同步变化，H 比保持 Green 关系
const deep = makeBathymetry(makeParams({ deepDepthM: 6000 }));
const shallow = makeBathymetry(makeParams({ deepDepthM: 2000 }));
check('6000m 比 2000m 更快', waveSpeed(6000) > waveSpeed(2000) ? 1 : 0, 1, 0);
// 深水基准越深，抬到同一浅水（10m）的 Green 放大倍数越大：(6000/10)^.25 > (2000/10)^.25
check('6000m Green 比更大', greenFactor(6000, 10) > greenFactor(2000, 10) ? 1 : 0, 1, 0);
check('6000m Green 比数值', greenFactor(6000, 10), 4.9492, 0.001, ' ×');
check('6000m 波列末锚点更早', deep.cuts[7] < shallow.cuts[7] ? 1 : 0, 1, 0);

const failed = rows.filter((r) => !r.ok);
const out = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  total: rows.length,
  passed: rows.length - failed.length,
  failed: failed.length,
  rows,
};
fs.writeFileSync(path.join(EVID, 'audit-physics.json'), JSON.stringify(out, null, 2));
fs.writeFileSync(
  path.join(EVID, 'audit-physics.log'),
  rows.map((r) => `${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  got=${r.got}${r.unit}  want=${r.want}±${r.tol}${r.unit}`).join('\n') + '\n'
);
console.log(`\n${out.passed}/${out.total} 通过`);
if (failed.length) process.exitCode = 1;
