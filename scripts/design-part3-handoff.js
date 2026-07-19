(function () {
  const VERSION = '20260719-part3-1';
  const SCREENS = {
    notifications: { light: 'notifications-light', dark: 'notifications-dark', back: () => window.showScreen ? window.showScreen('home') : window.showSubScreen?.('home') },
    security: { light: 'security-light', dark: 'security-dark', back: () => window.showSubScreen?.('profile') },
    'ai-memory': { light: 'memory-light', dark: 'memory-dark', back: () => window.showSubScreen?.('profile') },
    'language-settings': { light: 'language-light', dark: 'language-dark', back: () => window.showSubScreen?.('profile') },
    support: { light: 'support-light', dark: 'support-dark', back: () => window.showSubScreen?.('profile') }
  };

  function isLightTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light';
  }

  function frameSrc(folder) {
    return `assets/design/part3/${folder}/index.html?v=${VERSION}`;
  }

  function ensureStyles() {
    if (document.getElementById('part3-handoff-style')) return;
    const style = document.createElement('style');
    style.id = 'part3-handoff-style';
    style.textContent = `
      .screen.part3-handoff-screen {
        position: relative !important;
        overflow: hidden !important;
      }
      .part3-handoff-layer {
        position: absolute;
        inset: 0;
        z-index: 30;
        pointer-events: none;
        background: transparent;
      }
      .part3-handoff-frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
        background: transparent;
        pointer-events: none;
      }
      .part3-handoff-back {
        position: absolute;
        z-index: 31;
        left: 0;
        top: 0;
        width: 96px;
        height: 96px;
        border: 0;
        padding: 0;
        margin: 0;
        background: transparent;
        pointer-events: auto;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .screen.part3-handoff-screen > .back-bar,
      .screen.part3-handoff-screen > .sub-scroll,
      .screen.part3-handoff-screen > .notif-filters,
      .screen.part3-handoff-screen > .notif-scroll {
        opacity: 0 !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(style);
  }

  function mountOne(screenId, config) {
    const screen = document.getElementById(screenId);
    if (!screen) return;
    screen.classList.add('part3-handoff-screen');
    let layer = screen.querySelector(':scope > .part3-handoff-layer');
    if (!layer) {
      layer = document.createElement('div');
      layer.className = 'part3-handoff-layer';
      layer.innerHTML = '<iframe class="part3-handoff-frame" title=""></iframe><button class="part3-handoff-back" type="button" aria-label="Назад"></button>';
      screen.appendChild(layer);
      layer.querySelector('.part3-handoff-back').addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        config.back?.();
      });
    }
    const iframe = layer.querySelector('.part3-handoff-frame');
    const folder = isLightTheme() ? config.light : config.dark;
    const nextSrc = frameSrc(folder);
    if (!iframe.src.endsWith(nextSrc)) iframe.src = nextSrc;
  }

  function mountAll() {
    ensureStyles();
    Object.entries(SCREENS).forEach(([screenId, config]) => mountOne(screenId, config));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountAll, { once: true });
  else mountAll();

  new MutationObserver(mountAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });
})();
