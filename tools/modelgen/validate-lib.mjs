import { stat } from "node:fs/promises";
import { Accessor, NodeIO, Primitive } from "@gltf-transform/core";
import { VALID_EVIDENCE, VALID_ROLES } from "./scene-schema.mjs";

const MAX_TRIANGLES = 100_000;
const MAX_BYTES = 8 * 1024 * 1024;
const NORMAL_TOLERANCE = 1e-4;
const DEGENERATE_CROSS_SQUARED = 1e-20;

export async function inspectModel(path) {
  const doc = await new NodeIO().read(path);
  const root = doc.getRoot();
  const [scene] = root.listScenes();
  const sceneExtras = scene?.getExtras() ?? {};
  const meshNodes = root.listNodes().filter((node) => node.getMesh());
  const prefix = typeof sceneExtras.slug === "string" ? `${sceneExtras.slug} · ` : null;
  const nodeDetails = meshNodes.map((node) => {
    const extras = node.getExtras();
    const validName = Boolean(prefix && node.getName().startsWith(prefix));
    const validExtras = VALID_ROLES.has(extras.role) && VALID_EVIDENCE.has(extras.evidence);
    return {
      name: node.getName(),
      role: extras.role,
      evidence: extras.evidence,
      validName,
      validExtras,
    };
  });

  let triangles = 0;
  let missingMaterials = 0;
  let missingNormals = 0;
  let invalidNormals = 0;
  let invalidIndices = 0;
  let invalidPositions = 0;
  let invalidTopology = 0;
  let degenerateTriangles = 0;

  for (const mesh of root.listMeshes()) {
    for (const primitive of mesh.listPrimitives()) {
      const position = primitive.getAttribute("POSITION");
      const normal = primitive.getAttribute("NORMAL");
      if (!primitive.getMaterial()) missingMaterials += 1;
      if (!position || position.getType() !== "VEC3") {
        invalidPositions += 1;
        continue;
      }
      invalidPositions += countInvalidVectors(position);

      if (!normal) {
        missingNormals += 1;
      } else if (normal.getType() !== "VEC3") {
        invalidNormals += Math.max(normal.getCount(), position.getCount());
      } else {
        invalidNormals += countInvalidNormals(normal);
        invalidNormals += Math.abs(normal.getCount() - position.getCount());
      }

      const inspection = inspectPrimitiveIndices(primitive, position.getCount());
      invalidIndices += inspection.invalidIndices;
      invalidTopology += inspection.invalidTopology;
      if (inspection.invalidIndices > 0 || inspection.invalidTopology > 0) {
        continue;
      }
      const { triangles: indices } = inspection;
      triangles += indices.length;
      for (const [a, b, c] of indices) {
        if (a >= position.getCount() || b >= position.getCount() || c >= position.getCount()) {
          invalidPositions += 1;
          continue;
        }
        const va = position.getElement(a, []);
        const vb = position.getElement(b, []);
        const vc = position.getElement(c, []);
        if (![...va, ...vb, ...vc].every(Number.isFinite)) continue;
        if (crossSquared(va, vb, vc) <= DEGENERATE_CROSS_SQUARED) {
          degenerateTriangles += 1;
        }
      }
    }
  }

  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const node of meshNodes) {
    const matrix = node.getWorldMatrix();
    for (const primitive of node.getMesh().listPrimitives()) {
      const position = primitive.getAttribute("POSITION");
      if (!position || position.getType() !== "VEC3") continue;
      const inspection = inspectPrimitiveIndices(primitive, position.getCount());
      if (inspection.invalidIndices > 0 || inspection.invalidTopology > 0) continue;
      const referencedIndices = inspection.triangles.flat();
      for (const vertexIndex of referencedIndices) {
        const point = transformPoint(position.getElement(vertexIndex, []), matrix);
        if (!point.every(Number.isFinite)) continue;
        for (let axis = 0; axis < 3; axis += 1) {
          min[axis] = Math.min(min[axis], point[axis]);
          max[axis] = Math.max(max[axis], point[axis]);
        }
      }
    }
  }

  const { size: bytes } = await stat(path);
  const bounds = max.map((value, axis) => value - min[axis]);
  return {
    slug: sceneExtras.slug,
    name: sceneExtras.name,
    frontAxis: sceneExtras.frontAxis,
    level: sceneExtras.level,
    parts: meshNodes.length,
    triangles,
    bytes,
    outputPath: path,
    materials: root.listMaterials().length,
    missingMaterials,
    missingNormals,
    invalidNormals,
    invalidIndices,
    invalidPositions,
    invalidTopology,
    degenerateTriangles,
    meshNodes: meshNodes.length,
    semanticNodes: nodeDetails.filter(({ validName, validExtras }) => validName && validExtras).length,
    invalidNodeNames: nodeDetails.filter(({ validName }) => !validName).length,
    invalidNodeExtras: nodeDetails.filter(({ validExtras }) => !validExtras).length,
    nodeDetails,
    min,
    max,
    bounds,
  };
}

export function assertModel(summary, expectedSlug) {
  const problems = [];
  if (summary.slug !== expectedSlug) {
    problems.push(`scene slug ${String(summary.slug)} does not match ${expectedSlug}`);
  }
  if (typeof summary.name !== "string" || !summary.name.trim()) problems.push("scene name is missing");
  if (summary.frontAxis !== "+z") problems.push("frontAxis must be +z");
  if (summary.level !== "L2") problems.push("scene level must be L2");
  if (!Number.isInteger(summary.triangles) || summary.triangles <= 0) problems.push("model has no triangles");
  if (summary.triangles > MAX_TRIANGLES) {
    problems.push(`${summary.triangles} triangles exceed the ${MAX_TRIANGLES} limit`);
  }
  if (!Number.isFinite(summary.bytes) || summary.bytes <= 0) problems.push("model byte size is invalid");
  if (summary.bytes > MAX_BYTES) problems.push(`${summary.bytes} bytes exceed the ${MAX_BYTES} byte limit`);
  if (!Number.isInteger(summary.materials) || summary.materials < 1) problems.push("model has no materials");
  if ((summary.missingMaterials ?? 0) > 0) {
    problems.push(`${summary.missingMaterials} primitives are missing materials`);
  }
  if ((summary.missingNormals ?? 0) > 0) {
    problems.push(`${summary.missingNormals} primitives are missing NORMAL attributes`);
  }
  if ((summary.invalidNormals ?? 0) > 0) {
    problems.push(`${summary.invalidNormals} NORMAL vectors are non-finite, non-unit, or missing`);
  }
  if ((summary.invalidIndices ?? 0) > 0) {
    problems.push(`${summary.invalidIndices} index accessor/value problems violate unsigned non-normalized SCALAR indices`);
  }
  if ((summary.invalidPositions ?? 0) > 0) problems.push(`${summary.invalidPositions} POSITION values are invalid`);
  if ((summary.invalidTopology ?? 0) > 0) problems.push(`${summary.invalidTopology} primitives are not triangles`);
  if ((summary.degenerateTriangles ?? 0) > 0) {
    problems.push(`${summary.degenerateTriangles} degenerate triangles have zero area`);
  }
  if (!Number.isInteger(summary.meshNodes) || summary.meshNodes <= 0) problems.push("model has no mesh nodes");
  if (summary.semanticNodes !== summary.meshNodes) {
    problems.push(`${summary.semanticNodes} of ${summary.meshNodes} mesh nodes are semantic`);
  }
  if ((summary.invalidNodeNames ?? 0) > 0) {
    problems.push(`${summary.invalidNodeNames} mesh node names do not begin with "${expectedSlug} · "`);
  }
  if ((summary.invalidNodeExtras ?? 0) > 0) {
    problems.push(`${summary.invalidNodeExtras} mesh nodes lack valid role/evidence extras`);
  }

  const vectorsAreFinite = [summary.min, summary.max, summary.bounds]
    .every((vector) => Array.isArray(vector) && vector.length === 3 && vector.every(Number.isFinite));
  if (!vectorsAreFinite) {
    problems.push("model bounds are non-finite");
  } else {
    if (summary.bounds.some((dimension) => dimension <= 0)) problems.push("model bounds are degenerate");
    for (let axis = 0; axis < 3; axis += 1) {
      const measured = summary.max[axis] - summary.min[axis];
      if (Math.abs(measured - summary.bounds[axis]) > 1e-6) {
        problems.push("model bounds are inconsistent with min/max");
        break;
      }
    }
    if (summary.min[1] < -0.01 || summary.min[1] > 0.01) {
      problems.push(`model does not rest on ground: minY=${summary.min[1]}`);
    }
  }

  if (problems.length > 0) throw new Error(problems.join("; "));
  return summary;
}

function countInvalidVectors(accessor) {
  let invalid = 0;
  for (let index = 0; index < accessor.getCount(); index += 1) {
    if (!accessor.getElement(index, []).every(Number.isFinite)) invalid += 1;
  }
  return invalid;
}

function countInvalidNormals(accessor) {
  let invalid = 0;
  for (let index = 0; index < accessor.getCount(); index += 1) {
    const normal = accessor.getElement(index, []);
    const length = Math.hypot(...normal);
    if (!normal.every(Number.isFinite) || !Number.isFinite(length) || Math.abs(length - 1) > NORMAL_TOLERANCE) {
      invalid += 1;
    }
  }
  return invalid;
}

function inspectPrimitiveIndices(primitive, vertexCount) {
  const accessor = primitive.getIndices();
  let invalidIndices = 0;
  let values;
  if (accessor) {
    if (accessor.getType() !== Accessor.Type.SCALAR) invalidIndices += 1;
    if (accessor.getNormalized()) invalidIndices += 1;
    if (![Accessor.ComponentType.UNSIGNED_BYTE,
      Accessor.ComponentType.UNSIGNED_SHORT,
      Accessor.ComponentType.UNSIGNED_INT].includes(accessor.getComponentType())) {
      invalidIndices += 1;
    }
    values = [...(accessor.getArray() ?? [])];
    for (const value of values) {
      if (!Number.isInteger(value) || value < 0 || value >= vertexCount) invalidIndices += 1;
    }
  } else {
    values = Array.from({ length: vertexCount }, (_, index) => index);
  }

  if (invalidIndices > 0) return { triangles: [], invalidIndices, invalidTopology: 0 };
  const count = values.length;
  const at = (index) => values[index];
  const triangles = [];
  if (primitive.getMode() === Primitive.Mode.TRIANGLES) {
    if (count === 0 || count % 3 !== 0) return { triangles, invalidIndices: 0, invalidTopology: 1 };
    for (let index = 0; index < count; index += 3) {
      triangles.push([at(index), at(index + 1), at(index + 2)]);
    }
    return { triangles, invalidIndices: 0, invalidTopology: 0 };
  }
  if (primitive.getMode() === Primitive.Mode.TRIANGLE_STRIP) {
    if (count < 3) return { triangles, invalidIndices: 0, invalidTopology: 1 };
    for (let index = 0; index + 2 < count; index += 1) {
      triangles.push(index % 2 === 0
        ? [at(index), at(index + 1), at(index + 2)]
        : [at(index + 1), at(index), at(index + 2)]);
    }
    return { triangles, invalidIndices: 0, invalidTopology: 0 };
  }
  if (primitive.getMode() === Primitive.Mode.TRIANGLE_FAN) {
    if (count < 3) return { triangles, invalidIndices: 0, invalidTopology: 1 };
    for (let index = 1; index + 1 < count; index += 1) {
      triangles.push([at(0), at(index), at(index + 1)]);
    }
    return { triangles, invalidIndices: 0, invalidTopology: 0 };
  }
  return { triangles, invalidIndices: 0, invalidTopology: 1 };
}

function crossSquared(a, b, c) {
  const abx = b[0] - a[0];
  const aby = b[1] - a[1];
  const abz = b[2] - a[2];
  const acx = c[0] - a[0];
  const acy = c[1] - a[1];
  const acz = c[2] - a[2];
  const x = aby * acz - abz * acy;
  const y = abz * acx - abx * acz;
  const z = abx * acy - aby * acx;
  return x * x + y * y + z * z;
}

function transformPoint(point, matrix) {
  const [x, y, z] = point;
  return [
    matrix[0] * x + matrix[4] * y + matrix[8] * z + matrix[12],
    matrix[1] * x + matrix[5] * y + matrix[9] * z + matrix[13],
    matrix[2] * x + matrix[6] * y + matrix[10] * z + matrix[14],
  ];
}
