import fs from 'node:fs';
import path from 'node:path';

const utf8Decoder = new TextDecoder('utf-8', { fatal: true });
const shouldFix = process.argv.includes('--fix');

const cp1251SpecialCodePoints = [
  0x0402, 0x0403, 0x201A, 0x0453, 0x201E, 0x2026, 0x2020, 0x2021,
  0x20AC, 0x2030, 0x0409, 0x2039, 0x040A, 0x040C, 0x040B, 0x040F,
  0x0452, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014,
  null,   0x2122, 0x0459, 0x203A, 0x045A, 0x045C, 0x045B, 0x045F,
  0x00A0, 0x040E, 0x045E, 0x0408, 0x00A4, 0x0490, 0x00A6, 0x00A7,
  0x0401, 0x00A9, 0x0404, 0x00AB, 0x00AC, 0x00AD, 0x00AE, 0x0407,
  0x00B0, 0x00B1, 0x0406, 0x0456, 0x0491, 0x00B5, 0x00B6, 0x00B7,
  0x0451, 0x2116, 0x0454, 0x00BB, 0x0458, 0x0405, 0x0455, 0x0457,
];

const cp1251Forward = new Array(256).fill(0).map((_, index) => index);
for (let index = 0; index < cp1251SpecialCodePoints.length; index += 1) {
  const codePoint = cp1251SpecialCodePoints[index];
  if (codePoint != null) cp1251Forward[0x80 + index] = codePoint;
}
for (let byte = 0xC0; byte <= 0xFF; byte += 1) {
  cp1251Forward[byte] = 0x0410 + (byte - 0xC0);
}

const cp1251Reverse = new Map();
for (let byte = 0; byte < cp1251Forward.length; byte += 1) {
  cp1251Reverse.set(cp1251Forward[byte], byte);
}

const cyrillicPattern = /\p{Script=Cyrillic}/u;
const tokenPattern = /[^\t\n\r <>"'`=(){}[\],;]+/gu;
const targetPattern = /index\.html$|scripts[\\/].*\.(?:js|mjs|cjs)$|(?:pm|shared)[\\/].*\.md$/i;

function walkDir(dirPath, output = []) {
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) walkDir(fullPath, output);
    else output.push(fullPath);
  }
  return output;
}

function collectTargets() {
  const roots = ['index.html', 'scripts', 'pm', 'shared'];
  const files = [];
  for (const root of roots) {
    const stat = fs.statSync(root);
    if (stat.isDirectory()) files.push(...walkDir(root));
    else files.push(root);
  }
  return files.filter(filePath => targetPattern.test(filePath));
}

function encodeCp1251(value) {
  const bytes = [];
  for (const char of value) {
    const codePoint = char.codePointAt(0);
    if (codePoint <= 0x7F) {
      bytes.push(codePoint);
      continue;
    }
    const mapped = cp1251Reverse.get(codePoint);
    if (mapped == null) return null;
    bytes.push(mapped);
  }
  return Uint8Array.from(bytes);
}

function decodeUtf8AsCp1251Token(token) {
  const bytes = encodeCp1251(token);
  if (!bytes) return null;
  try {
    const decoded = utf8Decoder.decode(bytes);
    if (decoded === token) return null;
    if (!cyrillicPattern.test(decoded)) return null;
    return decoded;
  } catch {
    return null;
  }
}

function cp1251ByteToChar(byte) {
  return String.fromCodePoint(cp1251Forward[byte]);
}

function toMojibakeFragment(value) {
  const bytes = Buffer.from(value, 'utf8');
  let output = '';
  for (const byte of bytes) {
    output += cp1251ByteToChar(byte);
  }
  return output;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function* buildCandidateStrings() {
  for (let codePoint = 0x0400; codePoint <= 0x052F; codePoint += 1) {
    yield String.fromCodePoint(codePoint);
  }
  for (let codePoint = 0x00A0; codePoint <= 0x00BB; codePoint += 1) {
    yield String.fromCodePoint(codePoint);
  }
  for (let codePoint = 0x2010; codePoint <= 0x2044; codePoint += 1) {
    yield String.fromCodePoint(codePoint);
  }
  for (let codePoint = 0x20A0; codePoint <= 0x2122; codePoint += 1) {
    yield String.fromCodePoint(codePoint);
  }
  for (let codePoint = 0x2190; codePoint <= 0x21FF; codePoint += 1) {
    yield String.fromCodePoint(codePoint);
  }
  for (let codePoint = 0x2600; codePoint <= 0x27BF; codePoint += 1) {
    yield String.fromCodePoint(codePoint);
  }
  yield '\u2705';
  yield '\u270C\uFE0F';
  yield '\u2728';
  yield '\uFE0F';
  yield '\u{1F4DD}';
  yield '\u{1F91D}';
  yield '\u267B\uFE0F';
  yield '\u270D\uFE0F';
  yield '\u2600\uFE0F';
  yield '\u{1F4EC}';
  yield '\u{1F381}';
  yield '\u{1F4CB}';
  yield '\u{1F4A1}';
  yield '\u{1F4CA}';
  yield '\u{1F319}';
  yield '\u{1F514}';
  yield '\u{1F64F}';
  yield '\u{1F4C5}';
}

const fragmentFixMap = new Map();
for (const candidate of buildCandidateStrings()) {
  const mojibake = toMojibakeFragment(candidate);
  if (mojibake !== candidate && /[^\x00-\x7F]/.test(mojibake)) {
    fragmentFixMap.set(mojibake, candidate);
  }
}
const fragmentEntries = [...fragmentFixMap.entries()].sort((a, b) => b[0].length - a[0].length);
const fragmentRegex = new RegExp(fragmentEntries.map(([bad]) => escapeRegExp(bad)).join('|'), 'gu');

function lineNumberForOffset(text, offset) {
  return text.slice(0, offset).split(/\r?\n/).length;
}

function inspectFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const hits = [];
  let updated = original;

  updated = updated.replace(fragmentRegex, (bad, offset) => {
    const good = fragmentFixMap.get(bad) || bad;
    if (good !== bad) {
      hits.push({ filePath, line: lineNumberForOffset(original, offset), token: bad, decoded: good });
    }
    return good;
  });

  const seen = new Map();
  updated = updated.replace(tokenPattern, (token, offset) => {
    if (!cyrillicPattern.test(token) || token.length < 2) return token;
    let decoded = seen.get(token);
    if (decoded === undefined) {
      decoded = decodeUtf8AsCp1251Token(token);
      seen.set(token, decoded);
    }
    if (!decoded) return token;
    hits.push({ filePath, line: lineNumberForOffset(updated, offset), token, decoded });
    return decoded;
  });

  return { changed: updated !== original, hits, updated };
}

const targets = collectTargets();
const allHits = [];
const changedFiles = [];

for (const filePath of targets) {
  const result = inspectFile(filePath);
  allHits.push(...result.hits);
  if (shouldFix && result.changed) {
    fs.writeFileSync(filePath, result.updated, 'utf8');
    changedFiles.push(filePath);
  }
}

if (allHits.length === 0) {
  console.log('CP1251 mojibake check passed: 0 suspicious tokens');
  process.exit(0);
}

if (shouldFix) {
  console.log(`CP1251 mojibake autofix applied: ${allHits.length} fragment(s)/token(s) across ${changedFiles.length} file(s)`);
  for (const filePath of changedFiles) {
    console.log(`FIXED ${filePath}`);
  }
  process.exit(0);
}

for (const hit of allHits) {
  console.log(`${hit.filePath}:${hit.line}: ${hit.token} => ${hit.decoded}`);
}
console.error(`CP1251 mojibake check failed: ${allHits.length} suspicious fragment(s)/token(s)`);
process.exit(1);
