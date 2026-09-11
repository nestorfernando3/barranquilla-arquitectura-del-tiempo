import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const js = readFileSync(new URL("../main.js", import.meta.url), "utf8");
const css = readFileSync(new URL("../styles.css", import.meta.url), "utf8");

function functionSource(name, source = js) {
  const start = source.indexOf(`function ${name}(`);
  assert.notEqual(start, -1, `missing function ${name}`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    if (depth === 0) return source.slice(start, i + 1);
  }
  assert.fail(`unterminated function ${name}`);
}

function objectBodyAfter(marker, source) {
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `missing ${marker}`);
  const open = source.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === "{") depth++;
    if (source[i] === "}") depth--;
    if (depth === 0) return source.slice(open + 1, i);
  }
  assert.fail(`unterminated object after ${marker}`);
}

function assertDebugBoundIsSerialized(source, objectBody, field) {
  const explicitSerialization = new RegExp(
    `(?:^|,)\\s*${field}\\s*:\\s*serializeBounds\\(`
  ).test(objectBody);
  const serializedVariable = new RegExp(
    `const\\s+${field}\\s*=\\s*serializeBounds\\([^;]+\\);`
  ).test(source);
  const serializedShorthand = new RegExp(
    `(?:^|,)\\s*${field}\\s*,`
  ).test(objectBody) && serializedVariable;

  assert.ok(
    explicitSerialization || serializedShorthand,
    `${field} must be assigned from serializeBounds(...) inside the debug contract`
  );
}

test("mobile control owns its initial accessible state", () => {
  assert.match(
    html,
    /<button\b(?=[^>]*\bid="btn-mobile-mode")(?=[^>]*\baria-pressed="false")[^>]*>Ver modelo<\/button>/
  );
});

test("setMobileMode synchronizes mode, pressed state, and both labels", () => {
  const source = functionSource("setMobileMode");
  assert.match(
    source,
    /document\.body\.dataset\.mobileMode\s*=\s*modelMode\s*\?\s*"model"\s*:\s*"story";/
  );
  assert.match(
    source,
    /\$\("btn-mobile-mode"\)\.setAttribute\("aria-pressed",\s*String\(modelMode\)\);/
  );
  assert.match(
    source,
    /\$\("btn-mobile-mode"\)\.textContent\s*=\s*modelMode\s*\?\s*"Leer historia"\s*:\s*"Ver modelo";/
  );
});

test("mobile model mode leaves at least 55vh unobstructed", () => {
  const modelPanelRule = css.match(
    /body\[data-mobile-mode="model"\]\s+#panel\s*\{(?<declarations>[^}]*)\}/
  );
  assert.ok(modelPanelRule, "missing model-mode panel rule");
  const height = modelPanelRule.groups.declarations.match(
    /max-height:\s*calc\((?<occupied>\d+(?:\.\d+)?)vh\s*-\s*5\.6rem\)/
  );
  assert.ok(height, "model panel must reserve viewport space above the lower UI");
  assert.ok(100 - Number(height.groups.occupied) >= 55);

  assert.match(
    css,
    /body\[data-mobile-mode="model"\]\s+#panel \.body,\s*body\[data-mobile-mode="model"\]\s+#panel \.chips,\s*body\[data-mobile-mode="model"\]\s+#panel \.hint\s*\{\s*display:\s*none;/
  );
});

test("loader element owns polite live-status semantics", () => {
  assert.match(
    html,
    /<span\b(?=[^>]*\bid="loader")(?=[^>]*\brole="status")(?=[^>]*\baria-live="polite")[^>]*>Cargando modelo…<\/span>/
  );
});

test("model failure exposes the exact available narrative state", () => {
  const source = functionSource("showModel");
  assert.match(
    source,
    /catch \(err\)\s*\{[\s\S]*loaderChip\.textContent\s*=\s*"Modelo no disponible";[\s\S]*loaderChip\.hidden\s*=\s*false;[\s\S]*return;/
  );
});

test("intro gates and restores the lower interface", () => {
  assert.match(
    js,
    /const ui\s*=\s*\$\("ui"\);[\s\S]*?ui\.inert\s*=\s*true;\s*\$\("btn-start"\)\.focus\(\);/
  );
  assert.match(
    js,
    /\$\("btn-start"\)\.addEventListener\("click",\s*\(\)\s*=>\s*\{\s*intro\.classList\.add\("gone"\);\s*ui\.inert\s*=\s*false;\s*go\(0\);\s*\}\);/
  );
});

test("legacy recorrido route opens the narrative experience", () => {
  assert.match(
    js,
    /const legacyRoute\s*=\s*location\.hash\s*===\s*"#\/recorrido";/
  );
  assert.match(
    js,
    /if \(legacyRoute \|\| startIndex > 0\)[\s\S]*go\(legacyRoute \? 0 : startIndex\);/
  );
});

test("debug hook serializes stable building and full bounds", () => {
  const source = functionSource("showModel");
  const debugBody = objectBodyAfter("window.__recorridoDebug", source);
  assert.match(
    source,
    /const serializeBounds\s*=\s*\(box\)\s*=>\s*\(\{\s*min:\s*box\.min\.toArray\(\)\.map\([\s\S]*?\),\s*max:\s*box\.max\.toArray\(\)\.map\([\s\S]*?\),\s*\}\);/
  );
  assert.match(
    debugBody,
    /^\s*slug,\s*meshes,\s*(?:buildingBounds(?:\s*:\s*[^,]+)?),\s*(?:fullBounds(?:\s*:\s*[^,]+)?),\s*mobileMode:[\s\S]*?opacity:[\s\S]*?camDist:/
  );
  assertDebugBoundIsSerialized(source, debugBody, "buildingBounds");
  assertDebugBoundIsSerialized(source, debugBody, "fullBounds");
});

test("resetView flushes OrbitControls before restoring deterministic behavior", () => {
  const source = functionSource("resetView");
  const disableAuto = source.indexOf("controls.autoRotate = false;");
  const disableDamping = source.indexOf("controls.enableDamping = false;");
  const firstUpdate = source.indexOf("controls.update();");
  const vector = source.indexOf("new THREE.Vector3(5.4, 3.4, 7)");
  const target = source.indexOf("controls.target.set(0, camGoal.targetY, 0);");
  const cameraPose = source.indexOf("camera.position.copy(controls.target).add(offset);");
  const secondUpdate = source.indexOf("controls.update();", firstUpdate + 1);
  const restoreDamping = source.indexOf("controls.enableDamping = !REDUCED;");
  const restoreAuto = source.indexOf("controls.autoRotate = !REDUCED;");

  assert.match(source, /clearTimeout\(resumeTimer\);/);
  assert.match(
    source,
    /new THREE\.Vector3\(5\.4, 3\.4, 7\)\s*\.normalize\(\)\s*\.multiplyScalar\(camGoal\.dist\)/
  );
  assert.ok(disableAuto >= 0 && disableDamping >= 0);
  assert.ok(disableAuto < firstUpdate && disableDamping < firstUpdate);
  assert.ok(firstUpdate < vector && vector < target && target < cameraPose);
  assert.ok(cameraPose < secondUpdate);
  assert.ok(secondUpdate < restoreDamping && secondUpdate < restoreAuto);
  assert.equal(source.indexOf("controls.update();", secondUpdate + 1), -1);
});
