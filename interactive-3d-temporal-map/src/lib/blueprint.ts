import * as THREE from "three";
import { ERAS, type Building } from "../data/buildings";

/**
 * Plano interpretativo generado en canvas.
 * NO es un documento histórico: es un prototipo visual coherente
 * con la volumetría de datos del edificio.
 */
export function makeBlueprintCanvas(b: Building, w = 680, h = 860): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  if (!ctx) return c;

  const era = ERAS[b.era];
  // fondo papel de plano
  ctx.fillStyle = "#0d1a1f";
  ctx.fillRect(0, 0, w, h);

  // retícula
  ctx.strokeStyle = "rgba(79,163,168,0.14)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= w; x += 34) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y <= h; y += 34) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  // marco
  ctx.strokeStyle = "rgba(233,226,208,0.75)";
  ctx.lineWidth = 2;
  ctx.strokeRect(16, 16, w - 32, h - 32);
  ctx.strokeStyle = "rgba(233,226,208,0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(24, 24, w - 48, h - 48);

  // encabezado
  ctx.fillStyle = "#e9e2d0";
  ctx.font = "500 15px 'IBM Plex Mono', monospace";
  ctx.fillText("PLANO INTERPRETATIVO · PROTOTIPO", 40, 56);
  ctx.font = "400 11px 'IBM Plex Mono', monospace";
  ctx.fillStyle = "rgba(233,226,208,0.6)";
  ctx.fillText(`${b.lat.toFixed(4)} N · ${Math.abs(b.lon).toFixed(4)} W (aprox.)`, 40, 76);

  ctx.fillStyle = era.color;
  ctx.font = "italic 600 30px Georgia, serif";
  ctx.fillText(b.name, 40, 122);
  ctx.fillStyle = "rgba(233,226,208,0.55)";
  ctx.font = "400 11px 'IBM Plex Mono', monospace";
  ctx.fillText(`${era.label.toUpperCase()} · ${b.year ?? "fecha por verificar"}`, 40, 146);

  // ---- alzado frontal (x, y) ----
  const boxes = b.massing.boxes;
  const drawProjection = (
    ox: number, oy: number, pw: number, ph: number,
    title: string,
    project: (p: [number, number, number], s: [number, number, number]) => { x: number; y: number; w: number; h: number }
  ) => {
    ctx.strokeStyle = "rgba(233,226,208,0.4)";
    ctx.strokeRect(ox, oy, pw, ph);
    ctx.fillStyle = "rgba(233,226,208,0.55)";
    ctx.font = "400 10px 'IBM Plex Mono', monospace";
    ctx.fillText(title, ox + 10, oy + 18);

    const scale = Math.min(pw / 11, ph / 9);
    const cx = ox + pw / 2;
    const baseY = oy + ph - 36;
    for (const box of boxes) {
      const pr = project(box.p, box.s);
      const x = cx + (pr.x - pr.w / 2) * scale;
      const y = baseY - (pr.y + pr.h) * scale;
      ctx.strokeStyle = "rgba(79,163,168,0.85)";
      ctx.lineWidth = 1.4;
      ctx.strokeRect(x, y, pr.w * scale, pr.h * scale);
      // diagonales de volumen
      ctx.strokeStyle = "rgba(79,163,168,0.22)";
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.lineTo(x + pr.w * scale, y + pr.h * scale);
      ctx.moveTo(x + pr.w * scale, y); ctx.lineTo(x, y + pr.h * scale);
      ctx.stroke();
    }
    // línea de tierra
    ctx.strokeStyle = "rgba(233,226,208,0.6)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox + 14, baseY);
    ctx.lineTo(ox + pw - 14, baseY);
    ctx.stroke();
  };

  drawProjection(40, 175, w - 80, 330, "ALZADO PRINCIPAL — x / y", (p, s) => ({
    x: p[0], y: p[1] - s[1] / 2, w: s[0], h: s[1],
  }));
  drawProjection(40, 525, w - 80, 210, "PLANTA — x / z", (p, s) => ({
    x: p[0], y: p[2] + 4 - s[2] / 2, w: s[0], h: s[2],
  }));

  // sello
  ctx.save();
  ctx.translate(w - 150, h - 120);
  ctx.rotate(-0.12);
  ctx.strokeStyle = "rgba(193,87,47,0.9)";
  ctx.lineWidth = 2;
  ctx.strokeRect(-70, -26, 140, 52);
  ctx.strokeRect(-64, -20, 128, 40);
  ctx.fillStyle = "rgba(193,87,47,0.95)";
  ctx.font = "500 12px 'IBM Plex Mono', monospace";
  ctx.textAlign = "center";
  ctx.fillText("NO ES DOCUMENTO", 0, -3);
  ctx.fillText("HISTÓRICO", 0, 14);
  ctx.restore();
  ctx.textAlign = "left";

  ctx.fillStyle = "rgba(233,226,208,0.5)";
  ctx.font = "400 10px 'IBM Plex Mono', monospace";
  ctx.fillText("Volumetría aproximada generada a partir de datos del atlas — requiere levantamiento.", 40, h - 34);

  return c;
}

const textureCache = new Map<string, THREE.CanvasTexture>();

export function getBlueprintTexture(b: Building): THREE.CanvasTexture {
  const cached = textureCache.get(b.slug);
  if (cached) return cached;
  const tex = new THREE.CanvasTexture(makeBlueprintCanvas(b));
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  textureCache.set(b.slug, tex);
  return tex;
}
