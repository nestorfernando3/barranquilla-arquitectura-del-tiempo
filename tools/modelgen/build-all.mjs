#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import {
  copyFile,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rename,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeModel } from "./build-lib.mjs";
import { EXPECTED_SLUGS } from "./scene-schema.mjs";
import { assertModel, inspectModel } from "./validate-lib.mjs";

const TARGET_RELATIVE_PATHS = [
  "interactive-3d-temporal-map/public/models",
  "recorrido-narrativo/models",
];
const EXPECTED_FILES = EXPECTED_SLUGS.map((slug) => `${slug}.glb`).sort();
const EXPECTED_SCENE_FILES = EXPECTED_SLUGS.map((slug) => `${slug}.json`).sort();

export async function buildAll({ projectRoot, validateOnly = false, faultAfterTargetSwap } = {}) {
  if (!projectRoot) throw new Error("projectRoot is required");
  const targets = TARGET_RELATIVE_PATHS.map((relative) => join(projectRoot, relative));
  if (validateOnly) return validateCurrentTargets(targets);

  const scenesDirectory = join(projectRoot, "tools/modelgen/scenes");
  await assertExpectedSceneSet(scenesDirectory);
  const staging = await mkdtemp(join(tmpdir(), "bq-modelgen-all-"));
  const transactionId = randomUUID();
  const swaps = targets.map((target, index) => ({
    target,
    next: join(dirname(target), `.models-next-${transactionId}-${index + 1}`),
    backup: join(dirname(target), `.models-backup-${transactionId}-${index + 1}`),
    hadOriginal: false,
    rotated: false,
    promoted: false,
  }));
  let committed = false;

  try {
    const summaries = [];
    for (const slug of EXPECTED_SLUGS) {
      const scenePath = join(scenesDirectory, `${slug}.json`);
      const outputPath = join(staging, `${slug}.glb`);
      await writeModel(scenePath, outputPath);
      summaries.push(assertModel(await inspectModel(outputPath), slug));
    }

    for (const swap of swaps) {
      await mkdir(swap.next);
      for (const file of EXPECTED_FILES) {
        await copyFile(join(staging, file), join(swap.next, file));
      }
      await assertExpectedModelSet(swap.next);
      await assertMatchingHashes(staging, swap.next);
    }

    let completedSwaps = 0;
    try {
      for (const swap of swaps) {
        swap.hadOriginal = await pathExists(swap.target);
        if (swap.hadOriginal) {
          await rename(swap.target, swap.backup);
          swap.rotated = true;
        }
        await rename(swap.next, swap.target);
        swap.promoted = true;
        completedSwaps += 1;
        if (faultAfterTargetSwap === completedSwaps) {
          throw new Error("simulated target swap failure");
        }
      }

      await assertExpectedModelSet(targets[0]);
      await assertExpectedModelSet(targets[1]);
      await assertMatchingHashes(staging, targets[0]);
      await assertMatchingHashes(staging, targets[1]);
      await assertMatchingHashes(targets[0], targets[1]);
      committed = true;
    } catch (error) {
      const rollbackErrors = await rollbackSwaps(swaps);
      if (rollbackErrors.length > 0) {
        throw new AggregateError(
          [error, ...rollbackErrors],
          `${error.message}; rollback incomplete: ${rollbackErrors.map((item) => item.message).join("; ")}`,
        );
      }
      throw error;
    }

    for (const swap of swaps) await rm(swap.backup, { recursive: true, force: true });
    return summaries.map((summary) => ({
      ...summary,
      outputPath: join(targets[0], `${summary.slug}.glb`),
    }));
  } finally {
    await rm(staging, { recursive: true, force: true });
    for (const swap of swaps) {
      await rm(swap.next, { recursive: true, force: true });
      if (committed) await rm(swap.backup, { recursive: true, force: true });
    }
  }
}

async function validateCurrentTargets(targets) {
  for (const target of targets) await assertExpectedModelSet(target);
  await assertMatchingHashes(targets[0], targets[1]);

  const summaries = [];
  for (const slug of EXPECTED_SLUGS) {
    const first = assertModel(await inspectModel(join(targets[0], `${slug}.glb`)), slug);
    assertModel(await inspectModel(join(targets[1], `${slug}.glb`)), slug);
    summaries.push(first);
  }
  return summaries;
}

async function rollbackSwaps(swaps) {
  const errors = [];
  for (const swap of [...swaps].reverse()) {
    try {
      if (swap.promoted && await pathExists(swap.target)) {
        await rm(swap.target, { recursive: true });
      }
      if (swap.rotated && await pathExists(swap.backup)) {
        await rename(swap.backup, swap.target);
      }
    } catch (error) {
      errors.push(new Error(`failed to restore ${swap.target}: ${error.message}`, { cause: error }));
    }
  }
  return errors;
}

async function assertExpectedModelSet(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const actual = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".glb"))
    .map((entry) => entry.name)
    .sort();
  if (actual.length !== EXPECTED_FILES.length || actual.some((file, index) => file !== EXPECTED_FILES[index])) {
    throw new Error(
      `model set mismatch in ${directory}: expected ${EXPECTED_FILES.join(", ")}; found ${actual.join(", ")}`,
    );
  }
}

async function assertExpectedSceneSet(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const actual = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => entry.name)
    .sort();
  const expected = new Set(EXPECTED_SCENE_FILES);
  const found = new Set(actual);
  const missing = EXPECTED_SCENE_FILES.filter((file) => !found.has(file));
  const extra = actual.filter((file) => !expected.has(file));
  if (missing.length > 0 || extra.length > 0 || actual.length !== EXPECTED_SCENE_FILES.length) {
    throw new Error(
      `scene set mismatch in ${directory}: missing [${missing.join(", ")}]; extra [${extra.join(", ")}]`,
    );
  }
}

async function assertMatchingHashes(leftDirectory, rightDirectory) {
  for (const file of EXPECTED_FILES) {
    const [left, right] = await Promise.all([
      sha256(join(leftDirectory, file)),
      sha256(join(rightDirectory, file)),
    ]);
    if (left !== right) {
      throw new Error(`SHA-256 hash mismatch for ${file} between ${leftDirectory} and ${rightDirectory}`);
    }
  }
}

async function sha256(path) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function pathExists(path) {
  try {
    await lstat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}

export async function main(args = process.argv.slice(2)) {
  const validateOnly = args.length === 1 && args[0] === "--validate-only";
  if (args.length > 0 && !validateOnly) {
    console.error("Uso: node build-all.mjs [--validate-only]");
    return 2;
  }
  const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
  try {
    const summaries = await buildAll({ projectRoot, validateOnly });
    for (const summary of summaries) {
      console.log(`${summary.slug}: ${summary.triangles} triángulos, ${(summary.bytes / 1024).toFixed(1)} KB`);
    }
    console.log(validateOnly ? "VALIDACIÓN OK" : "BUILD OK");
    return 0;
  } catch (error) {
    console.error(`FALLO: ${error.message}`);
    return 1;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await main();
}
