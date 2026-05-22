import puppeteer from 'puppeteer';
import { execSync } from 'child_process';
import { basename, extname, dirname, join } from 'path';

const [,, url, output, viewport = '720x500'] = process.argv;
const [width, height] = viewport.split('x').map(Number);

// Output-Dateiname: screenshot.png → screenshot_preview.png
const ext     = extname(output);
const preview = join(dirname(output), basename(output, ext) + '_preview' + ext);

// Screenshot
const browser = await puppeteer.launch();
const page    = await browser.newPage();
await page.setViewport({ width, height });
await page.goto(url, { waitUntil: 'networkidle0' });
await page.screenshot({ path: output });
await browser.close();
console.log(`Screenshot: ${output}`);

// Play-Button compositen
execSync(`magick ${output} \
  \\( -size 100x100 xc:none \
     -fill "rgba(0,90,148,0.88)" \
     -draw "circle 50,50 50,3" \
     -fill white \
     -draw "polygon 38,24 76,50 38,76" \
  \\) \
  -gravity Center \
  -composite \
  ${preview}`);
console.log(`Vorschaubild: ${preview}`);