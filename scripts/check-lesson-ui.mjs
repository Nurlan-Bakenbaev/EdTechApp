import { chromium } from '@playwright/test';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
await mkdir('artifacts', { recursive: true });
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
try {
  await page.goto('http://127.0.0.1:3000/course/grade-1/g1_l001', { waitUntil: 'networkidle' });
  await page.locator('.authored-tabs button').nth(1).click();
  await page.screenshot({ path: 'artifacts/authored-test.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/authored-test-mobile.png', fullPage: true });
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile horizontal overflow');
  const task = JSON.parse(await readFile('content/authored-lessons/g1_l001.json', 'utf8')).assessment[0];
  const tokens = page.locator('.authored-options button');
  await tokens.nth(0).click();
  await page.locator('.lesson-drop-zone').click();
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await page.getByText(task.feedback.incorrect, { exact: true }).waitFor();
  for (let index = 1; index < task.rule.expected_count; index++) { await tokens.nth(index).click(); await page.locator('.lesson-drop-zone').click(); }
  await page.getByRole('button', { name: 'Проверить', exact: true }).click();
  await page.getByText(task.feedback.correct, { exact: true }).waitFor();
  await page.locator('.authored-tabs button').nth(2).click();
  await page.getByRole('link', { name: '↓ Сохранить PDF', exact: true }).waitFor();
  const response = await page.request.get('http://127.0.0.1:3000/api/homework/g1_l001');
  if (response.status() !== 200 || !response.headers()['content-type'].includes('application/pdf')) throw new Error('Homework PDF failed');
  await page.reload({ waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Тренируемся дома', exact: true }).waitFor();
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('kg_math_grade1_ktp_revised_85:g1_l001:local')));
  if (saved.tasks[task.id].first.correct !== false || saved.tasks[task.id].latest.correct !== true) throw new Error('First attempt overwritten');
  await page.screenshot({ path: 'artifacts/authored-homework-mobile.png', fullPage: true });
  await writeFile('artifacts/browser-check.json', JSON.stringify({ errors, firstAttemptPreserved: true, pdfDownload: response.status(), mobileOverflow: false }, null, 2));
  console.log(JSON.stringify({ errors, firstAttemptPreserved: true, pdfDownload: response.status(), mobileOverflow: false }));
} finally { await browser.close(); }
