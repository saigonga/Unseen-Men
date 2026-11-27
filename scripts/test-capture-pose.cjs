const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
let brightness = 200;
const compile = file => ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function load(file, mocks = {}) {
  const module = { exports: {} };
  vm.runInNewContext(compile(file), { module, exports: module.exports, require: name => mocks[name] || require(name), HTMLVideoElement: class {}, HTMLImageElement: class {}, document: { createElement: () => ({ getContext: () => ({ drawImage() {}, getImageData: () => ({ data: new Uint8Array(48 * 48 * 4).fill(brightness) }) }) }) } });
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
const input = { width: 400, height: 400 };
const detection = { box: { x: 100, y: 100, width: 200, height: 200 }, P: points, P478: null, femaleP: 0, pose: { yaw: 0, pitch: 0, roll: 0 } };
assert.equal(checkQuality(input, detection, "upload").blocking, null);
assert.equal(liveInstruction(input, detection), null);
for (const pitch of [-20, 20]) {
  const turned = { ...detection, pose: { ...detection.pose, pitch } };
  assert.match(checkQuality(input, turned, "camera").blocking, /phone at eye level/);
  assert.match(liveInstruction(input, turned), /Chin/);
}
const fallbackPoints = points.map(point => ({ ...point }));
fallbackPoints[30] = { x: 50, y: 78 };
assert.match(checkQuality(input, { ...detection, pose: null, P: fallbackPoints }, "upload").blocking, /phone at eye level/);
const rotated = { ...detection, pose: { ...detection.pose, yaw: 20 } };
assert.match(checkQuality(input, rotated, "upload").blocking, /head is turned/);
assert.match(liveInstruction(input, rotated), /Look straight/);
console.log('Capture pose checks passed.');
const distant = { ...detection, box: { x: 142, y: 142, width: 115, height: 115 } };
assert.match(checkQuality(input, distant, "upload").blocking, /face is too small/);
const landscape = { width: 3600, height: 1000 };
const landscapeFace = { ...detection, box: { x: 1550, y: 250, width: 500, height: 500 } };
assert.match(checkQuality(landscape, landscapeFace, "upload").blocking, /face is too small/);
assert.equal(checkQuality(landscape, landscapeFace, "camera").blocking, null);
const tooClose = { ...detection, box: { x: 20, y: 20, width: 360, height: 360 } };
assert.match(checkQuality(input, tooClose, "camera").blocking, /camera back/);
const tilted = { ...detection, pose: { ...detection.pose, roll: 15 } };
assert.match(checkQuality(input, tilted, "camera").blocking, /phone at eye level/);
brightness = 35;
assert.match(checkQuality(input, detection, "upload").blocking, /face is too dark/);
console.log("Photo retake checks passed.");
