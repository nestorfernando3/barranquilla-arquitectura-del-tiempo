import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { writeModel } from "../build-lib.mjs";
import { buildAll } from "../build-all.mjs";
import { EXPECTED_SLUGS } from "../scene-schema.mjs";
import { assertModel, inspectModel } from "../validate-lib.mjs";

const validScene = {
  slug: "estacion-montoya",
  name: "Estación Montoya",
  frontAxis: "+z",
  parts: [{
    type: "box",
    name: "Volumen principal",
    material: "ladrillo",
    role: "building",
    evidence: "documented",
    p: [0, 0.5, 0],
    s: [2, 1, 2],
  }],
};

const TARGET_RELATIVE_PATHS = [
  "interactive-3d-temporal-map/public/models",
  "recorrido-narrativo/models",
];

test("writeModel serializes the required L2 scene and mesh-node extras", async () => {
  const dir = await mkdtemp(join(tmpdir(), "bq-model-test-"));
  try {
    const scenePath = join(dir, "estacion-montoya.json");
    const outPath = join(dir, "estacion-montoya.glb");
    await writeFile(scenePath, JSON.stringify(validScene));

    const written = await writeModel(scenePath, outPath);
    const summary = await inspectModel(outPath);
    const doc = await new NodeIO().read(outPath);
    const [gltfScene] = doc.getRoot().listScenes();
    const meshNodes = doc.getRoot().listNodes().filter((node) => node.getMesh());

    assert.deepEqual(gltfScene.getExtras(), {
      slug: "estacion-montoya",
      name: "Estación Montoya",
      frontAxis: "+z",
      level: "L2",
    });
    assert.equal(meshNodes.length, 1);
    assert.match(meshNodes[0].getName(), /^estacion-montoya · /);
    assert.deepEqual(meshNodes[0].getExtras(), {
      role: "building",
      evidence: "documented",
    });
    assert.equal(written.slug, "estacion-montoya");
    assert.equal(written.parts, 1);
    assert.equal(written.outputPath, outPath);
    assert.equal(summary.slug, "estacion-montoya");
    assert.equal(summary.frontAxis, "+z");
    assert.equal(summary.level, "L2");
    assert.ok(summary.materials >= 1);
    assert.equal(summary.missingNormals, 0);
    assert.equal(summary.invalidNormals, 0);
    assert.equal(summary.degenerateTriangles, 0);
    assert.deepEqual(summary.min, [-1, 0, -1]);
    assert.deepEqual(summary.max, [1, 1, 1]);
    assert.deepEqual(summary.bounds, [2, 1, 2]);
    assert.equal(assertModel(summary, "estacion-montoya"), summary);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("writeModel rejects missing and blank scene names without creating a GLB", async () => {
  const dir = await mkdtemp(join(tmpdir(), "bq-model-name-"));
  const { name: _name, ...sceneWithoutName } = validScene;
  const cases = [
    { label: "missing", scene: sceneWithoutName },
    { label: "blank", scene: { ...validScene, name: "   " } },
  ];
  try {
    for (const { label, scene } of cases) {
      const scenePath = join(dir, "estacion-montoya.json");
      const outputPath = join(dir, `${label}.glb`);
      await writeFile(scenePath, JSON.stringify(scene));

      await assert.rejects(() => writeModel(scenePath, outputPath), /scene name/i);
      await assert.rejects(() => stat(outputPath), { code: "ENOENT" });
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("inspectModel counts missing, invalid, and degenerate geometry from a real GLB", async () => {
  const dir = await mkdtemp(join(tmpdir(), "bq-model-defects-"));
  try {
    const modelPath = join(dir, "edificio-garcia.glb");
    await writeDefectiveModel(modelPath);

    const summary = await inspectModel(modelPath);

    assert.equal(summary.triangles, 2);
    assert.equal(summary.materials, 1);
    assert.equal(summary.missingMaterials, 1);
    assert.equal(summary.missingNormals, 1);
    assert.equal(summary.invalidNormals, 2);
    assert.equal(summary.degenerateTriangles, 1);
    assert.equal(summary.meshNodes, 2);
    assert.equal(summary.semanticNodes, 1);
    assert.throws(
      () => assertModel(summary, "edificio-garcia"),
      /material|NORMAL|degenerate|semantic/i,
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("inspectModel rejects every malformed indexed accessor even beside valid geometry", async () => {
  const cases = [
    {
      label: "floating-point component",
      indices: new Float32Array([0, 1, 2]),
    },
    {
      label: "non-SCALAR type",
      indices: new Uint16Array([0, 1, 2]),
      type: "VEC3",
    },
    {
      label: "normalized unsigned component",
      indices: new Uint16Array([0, 1, 2]),
      normalized: true,
    },
    {
      label: "negative value",
      indices: new Int16Array([-1, 1, 2]),
    },
    {
      label: "fractional value",
      indices: new Float32Array([0, 1.5, 2]),
    },
    {
      label: "out-of-range value",
      indices: new Uint16Array([0, 1, 9]),
    },
  ];

  const dir = await mkdtemp(join(tmpdir(), "bq-model-indices-"));
  try {
    for (const [index, fixture] of cases.entries()) {
      const modelPath = join(dir, `malformed-${index}.glb`);
      await writeMalformedIndexedModel(modelPath, fixture);
      const summary = await inspectModel(modelPath);

      assert.ok(summary.triangles >= 1, `${fixture.label} retains independent valid geometry`);
      assert.ok(summary.invalidIndices > 0, `${fixture.label} must count as invalid indices`);
      assert.throws(
        () => assertModel(summary, "estacion-montoya"),
        /indices/i,
        fixture.label,
      );
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("assertModel rejects semantic and geometric defects", () => {
  assert.throws(() => assertModel({
    slug: "edificio-garcia",
    name: "Edificio García",
    frontAxis: "+z",
    level: "L2",
    triangles: 10,
    bytes: 100,
    materials: 0,
    missingMaterials: 1,
    missingNormals: 1,
    invalidNormals: 0,
    degenerateTriangles: 0,
    meshNodes: 1,
    semanticNodes: 0,
    min: [0, 0, 0],
    max: [1, 1, 1],
    bounds: [1, 1, 1],
  }, "edificio-garcia"), /materials|NORMAL|semantic/i);
});

test("buildAll installs and validate-only verifies both complete matching targets", async () => {
  const root = await makeProjectFixture();
  try {
    const summaries = await buildAll({ projectRoot: root });

    assert.equal(summaries.length, 13);
    assert.deepEqual(summaries.map(({ slug }) => slug), [...EXPECTED_SLUGS]);
    assert.deepEqual(await listTargetModels(root, 0), EXPECTED_SLUGS.map((slug) => `${slug}.glb`));
    assert.deepEqual(await listTargetModels(root, 1), EXPECTED_SLUGS.map((slug) => `${slug}.glb`));
    assert.deepEqual(await targetHashes(root, 0), await targetHashes(root, 1));

    const validated = await buildAll({ projectRoot: root, validateOnly: true });
    assert.equal(validated.length, 13);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("buildAll rejects an extra regular scene file without changing target hashes", async () => {
  const root = await makeProjectFixture();
  try {
    await buildAll({ projectRoot: root });
    await writeFile(
      join(root, "tools/modelgen/scenes/unexpected.json"),
      JSON.stringify(validScene),
    );
    const before = await bothTargetHashes(root);

    await assert.rejects(
      () => buildAll({ projectRoot: root }),
      /scene set mismatch.*unexpected\.json/i,
    );
    assert.deepEqual(await bothTargetHashes(root), before);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("buildAll rejects a missing scene file at the manifest boundary without changing target hashes", async () => {
  const root = await makeProjectFixture();
  try {
    await buildAll({ projectRoot: root });
    await rm(join(root, "tools/modelgen/scenes/edificio-garcia.json"));
    const before = await bothTargetHashes(root);

    await assert.rejects(
      () => buildAll({ projectRoot: root }),
      /scene set mismatch.*edificio-garcia\.json/i,
    );
    assert.deepEqual(await bothTargetHashes(root), before);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("validate-only rejects set and hash mismatches without changing either target", async () => {
  const root = await makeProjectFixture();
  try {
    await buildAll({ projectRoot: root });
    const firstTarget = targetPath(root, 0);
    const secondTarget = targetPath(root, 1);
    const source = join(firstTarget, "estacion-montoya.glb");
    await writeFile(join(firstTarget, "unexpected.glb"), await readFile(source));
    let before = await snapshotBothTargets(root);

    await assert.rejects(
      () => buildAll({ projectRoot: root, validateOnly: true }),
      /model set|unexpected|cardinality/i,
    );
    assert.deepEqual(await snapshotBothTargets(root), before);

    await rm(join(firstTarget, "unexpected.glb"));
    const alteredScenePath = join(root, "tools/modelgen/scenes/estacion-montoya.json");
    await writeFile(alteredScenePath, JSON.stringify({
      ...validScene,
      name: "Estación Montoya alterada",
    }));
    await writeModel(alteredScenePath, join(secondTarget, "estacion-montoya.glb"));
    before = await snapshotBothTargets(root);

    await assert.rejects(
      () => buildAll({ projectRoot: root, validateOnly: true }),
      /hash/i,
    );
    assert.deepEqual(await snapshotBothTargets(root), before);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("a failed target swap restores both production directories", async () => {
  const root = await makeProjectFixture();
  try {
    await writeFile(join(targetPath(root, 0), "original-a.txt"), "target A before build\n");
    await writeFile(join(targetPath(root, 1), "original-b.txt"), "target B before build\n");
    const before = await snapshotBothTargets(root);

    await assert.rejects(
      () => buildAll({ projectRoot: root, faultAfterTargetSwap: 1 }),
      /simulated target swap failure/,
    );

    assert.deepEqual(await snapshotBothTargets(root), before);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

async function writeDefectiveModel(path) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene("defective").setExtras({
    slug: "edificio-garcia",
    name: "Edificio García",
    frontAxis: "+z",
    level: "L2",
  });
  const material = doc.createMaterial("material");

  const validPositions = doc.createAccessor("valid-pos")
    .setType("VEC3")
    .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]))
    .setBuffer(buffer);
  const missingNormalPrimitive = doc.createPrimitive()
    .setAttribute("POSITION", validPositions);
  const missingNormalMesh = doc.createMesh("missing-normal-mesh")
    .addPrimitive(missingNormalPrimitive);
  scene.addChild(doc.createNode("wrong node name").setMesh(missingNormalMesh));

  const degeneratePositions = doc.createAccessor("degenerate-pos")
    .setType("VEC3")
    .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 2, 0, 0]))
    .setBuffer(buffer);
  const invalidNormals = doc.createAccessor("invalid-normal")
    .setType("VEC3")
    .setArray(new Float32Array([0, 2, 0, Number.NaN, 0, 0, 0, 1, 0]))
    .setBuffer(buffer);
  const invalidPrimitive = doc.createPrimitive()
    .setMaterial(material)
    .setAttribute("POSITION", degeneratePositions)
    .setAttribute("NORMAL", invalidNormals);
  const invalidMesh = doc.createMesh("invalid-mesh").addPrimitive(invalidPrimitive);
  scene.addChild(doc.createNode("edificio-garcia · Parte")
    .setExtras({ role: "building", evidence: "documented" })
    .setMesh(invalidMesh));

  await new NodeIO().write(path, doc);
}

async function writeMalformedIndexedModel(path, { indices, type = "SCALAR", normalized = false }) {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const scene = doc.createScene("indexed-scene").setExtras({
    slug: "estacion-montoya",
    name: "Estación Montoya",
    frontAxis: "+z",
    level: "L2",
  });
  const material = doc.createMaterial("material");
  const positions = doc.createAccessor("positions")
    .setType("VEC3")
    .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 1]))
    .setBuffer(buffer);
  const normals = doc.createAccessor("normals")
    .setType("VEC3")
    .setArray(new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0]))
    .setBuffer(buffer);
  const validPrimitive = doc.createPrimitive()
    .setMaterial(material)
    .setAttribute("POSITION", positions)
    .setAttribute("NORMAL", normals);
  const indexAccessor = doc.createAccessor("malformed-indices")
    .setType(type)
    .setArray(indices)
    .setNormalized(normalized)
    .setBuffer(buffer);
  const malformedPrimitive = doc.createPrimitive()
    .setMaterial(material)
    .setIndices(indexAccessor)
    .setAttribute("POSITION", positions)
    .setAttribute("NORMAL", normals);
  const mesh = doc.createMesh("indexed-mesh")
    .addPrimitive(validPrimitive)
    .addPrimitive(malformedPrimitive);
  scene.addChild(doc.createNode("estacion-montoya · Índices")
    .setExtras({ role: "building", evidence: "documented" })
    .setMesh(mesh));

  await new NodeIO().write(path, doc);
}

async function makeProjectFixture() {
  const root = await mkdtemp(join(tmpdir(), "bq-model-pipeline-"));
  const scenesDir = join(root, "tools/modelgen/scenes");
  await mkdir(scenesDir, { recursive: true });
  for (const relative of TARGET_RELATIVE_PATHS) {
    await mkdir(join(root, relative), { recursive: true });
  }
  for (const slug of EXPECTED_SLUGS) {
    const scene = {
      ...validScene,
      slug,
      name: `Fixture ${slug}`,
      parts: validScene.parts.map((part) => ({ ...part, name: `Parte ${slug}` })),
    };
    await writeFile(join(scenesDir, `${slug}.json`), JSON.stringify(scene));
  }
  return root;
}

function targetPath(root, index) {
  return join(root, TARGET_RELATIVE_PATHS[index]);
}

async function listTargetModels(root, index) {
  return (await readdir(targetPath(root, index)))
    .filter((name) => name.endsWith(".glb"))
    .sort();
}

async function targetHashes(root, index) {
  const target = targetPath(root, index);
  const names = await listTargetModels(root, index);
  return Promise.all(names.map(async (name) => [
    name,
    createHash("sha256").update(await readFile(join(target, name))).digest("hex"),
  ]));
}

async function bothTargetHashes(root) {
  return Promise.all([targetHashes(root, 0), targetHashes(root, 1)]);
}

async function snapshotBothTargets(root) {
  return Promise.all(TARGET_RELATIVE_PATHS.map(async (relative) => {
    const dir = join(root, relative);
    const dirStats = await stat(dir);
    const names = (await readdir(dir)).sort();
    const files = await Promise.all(names.map(async (name) => {
      const path = join(dir, name);
      const fileStats = await stat(path);
      return {
        name,
        bytes: fileStats.size,
        modified: fileStats.mtimeMs,
        hash: createHash("sha256").update(await readFile(path)).digest("hex"),
      };
    }));
    return { modified: dirStats.mtimeMs, files };
  }));
}
