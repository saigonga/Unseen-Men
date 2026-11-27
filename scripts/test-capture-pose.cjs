const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function load(file, mocks = {}) {
  const module = { exports: {} };
  vm.runInNewContext(compile(file), { module, exports: module.exports, require: name => mocks[name] || require(name), HTMLVideoElement: class {}, HTMLImageElement: class {}, document: { createElement: () => ({ getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8Array(48 * 48 * 4).fill(200) }) }) }) } });
  return module.exports;
}
const geometry = load('lib/geometry.ts');
const config = load('lib/capture.config.ts');
const { checkQuality, liveInstruction } = load('lib/quality.ts', { './geometry': geometry, './capture.config': config, './mesh3d': { yawOf: () => 0 } });
const points = Array.from({ length: 68 }, () => ({ x: 50, y: 50 }));
points[1] = { x: 0, y: 50 }; points[15] = { x: 100, y: 50 };
points[0] = { x: 0, y: 50 }; points[16] = { x: 100, y: 50 };
points[19] = points[24] = { x: 50, y: 10 }; points[8] = { x: 50, y: 100 };
points[48] = { x: 30, y: 75 }; points[54] = { x: 70, y: 75 };
points[62] = { x: 50, y: 75 }; points[66] = { x: 50, y: 76 };
const input = { width: 200, height: 200 };
const detection = { box: { x: 50, y: 50, width: 100, height: 100 }, P: points, P478: null, femaleP: 0, pose: { yaw: 0, pitch: 0, roll: 0 } };
assert.equal(checkQuality(input, detection).blocking, null);
assert.equal(liveInstruction(input, detection), null);
for (const pitch of [-20, 20]) {
  const turned = { ...detection, pose: { ...detection.pose, pitch } };
  assert.match(checkQuality(input, turned).blocking, /phone at eye level/);
  assert.match(liveInstruction(input, turned), /Chin/);
}
const fallbackPoints = points.map(point => ({ ...point }));
fallbackPoints[30] = { x: 50, y: 78 };
assert.match(checkQuality(input, { ...detection, pose: null, P: fallbackPoints }).blocking, /phone at eye level/);
const rotated = { ...detection, pose: { ...detection.pose, yaw: 20 } };
assert.match(checkQuality(input, rotated).blocking, /head is turned/);
assert.match(liveInstruction(input, rotated), /Look straight/);
console.log('Capture pose checks passed.');
