import test from "node:test";
import assert from "node:assert/strict";
import { buildPart } from "../lib.mjs";

const base = { name: "prueba", material: "stucco", role: "building", evidence: "documented", p: [0, 0, 0] };
const area2 = (a, b, c) => {
  const ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
  return Math.hypot(
    ab[1] * ac[2] - ab[2] * ac[1],
    ab[2] * ac[0] - ab[0] * ac[2],
    ab[0] * ac[1] - ab[1] * ac[0],
  );
};

function assertValidMesh(mesh) {
  assert.ok(mesh.triangles > 0);
  assert.equal(mesh.positions.length, mesh.normals.length);
  assert.ok(mesh.positions.every(Number.isFinite));
  assert.ok(mesh.normals.every(Number.isFinite));
  for (let i = 0; i < mesh.normals.length; i += 3) {
    const length = Math.hypot(...mesh.normals.slice(i, i + 3));
    assert.ok(Math.abs(length - 1) < 1e-6);
  }
  for (let i = 0; i < mesh.positions.length; i += 9) {
    const p = mesh.positions.slice(i, i + 9);
    assert.ok(area2(p.slice(0, 3), p.slice(3, 6), p.slice(6, 9)) > 1e-8);
  }
}

for (const part of [
  { ...base, type: "hipRoof", s: [8, 2, 5], ridge: 0.45 },
  { ...base, type: "arch", s: [2, 4, 0.3], arch: "round", seg: 12 },
  { ...base, type: "arch", s: [2, 5, 0.3], arch: "pointed", seg: 12 },
  { ...base, type: "arcade", len: 12, h: 4, dep: 0.5, n: 6, arch: "round" },
  { ...base, type: "windowGrid", cell: [1, 1.6, 0.15], count: [5, 2], gap: [0.6, 0.8] },
  { ...base, type: "classicalColumn", s: [1.2, 10, 1.2], seg: 16 },
]) {
  test(`${part.type} has normals and no zero-area triangles`, () => {
    assertValidMesh(buildPart(part));
  });
}

test("arch keeps its clockwise outline while front and back face outward", () => {
  const mesh = buildPart({ ...base, type: "arch", s: [2, 4, 0.3], arch: "round", seg: 12 });
  const outline = [];
  for (let i = 0; i < mesh.positions.length; i += 36) {
    outline.push(mesh.positions.slice(i + 6, i + 9));
    assert.ok(mesh.normals[i + 2] > 0.999999, "front normal points +z");
    assert.ok(mesh.normals[i + 11] < -0.999999, "back normal points -z");
  }
  const signedArea = outline.reduce((area, point, index) => {
    const next = outline[(index + 1) % outline.length];
    return area + point[0] * next[1] - next[0] * point[1];
  }, 0);
  assert.ok(signedArea < 0, "arch outline is clockwise in local x/y");
});
