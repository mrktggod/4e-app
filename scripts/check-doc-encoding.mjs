#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const targets = ["pm", "shared"]
  .flatMap((dir) => {
    const root = path.join(process.cwd(), dir);
    return fs.existsSync(root)
      ? fs
          .readdirSync(root)
          .filter((file) => file.endsWith(".md"))
          .map((file) => path.join(dir, file))
      : [];
  });

if (targets.length === 0) {
  console.log("No Markdown files found under pm/ or shared/.");
  process.exit(0);
}

const failures = [];

for (const file of targets) {
  const raw = fs.readFileSync(file);
  const text = raw.toString("utf8");
  const encoded = Buffer.from(text, "utf8");
  if (!raw.equals(encoded)) {
    failures.push(`${file}: not valid UTF-8`);
  }

  if (text.includes("\uFFFD")) {
    failures.push(`${file}: contains replacement character (�), likely encoding corruption`);
  }
}

if (failures.length > 0) {
  console.error("Encoding check failed for markdown docs:");
  failures.forEach((line) => console.error(` - ${line}`));
  process.exit(1);
}

console.log(`Markdown encoding check passed for ${targets.length} files in pm/ and shared/.`);
