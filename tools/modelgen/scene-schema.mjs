export const EXPECTED_SLUGS = Object.freeze([
  "antigua-aduana", "banco-dugand", "bellas-artes", "caja-agraria",
  "cine-rex", "edificio-garcia", "edificio-scadta", "estacion-montoya",
  "estadio-romelio-martinez", "hotel-el-prado", "iglesia-san-nicolas",
  "intendencia-fluvial", "teatro-colon"
]);
export const VALID_ROLES = new Set(["building", "context"]);
export const VALID_EVIDENCE = new Set(["documented", "inferred", "evocative"]);
export const VALID_SHAPES = new Set([
  "box", "gable", "cyl", "dome", "colonnade", "hipRoof", "arch",
  "arcade", "arcWall", "curvedSlab", "windowGrid", "reliefGrid",
  "lattice", "classicalColumn", "bleacher", "curvedRoof", "wedge"
]);
export const FRONT_AXIS = "+z";

export function validateScene(scene, expectedSlug) {
  if (!scene || typeof scene !== "object") throw new Error("scene must be an object");
  if (!EXPECTED_SLUGS.includes(scene.slug)) throw new Error(`unknown slug: ${scene.slug}`);
  if (expectedSlug && scene.slug !== expectedSlug) throw new Error(`slug mismatch: ${scene.slug}`);
  if (typeof scene.name !== "string" || !scene.name.trim()) throw new Error("scene name must be a non-blank string");
  if (scene.frontAxis !== FRONT_AXIS) throw new Error("frontAxis must be +z");
  if (!Array.isArray(scene.parts) || scene.parts.length === 0) throw new Error("parts must be non-empty");
  for (const [index, part] of scene.parts.entries()) {
    if (!part.name?.trim()) throw new Error(`part ${index} requires name`);
    if (!VALID_SHAPES.has(part.type)) throw new Error(`part ${index} has invalid type`);
    if (!VALID_ROLES.has(part.role)) throw new Error(`part ${index} has invalid role`);
    if (!VALID_EVIDENCE.has(part.evidence)) throw new Error(`part ${index} has invalid evidence`);
    if (typeof part.material !== "string" || !part.material.trim()) throw new Error(`part ${index} requires material`);
    for (const field of ["p", "s", "r"]) {
      if (part[field] !== undefined &&
          (!Array.isArray(part[field]) || part[field].length !== 3 ||
           part[field].some((value) => !Number.isFinite(value)))) {
        throw new Error(`part ${index} ${field} must be a finite vec3`);
      }
    }
  }
  return scene;
}
