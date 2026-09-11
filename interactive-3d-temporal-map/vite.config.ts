import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Emits a virtual module mapping each public model URL ("/models/<slug>.glb") to a
 * base64 data URI, so the single-file build stays self-contained (the app can be
 * opened as one .html with no server or sidecar assets). In normal builds it
 * exports an empty map and the runtime fetches the files from /models/.
 */
function modelDataUrisPlugin(enabled: boolean): Plugin {
  const virtualId = "\0virtual:model-data-uris";
  return {
    name: "model-data-uris",
    resolveId(id) {
      if (id === "virtual:model-data-uris") return virtualId;
    },
    load(id) {
      if (id !== virtualId) return null;
      if (!enabled) return "export default {};";
      const dir = path.resolve(__dirname, "public/models");
      const entries = fs
        .readdirSync(dir)
        .filter((f) => f.endsWith(".glb"))
        .map((f) => {
          const b64 = fs.readFileSync(path.join(dir, f)).toString("base64");
          return [`/models/${f}`, `data:model/gltf-binary;base64,${b64}`];
        });
      return `export default ${JSON.stringify(Object.fromEntries(entries))};`;
    },
  };
}

// https://vite.dev/config/
export default defineConfig(() => {
  const singleFile = process.env.SINGLE_FILE === "1";

  return {
    define: {
      __SINGLE_FILE__: JSON.stringify(singleFile),
    },
    plugins: [
      react(),
      tailwindcss(),
      modelDataUrisPlugin(singleFile),
      ...(singleFile ? [viteSingleFile()] : []),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
  };
});
