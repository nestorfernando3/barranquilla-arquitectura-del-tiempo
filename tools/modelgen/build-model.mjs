#!/usr/bin/env node
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeModel } from "./build-lib.mjs";

export async function main(args = process.argv.slice(2)) {
  const [scenePath, outPath, ...extra] = args;
  if (!scenePath || !outPath || extra.length > 0) {
    console.error("Uso: node build-model.mjs scenes/<slug>.json <salida.glb>");
    return 2;
  }

  try {
    const summary = await writeModel(scenePath, outPath);
    console.log(
      `OK ${summary.outputPath} — ${summary.parts} partes, ${summary.triangles} triángulos, ${(summary.bytes / 1024).toFixed(1)} KB`,
    );
    return 0;
  } catch (error) {
    console.error(`FALLO: ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
