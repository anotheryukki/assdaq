import puppeteer from "puppeteer-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const url = process.argv[2] || "http://localhost:3000";
const label = process.argv[3];

const outDir = path.join(__dirname, "temporary screenshots");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

let n = 1;
while (fs.existsSync(path.join(outDir, `screenshot-${n}${label ? "-" + label : ""}.png`))) {
  n++;
}
const outFile = path.join(outDir, `screenshot-${n}${label ? "-" + label : ""}.png`);

function findChrome() {
  const cacheRoot = path.join(process.env.USERPROFILE || "", ".cache", "puppeteer", "chrome");
  if (fs.existsSync(cacheRoot)) {
    const versions = fs.readdirSync(cacheRoot).sort().reverse();
    for (const v of versions) {
      const exe = path.join(cacheRoot, v, "chrome-win64", "chrome.exe");
      if (fs.existsSync(exe)) return exe;
    }
  }
  return null;
}

const executablePath = findChrome();
if (!executablePath) {
  console.error("No cached Chrome binary found.");
  process.exit(1);
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  defaultViewport: { width: 1440, height: 900 },
});

const page = await browser.newPage();
await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
await new Promise((r) => setTimeout(r, 1500));
await page.screenshot({ path: outFile });
await browser.close();

console.log(`Saved ${outFile}`);
