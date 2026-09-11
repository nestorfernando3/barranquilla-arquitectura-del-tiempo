import modelDataUris from "virtual:model-data-uris";

/**
 * Resuelve la URL de un modelo patrimonial. En el build autocontenida
 * (`npm run build:single`) los GLB viven embebidos como data URIs; en el resto de
 * builds se sirven desde /models/.
 */
export function resolveModelUrl(url: string): string {
  return modelDataUris[url] ?? url;
}
