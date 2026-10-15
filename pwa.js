/* 展商城 PWA：註冊 Service Worker + 「安裝 App」按鈕（Android/電腦直接安裝；iPhone 顯示加入主畫面教學） */
(() => {
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  const standalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  if (standalone()) return;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  let deferred = null;

  const btn = document.createElement('button');
  btn.id = 'zah-install'; btn.type = 'button'; btn.textContent = '📲 安裝 App';
  btn.style.cssText = 'display:none;padding:.45rem .8rem;border-radius:.75rem;font-size:12px;font-weight:800;color:#fff;background:linear-gradient(135deg,#10b981,#047857);box-shadow:0 8px 18px -8px rgba(4,120,87,.9);white-space:nowrap;cursor:pointer;border:0';
  const mount = () => {
    const host = document.getElementById('out')?.parentElement || document.querySelector('header > div:last-child');
    if (host) host.insertBefore(btn, host.firstChild);
    else { btn.style.cssText += ';position:fixed;right:12px;bottom:12px;z-index:9998'; document.body.appendChild(btn); }
  };
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mount); else mount();

  addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; btn.style.display = ''; });
  addEventListener('appinstalled', () => { btn.style.display = 'none'; deferred = null; });
  if (ios) btn.style.display = '';

  btn.onclick = async () => {
    if (deferred) { deferred.prompt(); await deferred.userChoice.catch(() => {}); deferred = null; btn.style.display = 'none'; return; }
    if (ios) alert('在 iPhone / iPad 安裝：\n\n1. 用 Safari 開啟這個網頁\n2. 點下方「分享」圖示（方框加箭頭）\n3. 選「加入主畫面」\n4. 按「新增」\n\n之後就能像 App 一樣從主畫面開啟。');
    else alert('這個瀏覽器目前不能直接安裝。\n請用 Chrome / Edge 開啟，或到瀏覽器選單選「安裝應用程式 / 加到主畫面」。');
  };
})();
