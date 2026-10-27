import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import assert from 'node:assert/strict';
const server = spawn('python3', ['-m', 'http.server', '8765', '--bind', '127.0.0.1'], { stdio: 'ignore' });
let browser;
try {
  for (let i = 0; i < 50; i++) {
    try { const r = await fetch('http://127.0.0.1:8765/fee-calculator/'); if (r.ok) break; } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:8765/fee-calculator/');
  await page.selectOption('#application', 'money');
  await page.fill('#claimAmount', '5000');
  await page.getByRole('button', { name: 'Calculate fee' }).click();
  assert.match(await page.locator('#fee-result').innerText(), /£205\.00/);
  await page.selectOption('#category', 'property-tribunal');
  await page.selectOption('#application', 'service-charge');
  await page.selectOption('#hearing', 'yes');
  await page.getByRole('button', { name: 'Calculate fee' }).click();
  assert.match(await page.locator('#fee-result').innerText(), /£341\.00/);
  await page.reload();
  assert.match(await page.locator('#calc-list').innerText(), /341\.00/);
  const accessibility = await new AxeBuilder({ page }).analyze();
  assert.deepEqual(accessibility.violations.map(v => v.id), []);
  assert.deepEqual(errors, []);
  console.log('Fee calculator browser and axe checks passed');
} finally {
  if (browser) await browser.close();
  server.kill();
}
