import test from "node:test";
import assert from "node:assert/strict";
import { buildPart } from "../lib.mjs";

const base = {
  name: "prueba", material: "stucco", role: "building",
  evidence: "documented", p: [0, 0, 0]
};
const parts = [
  { type: "arcWall", s: [8, 6, 8], innerRadius: 0.72, start: 0, sweep: Math.PI / 2, seg: 18 },
  { type: "curvedSlab", s: [10, 0.35, 10], innerRadius: 0.58, start: 0, sweep: Math.PI / 2, seg: 18 },
  { type: "reliefGrid", panel: [1.2, 0.8, 0.18], count: [6, 8], gap: [0.18, 0.16], offsets: [0, 0.15, -0.1] },
  { type: "lattice", s: [6, 3, 0.25], count: [6, 3], bar: 0.12 },
  { type: "bleacher", s: [18, 5, 8], steps: 8 },
  { type: "curvedRoof", s: [20, 3, 8], rise: 0.28, seg: 16 },
  { type: "wedge", s: [5, 4, 3], slopeAxis: "x" }
].map((part) => ({ ...base, ...part }));

for (const part of parts) {
  test(`${part.type} builds valid geometry`, () => {
    const mesh = buildPart(part);
    assert.ok(mesh.triangles >= 8);
    assert.equal(mesh.positions.length, mesh.normals.length);
    assert.ok(mesh.positions.every(Number.isFinite));
    assert.ok(mesh.normals.every(Number.isFinite));
  });
}

test("lattice bars stay inside the declared x/y bounding box", () => {
  const mesh = buildPart({ ...base, type: "lattice", p: [3, 4, 0], s: [6, 3, 0.25], count: [6, 3], bar: 0.12 });
  for (let i = 0; i < mesh.positions.length; i += 3) {
    assert.ok(mesh.positions[i] >= -1e-9 && mesh.positions[i] <= 6 + 1e-9);
    assert.ok(mesh.positions[i + 1] >= 2.5 - 1e-9 && mesh.positions[i + 1] <= 5.5 + 1e-9);
  }
});

test("annular sector curves point outward on the outside and inward on the opening", () => {
  const mesh = buildPart({ ...base, type: "arcWall", s: [2, 2, 2], innerRadius: 0.6, start: 0, sweep: Math.PI / 2, seg: 4 });
  const curveDots = { outer: [], inner: [] };
  for (let i = 0; i < mesh.positions.length; i += 9) {
    const triangle = mesh.positions.slice(i, i + 9);
    const radii = [0, 3, 6].map((offset) => Math.hypot(triangle[offset], triangle[offset + 2]));
    const radius = radii[0];
    const normal = mesh.normals.slice(i, i + 3);
    if (Math.abs(normal[1]) > 1e-9 || !radii.every((value) => Math.abs(value - radius) < 1e-9)) continue;
    const centerX = (triangle[0] + triangle[3] + triangle[6]) / 3;
    const centerZ = (triangle[2] + triangle[5] + triangle[8]) / 3;
    const dot = normal[0] * centerX + normal[2] * centerZ;
    if (Math.abs(radius - 1) < 1e-9) curveDots.outer.push(dot);
    if (Math.abs(radius - 0.6) < 1e-9) curveDots.inner.push(dot);
  }
  assert.ok(curveDots.outer.length > 0 && curveDots.outer.every((dot) => dot > 0));
  assert.ok(curveDots.inner.length > 0 && curveDots.inner.every((dot) => dot < 0));
});

test("curved roof end caps point away from their respective sides", () => {
  const mesh = buildPart({ ...base, type: "curvedRoof", s: [4, 2, 6], rise: 0.28, seg: 8 });
  const capNormals = { left: [], right: [] };
  for (let i = 0; i < mesh.positions.length; i += 9) {
    const triangle = mesh.positions.slice(i, i + 9);
    const xs = [triangle[0], triangle[3], triangle[6]];
    if (xs.every((x) => Math.abs(x + 2) < 1e-9)) capNormals.left.push(mesh.normals[i]);
    if (xs.every((x) => Math.abs(x - 2) < 1e-9)) capNormals.right.push(mesh.normals[i]);
  }
  assert.ok(capNormals.left.length > 0 && capNormals.left.every((normalX) => normalX < 0));
  assert.ok(capNormals.right.length > 0 && capNormals.right.every((normalX) => normalX > 0));
});
