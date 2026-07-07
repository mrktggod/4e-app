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

  window.FourPlatform = {
    telegramApp,
    vkBridge,
    getTelegramBotUsername,
    getTelegramUser,
    getTelegramInitData,
    initTelegram,
    isVkMiniAppContext,
    getSurface,
  };
})(window);
