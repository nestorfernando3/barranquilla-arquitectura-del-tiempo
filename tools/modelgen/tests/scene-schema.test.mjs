import test from "node:test";
import assert from "node:assert/strict";
import { EXPECTED_SLUGS, validateScene } from "../scene-schema.mjs";

test("the production manifest contains the 13 canonical slugs", () => {
  assert.equal(EXPECTED_SLUGS.length, 13);
  assert.equal(new Set(EXPECTED_SLUGS).size, 13);
  assert.ok(EXPECTED_SLUGS.includes("edificio-garcia"));
});

test("a scene must declare a non-blank string name", () => {
  const scene = {
    slug: "estacion-montoya",
    name: "Estación Montoya",
    frontAxis: "+z",
    parts: [{
      type: "box", name: "Cuerpo", material: "ladrillo",
      role: "building", evidence: "documented",
    }],
  };
  for (const name of [undefined, null, 42, "", "   "]) {
    assert.throws(() => validateScene({ ...scene, name }), /scene name/i);
  }
});

test("a part must declare role and evidence", () => {
  assert.throws(() => validateScene({
    slug: "estacion-montoya",
    name: "Estación Montoya",
    frontAxis: "+z",
    parts: [{ type: "box", name: "Cuerpo", material: "ladrillo", p: [0, 1, 0], s: [2, 2, 2] }]
  }), /role/);
});

test("frontAxis is always +z", () => {
  assert.throws(() => validateScene({
    slug: "estacion-montoya",
    name: "Estación Montoya",
    frontAxis: "-z",
    parts: []
  }), /frontAxis/);
});

test("unknown shapes and non-finite transforms are rejected", () => {
  assert.throws(() => validateScene({
    slug: "estacion-montoya",
    name: "Estación Montoya",
    frontAxis: "+z",
    parts: [{
      type: "inventedShape", name: "Error", material: "ladrillo",
      role: "building", evidence: "documented", p: [0, NaN, 0]
    }]
  }), /type|finite/);
});
