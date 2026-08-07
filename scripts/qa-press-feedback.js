(function initQaPressFeedback(window, document) {
  'use strict';

  const pressStates = new WeakMap();

  function restorePress(target, state) {
    if (pressStates.get(target) !== state) return;
    target.style.setProperty('box-shadow', state.boxShadow.value, state.boxShadow.priority);
    target.style.setProperty('border-color', state.borderColor.value, state.borderColor.priority);
    target.classList.remove('qa-press-glow');
    pressStates.delete(target);
  }

  function flashContainedGlass(target) {
    const previous = {
      boxShadow: {
        value: target.style.getPropertyValue('box-shadow'),
        priority: target.style.getPropertyPriority('box-shadow'),
      },
      borderColor: {
        value: target.style.getPropertyValue('border-color'),
        priority: target.style.getPropertyPriority('border-color'),
      },
    };
    pressStates.set(target, previous);
    target.classList.remove('qa-press-glow');
    void target.offsetWidth;
    target.classList.add('qa-press-glow');
    // Inline priority is intentional: legacy screen styles use `!important`.
    // This keeps the short light inside the pressed control rather than
    // falling back to an outer rectangular shadow in Telegram WebView.
    target.style.setProperty(
      'box-shadow',
      'inset 0 0 0 1px color-mix(in srgb, var(--green) 42%, transparent), inset 0 -20px 28px color-mix(in srgb, var(--green) 25%, transparent), inset 0 1px 0 color-mix(in srgb, #fff 18%, transparent)',
      'important'
    );
    target.style.setProperty('border-color', 'var(--glass-stroke-strong)', 'important');
    window.setTimeout(function () {
      restorePress(target, previous);
    }, 220);
  }

  function installQaPressFeedback() {
    if (window.__qaPressFeedbackInstalled) return;
    window.__qaPressFeedbackInstalled = true;
    document.addEventListener('pointerdown', function (event) {
      const target = event.target.closest('button,[role="button"],.profile-menu-row,.sub-row,.task-row');
      if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return;
      // The centre dashboard control is a pre-rendered circular asset. Other
      // controls, including the side menu buttons, use a contained inset pulse
      // that follows their own glass frame without painting an outer square.
      if (!target.matches('#home .dash-center-button')) {
        flashContainedGlass(target);
      }
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
