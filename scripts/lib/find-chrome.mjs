import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

async function exists(file) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

function commandExists(command) {
  const result = spawnSync(command, ['--version'], {
    stdio: 'ignore',
    shell: false,
  });
  return !result.error;
}

export async function findChrome(extraCandidates = []) {
  const candidates = [
    process.env.CHROME_PATH,
    process.env.BROWSER_PATH,
    ...extraCandidates,
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env['ProgramFiles(x86)'] && path.join(process.env['ProgramFiles(x86)'], 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    'chrome',
    'google-chrome',
    'chromium',
    'chromium-browser',
    'msedge',
  ].filter(Boolean);

  for (const candidate of candidates) {
    const isPathLike = candidate.includes('/') || candidate.includes('\\');
    if (isPathLike) {
      if (await exists(candidate)) return candidate;
    } else if (commandExists(candidate)) {
      return candidate;
    }
  }

  const playwrightChromium = chromium.executablePath();
  if (playwrightChromium && await exists(playwrightChromium)) {
    return playwrightChromium;
  }

  throw new Error('Chrome, Edge, or Playwright Chromium executable was not found');
}
