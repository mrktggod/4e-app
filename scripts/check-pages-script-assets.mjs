import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = process.cwd();
const outDir = resolve(repoRoot, ".pages-dist");
const htmlFiles = ["index.html", "vk.html"];
const scriptSrcPattern = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
const missing = [];
const found = [];

function isLocalScript(src) {
  return !/^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(src) && !src.startsWith("data:");
}

function normalizeScriptPath(src) {
  return src.split("#")[0].split("?")[0].replace(/^\/+/, "");
}

for (const htmlFile of htmlFiles) {
  const sourcePath = resolve(repoRoot, htmlFile);
  if (!existsSync(sourcePath)) {
    missing.push(`${htmlFile}: source HTML file is missing`);
    continue;
  }

  const html = readFileSync(sourcePath, "utf8");
  for (const match of html.matchAll(scriptSrcPattern)) {
    const src = match[1].trim();
    if (!isLocalScript(src)) continue;

    const relPath = normalizeScriptPath(src);
    const artifactPath = resolve(outDir, relPath);
    found.push(`${htmlFile} -> ${relPath}`);
    if (!existsSync(artifactPath)) {
      missing.push(`${htmlFile}: ${relPath} is referenced but missing from .pages-dist`);
    }
  }
}

if (missing.length) {
  console.error("Pages script asset check failed:");
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log("Pages script asset check passed:");
for (const item of found.sort()) console.log(`- ${item}`);
