import fs from "node:fs";
import path from "node:path";

const SRC_DIR = "translations";
const OUT_DIR = "public";
const LANGS = ["en", "et"];

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function cleanOutput() {
  LANGS.forEach((lng) => {
    const outLngDir = path.join(OUT_DIR, lng);
    if (fs.existsSync(outLngDir)) {
      fs.rmSync(outLngDir, { recursive: true, force: true });
    }
  });
}

function listNamespaces(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
}

function listJsonFiles(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith(".json"))
    .map((e) => path.join(dir, e.name));
}

cleanOutput();

const namespaces = listNamespaces(SRC_DIR);
if (namespaces.length === 0) {
  throw new Error(`No namespace folders found under: ${SRC_DIR}`);
}

namespaces.forEach((ns) => {
  const nsDir = path.join(SRC_DIR, ns);
  const files = listJsonFiles(nsDir);

  if (files.length === 0) {
    console.warn(`⚠️ No JSON files in namespace folder: ${nsDir}`);
    return;
  }

  // Merge all files in this namespace into one multilingual object:
  // { key: {en:..., et:...}, ... }
  const merged = Object.assign({}, ...files.map(readJson));

  LANGS.forEach((lng) => {
    const flat = {};
    Object.entries(merged).forEach(([key, value]) => {
      const strippedKey = key.startsWith(`${ns}.`)
        ? key.slice(ns.length + 1)
        : key;
      if (value?.[lng] != null) flat[strippedKey] = value[lng];
    });

    const outLngDir = path.join(OUT_DIR, lng);
    fs.mkdirSync(outLngDir, { recursive: true });

    fs.writeFileSync(
      path.join(outLngDir, `${ns}.json`),
      JSON.stringify(flat, null, 2) + "\n",
      "utf8"
    );
  });
});

console.log("Locales built");
