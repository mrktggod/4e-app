import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexUrl = pathToFileURL(path.join(root, 'index.html')).href;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });

try {
  await page.goto(indexUrl);
  await page.evaluate(() => {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('task-detail')?.classList.add('active');
  });

  await page.evaluate(() => window.showToast('Сохранено ✓'));
  await page.waitForFunction(() => document.getElementById('toast')?.classList.contains('show'));
  await page.waitForTimeout(1650);
  const successAutoHidden = await page.evaluate(() => !document.getElementById('toast')?.classList.contains('show'));
  if (!successAutoHidden) throw new Error('success toast did not auto-hide quickly');

  await page.evaluate(() => window.showToast('Сохранено ✓'));
  await page.waitForFunction(() => document.getElementById('toast')?.classList.contains('show'));
  await page.evaluate(() => {
    const scroll = document.querySelector('#task-detail .detail-redesign-scroll');
    scroll.scrollTop = 80;
    scroll.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(80);
  const successDismissedOnScroll = await page.evaluate(() => !document.getElementById('toast')?.classList.contains('show'));
  if (!successDismissedOnScroll) throw new Error('success toast stayed visible after task-detail scroll');

  await page.evaluate(() => window.showToast('Ошибка сохранения'));
  await page.waitForFunction(() => document.getElementById('toast')?.classList.contains('show'));
  await page.evaluate(() => {
    const scroll = document.querySelector('#task-detail .detail-redesign-scroll');
    scroll.scrollTop = 120;
    scroll.dispatchEvent(new Event('scroll', { bubbles: true }));
  });
  await page.waitForTimeout(1800);
  const errorStillVisible = await page.evaluate(() => document.getElementById('toast')?.classList.contains('show'));
  if (!errorStillVisible) throw new Error('error toast was dismissed too quickly');

  await page.waitForTimeout(2600);
  const errorEventuallyHidden = await page.evaluate(() => !document.getElementById('toast')?.classList.contains('show'));
  if (!errorEventuallyHidden) throw new Error('error toast did not eventually auto-hide');

  console.log('task toast lifecycle smoke: PASS');
} finally {
  await browser.close();
}
