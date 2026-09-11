#!/usr/bin/env node
import { basename, extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { assertModel, inspectModel } from "./validate-lib.mjs";

export async function main(args = process.argv.slice(2)) {
  const [path, ...extra] = args;
  if (!path || extra.length > 0) {
    console.error("Uso: node validate.mjs <archivo.glb>");
    return 2;
  }

  try {
    const summary = await inspectModel(path);
    const expectedSlug = basename(path, extname(path));
    assertModel(summary, expectedSlug);
    console.log(`archivo        : ${(summary.bytes / 1024).toFixed(1)} KB`);
    console.log(`triángulos     : ${summary.triangles}`);
    console.log(`bbox (m, XYZ)  : ${summary.bounds.join(" × ")}`);
    console.log(`materiales     : ${summary.materials}`);
    console.log(`nodos          : ${summary.meshNodes}`);
    console.log("\nVALIDACIÓN OK");
    return 0;
  } catch (error) {
    console.error(`FALLO: ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
