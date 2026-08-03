(function initQaPressFeedback(window, document) {
  'use strict';

  function installQaPressFeedback() {
    if (window.__qaPressFeedbackInstalled) return;
    window.__qaPressFeedbackInstalled = true;
    document.addEventListener('pointerdown', function (event) {
      const target = event.target.closest('button,[role="button"],.profile-menu-row,.sub-row,.task-row');
      if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
      target.classList.remove('qa-press-glow');
      void target.offsetWidth;
      target.classList.add('qa-press-glow');
      setTimeout(function () {
        target.classList.remove('qa-press-glow');
      }, 220);
      try {
        window.Telegram?.WebApp?.HapticFeedback?.impactOccurred?.('light');
      } catch (e) {}
      if (navigator.vibrate) navigator.vibrate(8);
    }, { passive: true });
    document.addEventListener('input', function (event) {
      if (
        typeof window.autoResizeField === 'function' &&
        event.target.matches('#detail-description,.detail-check-text,textarea.profile-input,textarea.detail-control')
      ) {
        window.autoResizeField(event.target);
      }
    });
    document.addEventListener('focusin', function (event) {
      if (event.target.matches('input,textarea')) event.target.setAttribute('enterkeyhint', 'done');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installQaPressFeedback);
  } else {
    installQaPressFeedback();
  }
})(window, document);
