import { cpSync, existsSync, mkdirSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const repoRoot = process.cwd();
const outDir = resolve(repoRoot, ".vk-hosting-dist");

const requiredFiles = [
  "vk.html",
  "privacy.html",
  "styles.min.css",
];

const optionalPaths = [
  "styles.css",
  "favicon.ico",
  "favicon.svg",
  "manifest.webmanifest",
  "site.webmanifest",
  "robots.txt",
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
    throw new Error(`Required VK hosting file is missing: ${relPath}`);
  }
  cpSync(srcPath, resolve(outDir, relPath), { recursive: true });
}

const vkEntry = resolve(outDir, "vk.html");
const indexEntry = resolve(outDir, "index.html");
renameSync(vkEntry, indexEntry);

for (const relPath of optionalPaths) {
  const srcPath = resolve(repoRoot, relPath);
  if (!existsSync(srcPath)) continue;
  const destPath = resolve(outDir, relPath);
  mkdirSync(dirname(destPath), { recursive: true });
  cpSync(srcPath, destPath, { recursive: true });
}

writeFileSync(resolve(outDir, ".nojekyll"), "");

const publishedEntries = readdirSync(outDir)
  .map((name) => {
    const fullPath = join(outDir, name);
    const suffix = statSync(fullPath).isDirectory() ? "/" : "";
    return `${name}${suffix}`;
  })
  .sort();

console.log("VK hosting artifact ready:");
for (const entry of publishedEntries) {
  console.log(`- ${entry}`);
}
