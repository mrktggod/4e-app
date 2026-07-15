import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const repoRoot = process.cwd();
const outDir = resolve(repoRoot, ".pages-dist");

const requiredFiles = [
  "404.html",
  "index.html",
  "vk.html",
  "privacy.html",
  "styles.min.css",
  "scripts/platform-adapter.js",
  "scripts/task-ui-renderers.js",
  "scripts/auth-handlers.js",
];

const optionalPaths = [
  "styles.css",
  "favicon.ico",
  "favicon.svg",
  "manifest.webmanifest",
  "site.webmanifest",
  "sw.js",
  "robots.txt",
  "sitemap.xml",
  "icons",
  "images",
  "img",
  "assets",
];

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const relPath of requiredFiles) {
  const srcPath = resolve(repoRoot, relPath);
  if (!existsSync(srcPath)) {
    throw new Error(`Required Pages file is missing: ${relPath}`);
  }
  const destPath = resolve(outDir, relPath);
  mkdirSync(dirname(destPath), { recursive: true });
  cpSync(srcPath, destPath, { recursive: true });
}

for (const relPath of optionalPaths) {
  const srcPath = resolve(repoRoot, relPath);
  if (!existsSync(srcPath)) continue;
  cpSync(srcPath, resolve(outDir, relPath), { recursive: true });
}

writeFileSync(resolve(outDir, ".nojekyll"), "");

const publishedEntries = readdirSync(outDir)
  .map((name) => {
    const fullPath = join(outDir, name);
    const suffix = statSync(fullPath).isDirectory() ? "/" : "";
    return `${name}${suffix}`;
  })
  .sort();

console.log("Pages artifact ready:");
for (const entry of publishedEntries) {
  console.log(`- ${entry}`);
}
