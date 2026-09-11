import { readFile, stat } from "node:fs/promises";
import { basename, extname } from "node:path";
import { Document, NodeIO } from "@gltf-transform/core";
import { buildScene } from "./lib.mjs";
import { validateScene } from "./scene-schema.mjs";

export async function writeModel(scenePath, outPath) {
  const scene = JSON.parse(await readFile(scenePath, "utf8"));
  const expectedSlug = basename(scenePath, extname(scenePath));
  validateScene(scene, expectedSlug);

  const parts = buildScene(scene);
  if (parts.length === 0) throw new Error("La escena no tiene partes con geometría.");

  const doc = new Document();
  doc.getRoot().getAsset().generator = "bq-modelgen procedural L2";
  const gltfScene = doc.createScene(`escena-${scene.slug}`).setExtras({
    slug: scene.slug,
    name: scene.name,
    frontAxis: scene.frontAxis,
    level: "L2",
  });
  const buffer = doc.createBuffer();
  const materials = createMaterials(doc, parts);
  const usedNames = new Map();
  let triangles = 0;

  for (const [index, part] of parts.entries()) {
    const positions = new Float32Array(part.positions);
    const normals = new Float32Array(part.normals);
    const vertexCount = positions.length / 3;
    const positionAccessor = doc.createAccessor(`pos-${index}`)
      .setType("VEC3")
      .setArray(positions)
      .setBuffer(buffer);
    const normalAccessor = doc.createAccessor(`nrm-${index}`)
      .setType("VEC3")
      .setArray(normals)
      .setBuffer(buffer);
    const primitive = doc.createPrimitive()
      .setMaterial(materials.get(part.color))
      .setAttribute("POSITION", positionAccessor)
      .setAttribute("NORMAL", normalAccessor);

    if (vertexCount <= 65_535) {
      const indices = new Uint16Array(vertexCount);
      for (let vertex = 0; vertex < vertexCount; vertex += 1) indices[vertex] = vertex;
      primitive.setIndices(doc.createAccessor(`idx-${index}`)
        .setType("SCALAR")
        .setArray(indices)
        .setBuffer(buffer));
    }

    const mesh = doc.createMesh(`${part.name} · malla`).addPrimitive(primitive);
    const baseName = `${scene.slug} · ${part.name}`;
    const duplicateIndex = usedNames.get(baseName) ?? 0;
    usedNames.set(baseName, duplicateIndex + 1);
    const nodeName = duplicateIndex === 0 ? baseName : `${baseName} (${duplicateIndex + 1})`;
    const node = doc.createNode(nodeName)
      .setExtras({ role: part.role, evidence: part.evidence })
      .setMesh(mesh);
    gltfScene.addChild(node);
    triangles += part.triangles;
  }

  await new NodeIO().write(outPath, doc);
  const { size: bytes } = await stat(outPath);
  return { slug: scene.slug, parts: parts.length, triangles, bytes, outputPath: outPath };
}

function createMaterials(doc, parts) {
  const materials = new Map();
  for (const { color } of parts) {
    if (materials.has(color)) continue;
    const material = doc.createMaterial(`mat-${color.replace("#", "")}`)
      .setBaseColorFactor([...hexToRgb(color), 1])
      .setRoughnessFactor(0.85)
      .setMetallicFactor(0.06)
      .setDoubleSided(true);
    materials.set(color, material);
  }
  return materials;
}

function hexToRgb(hex) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new Error(`Color inválido: ${hex}`);
  return [
    Number.parseInt(hex.slice(1, 3), 16) / 255,
    Number.parseInt(hex.slice(3, 5), 16) / 255,
    Number.parseInt(hex.slice(5, 7), 16) / 255,
  ];
}
