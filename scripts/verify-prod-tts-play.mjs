// TTS 真实播放验证：真实鼠标点击（CDP 受信事件）+ 音频事件钩子
import { createRequire } from 'node:module';
const require = createRequire('C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/package.json');
const puppeteer = require('C:/Users/lijia/WorkBuddy/2026-09-12-20-25-07/node_modules/puppeteer-core');
const PROD = 'https://www.indobrain.app';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    headless: true,
    args: ['--no-first-run', '--disable-extensions', '--window-size=1280,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  await page.evaluateOnNewDocument(() => {
    window.__tts = { playCalls: 0, errors: [], events: [], maxTime: 0, duration: 0, srcKind: '' };
    const origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function patched() {
      window.__tts.playCalls += 1;
      window.__tts.srcKind = this.src && this.src.startsWith('blob:') ? 'blob' : (this.src || '').slice(0, 40);
      this.addEventListener('playing', () => window.__tts.events.push('playing'));
      this.addEventListener('timeupdate', () => {
        window.__tts.maxTime = Math.max(window.__tts.maxTime, this.currentTime || 0);
        window.__tts.duration = this.duration || window.__tts.duration;
      });
      this.addEventListener('error', () => window.__tts.errors.push('media-error'));
      const p = origPlay.call(this);
      if (p && p.catch) p.catch((e) => window.__tts.errors.push(String(e && e.name || e)));
      return p;
    };
    if (window.speechSynthesis) {
      const origSpeak = window.speechSynthesis.speak.bind(window.speechSynthesis);
      window.speechSynthesis.speak = (u) => { window.__tts.events.push('speechSynthesis'); return origSpeak(u); };
    }
  });

  await page.goto(PROD + '/learn-chinese', { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(1200);

  const box = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /Dengarkan Mandarin/i.test(x.textContent || ''));
    if (!b) return null;
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  console.log('button box', box);
  await page.mouse.click(box.x, box.y); // CDP 受信点击
  await sleep(9000);
  const state = await page.evaluate(() => ({
    ...window.__tts,
    labelNow: [...document.querySelectorAll('button')].map((b) => (b.textContent || '').trim()).find((t) => /Memutar|Memuat|Audio belum/i.test(t)) || '',
    bodyHasError: /Audio belum tersedia/.test(document.body.innerText),
  }));
  console.log(JSON.stringify(state, null, 1));
  const ok = state.playCalls > 0 && state.errors.length === 0 && state.maxTime > 0.2;
  console.log(ok ? 'PASS 真实播放：音频元素播放推进 currentTime=' + state.maxTime.toFixed(2) + 's' : 'FAIL 未能确认播放');
  await page.screenshot({ path: 'C:/Users/lijia/Documents/Codex/2026-09-13/continue-from-previous-codex-session-do/indobrain-v12-rc2-integration/results/prod-qa/shots/tts-playing.png' });
  await browser.close();
})();
