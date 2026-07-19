(function initFourPlatform(window) {
  'use strict';

  const telegramApp = window.Telegram?.WebApp || null;
  const vkBridge = window.vkBridge || null;
  const telegramStartKeys = ['startapp', 'tgWebAppStartParam', 'telegram_start', 'telegramStartToken', 'startToken', 'tgAuth'];

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

  function getOAuthRedirectUri() {
    return window.location.origin + window.location.pathname;
  }

  function base64UrlFromBytes(bytes) {
    let binary = '';
    bytes.forEach(byte => { binary += String.fromCharCode(byte); });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function randomOAuthVerifier() {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return base64UrlFromBytes(bytes);
  }

  async function sha256Base64Url(value) {
    const data = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return base64UrlFromBytes(new Uint8Array(digest));
  }

  async function createOAuthPkce() {
    const verifier = randomOAuthVerifier();
    return { verifier, challenge: await sha256Base64Url(verifier) };
  }

  function rememberOAuthState(prefix, state, provider, redirectUri, codeVerifier) {
    if (!prefix || !state) return;
    sessionStorage.setItem(prefix + state, JSON.stringify({
      provider,
      redirectUri,
      codeVerifier,
      createdAt: Date.now(),
    }));
  }

  function consumeOAuthState(prefix, state) {
    if (!prefix || !state) return null;
    const key = prefix + state;
    const raw = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function getHashParams() {
    return new URLSearchParams((window.location.hash || '').replace(/^#/, '?'));
  }

  function normalizeReferralCode(value) {
    return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '').slice(0, 32);
  }

  function normalizeAttributionValue(value) {
    return String(value || '').trim().toLowerCase().slice(0, 120);
  }

  function getAttributionChannel(referralCode) {
    if (referralCode) return 'referral';
    if (getTelegramInitData()) return 'telegram_miniapp';
    if (vkBridge && isVkMiniAppContext()) return 'vk_miniapp';
    const params = getSearchParams();
    const source = normalizeAttributionValue(params.get('source') || params.get('utm_source'));
    if (source === 'telegram_bot' || source === 'tg_bot' || source === 'bot') return 'telegram_bot';
    if (source === 'telegram_miniapp' || source === 'tg_miniapp' || source === 'telegram') return 'telegram_miniapp';
    if (source === 'vk_miniapp' || source === 'vk') return 'vk_miniapp';
    return 'web_direct';
  }

  function getAcquisitionAttribution() {
    const search = getSearchParams();
    const hash = getHashParams();
    const referralCode = getReferralCodeFromLaunch() || '';
    const readParam = key => search.get(key) || hash.get(key) || '';
    const attribution = {
      acquisition_channel: getAttributionChannel(referralCode),
      acquisition_source: normalizeAttributionValue(readParam('utm_source') || readParam('source')),
      acquisition_campaign: normalizeAttributionValue(readParam('utm_campaign')),
      acquisition_content: normalizeAttributionValue(readParam('utm_content')),
      acquisition_referral_code: referralCode,
    };
    const medium = normalizeAttributionValue(readParam('utm_medium'));
    const term = normalizeAttributionValue(readParam('utm_term'));
    if (medium) attribution.acquisition_medium = medium;
    if (term) attribution.acquisition_term = term;
    Object.keys(attribution).forEach(key => {
      if (!attribution[key]) delete attribution[key];
    });
    return attribution;
  }

  function getReferralCodeFromLaunch() {
    const fromSearch = getSearchParams();
    const fromHash = getHashParams();
    const keys = ['ref', 'referral', 'invite'];
    for (const key of keys) {
      const value = fromSearch.get(key) || fromHash.get(key);
      const normalized = normalizeReferralCode(value);
      if (normalized) return normalized;
    }
    return '';
  }

  function savePendingReferralCode(storageKey, code) {
    const normalized = normalizeReferralCode(code);
    if (!storageKey || !normalized) return;
    try {
      localStorage.setItem(storageKey, normalized);
    } catch (error) {}
  }

  function getPendingReferralCode(storageKey) {
    if (!storageKey) return '';
    try {
      return normalizeReferralCode(localStorage.getItem(storageKey) || '');
    } catch (error) {
      return '';
    }
  }

  function clearPendingReferralCode(storageKey) {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {}
  }

  function capturePendingReferralCode(storageKey) {
    const code = getReferralCodeFromLaunch();
    if (code) savePendingReferralCode(storageKey, code);
  }

  function buildReferralLink(code) {
    const normalized = normalizeReferralCode(code);
    if (!normalized) return '';
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('ref', normalized);
    return url.toString();
  }

  const dialogReturnFocus = new Map();

  function getDialogFocusable(root) {
    if (!root) return [];
    return Array.from(root.querySelectorAll('a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter(element => element.offsetParent !== null || element === document.activeElement);
  }

  function openAccessibleDialog(dialogId, focusSelector) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    dialogReturnFocus.set(dialogId, document.activeElement);
    dialog.setAttribute('aria-hidden', 'false');
    setTimeout(() => {
      const target = focusSelector ? dialog.querySelector(focusSelector) : null;
      const focusable = target || getDialogFocusable(dialog)[0] || dialog.querySelector('[tabindex="-1"]') || dialog;
      focusable?.focus?.();
    }, 0);
  }

  function closeAccessibleDialog(dialogId, options) {
    const dialog = document.getElementById(dialogId);
    if (!dialog) return;
    dialog.setAttribute('aria-hidden', 'true');
    const shouldRestore = !options || options.restoreFocus !== false;
    const previous = dialogReturnFocus.get(dialogId);
    dialogReturnFocus.delete(dialogId);
    if (shouldRestore && previous && document.contains(previous)) {
      setTimeout(() => previous.focus?.(), 0);
    }
  }

  function handleAccessibleDialogKeydown(event, dialogId, closeFn) {
    const dialog = document.getElementById(dialogId);
    if (!dialog || dialog.getAttribute('aria-hidden') === 'true') return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeFn?.();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = getDialogFocusable(dialog);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
  }

  function togglePasswordVisibility(fieldId) {
    const input = document.getElementById(fieldId);
    if (!input) return false;
    input.type = input.type === 'password' ? 'text' : 'password';
    return true;
  }

  function shouldHandleEnterSubmit(event) {
    return !!(event && event.key === 'Enter' && event.target?.matches('input'));
  }

  function setFormFieldError(fieldId, message, invalidClass) {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + '-error');
    const hasError = !!message;
    if (input) {
      input.setAttribute('aria-invalid', hasError ? 'true' : 'false');
      if (invalidClass) input.classList.toggle(invalidClass, hasError);
    }
    if (error) {
      error.textContent = message || '';
      error.classList.toggle('show', hasError);
    }
  }

  function clearFormFieldError(fieldId, invalidClass) {
    setFormFieldError(fieldId, '', invalidClass);
  }

  function clearFormErrors(fieldIds, invalidClass) {
    (fieldIds || []).forEach(fieldId => clearFormFieldError(fieldId, invalidClass));
  }

  function bindClick(id, handler) {
    const el = document.getElementById(id);
    if (!el) return false;
    el.addEventListener('click', handler);
    return true;
  }

  function bindOAuthLoginButtons(bind = bindClick) {
    const vkButton = document.getElementById('login-vk-id-btn');
    const yandexButton = document.getElementById('login-yandex-id-btn');
    const safeStartOAuth = window.startOAuthLogin;
    if (vkButton && typeof safeStartOAuth === 'function') {
      bind(vkButton.id, () => safeStartOAuth('vk_id'));
    }
    if (yandexButton && typeof safeStartOAuth === 'function') {
      bind(yandexButton.id, () => safeStartOAuth('yandex'));
    }
    return true;
  }

  function bindTaskUiHandlers(bind = bindClick) {
    const aiMemoryForgetBtn = document.getElementById('ai-memory-forget-btn');
    if (aiMemoryForgetBtn) bind(aiMemoryForgetBtn.id, handleForgetAllAiFacts);

    const detailContactBtn = document.getElementById('detail-contact-btn');
    if (detailContactBtn) bind(detailContactBtn.id, openDetailContactPanel);

    const detailPersonRow = document.getElementById('detail-person-row');
    if (detailPersonRow) {
      detailPersonRow.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'detail-contact-btn') return;
        openDetailPersonPicker();
      });
      detailPersonRow.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openDetailPersonPicker();
        }
      });
    }

    const contactTelegramBtn = document.getElementById('contact-panel-telegram-btn');
    if (contactTelegramBtn) bind(contactTelegramBtn.id, contactViaTelegram);
    const contactWriteBtn = document.getElementById('contact-panel-write-btn');
    if (contactWriteBtn) bind(contactWriteBtn.id, contactViaWrite);
    const contactCancelBtn = document.getElementById('contact-panel-cancel-btn');
    if (contactCancelBtn) bind(contactCancelBtn.id, closeContactPanel);

    const quickAddSubmitBtn = document.getElementById('quick-add-submit');
    if (quickAddSubmitBtn) bind(quickAddSubmitBtn.id, submitQuickAdd);
    const quickAddCancelBtn = document.getElementById('quick-add-cancel');
    if (quickAddCancelBtn) bind(quickAddCancelBtn.id, closeQuickAdd);

    const taskMoveOptions = document.getElementById('task-move');
    if (taskMoveOptions) {
      taskMoveOptions.addEventListener('click', event => {
        const option = event.target.closest('.move-option[data-move-kind]');
        if (option && option.dataset.moveKind) {
          const kind = option.dataset.moveKind;
          if (typeof moveTaskTo === 'function') moveTaskTo(kind);
          return;
        }
        const custom = event.target.closest('.move-option[data-move-action="open-custom-date"]');
        if (custom && typeof openCustomDate === 'function') {
          openCustomDate();
        }
      });
    }

    const moveTaskConfirm = document.getElementById('confirm-task-move-btn');
    if (moveTaskConfirm) bind(moveTaskConfirm.id, confirmMoveTask);

    const taskDetailActions = document.getElementById('task-detail-actions');
    if (taskDetailActions) {
      taskDetailActions.addEventListener('click', event => {
        const button = event.target.closest('[data-detail-action]');
        if (!button) return;
        const action = button.dataset.detailAction;
        if (action === 'open-task-move' && typeof openTaskMove === 'function') {
          openTaskMove(currentTaskId);
          return;
        }
        if (action === 'enter-edit-mode' && typeof enterEditMode === 'function') {
          enterEditMode();
          return;
        }
        if (action === 'complete' && typeof completeTask === 'function') {
          completeTask(currentTaskId);
          return;
        }
      });
    }

    const taskDetailTabs = document.getElementById('task-detail-tabs');
    if (taskDetailTabs) {
      taskDetailTabs.addEventListener('click', event => {
        const button = event.target.closest('[data-detail-tab]');
        if (!button) return;
        const tabName = button.dataset.detailTab;
        if (!tabName || typeof switchDetailTab !== 'function') return;
        switchDetailTab(tabName, button);
      });
    }

    const detailQuickDeadline = document.getElementById('detail-quick-deadline');
    if (detailQuickDeadline) {
      detailQuickDeadline.addEventListener('click', event => {
        const button = event.target.closest('button[data-detail-deadline-kind]');
        if (!button) return;
        const kind = button.dataset.detailDeadlineKind;
        if (!kind || typeof setQuickDeadline !== 'function') return;
        setQuickDeadline(kind);
      });
    }

    const detailDeadlineInput = document.getElementById('detail-time-input');
    if (detailDeadlineInput) {
      detailDeadlineInput.addEventListener('change', event => {
        const value = event?.target?.value || '';
        if (typeof setDetailDeadline === 'function') setDetailDeadline(value);
      });
    }

    const detailStatusSelect = document.getElementById('detail-status-select');
    if (detailStatusSelect) {
      detailStatusSelect.addEventListener('change', event => {
        if (typeof setDetailStatus === 'function') setDetailStatus(event?.target?.value || 'active');
      });
    }

    const detailPrioritySelect = document.getElementById('detail-priority-select');
    if (detailPrioritySelect) {
      detailPrioritySelect.addEventListener('change', event => {
        if (typeof setDetailPriority === 'function') setDetailPriority(event?.target?.value || 'normal');
      });
    }

    const detailReminderSelect = document.getElementById('detail-reminder');
    if (detailReminderSelect) {
      detailReminderSelect.addEventListener('change', event => {
        if (typeof setDetailReminder === 'function') setDetailReminder(event?.target?.value || 'none');
      });
    }

    const detailDirectionInput = document.getElementById('detail-direction');
    if (detailDirectionInput) {
      detailDirectionInput.addEventListener('input', event => {
        const value = event?.target?.value || '';
        if (typeof setDetailDirectionLabel === 'function') {
          setDetailDirectionLabel(value);
        }
      });
    }

    const detailChecklistInput = document.getElementById('detail-checklist-input');
    if (detailChecklistInput) {
      detailChecklistInput.addEventListener('keydown', event => {
        if (event && event.key === 'Enter') {
          event.preventDefault();
          if (typeof addDetailChecklistItem === 'function') {
            addDetailChecklistItem();
          }
        }
      });
    }

    const taskDetailActionArea = document.getElementById('task-detail');
    if (taskDetailActionArea) {
      taskDetailActionArea.addEventListener('click', event => {
        const button = event.target.closest('[data-detail-action]');
        if (!button) return;
        const action = button.dataset.detailAction;
        if (action === 'back-to-home' && typeof goHome === 'function') {
          goHome();
          return;
        }
        if (action === 'edit-title' && typeof makeDetailEditable === 'function') {
          makeDetailEditable(button);
          return;
        }
        if (action === 'decompose-task' && typeof decomposeCurrentTask === 'function') {
          decomposeCurrentTask();
          return;
        }
        if (action === 'add-checklist-item' && typeof addDetailChecklistItem === 'function') {
          addDetailChecklistItem();
          return;
        }
        if (action === 'toggle-tag-input' && typeof toggleTagInput === 'function') {
          toggleTagInput();
          return;
        }
        if (action === 'add-tag-from-input' && typeof addTagFromInput === 'function') {
          addTagFromInput();
          return;
        }
        if (action === 'set-reminder-quick' && typeof setReminder === 'function') {
          const reminder = button.dataset.detailReminder || '';
          if (reminder) {
            setReminder(reminder, button);
          }
          return;
        }
        if (action === 'open-task-menu' && typeof openTaskMenu === 'function') {
          openTaskMenu();
          return;
        }
      });
    }

    const detailTagInput = document.getElementById('detail-tag-input');
    if (detailTagInput) {
      detailTagInput.addEventListener('keydown', event => {
        if (event && event.key === 'Enter') {
          event.preventDefault();
          if (typeof addTagFromInput === 'function') {
            addTagFromInput();
          }
        }
      });
    }

    const taskAdviceBtn = document.getElementById('detail-load-advice-btn');
    if (taskAdviceBtn) bind(taskAdviceBtn.id, loadTaskAdvice);
    const taskCommentSendBtn = document.getElementById('detail-comment-send-btn');
    if (taskCommentSendBtn) bind(taskCommentSendBtn.id, addDetailComment);

    const calendarScreen = document.getElementById('calendar');
    if (calendarScreen) {
      calendarScreen.addEventListener('click', event => {
        const calAction = event.target.closest('[data-cal-action]');
        if (calAction) {
          const action = calAction.dataset.calAction;
          if (action === 'back-home' && typeof goHome === 'function') {
            goHome();
          }
          return;
        }

        const calTab = event.target.closest('[data-cal-view]');
        if (calTab) {
          const view = calTab.dataset.calView;
          if (view && typeof setCalView === 'function') {
            setCalView(view, calTab);
          }
          return;
        }

        const navBtn = event.target.closest('[data-cal-nav]');
        if (navBtn) {
          const delta = Number.parseInt(navBtn.dataset.calNav || '0', 10);
          if (!Number.isNaN(delta) && typeof calNav === 'function') {
            calNav(delta);
          }
          return;
        }

        const calTaskRow = event.target.closest('[data-cal-task-id]');
        if (calTaskRow) {
          const taskId = calTaskRow.dataset.calTaskId;
          if (taskId && typeof openTaskById === 'function') {
            openTaskById(taskId, 0);
          }
        }
      });
    }

    const statisticsScreen = document.getElementById('statistics');
    if (statisticsScreen) {
      statisticsScreen.addEventListener('click', event => {
        const actionBtn = event.target.closest('[data-stats-action]');
        if (!actionBtn) return;
        const action = actionBtn.dataset.statsAction;
        if (action === 'back-home' && typeof goHome === 'function') {
          goHome();
          return;
        }
        if (action === 'open-promises' && typeof openPromiseList === 'function') {
          openPromiseList();
          return;
        }
        if (action === 'open-active-tasks' && typeof openActiveTaskList === 'function') {
          openActiveTaskList();
        }
      });
    }

    const homeScreen = document.getElementById('home');
    if (homeScreen) {
      const assistantBtn = document.getElementById('home-nav-voice');
      if (assistantBtn && !assistantBtn.dataset.longPressInit) {
        assistantBtn.dataset.longPressInit = '1';
        let pressTimer = null;
        const clearPressTimer = () => {
          if (pressTimer) {
            clearTimeout(pressTimer);
            pressTimer = null;
          }
        };
        assistantBtn.addEventListener('pointerdown', event => {
          if (event.pointerType === 'mouse' && event.button !== 0) return;
          assistantBtn.dataset.longPressTriggered = '0';
          clearPressTimer();
          pressTimer = setTimeout(() => {
            assistantBtn.dataset.longPressTriggered = '1';
            if (typeof openVoice === 'function') openVoice();
          }, 550);
        });
        ['pointerup', 'pointerleave', 'pointercancel'].forEach(eventName => {
          assistantBtn.addEventListener(eventName, clearPressTimer);
        });
      }

      homeScreen.addEventListener('click', event => {
        const actionBtn = event.target.closest('[data-home-action]');
        if (actionBtn) {
          const action = actionBtn.dataset.homeAction;
          if (action === 'open-profile' && typeof openProfile === 'function') {
            openProfile();
            return;
          }
          if (action === 'open-notifications' && typeof openNotifications === 'function') {
            openNotifications();
            return;
          }
          if (action === 'open-focus-list' && typeof openFocusList === 'function') {
            openFocusList();
            return;
          }
          if (action === 'start-with-first-task' && typeof plannerStartWithFirstTask === 'function') {
            plannerStartWithFirstTask();
            return;
          }
          if (action === 'toggle-planner-compact' && typeof togglePlannerCompact === 'function') {
            togglePlannerCompact();
            return;
          }
          if (action === 'open-done-list' && typeof openDoneList === 'function') {
            openDoneList();
            return;
          }
          if (action === 'open-active-list' && typeof openActiveTaskList === 'function') {
            openActiveTaskList();
            return;
          }
          if (action === 'open-promise-list' && typeof openPromiseList === 'function') {
            openPromiseList();
            return;
          }
          if (action === 'open-statistics' && typeof openStatistics === 'function') {
            openStatistics();
            return;
          }
          if (action === 'toggle-all-tasks' && typeof toggleAllTasks === 'function') {
            toggleAllTasks();
          }
          return;
        }

        const plannerSectionBtn = event.target.closest('[data-home-planner-section]');
        if (plannerSectionBtn) {
          const section = plannerSectionBtn.dataset.homePlannerSection;
          if (section && typeof openHomePlannerSection === 'function') {
            openHomePlannerSection(section);
          }
          return;
        }

        const navActionBtn = event.target.closest('[data-home-nav-action]');
        if (navActionBtn) {
          if (navActionBtn.dataset.longPressTriggered === '1') {
            navActionBtn.dataset.longPressTriggered = '0';
            return;
          }
          const action = navActionBtn.dataset.homeNavAction;
          if (action === 'today' && typeof goHome === 'function') {
            goHome();
          } else if ((action === 'calendar' || action === 'cal') && typeof openCalendar === 'function') {
            openCalendar();
          } else if (action === 'brain' && typeof openAsk === 'function') {
            openAsk();
          }
          return;
        }

        const tabBtn = event.target.closest('[data-home-filter]');
        if (!tabBtn) return;
        const filter = tabBtn.dataset.homeFilter;
        if (filter && typeof setHomeFilter === 'function') {
          setHomeFilter(filter, tabBtn);
        }
      });
    }

    const notificationsScreen = document.getElementById('notifications');
    if (notificationsScreen) {
      notificationsScreen.addEventListener('click', event => {
        const backAction = event.target.closest('[data-notifs-action]');
        if (backAction) {
          const action = backAction.dataset.notifsAction;
          if (action === 'back-home' && typeof goHome === 'function') {
            goHome();
          }
          return;
        }
        const filterBtn = event.target.closest('[data-notifs-filter]');
        if (!filterBtn) return;
        const filter = filterBtn.dataset.notifsFilter;
        if (filter && typeof filterNotifs === 'function') {
          filterNotifs(filter, filterBtn);
        }
      });
    }

    const globalNav = document.getElementById('global-nav');
    if (globalNav) {
      globalNav.addEventListener('click', event => {
        const navActionBtn = event.target.closest('[data-global-nav-action]');
        if (!navActionBtn) return;
        const action = navActionBtn.dataset.globalNavAction;
        if (action === 'chats' && typeof openChats === 'function') {
          openChats();
        } else if ((action === 'calendar' || action === 'cal') && typeof openCalendar === 'function') {
          openCalendar();
        } else if (action === 'voice' && typeof openVoice === 'function') {
          openVoice();
        } else if (action === 'brain' && typeof openAsk === 'function') {
          openAsk();
        }
      });
    }

    const aiMemoryRows = document.getElementById('ai-memory-list');
    if (aiMemoryRows) {
      aiMemoryRows.addEventListener('click', function (e) {
        const btn = e.target.closest('button.ai-memory-delete-btn');
        if (!btn || !btn.dataset.factId) return;
        deleteAiMemoryFact(btn.dataset.factId);
      });
    }

    const quickAddOverlay = document.getElementById('quick-add-overlay');
    if (quickAddOverlay) {
      quickAddOverlay.addEventListener('keydown', (event) => handleAccessibleDialogKeydown(event, 'quick-add-overlay', closeQuickAdd));
    }

    const contactPanelOverlay = document.getElementById('contact-panel-overlay');
    if (contactPanelOverlay) {
      contactPanelOverlay.addEventListener('keydown', (event) => handleAccessibleDialogKeydown(event, 'contact-panel-overlay', closeContactPanel));
    }

    return true;
  }

  function bindProfileMenuItems(bind = bindClick) {
    const profileMenu = document.querySelector('#profile .profile-menu');
    const profileItems = profileMenu
      ? [...profileMenu.querySelectorAll('.profile-item')].filter(item => !item.hasAttribute('onclick'))
      : [];
    const profileSections = ['subscription', 'notif-settings', 'language-settings', 'security', 'privacy-center', 'support'];
    profileItems.forEach((item, index) => {
      if (profileSections[index] && item?.id) {
        bind(item.id, () => window.showSubScreen(profileSections[index]));
      } else if (profileSections[index] && item) {
        item.addEventListener('click', () => window.showSubScreen(profileSections[index]));
      }
    });

    const themeItem = document.querySelector('#profile .profile-menu:nth-child(2) .profile-item');
    if (themeItem) {
      themeItem.addEventListener('click', () => window.showSubScreen('theme-settings'));
    }
    return true;
  }

  function bindAuthA11yHandlers(bind = bindClick) {
    bind('login-submit-btn', doLogin);
    bind('reg-submit-btn', doRegister);
    bind('forgot-submit-btn', doForgotPassword);
    bind('reset-submit-btn', doResetPassword);
    bind('show-forgot-btn', showForgotPassword);
    bind('forgot-back-btn', () => showScreen('login'));
    bind('login-telegram-btn', () => loginWithTelegram());

    document.querySelectorAll('[data-toggle-pass]').forEach(btn => {
      btn.addEventListener('click', () => togglePass(btn.dataset.togglePass));
    });

    document.querySelectorAll('[data-auth-tab]').forEach(tab => {
      tab.addEventListener('click', () => switchAuthTab(tab.dataset.authTab, true));
      tab.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = tab.dataset.authTab === 'login' ? 'register' : 'login';
        switchAuthTab(next, true);
      });
    });

    AUTH_FIELD_IDS.forEach(fieldId => {
      const input = document.getElementById(fieldId);
      if (input) input.addEventListener('input', () => clearAuthFieldError(fieldId));
    });

    const loginForm = document.getElementById('form-login');
    if (loginForm) loginForm.addEventListener('keydown', event => {
      if (PLATFORM.shouldHandleEnterSubmit(event)) submitLoginOnEnter(event);
    });
    const registerForm = document.getElementById('form-register');
    if (registerForm) registerForm.addEventListener('keydown', event => {
      if (PLATFORM.shouldHandleEnterSubmit(event)) {
        event.preventDefault();
        doRegister();
      }
    });
    const forgotScreen = document.getElementById('forgot-password');
    if (forgotScreen) forgotScreen.addEventListener('keydown', event => {
      if (PLATFORM.shouldHandleEnterSubmit(event)) {
        event.preventDefault();
        doForgotPassword();
      }
    });
    const resetScreen = document.getElementById('reset-password');
    if (resetScreen) resetScreen.addEventListener('keydown', event => {
      if (PLATFORM.shouldHandleEnterSubmit(event)) {
        event.preventDefault();
        doResetPassword();
      }
    });

    return true;
  }

  function focusFirstInvalid(fieldIds) {
    const invalid = (fieldIds || [])
      .map(fieldId => document.getElementById(fieldId))
      .find(element => element && element.getAttribute('aria-invalid') === 'true');
    if (invalid) invalid.focus();
  }

  function getTelegramStartTokenFromLaunch() {
    const initStart = telegramApp?.initDataUnsafe?.start_param;
    if (initStart) return String(initStart).trim();

    const fromSearch = getSearchParams();
    const fromHash = getHashParams();
    for (const key of telegramStartKeys) {
      const value = fromSearch.get(key) || fromHash.get(key);
      if (value) return String(value).trim();
    }
    return '';
  }

  function getTelegramReturnUrl() {
    try {
      const url = new URL(window.location.href);
      telegramStartKeys.forEach(key => {
        url.searchParams.delete(key);
        url.hash = url.hash
          .replace(new RegExp('([#&?])' + key + '=[^&]*&?', 'g'), '$1')
          .replace(/[?&]$/, '');
      });
      return url.toString();
    } catch (error) {
      return window.location.origin + window.location.pathname;
    }
  }

  function saveTelegramPendingStart(storageKey, startToken) {
    if (!storageKey || !startToken) return;
    try {
      localStorage.setItem(storageKey, startToken);
    } catch (error) {}
  }

  function clearTelegramPendingStart(storageKey) {
    if (!storageKey) return;
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {}
  }

  function getTelegramPendingStart(storageKey) {
    if (!storageKey) return '';
    try {
      return (localStorage.getItem(storageKey) || '').trim();
    } catch (error) {
      return '';
    }
  }

  function cleanTelegramAuthUrl() {
    try {
      const url = new URL(window.location.href);
      let changed = false;
      telegramStartKeys.forEach(key => {
        if (url.searchParams.has(key)) {
          url.searchParams.delete(key);
          changed = true;
        }
      });
      if (changed) window.history.replaceState(null, '', url.pathname + (url.search || '') + (url.hash || ''));
    } catch (error) {}
  }

  function buildTelegramBotLoginUrl(startToken, botUsername) {
    const bot = String(botUsername || getTelegramBotUsername() || 'Denzel89bot').replace(/^@/, '').trim() || 'Denzel89bot';
    const base = 'https://t.me/' + encodeURIComponent(bot);
    return startToken ? base + '?start=' + encodeURIComponent(startToken) : base;
  }

  function openTelegramLoginUrl(url) {
    const inTelegramMiniApp = !!getTelegramInitData();
    if (inTelegramMiniApp && telegramApp?.openTelegramLink && /^https:\/\/t\.me\//i.test(url)) {
      try {
        const result = telegramApp.openTelegramLink(url);
        if (result && typeof result.catch === 'function') {
          result.catch(() => { window.location.href = url; });
        }
        return true;
      } catch (error) {
        console.warn('openTelegramLink failed, falling back to web link', error);
      }
    }
    window.location.href = url;
    return true;
  }

  function searchLike(value) {
    return String(value || '').replace(/^#/, '?');
  }

  async function getVkLaunchParams() {
    const bridge = window.vkBridge || vkBridge;
    const candidates = [];
    if (window.location.search) candidates.push(window.location.search);
    if (window.location.hash) candidates.push(searchLike(window.location.hash));
    try {
      if (bridge?.send) {
        const bridgeParams = await bridge.send('VKWebAppGetLaunchParams');
        const params = new URLSearchParams();
        Object.entries(bridgeParams || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) params.set(key, String(value));
        });
        const qs = params.toString();
        if (qs) candidates.push('?' + qs);
      }
    } catch (error) {}
    return candidates.find(value => value.includes('sign=') && value.includes('vk_user_id')) ||
      candidates.find(value => value.includes('vk_')) ||
      '';
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
        const keyboardHeight = Number(event.detail?.data?.keyboardHeight || 0);
        document.documentElement.style.setProperty('--app-keyboard-offset', `${Math.max(0, keyboardHeight)}px`);
        setTimeout(() => {
          if (document.activeElement) document.activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      if (event.detail.type === 'VKWebAppKeyboardHidden') document.documentElement.style.setProperty('--app-keyboard-offset', '0px');
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
    getOAuthRedirectUri,
    createOAuthPkce,
    rememberOAuthState,
    consumeOAuthState,
    normalizeReferralCode,
    getAcquisitionAttribution,
    getReferralCodeFromLaunch,
    savePendingReferralCode,
    getPendingReferralCode,
    clearPendingReferralCode,
    capturePendingReferralCode,
    buildReferralLink,
    getDialogFocusable,
    openAccessibleDialog,
    closeAccessibleDialog,
    handleAccessibleDialogKeydown,
    isValidEmail,
    togglePasswordVisibility,
    shouldHandleEnterSubmit,
    bindClick,
    bindOAuthLoginButtons,
    bindAuthA11yHandlers,
    bindTaskUiHandlers,
    bindProfileMenuItems,
    setFormFieldError,
    clearFormFieldError,
    clearFormErrors,
    focusFirstInvalid,
    getTelegramStartTokenFromLaunch,
    getTelegramReturnUrl,
    saveTelegramPendingStart,
    clearTelegramPendingStart,
    getTelegramPendingStart,
    cleanTelegramAuthUrl,
    buildTelegramBotLoginUrl,
    openTelegramLoginUrl,
    getVkLaunchParams,
    initVkMiniAppAdapter,
  };
})(window);
