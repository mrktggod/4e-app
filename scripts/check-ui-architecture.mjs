import { readFileSync, existsSync } from 'node:fs';

const file = process.argv[2] || 'index.html';
const limits = {
  inlineStyles: 465,
  inlineHandlers: 402,
  styleTags: 0,
  inlineScriptTags: 3,
};

if (!existsSync(file)) {
  console.error(`UI architecture guard failed: ${file} not found`);
  process.exit(1);
}

const source = readFileSync(file, 'utf8');
const count = (pattern) => (source.match(pattern) || []).length;

const metrics = {
  inlineStyles: count(/style=/g),
  inlineHandlers: count(/on[a-z]+=/g),
  styleTags: count(/<style/g),
  inlineScriptTags: count(/<script(?![^>]+src=)([^>]*)?>/g),
};

let fail = false;

if (!/<link[^>]+href="styles\.min\.css"/.test(source)) {
  console.error(`UI architecture guard failed: ${file} must link styles.min.css`);
  fail = true;
}

if (/�|Ð/.test(source)) {
  console.error(`UI architecture guard failed: encoding suspicion in ${file} (possible mojibake)`);
  fail = true;
}

const labels = {
  inlineStyles: 'inline style attributes',
  inlineHandlers: 'inline event handlers',
  styleTags: 'style tags',
  inlineScriptTags: 'inline script tags',
};

for (const [key, value] of Object.entries(metrics)) {
  const max = limits[key];
  if (value > max) {
    console.error(`UI architecture guard failed: ${labels[key]} = ${value}, allowed max = ${max}`);
    fail = true;
  } else {
    console.log(`UI architecture guard: ${labels[key]} = ${value} / ${max}`);
  }
}

if (fail) {
  console.error(`
New UI code must not increase legacy inline debt.
Use:
- styles/**/*.less for visual styles;
- BEM-like class names for UI blocks and elements;
- addEventListener or delegated JS handlers instead of onclick/oninput/onchange in HTML.

If an exception is truly needed, document it in the task and update this guard in the same review.`);
  process.exit(1);
}
