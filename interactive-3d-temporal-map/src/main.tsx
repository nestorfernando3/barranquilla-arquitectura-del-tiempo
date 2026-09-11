import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

declare const __SINGLE_FILE__: boolean;

// Service worker solo en despliegues multi-archivo; en la entrega autocontenida
// no existe /sw.js junto al HTML y el registro solo produciría un 404.
if ("serviceWorker" in navigator && !__SINGLE_FILE__) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

// three.js r183+ deprecates THREE.Clock, but @react-three/fiber still constructs
// one internally (checked in fiber 9.6.1–9.7.0 dist). Our own code never uses
// Clock directly. Filter only that exact deprecation message until fiber migrates
// to THREE.Timer; remove this block when it does.
const origWarn = console.warn.bind(console);
console.warn = (...args: unknown[]) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes("Clock: This module has been deprecated")
  ) {
    return;
  }
  origWarn(...args);
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
