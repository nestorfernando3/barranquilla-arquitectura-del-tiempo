/// <reference types="vite/client" />

declare module "virtual:model-data-uris" {
  /** Mapa de URL original ("/models/<slug>.glb") → data URI. Vacío fuera del build single-file. */
  const modelDataUris: Record<string, string>;
  export default modelDataUris;
}

/** true en la entrega autocontenida (`npm run build:single`); lo define vite.config.ts. */
declare const __SINGLE_FILE__: boolean;
