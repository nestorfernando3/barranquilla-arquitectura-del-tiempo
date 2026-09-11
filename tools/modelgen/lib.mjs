/**
 * lib.mjs — Geometría compartida del generador de modelos.
 *
 * Unidades: metros. Eje Y arriba. Origen: centro del lote, a nivel de suelo.
 * Todas las formas producen un "triangle soup" con normales planas por cara.
 *
 * Paleta de materiales = MATERIAL_COLORS en src/data/buildings.ts,
 * para que el GLB converse con la volumetría procedural de la app.
 */

export const MATERIAL_COLORS = {
  piedra: "#cfc6b2",
  ladrillo: "#b3653f",
  stucco: "#d9cfae",
  concreto: "#9aa0a6",
  metal: "#667584",
  madera: "#8a6844",
  vidrio: "#3f7f86",
  teja: "#4a5560",
  pasto: "#5f7350",
};

export function resolveColor(material) {
  if (typeof material !== "string") return "#cccccc";
  if (material.startsWith("#")) return material;
  return MATERIAL_COLORS[material] ?? "#cccccc";
}

/* ---------- utilidades ---------- */

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
}

function rotMat(r) {
  // Convención three.js Euler 'XYZ': M = Rx * Ry * Rz aplicada como M·v
  if (!r || (r[0] === 0 && r[1] === 0 && r[2] === 0)) return null;
  const [ax, ay, az] = r;
  const cx = Math.cos(ax), sx = Math.sin(ax);
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const cz = Math.cos(az), sz = Math.sin(az);
  // Ry*Rx*Rz simplificado no; usar composición explícita Rx luego Ry luego Rz (intrínseco)
  const m00 = cy * cz + sx * sy * sz;
  const m01 = -cy * sz + sx * sy * cz;
  const m02 = cx * sy;
  const m10 = cx * sz;
  const m11 = cx * cz;
  const m12 = -sx;
  const m20 = -sy * cz + sx * cy * sz;
  const m21 = sy * sz + sx * cy * cz;
  const m22 = cx * cy;
  return [m00, m01, m02, m10, m11, m12, m20, m21, m22];
}

function apply(m, x, y, z) {
  return [m[0] * x + m[1] * y + m[2] * z, m[3] * x + m[4] * y + m[5] * z, m[6] * x + m[7] * y + m[8] * z];
}

function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
function cross(a, b) {
  return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
function norm(a) {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
}

/** Acumulador de triángulos con color por vértice. */
export class MeshSoup {
  constructor() {
    this.positions = []; // float triples
    this.normals = [];
    this.colors = [];
  }
  /** Triángulo con normal calculada. */
  tri(a, b, c) {
    const raw = cross(sub(b, a), sub(c, a));
    const length = Math.hypot(...raw);
    if (length <= 1e-10) return;
    const n = raw.map((value) => value / length);
    for (const v of [a, b, c]) {
      this.positions.push(v[0], v[1], v[2]);
      this.normals.push(n[0], n[1], n[2]);
      this.colors.push(...this._color);
    }
  }
  /** Quad (v0,v1,v2,v3) → dos triángulos. */
  quad(a, b, c, d) {
    this.tri(a, b, c);
    this.tri(a, c, d);
  }
  setColor(rgb) { this._color = rgb; }
}

function place(soup, part, fn) {
  const m = rotMat(part.r);
  const p = part.p ?? [0, 0, 0];
  const s = part.s ?? [1, 1, 1];
  soup.setColor(hexToRgb(resolveColor(part.material)));
  // fn recibe offsets locales escalados y devuelve vértices locales
  const T = (x, y, z) => {
    let v = [x * s[0], y * s[1], z * s[2]];
    if (m) v = apply(m, v[0], v[1], v[2]);
    return [v[0] + p[0], v[1] + p[1], v[2] + p[2]];
  };
  fn(T);
}

/* ---------- formas ---------- */

/**
 * box — prisma rectangular. s=[sx,sy,sz]; taper opcional escala el borde superior
 * (útil para retrocesos déco y remates piramidales).
 */
function emitBox(soup, part) {
  place(soup, part, (T) => {
    const t = part.taper ?? 1;
    const hy = 0.5;
    const hx = 0.5, hz = 0.5;
    const b0 = T(-hx, -hy, -hz), b1 = T(hx, -hy, -hz), b2 = T(hx, -hy, hz), b3 = T(-hx, -hy, hz);
    const c0 = T(-hx * t, hy, -hz * t), c1 = T(hx * t, hy, -hz * t), c2 = T(hx * t, hy, hz * t), c3 = T(-hx * t, hy, hz * t);
    soup.quad(b3, b2, c2, c3); // frente +z
    soup.quad(b1, b0, c0, c1); // atrás -z
    soup.quad(b0, b3, c3, c0); // izquierda -x
    soup.quad(b2, b1, c1, c2); // derecha +x
    soup.quad(c0, c1, c2, c3); // tapa
    soup.quad(b0, b1, b2, b3); // base
  });
}

/**
 * gable — tejido a dos aguas. La cumbrera corre según axis: "x" (por defecto) o "z".
 * s=[largo, altoTotal, profundidad].
 */
function emitGable(soup, part) {
  place(soup, part, (T) => {
    const alongZ = part.axis === "z";
    const P = (u, v, w) => (alongZ ? T(w, v, u) : T(u, v, w));
    const L = 0.5, H = 1.0, D = 0.5;
    const a0 = P(-L, 0, -D), a1 = P(L, 0, -D);
    const b0 = P(-L, 0, D), b1 = P(L, 0, D);
    const r0 = P(-L, H, 0), r1 = P(L, H, 0);
    // aguas del techo
    soup.quad(a0, a1, r1, r0); // cara -w
    soup.quad(b1, b0, r0, r1); // cara +w
    // hastiales
    soup.tri(a0, r0, b0);
    soup.tri(a1, b1, r1);
    // base
    soup.quad(a0, b0, b1, a1);
  });
}

/**
 * cyl — cilindro/cono en Y. r=[radioSuperior, radioInferior], s.y = altura,
 * seg segmentos (def 14).
 */
function emitCyl(soup, part) {
  place(soup, part, (T) => {
    const seg = part.seg ?? 14;
    const [rt, rb] = part.rad ?? [part.radius ?? 0.5, part.radius ?? 0.5];
    const hy = 0.5;
    const ring = (rad, y) => {
      const pts = [];
      for (let i = 0; i < seg; i++) {
        const th = (i / seg) * Math.PI * 2;
        pts.push(T(rad * Math.cos(th), y, rad * Math.sin(th)));
      }
      return pts;
    };
    const bot = ring(rb, -hy), top = ring(rt, hy);
    for (let i = 0; i < seg; i++) {
      const j = (i + 1) % seg;
      soup.quad(bot[i], bot[j], top[j], top[i]);
    }
    if (rt > 1e-4) {
      const c = T(0, hy, 0);
      for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; soup.tri(c, top[i], top[j]); }
    }
    const cb = T(0, -hy, 0);
    for (let i = 0; i < seg; i++) { const j = (i + 1) % seg; soup.tri(cb, bot[j], bot[i]); }
  });
}

/** dome — media esfera apoyada en su base. s.x/z = diámetro, s.y = altura. */
function emitDome(soup, part) {
  place(soup, part, (T) => {
    const seg = part.seg ?? 16, rings = part.rings ?? 5;
    const pt = (i, j) => {
      const th = (i / seg) * Math.PI * 2;
      const ph = (j / rings) * (Math.PI / 2);
      return T(0.5 * Math.sin(ph) * Math.cos(th), Math.cos(ph), 0.5 * Math.sin(ph) * Math.sin(th));
    };
    for (let j = 0; j < rings; j++) {
      for (let i = 0; i < seg; i++) {
        const i2 = (i + 1) % seg;
        soup.quad(pt(i, j), pt(i2, j), pt(i2, j + 1), pt(i, j + 1));
      }
    }
  });
}

/**
 * colonnade — galería de pilares con arquitrabe. Corre sobre el eje local x
 * (usa axis:"z" para invertirlo). Params: len, h, dep, n, pw (ancho pilar),
 * archH (altura arquitrabe).
 */
function emitColonnade(soup, part) {
  const n = Math.max(2, part.n ?? 6);
  const len = part.len ?? 4, h = part.h ?? 1, dep = part.dep ?? 0.35;
  const pw = Math.min(part.pw ?? len / n * 0.38, len / n * 0.6);
  const archH = part.archH ?? Math.min(0.22 * h, 0.35);
  const alongZ = part.axis === "z";
  const cx = part.p?.[0] ?? 0, cy = part.p?.[1] ?? 0, cz = part.p?.[2] ?? 0;
  for (let i = 0; i < n; i++) {
    const off = -len / 2 + (len / n) * (i + 0.5);
    const box = {
      material: part.material,
      p: alongZ ? [cx, cy + h / 2, cz + off] : [cx + off, cy + h / 2, cz],
      s: alongZ ? [dep, h, pw] : [pw, h, dep],
    };
    emitBox(soup, box);
  }
  const beam = {
    material: part.material,
    p: alongZ ? [cx, cy + h + archH / 2, cz] : [cx, cy + h + archH / 2, cz],
    s: alongZ ? [dep * 1.08, archH, len + pw * 0.4] : [len + pw * 0.4, archH, dep * 1.08],
  };
  emitBox(soup, beam);
}

/** hipRoof — cubierta a cuatro aguas cerrada, con cumbrera sobre x o z. */
function emitHipRoof(soup, part) {
  place(soup, part, (T) => {
    const alongZ = part.axis === "z";
    const ridge = Math.max(0, Math.min(1, part.ridge ?? 0));
    const P = (u, v, w) => (alongZ ? T(w, v, u) : T(u, v, w));
    const tri = (a, b, c) => {
      if (alongZ) soup.tri(P(...a), P(...c), P(...b));
      else soup.tri(P(...a), P(...b), P(...c));
    };
    const quad = (a, b, c, d) => {
      tri(a, b, c);
      tri(a, c, d);
    };
    const b0 = [-0.5, -0.5, -0.5], b1 = [0.5, -0.5, -0.5];
    const b2 = [0.5, -0.5, 0.5], b3 = [-0.5, -0.5, 0.5];
    const r0 = [-ridge / 2, 0.5, 0], r1 = [ridge / 2, 0.5, 0];
    quad(b1, b0, r0, r1);
    quad(b3, b2, r1, r0);
    tri(b1, r1, b2);
    tri(b0, b3, r0);
    quad(b0, b1, b2, b3);
  });
}

function archOutline(kind, seg) {
  const outline = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0]];
  if (kind === "pointed") {
    const half = Math.max(3, Math.ceil(seg / 2));
    for (let i = 1; i <= half; i++) {
      const t = i / half, u = 1 - t;
      outline.push([u * u * 0.5 + 2 * u * t * 0.5, 2 * u * t * 0.36 + t * t * 0.5]);
    }
    for (let i = 1; i <= half; i++) {
      const t = i / half, u = 1 - t;
      outline.push([-2 * u * t * 0.5 - t * t * 0.5, u * u * 0.5 + 2 * u * t * 0.36]);
    }
  } else {
    for (let i = 1; i <= seg; i++) {
      const theta = (i / seg) * Math.PI;
      outline.push([0.5 * Math.cos(theta), 0.5 * Math.sin(theta)]);
    }
  }
  return outline.reverse();
}

/** arch — panel arqueado convexo, cerrado y extruido sobre z. */
function emitArch(soup, part) {
  const seg = Math.max(6, Math.floor(part.seg ?? 12));
  const outline = archOutline(part.arch, seg);
  place(soup, part, (T) => {
    const front = outline.map(([x, y]) => T(x, y, 0.5));
    const back = outline.map(([x, y]) => T(x, y, -0.5));
    const center = outline.reduce((sum, [x, y]) => [sum[0] + x, sum[1] + y], [0, 0]);
    const frontCenter = T(center[0] / outline.length, center[1] / outline.length, 0.5);
    const backCenter = T(center[0] / outline.length, center[1] / outline.length, -0.5);
    for (let i = 0; i < outline.length; i++) {
      const j = (i + 1) % outline.length;
      soup.tri(frontCenter, front[j], front[i]);
      soup.tri(backCenter, back[i], back[j]);
      soup.quad(front[i], front[j], back[j], back[i]);
    }
  });
}

function archCurve(kind, radius, springY, seg) {
  if (kind !== "pointed") {
    return Array.from({ length: seg + 1 }, (_, i) => {
      const theta = (i / seg) * Math.PI;
      return [radius * Math.cos(theta), springY + radius * Math.sin(theta)];
    });
  }
  const half = Math.max(3, Math.ceil(seg / 2));
  const curve = [];
  for (let i = 0; i <= half; i++) {
    const t = i / half, u = 1 - t;
    curve.push([radius * (u * u + 2 * u * t), springY + radius * (2 * u * t * 0.72 + t * t)]);
  }
  for (let i = 1; i <= half; i++) {
    const t = i / half, u = 1 - t;
    curve.push([-radius * (2 * u * t + t * t), springY + radius * (u * u + 2 * u * t * 0.72)]);
  }
  return curve;
}

function emitArchBand(soup, { center, outerRadius, innerRadius, springY, dep, arch, seg, material }) {
  const outer = archCurve(arch, outerRadius, springY, seg);
  const inner = archCurve(arch, innerRadius, springY, seg);
  const front = (point) => [center[0] + point[0], center[1] + point[1], center[2] + dep / 2];
  const back = (point) => [center[0] + point[0], center[1] + point[1], center[2] - dep / 2];
  soup.setColor(hexToRgb(resolveColor(material)));
  for (let i = 0; i < outer.length - 1; i++) {
    const j = i + 1;
    soup.quad(front(outer[i]), front(outer[j]), front(inner[j]), front(inner[i]));
    soup.quad(back(outer[i]), back(inner[i]), back(inner[j]), back(outer[j]));
    soup.quad(front(outer[i]), back(outer[i]), back(outer[j]), front(outer[j]));
    soup.quad(front(inner[i]), front(inner[j]), back(inner[j]), back(inner[i]));
  }
  const last = outer.length - 1;
  soup.quad(front(outer[0]), front(inner[0]), back(inner[0]), back(outer[0]));
  soup.quad(front(outer[last]), back(outer[last]), back(inner[last]), front(inner[last]));
}

/** arcade — vanos abiertos: pilares y bandas curvas, sin rellenar las luces. */
function emitArcade(soup, part) {
  const n = Math.max(1, Math.floor(part.n ?? 4));
  const len = part.len ?? 4, h = part.h ?? 1, dep = part.dep ?? 0.35;
  const bay = len / n;
  const pw = Math.min(Math.max(part.pw ?? bay * 0.22, 1e-6), bay * 0.8);
  const outerRadius = Math.min(bay / 2, Math.max(h * 0.8, 1e-6));
  const innerRadius = Math.max(outerRadius - pw, outerRadius * 0.2);
  const springY = Math.max(h - outerRadius, 1e-6);
  const alongZ = part.axis === "z";
  const p = part.p ?? [0, 0, 0];
  for (let i = 0; i <= n; i++) {
    const offset = -len / 2 + i * bay;
    emitBox(soup, {
      material: part.material,
      p: alongZ ? [p[0], p[1] + springY / 2, p[2] + offset] : [p[0] + offset, p[1] + springY / 2, p[2]],
      s: alongZ ? [dep, springY, pw] : [pw, springY, dep],
    });
  }
  for (let i = 0; i < n; i++) {
    const offset = -len / 2 + (i + 0.5) * bay;
    if (alongZ) {
      const rotated = new MeshSoup();
      emitArchBand(rotated, {
        center: [p[2] + offset, p[1], p[0]], outerRadius, innerRadius, springY, dep,
        arch: part.arch, seg: Math.max(6, Math.floor(part.seg ?? 12)), material: part.material,
      });
      soup.setColor(hexToRgb(resolveColor(part.material)));
      for (let j = 0; j < rotated.positions.length; j += 9) {
        const point = (index) => [
          rotated.positions[j + index + 2], rotated.positions[j + index + 1], rotated.positions[j + index],
        ];
        soup.tri(point(0), point(6), point(3));
      }
    } else {
      emitArchBand(soup, {
        center: [p[0] + offset, p[1], p[2]], outerRadius, innerRadius, springY, dep,
        arch: part.arch, seg: Math.max(6, Math.floor(part.seg ?? 12)), material: part.material,
      });
    }
  }
}

/** windowGrid — retícula de cajas repetida dentro de una sola parte. */
function emitWindowGrid(soup, part) {
  const [width, height, depth] = part.cell ?? [1, 1, 0.1];
  const [colsRaw, rowsRaw] = part.count ?? [1, 1];
  const cols = Math.max(1, Math.floor(colsRaw)), rows = Math.max(1, Math.floor(rowsRaw));
  const [gapX, gapY] = part.gap ?? [0, 0];
  const alongZ = part.axis === "z";
  const p = part.p ?? [0, 0, 0];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const horizontal = (col - (cols - 1) / 2) * (width + gapX);
      const vertical = (row - (rows - 1) / 2) * (height + gapY);
      emitBox(soup, {
        material: part.material,
        p: alongZ ? [p[0], p[1] + vertical, p[2] + horizontal] : [p[0] + horizontal, p[1] + vertical, p[2]],
        s: alongZ ? [depth, height, width] : [width, height, depth],
      });
    }
  }
}

/** classicalColumn — basa, fuste y capitel cilíndricos, rematados por dos ábacos. */
function emitClassicalColumn(soup, part) {
  const [diameter = 1, height = 1] = part.s ?? [1, 1, 1];
  const baseRatio = part.baseRatio ?? 1.2, capRatio = part.capRatio ?? 1.3;
  const abacusHeight = height * 0.04;
  const baseHeight = height * 0.12, capHeight = height * 0.12;
  const shaftHeight = height - baseHeight - capHeight - abacusHeight * 2;
  const p = part.p ?? [0, 0, 0];
  const bottom = p[1] - height / 2;
  const child = (centerY, componentHeight, ratio) => emitCyl(soup, {
    material: part.material, p: [p[0], centerY, p[2]], s: [diameter, componentHeight, diameter],
    rad: [ratio / 2, ratio / 2], seg: Math.max(6, Math.floor(part.seg ?? 14)),
  });
  child(bottom + baseHeight / 2, baseHeight, baseRatio);
  emitBox(soup, { material: part.material, p: [p[0], bottom + baseHeight + abacusHeight / 2, p[2]], s: [diameter * baseRatio, abacusHeight, diameter * baseRatio] });
  child(bottom + baseHeight + abacusHeight + shaftHeight / 2, shaftHeight, 0.78);
  child(bottom + baseHeight + abacusHeight + shaftHeight + capHeight / 2, capHeight, capRatio);
  emitBox(soup, { material: part.material, p: [p[0], bottom + height - abacusHeight / 2, p[2]], s: [diameter * capRatio, abacusHeight, diameter * capRatio] });
}

function finiteOr(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function positive(value, fallback, minimum = 1e-4) {
  return Math.max(minimum, finiteOr(value, fallback));
}

function integerAtLeast(value, fallback, minimum) {
  return Math.max(minimum, Math.floor(finiteOr(value, fallback)));
}

/** Caja local, transformada por el colocador de la parte que la contiene. */
function emitLocalBox(soup, T, center, dimensions) {
  const [cx, cy, cz] = center;
  const [sx, sy, sz] = dimensions;
  const hx = sx / 2, hy = sy / 2, hz = sz / 2;
  const b0 = T(cx - hx, cy - hy, cz - hz), b1 = T(cx + hx, cy - hy, cz - hz);
  const b2 = T(cx + hx, cy - hy, cz + hz), b3 = T(cx - hx, cy - hy, cz + hz);
  const t0 = T(cx - hx, cy + hy, cz - hz), t1 = T(cx + hx, cy + hy, cz - hz);
  const t2 = T(cx + hx, cy + hy, cz + hz), t3 = T(cx - hx, cy + hy, cz + hz);
  soup.quad(b3, b2, t2, t3);
  soup.quad(b1, b0, t0, t1);
  soup.quad(b0, b3, t3, t0);
  soup.quad(b2, b1, t1, t2);
  soup.quad(t0, t1, t2, t3);
  soup.quad(b0, b1, b2, b3);
}

/** Sector anular cerrado. thicknessMode solo define el espesor por defecto. */
function emitSector(soup, part, thicknessMode) {
  const seg = integerAtLeast(part.seg, 14, 4);
  const start = finiteOr(part.start, 0);
  const requestedSweep = finiteOr(part.sweep, Math.PI / 2);
  const direction = requestedSweep < 0 ? -1 : 1;
  const sweep = direction * Math.min(Math.PI * 2, Math.max(1e-3, Math.abs(requestedSweep)));
  const defaultInner = thicknessMode === "slab" ? 0.6 : 0.76;
  const inner = Math.min(0.999, Math.max(1e-3, finiteOr(part.innerRadius, defaultInner)));
  const quad = direction > 0
    ? (a, b, c, d) => soup.quad(a, b, c, d)
    : (a, b, c, d) => soup.quad(a, d, c, b);

  place(soup, part, (T) => {
    const ring = (radius, y) => Array.from({ length: seg + 1 }, (_, i) => {
      const theta = start + (sweep * i) / seg;
      return T(radius * 0.5 * Math.cos(theta), y, radius * 0.5 * Math.sin(theta));
    });
    const outerBottom = ring(1, -0.5), outerTop = ring(1, 0.5);
    const innerBottom = ring(inner, -0.5), innerTop = ring(inner, 0.5);
    for (let i = 0; i < seg; i++) {
      const j = i + 1;
      quad(outerBottom[i], outerTop[i], outerTop[j], outerBottom[j]);
      quad(innerBottom[j], innerTop[j], innerTop[i], innerBottom[i]);
      quad(outerBottom[i], outerBottom[j], innerBottom[j], innerBottom[i]);
      quad(outerTop[i], innerTop[i], innerTop[j], outerTop[j]);
    }
    quad(outerBottom[0], innerBottom[0], innerTop[0], outerTop[0]);
    quad(outerBottom[seg], outerTop[seg], innerTop[seg], innerBottom[seg]);
  });
}

function emitArcWall(soup, part) {
  emitSector(soup, part, "wall");
}

function emitCurvedSlab(soup, part) {
  emitSector(soup, part, "slab");
}

/** reliefGrid — paneles someros con un desplazamiento determinista por celda. */
function emitReliefGrid(soup, part) {
  const [panelX, panelY, panelZ] = part.panel ?? [1, 1, 0.1];
  const [colsRaw, rowsRaw] = part.count ?? [1, 1];
  const cols = integerAtLeast(colsRaw, 1, 1), rows = integerAtLeast(rowsRaw, 1, 1);
  const [gapXRaw, gapYRaw] = part.gap ?? [0, 0];
  const gapX = finiteOr(gapXRaw, 0), gapY = finiteOr(gapYRaw, 0);
  const offsets = Array.isArray(part.offsets) && part.offsets.length ? part.offsets : [0];
  const panel = [positive(panelX, 1), positive(panelY, 1), positive(panelZ, 0.1)];
  place(soup, part, (T) => {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const offset = finiteOr(offsets[(col + row) % offsets.length], 0);
        const x = (col - (cols - 1) / 2) * (panel[0] + gapX);
        const y = (row - (rows - 1) / 2) * (panel[1] + gapY);
        emitLocalBox(soup, T, [x, y, offset], panel);
      }
    }
  });
}

/** lattice — barras verticales y horizontales, siempre contenidas por s. */
function emitLattice(soup, part) {
  const [colsRaw, rowsRaw] = part.count ?? [1, 1];
  const cols = integerAtLeast(colsRaw, 1, 1), rows = integerAtLeast(rowsRaw, 1, 1);
  const [sx, sy] = part.s ?? [1, 1, 1];
  const bar = positive(part.bar, 0.1);
  const barX = Math.min(1, bar / positive(Math.abs(sx), 1));
  const barY = Math.min(1, bar / positive(Math.abs(sy), 1));
  place(soup, part, (T) => {
    for (let col = 0; col < cols; col++) {
      const x = cols === 1 ? 0 : -0.5 + barX / 2 + (col * (1 - barX)) / (cols - 1);
      emitLocalBox(soup, T, [x, 0, 0], [barX, 1, 1]);
    }
    for (let row = 0; row < rows; row++) {
      const y = rows === 1 ? 0 : -0.5 + barY / 2 + (row * (1 - barY)) / (rows - 1);
      emitLocalBox(soup, T, [0, y, 0], [1, barY, 1]);
    }
  });
}

/** bleacher — cajas escalonadas cerradas, de menor fondo a mayor altura. */
function emitBleacher(soup, part) {
  const steps = integerAtLeast(part.steps, 6, 1);
  place(soup, part, (T) => {
    for (let i = 0; i < steps; i++) {
      const height = (i + 1) / steps;
      const depth = (steps - i) / steps;
      emitLocalBox(soup, T, [0, -0.5 + height / 2, -0.5 + depth / 2], [1, height, depth]);
    }
  });
}

/** curvedRoof — volumen cerrado de perfil parabólico extruido a lo largo de x. */
function emitCurvedRoof(soup, part) {
  const seg = integerAtLeast(part.seg, 14, 4);
  const rise = Math.min(1, Math.max(1e-3, finiteOr(part.rise, 0.25)));
  place(soup, part, (T) => {
    const top = Array.from({ length: seg + 1 }, (_, i) => {
      const z = -0.5 + i / seg;
      return -0.5 + rise * (1 - 4 * z * z);
    });
    const leftTop = top.map((y, i) => T(-0.5, y, -0.5 + i / seg));
    const rightTop = top.map((y, i) => T(0.5, y, -0.5 + i / seg));
    for (let i = 0; i < seg; i++) {
      const j = i + 1;
      soup.quad(leftTop[i], leftTop[j], rightTop[j], rightTop[i]);
    }
    const leftBack = T(-0.5, -0.5, -0.5), leftFront = T(-0.5, -0.5, 0.5);
    const rightBack = T(0.5, -0.5, -0.5), rightFront = T(0.5, -0.5, 0.5);
    soup.quad(leftBack, rightBack, rightFront, leftFront);
    for (let i = 0; i < seg; i++) {
      const j = i + 1;
      soup.tri(leftBack, leftTop[j], leftTop[i]);
      soup.tri(rightBack, rightTop[i], rightTop[j]);
    }
  });
}

/** wedge — prisma triangular cerrado; la pendiente puede avanzar por x o z. */
function emitWedge(soup, part) {
  const alongZ = part.slopeAxis === "z";
  place(soup, part, (T) => {
    const P = (x, y, z) => alongZ ? T(z, y, x) : T(x, y, z);
    const tri = alongZ
      ? (a, b, c) => soup.tri(a, c, b)
      : (a, b, c) => soup.tri(a, b, c);
    const quad = alongZ
      ? (a, b, c, d) => soup.quad(a, d, c, b)
      : (a, b, c, d) => soup.quad(a, b, c, d);
    const a = P(-0.5, -0.5, -0.5), b = P(0.5, -0.5, -0.5), c = P(0.5, 0.5, -0.5);
    const d = P(-0.5, -0.5, 0.5), e = P(0.5, -0.5, 0.5), f = P(0.5, 0.5, 0.5);
    tri(a, c, b);
    tri(d, e, f);
    quad(a, b, e, d);
    quad(b, c, f, e);
    quad(c, a, d, f);
  });
}

const EMITTERS = {
  box: emitBox, gable: emitGable, cyl: emitCyl, dome: emitDome, colonnade: emitColonnade,
  hipRoof: emitHipRoof, arch: emitArch, arcade: emitArcade, windowGrid: emitWindowGrid,
  classicalColumn: emitClassicalColumn,
  arcWall: emitArcWall, curvedSlab: emitCurvedSlab, reliefGrid: emitReliefGrid,
  lattice: emitLattice, bleacher: emitBleacher, curvedRoof: emitCurvedRoof,
  wedge: emitWedge,
};

export const SHAPE_TYPES = Object.keys(EMITTERS);

export function buildPart(part) {
  const emit = EMITTERS[part.type];
  if (!emit) throw new Error(`Tipo de forma desconocido: ${part.type} (parte "${part.name}")`);
  const soup = new MeshSoup();
  emit(soup, part);
  return {
    name: part.name ?? part.type,
    color: resolveColor(part.material),
    role: part.role,
    evidence: part.evidence,
    positions: soup.positions,
    normals: soup.normals,
    triangles: soup.positions.length / 9,
  };
}

/**
 * Convierte una escena declarativa en triangle soup por parte.
 * Devuelve [{ name, material:"#hex", positions:[...], normals:[...], triangles }]
 * — un registro por parte para conservar nombres semánticos de nodo;
 * los materiales del GLB se comparten después por color.
 */
export function buildScene(scene) {
  const out = [];
  for (const part of scene.parts ?? []) {
    const built = buildPart(part);
    if (!built.positions.length) continue;
    out.push(built);
  }
  return out;
}
