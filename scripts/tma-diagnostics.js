(function initFourTmaDiagnostics(window, document) {
  'use strict';

  const BUILD = 'tma-diag-2026-07-18-urgent2';
  const events = [];
  const errors = [];
  const clicks = [];
  let banner = null;
  let expanded = false;

  function nowLabel() {
    try {
      return new Date().toISOString().slice(11, 19);
    } catch (error) {
      return 'time?';
    }
  }

  function safe(label, fn, fallback) {
    try {
      return fn();
    } catch (error) {
      recordError(label, error);
      return fallback;
    }
  }

  function mark(label, detail) {
    events.push({ at: nowLabel(), label, detail: detail || '' });
    if (events.length > 16) events.shift();
    render();
  }

  function recordError(label, error) {
    const message = error?.message || String(error || 'unknown error');
    const stack = String(error?.stack || '').split('\n').slice(0, 2).join(' | ');
    errors.push({ at: nowLabel(), label, message, stack });
    if (errors.length > 8) errors.shift();
    render();
  }

  function shouldShow() {
    return safe('shouldShow', () => {
      const params = new URLSearchParams(window.location.search || '');
      return params.get('tma_diag') === '1';
    }, false);
  }

  function readState() {
    return safe('readState', () => {
      const tgApp = safe('read Telegram.WebApp', () => window.Telegram?.WebApp || null, null);
      const fp = window.FourPlatform || null;
      const sw = window.navigator?.serviceWorker;
      const controlled = !!sw?.controller;
      const warnings = safe('read startup warnings', () => (
        typeof fp?.getTelegramStartupWarnings === 'function'
          ? fp.getTelegramStartupWarnings()
          : []
      ), []);
      const ids = ['login-submit-btn', 'login-telegram-btn', 'login-vk-id-btn', 'login-yandex-id-btn'];
      const buttons = ids.map((id) => {
        const el = document.getElementById(id);
        return `${id}:${el ? 'yes' : 'no'}`;
      }).join(' ');
      return {
        url: window.location.href,
        ua: window.navigator?.userAgent || '',
        readyState: document.readyState,
        tgGlobal: !!window.Telegram,
        tgWebApp: !!tgApp,
        initDataLen: String(tgApp?.initData || '').length,
        tgUser: tgApp?.initDataUnsafe?.user?.id || '',
        platform: !!fp,
        warnings,
        swControlled: controlled,
        buttons,
      };
    }, {});
  }

  function line(label, value) {
    return `<div><strong>${escapeHtml(label)}:</strong> <span>${escapeHtml(value)}</span></div>`;
  }

  function escapeHtml(value) {
    return String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  }

  function ensureBanner() {
    if (banner || !shouldShow() || !document.body) return banner;
    banner = document.createElement('div');
    banner.id = 'four-tma-diagnostics';
    banner.style.cssText = [
      'position:fixed',
      'left:10px',
      'right:10px',
      'top:calc(env(safe-area-inset-top,0px) + 10px)',
      'z-index:2147483647',
      'max-height:48vh',
      'overflow:auto',
      'padding:10px 12px',
      'border:1px solid rgba(154,194,60,.55)',
      'border-radius:14px',
      'background:rgba(9,14,7,.94)',
      'color:#f2f5e9',
      'box-shadow:0 12px 34px rgba(0,0,0,.42)',
      'font:12px/1.35 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace',
      'white-space:normal',
      'pointer-events:auto',
    ].join(';');
    banner.addEventListener('click', (event) => {
      const target = event.target;
      if (target && target.dataset && target.dataset.tmaDiagToggle) {
        expanded = !expanded;
        render();
      }
      if (target && target.dataset && target.dataset.tmaDiagCopy) {
        copyText();
      }
    });
    document.body.appendChild(banner);
    return banner;
  }

  function copyText() {
    const state = readState();
    const text = [
      `build=${BUILD}`,
      `url=${state.url || ''}`,
      `ua=${state.ua || ''}`,
      `readyState=${state.readyState || ''}`,
      `tgGlobal=${state.tgGlobal}`,
      `tgWebApp=${state.tgWebApp}`,
      `initDataLen=${state.initDataLen}`,
      `tgUser=${state.tgUser || ''}`,
      `platform=${state.platform}`,
      `swControlled=${state.swControlled}`,
      `buttons=${state.buttons || ''}`,
      `warnings=${JSON.stringify(state.warnings || [])}`,
      `errors=${JSON.stringify(errors)}`,
      `events=${JSON.stringify(events)}`,
      `clicks=${JSON.stringify(clicks)}`,
    ].join('\n');
    window.navigator?.clipboard?.writeText(text).catch(() => {});
  }

  function render() {
    if (!document.body) return;
    const el = ensureBanner();
    if (!el) return;
    const state = readState();
    const latestError = errors[errors.length - 1];
    const latestClick = clicks[clicks.length - 1];
    const warnings = (state.warnings || []).map((item) => `${item.label}:${item.message}`).join(' | ') || 'none';
    const eventText = events.slice(-5).map((item) => `${item.at} ${item.label}${item.detail ? ' ' + item.detail : ''}`).join(' | ');
    const errorText = latestError ? `${latestError.at} ${latestError.label}: ${latestError.message}` : 'none';
    const clickText = latestClick ? `${latestClick.at} ${latestClick.id || latestClick.tag}` : 'none';
    el.innerHTML = [
      `<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:6px">`,
      `<strong style="color:#9ac23c">4 TMA diag ${escapeHtml(BUILD)}</strong>`,
      `<span><button data-tma-diag-toggle="1" style="font:inherit;border:1px solid #9ac23c;border-radius:8px;background:transparent;color:#9ac23c;padding:3px 6px">${expanded ? 'short' : 'more'}</button> `,
      `<button data-tma-diag-copy="1" style="font:inherit;border:1px solid #9ac23c;border-radius:8px;background:transparent;color:#9ac23c;padding:3px 6px">copy</button></span>`,
      `</div>`,
      line('state', `${state.readyState} platform=${state.platform} sw=${state.swControlled}`),
      line('telegram', `global=${state.tgGlobal} webApp=${state.tgWebApp} initDataLen=${state.initDataLen} user=${state.tgUser || 'none'}`),
      line('buttons', state.buttons || 'not-read'),
      line('last-click', clickText),
      line('last-error', errorText),
      line('tg-warnings', warnings),
      expanded ? line('events', eventText || 'none') : '',
      expanded ? line('url', state.url || '') : '',
      expanded ? line('ua', state.ua || '') : '',
    ].join('');
  }

  window.addEventListener('error', (event) => {
    recordError('window.error', event.error || event.message);
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    recordError('unhandledrejection', event.reason || 'promise rejected');
  }, true);

  document.addEventListener('click', (event) => {
    const target = event.target?.closest?.('button,a,[onclick],[role="button"]') || event.target;
    clicks.push({
      at: nowLabel(),
      id: target?.id || '',
      tag: target?.tagName || '',
      text: String(target?.textContent || '').trim().slice(0, 40),
    });
    if (clicks.length > 8) clicks.shift();
    render();
  }, true);

  document.addEventListener('DOMContentLoaded', () => {
    mark('DOMContentLoaded');
    render();
  });

  window.addEventListener('load', () => {
    mark('load');
    render();
  });

  window.FourTmaDiagnostics = {
    build: BUILD,
    mark,
    recordError,
    render,
    getSnapshot: () => ({ build: BUILD, state: readState(), events: events.slice(), errors: errors.slice(), clicks: clicks.slice() }),
  };

  mark('diag-script-loaded');
})(window, document);
