import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

async function record() {
  const outputDir = path.resolve('./recordings');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Clear previous recordings
  fs.readdirSync(outputDir).forEach(f => {
    try { fs.unlinkSync(path.join(outputDir, f)); } catch(e){}
  });

  const width = 1080;
  const height = 1080;

  console.log('Launching browser with Chrome for 1080x1080 recording...');
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: [
      '--enable-webgl',
      '--use-gl=angle',
      '--use-angle=default',
      '--ignore-gpu-blocklist',
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const context = await browser.newContext({
    recordVideo: {
      dir: outputDir,
      size: { width, height }
    },
    viewport: { width, height },
    deviceScaleFactor: 1
  });

  const page = await context.newPage();
  console.log('Navigating to live demo...');
  await page.goto('https://jeiel85.github.io/crossy-fish/', { waitUntil: 'networkidle' });

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  await sleep(1000);

  // 1. Start Game
  console.log('1. Starting game...');
  await page.click('#btn-start-game');
  await sleep(1000);

  // Character movement - 2 hops forward, 1 hop right
  await page.keyboard.press('KeyW');
  await sleep(350);
  await page.keyboard.press('KeyW');
  await sleep(400);
  await page.keyboard.press('KeyD');
  await sleep(500);

  // 2. Camera: Shoulder 3rd-person
  console.log('2. Switching camera to Shoulder View...');
  await page.keyboard.press('KeyV');
  await sleep(1200);

  // 3. Weather: 🌸 Cherry Blossom
  console.log('3. Weather: Cherry Blossom petals...');
  await page.evaluate(() => {
    if (window.game) window.game.weatherSystem.setWeather('cherry');
  });
  await sleep(1500);

  // 4. Cast Fishing Rod!
  console.log('4. Casting rod...');
  await page.keyboard.press('Space');
  await sleep(1200);

  // 5. Camera: Focus View (Bobber close-up)
  console.log('5. Switching camera to Focus View...');
  await page.keyboard.press('KeyV');
  await sleep(1500);

  // 6. Weather: 🌅 Sunset Golden Hour
  console.log('6. Weather: Sunset...');
  await page.evaluate(() => {
    if (window.game) window.game.weatherSystem.setWeather('sunset');
  });
  await sleep(1500);

  // 7. Fish Strike & Reel In & Catch!
  console.log('7. Triggering strike & reel catch...');
  await page.evaluate(() => {
    if (window.game) {
      window.game.fishingMechanic.triggerStrike();
    }
  });
  await sleep(1000);

  await page.evaluate(() => {
    if (window.game) {
      window.game.fishingMechanic.hook();
    }
  });
  await sleep(1200);

  await page.evaluate(() => {
    if (window.game) {
      window.game.fishingMechanic.onFishCaughtSuccess();
    }
  });
  await sleep(2500); // Celebrate catch & confetti

  // 8. Next Stage: Tropical Reef
  console.log('8. Switching to Stage 2: Tropical Reef...');
  await page.evaluate(() => {
    if (window.game) window.game.nextStage();
  });
  await sleep(1200);

  // 9. Camera: Top-Down Aerial View
  console.log('9. Switching camera to Top-Down View...');
  await page.keyboard.press('KeyV');
  await sleep(1200);

  // 10. Weather: ⛈️ Storm with lightning
  console.log('10. Weather: Storm with lightning...');
  await page.evaluate(() => {
    if (window.game) window.game.weatherSystem.setWeather('storm');
  });
  await sleep(2000);

  // 11. Next Stage: Frozen Fjord & ❄️ Snow
  console.log('11. Switching to Frozen Fjord with Snow...');
  await page.evaluate(() => {
    if (window.game) {
      window.game.loadStage(3); // Fjord
      window.game.weatherSystem.setWeather('snow');
    }
  });
  await sleep(1500);

  // 12. Camera back to Isometric & AUTO bot toggle
  console.log('12. Camera to Isometric & enabling AUTO Bot...');
  await page.keyboard.press('KeyV');
  await sleep(600);
  await page.click('#btn-autoplay');
  await sleep(3500);

  // 13. Open Fishdex Modal
  console.log('13. Showing Fishdex Modal...');
  await page.click('#btn-fishdex-open');
  await sleep(2200);
  await page.click('#btn-close-fishdex');
  await sleep(1000);

  console.log('Wrapping up recording...');
  await sleep(1000);

  await context.close();
  await browser.close();

  // Find the recorded webm file
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.webm'));
  if (files.length > 0) {
    const rawWebm = path.join(outputDir, files[0]);
    const finalMp4 = path.join(outputDir, 'crossy_fish_demo.mp4');
    const finalGif = path.join(outputDir, 'crossy_fish_demo.gif');
    console.log(`Converting ${rawWebm} to MP4 (${finalMp4}) with ffmpeg...`);

    execSync(`ffmpeg -y -i "${rawWebm}" -c:v libx264 -pix_fmt yuv420p -preset medium -crf 20 -r 30 -movflags +faststart "${finalMp4}"`);
    console.log('MP4 created successfully!');

    console.log('Generating highlight GIF for preview...');
    execSync(`ffmpeg -y -ss 00:00:04 -t 7 -i "${finalMp4}" -vf "fps=14,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=128[p];[s1][p]paletteuse=dither=bayer" "${finalGif}"`);
    console.log('GIF created successfully!');
  }

  console.log('Record process finished!');
}

record().catch(err => {
  console.error('Recording error:', err);
  process.exit(1);
});
