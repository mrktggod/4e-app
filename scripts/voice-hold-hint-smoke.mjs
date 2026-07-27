import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });

try {
  await page.goto(indexUrl);
  await page.evaluate(() => {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('home')?.classList.add('active');
  });

  const hint = page.locator('#home-voice-hold-hint');
  const voiceButton = page.locator('#home-nav-voice');
  await hint.waitFor({ state: 'visible' });

  const metrics = await page.evaluate(() => {
    const hintEl = document.getElementById('home-voice-hold-hint');
    const buttonEl = document.getElementById('home-nav-voice');
    const hintRect = hintEl.getBoundingClientRect();
    const buttonRect = buttonEl.getBoundingClientRect();
    const hintStyle = getComputedStyle(hintEl);
    return {
      text: hintEl.textContent.trim(),
      display: hintStyle.display,
      opacity: Number(hintStyle.opacity),
      hint: {
        left: hintRect.left,
        right: hintRect.right,
        top: hintRect.top,
        bottom: hintRect.bottom,
        width: hintRect.width,
        height: hintRect.height,
      },
      button: {
        top: buttonRect.top,
        bottom: buttonRect.bottom,
      },
      describedBy: buttonEl.getAttribute('aria-describedby'),
    };
  });

  if (metrics.text !== 'Удерживай для голоса') throw new Error(`unexpected hint text: ${metrics.text}`);
  if (metrics.display === 'none' || metrics.opacity < 0.8) throw new Error('hint is not visibly rendered');
  if (metrics.describedBy !== 'home-voice-hold-hint') throw new Error('voice button is not linked to the hint');
  if (metrics.hint.left < 0 || metrics.hint.right > 390) throw new Error('hint escapes 390px viewport');
  if (metrics.hint.bottom >= metrics.button.top - 4) throw new Error('hint overlaps the center voice button');
  if (metrics.hint.width < 90 || metrics.hint.height < 20) throw new Error('hint geometry is too small to notice');

  console.log('voice hold hint smoke: PASS', JSON.stringify(metrics));
} finally {
  await browser.close();
}
