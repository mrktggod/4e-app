(function initFourPlatform(window) {
  'use strict';

  const telegramApp = window.Telegram?.WebApp || null;
  const vkBridge = window.vkBridge || null;

  function getSearchParams() {
    return new URLSearchParams(window.location.search || '');
  }

  function getTelegramBotUsername() {
    return getSearchParams().get('bot') || 'Denzel89bot';
  }

  function getTelegramUser() {
    return telegramApp?.initDataUnsafe?.user || null;
  }

  function getTelegramInitData() {
    return telegramApp?.initData || '';
  }

  function initTelegram() {
    if (telegramApp?.ready) telegramApp.ready();
    telegramApp?.expand?.();
    telegramApp?.disableVerticalSwipes?.();
  }

  function isVkMiniAppContext() {
    const raw = [window.location.search, window.location.hash].filter(Boolean).join('&');
    return /(?:^|[?#&])vk_/.test(raw) || /(?:^|[?#&])sign=/.test(raw);
  }

  function getSurface() {
    if (getTelegramInitData()) return 'telegram';
    if (vkBridge && isVkMiniAppContext()) return 'vk';
    return 'web';
  }

  function initVkMiniAppAdapter(deps) {
    const options = deps || {};
    const bridge = window.vkBridge || vkBridge;
    const checkVkContext = options.isVkMiniAppContext || isVkMiniAppContext;
    const isVK = !!bridge && checkVkContext();
    if (!isVK || window.__fourVkMiniAppAdapterReady) return;

    window.__fourVkMiniAppAdapterReady = true;
    console.log('[VK Adapter] VK Mini App detected');
    document.body.setAttribute('data-platform', 'vk');

    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => link.remove());
    const fontStyle = document.createElement('style');
    fontStyle.textContent = 'html,body,*{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif!important}';
    document.head.appendChild(fontStyle);

    const call = (name, args) => {
      const fn = options[name] || window[name];
      if (typeof fn === 'function') return fn.apply(window, args || []);
      return undefined;
    };

    bridge.send('VKWebAppInit')
      .then(() => console.log('[VK Adapter] Init OK'))
      .catch(error => console.warn('[VK Adapter] Init error', error));

    window.vkAuth = function vkAuth() {
      return bridge.send('VKWebAppGetUserInfo').then(user => {
        const name = user.first_name + ' ' + user.last_name;
        const email = 'vk_' + user.id + '@vk.com';
        sessionStorage.setItem('vk_user_id', user.id);
        sessionStorage.setItem('vk_user_name', name);
        sessionStorage.setItem('vk_user_photo', user.photo_200 || '');
        const nameEl = document.getElementById('user-chip-name');
        const avatarEl = document.getElementById('user-avatar-small');
        if (nameEl) nameEl.textContent = user.first_name;
        if (avatarEl) avatarEl.textContent = user.first_name[0].toUpperCase();
        return { name, email, id: user.id };
      });
    };

    const originalShowScreen = window.showScreen;
    if (typeof originalShowScreen === 'function') {
      window.showScreen = function showScreenWithVkAuth(id) {
        if (id === 'login') {
          window.vkAuth()
            .then(() => originalShowScreen('home'))
            .catch(() => originalShowScreen('login'));
          return;
        }
        originalShowScreen(id);
      };
    }

    bridge.subscribe(event => {
      if (event.detail.type === 'VKWebAppUpdateConfig') call('applyHostThemeScheme', [event.detail.data.scheme]);
      if (event.detail.type === 'VKWebAppViewRestore') call('loadTasks');
    });
    bridge.send('VKWebAppGetConfig')
      .then(config => call('applyHostThemeScheme', [config.scheme]))
      .catch(() => {});
    bridge.send('VKWebAppGetSafeAreaInsets')
      .then(result => {
        const insets = result.insets;
        document.documentElement.style.setProperty('--safe-top', insets.top + 'px');
        document.documentElement.style.setProperty('--safe-bottom', insets.bottom + 'px');
        document.documentElement.style.setProperty('--safe-left', insets.left + 'px');
        document.documentElement.style.setProperty('--safe-right', insets.right + 'px');
      })
      .catch(() => {
        document.documentElement.style.setProperty('--safe-top', '0px');
        document.documentElement.style.setProperty('--safe-bottom', '0px');
      });

    window.haptic = function haptic(type) {
      if (['success', 'warning', 'error'].includes(type)) {
        bridge.send('VKWebAppTapticNotificationOccurred', { type }).catch(() => {});
      } else {
        bridge.send('VKWebAppTapticImpactOccurred', { style: type || 'light' }).catch(() => {});
      }
    };
    document.addEventListener('click', event => {
      const button = event.target.closest('button,.nav-item,.nav-mic-v2,.task-row,.move-option');
      if (button) window.haptic('light');
    }, { passive: true });

    const deepScreens = ['task-detail', 'task-confirm', 'task-move', 'task-done', 'new-task', 'voice', 'profile', 'subscription'];
    const showScreenBeforeSwipeBack = window.showScreen;
    window.showScreen = function showScreenWithVkSwipeBack(id) {
      if (deepScreens.includes(id)) {
        bridge.send('VKWebAppDisableSwipeBack').catch(() => {});
      } else {
        bridge.send('VKWebAppEnableSwipeBack').catch(() => {});
      }
      if (typeof showScreenBeforeSwipeBack === 'function') showScreenBeforeSwipeBack(id);
    };

    bridge.subscribe(event => {
      if (event.detail.type === 'VKWebAppChangeFragment') call('goHome');
    });
    bridge.subscribe(event => {
      if (event.detail.type === 'VKWebAppKeyboardShown') {
        document.body.style.paddingBottom = event.detail.data.keyboardHeight + 'px';
        setTimeout(() => {
          if (document.activeElement) document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      if (event.detail.type === 'VKWebAppKeyboardHidden') document.body.style.paddingBottom = '';
    });

    const vkCache = {};
    window.vkStorageGet = function vkStorageGet(key) {
      return bridge.send('VKWebAppStorageGet', { keys: [key] }).then(result => {
        const item = result.keys.find(row => row.key === key);
        const value = item ? item.value : null;
        vkCache[key] = value;
        return value;
      });
    };
    window.vkStorageSet = function vkStorageSet(key, value) {
      vkCache[key] = value;
      return bridge.send('VKWebAppStorageSet', { key, value: String(value) });
    };

    const vkKeys = ['theme', 'pin', 'lang', 'notifications'];
    const setLocalItem = localStorage.setItem.bind(localStorage);
    const getLocalItem = localStorage.getItem.bind(localStorage);
    localStorage.setItem = function setItemWithVkStorage(key, value) {
      setLocalItem(key, value);
      if (vkKeys.includes(key)) window.vkStorageSet(key, value);
    };
    localStorage.getItem = function getItemWithVkStorage(key) {
      if (vkKeys.includes(key) && vkCache[key] !== undefined) return vkCache[key];
      return getLocalItem(key);
    };

    Promise.all(vkKeys.map(key => bridge.send('VKWebAppStorageGet', { keys: [key] })
      .then(result => {
        const item = result.keys.find(row => row.key === key);
        if (item && item.value) {
          vkCache[key] = item.value;
          setLocalItem(key, item.value);
        }
      })
      .catch(() => {})))
      .then(() => {
        const theme = vkCache.theme;
        if (theme) call('applyTheme', [theme]);
        console.log('[VK Adapter] Storage preloaded', vkCache);
      });

    window.openVKPayment = function openVKPayment(planId, amount) {
      const plan = call('getPlanConfig', [planId]) || { title: 'Premium', priceRub: amount, durationDays: 30 };
      return bridge.send('VKWebAppShowOrderBox', {
        type: 'item',
        item: JSON.stringify({ id: planId, title: plan.title }),
        amount: amount || plan.priceRub,
      }).then(result => {
        if (result && result.success) call('onPaymentSuccess', [plan]);
        return result;
      }).catch(error => {
        console.warn('[VK Pay]', error);
        throw error;
      });
    };

    bridge.send('VKWebAppGetClientVersion')
      .then(result => {
        if (result.platform === 'web' || window.innerWidth >= 680) {
          document.body.classList.add('vk-desktop');
          document.body.setAttribute('data-vk-platform', 'desktop');
        }
      })
      .catch(() => {
        if (window.innerWidth >= 680) document.body.classList.add('vk-desktop');
      });
    console.log('[VK Adapter] Initialized');
  }

  window.FourPlatform = {
    telegramApp,
    vkBridge,
    getTelegramBotUsername,
    getTelegramUser,
    getTelegramInitData,
    initTelegram,
    isVkMiniAppContext,
    getSurface,
    initVkMiniAppAdapter,
  };
})(window);
