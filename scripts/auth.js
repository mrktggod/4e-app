(function initAuthHelpers(window){
    const OAUTH_PENDING_PREFIX='chetam_oauth_pending_';
  const REF_PENDING_K='pendingReferralCode';

  function getOAuthRedirectUri(){
    return window.PLATFORM?.getOAuthRedirectUri ? window.PLATFORM.getOAuthRedirectUri() : window.location.origin + window.location.pathname;
  }

  async function createOAuthPkce(){
    if(!window.PLATFORM?.createOAuthPkce) throw new Error('platform adapter unavailable');
    return window.PLATFORM.createOAuthPkce();
  }

  function rememberOAuthState(state, provider, redirectUri, codeVerifier){
    if(window.PLATFORM?.rememberOAuthState) window.PLATFORM.rememberOAuthState(OAUTH_PENDING_PREFIX,state,provider,redirectUri,codeVerifier);
  }

  function consumeOAuthState(state){
    return window.PLATFORM?.consumeOAuthState ? window.PLATFORM.consumeOAuthState(OAUTH_PENDING_PREFIX,state) : null;
  }

  async function startOAuthLogin(provider){
    const map={
      vk_id:{path:'/auth/vk-id/start', label:'VK ID'},
      yandex:{path:'/auth/yandex-id/start', label:'Яндекс ID'}
    };
    const cfg=map[provider];
    if(!cfg || !window.WORKER){
      showToast && showToast('Сервис входа временно недоступен');
      return;
    }
    const btn=document.querySelector('[data-oauth-provider="'+provider+'"]') || document.getElementById(provider==='vk_id'?'login-vk-id-btn':'login-yandex-id-btn');
    const prev=btn ? btn.textContent : '';
    if(btn){
      btn.disabled=true;
      btn.textContent='Открываем...';
    }
    try{
      const state='oauth_'+Date.now()+'_'+Math.random().toString(36).slice(2);
      const redirectUri=getOAuthRedirectUri();
      const pkce=await createOAuthPkce();
      const startUrl=window.WORKER+cfg.path+'?redirectUri='+encodeURIComponent(redirectUri)+'&state='+encodeURIComponent(state)+'&codeChallenge='+encodeURIComponent(pkce.challenge);
      const r=await withTimeout(fetch(startUrl,{headers:authHeaders()}),10000);
      const d=await readJsonSafe(r);
      if(!r.ok||!d.ok||!d.authUrl){
        showToast(d.error||cfg.label+' пока не настроен');
        return;
      }
      rememberOAuthState(d.state||state, provider, d.redirectUri||redirectUri, pkce.verifier);
      window.location.href=d.authUrl;
    }catch(e){
      showToast('Не удалось открыть вход через '+cfg.label);
    }finally{
      if(btn){
        btn.disabled=false;
        btn.textContent=prev;
      }
    }
  }

  async function processOAuthCallback(){
    const params=new URLSearchParams(window.location.search);
    const code=params.get('code');
    const state=params.get('state');
    if(!code||!state) return false;
    const pending=consumeOAuthState(state);
    if(!pending||!pending.provider){
      showToast('Сессия входа истекла. Попробуйте ещё раз');
      return false;
    }
    window.history.replaceState({},'',window.location.pathname);
    const path=pending.provider==='yandex'?'/auth/yandex-id':'/auth/vk-id';
    try{
      showScreen('login');
      const pendingRef=getPendingReferralCode();
      const r=await withTimeout(fetch(window.WORKER+path,{method:'POST',headers:authHeaders(),body:JSON.stringify({code,redirectUri:pending.redirectUri||getOAuthRedirectUri(),codeVerifier:pending.codeVerifier||'',attribution:getAcquisitionAttribution(),...(pendingRef?{ref:pendingRef}:{})})}),15000);
      const d=await readJsonSafe(r);
      if(d.ok&&d.token){
        setLegacyToken(d.token);
        localStorage.removeItem(window.LOGOUT_K);
        window.currentUser=d.user;
        window.chatId='user_'+window.currentUser.id;
        clearPendingReferralCode();
        applyUserInfo();
        localStorage.setItem(window.ONBOARD_K,'1');
        showScreen('home');
        loadTasks();
        if(typeof showAccountMergeToast==='function') showAccountMergeToast(d);
        if(!d.accountMerged) showToast(d.isNew?'Добро пожаловать! 30 дней Premium 🎁':'С возвращением!');
        return true;
      }
      showToast(d.error||'Ошибка входа через сервис');
    }catch(e){
      showToast('Нет соединения');
    }
    return false;
  }

  function isVkMiniAppContext(){
    if(window.PLATFORM?.isVkMiniAppContext) return window.PLATFORM.isVkMiniAppContext();
    const raw=[window.location.search,window.location.hash].filter(Boolean).join('&');
    return /(?:^|[?#&])vk_/.test(raw) || /(?:^|[?#&])sign=/.test(raw);
  }

  function getTelegramStartTokenFromLaunch(){
    return window.PLATFORM?.getTelegramStartTokenFromLaunch ? window.PLATFORM.getTelegramStartTokenFromLaunch() : '';
  }

  function normalizeReferralCode(value){
    return window.PLATFORM?.normalizeReferralCode ? window.PLATFORM.normalizeReferralCode(value) : String(value||'').trim().toLowerCase().replace(/[^a-z0-9_-]+/g,'').slice(0,32);
  }

  function getReferralCodeFromLaunch(){
    return window.PLATFORM?.getReferralCodeFromLaunch ? window.PLATFORM.getReferralCodeFromLaunch() : '';
  }

  function getAcquisitionAttribution(){
    try {
      return window.PLATFORM?.getAcquisitionAttribution ? window.PLATFORM.getAcquisitionAttribution() : {};
    } catch (error) {
      return {};
    }
  }

  function savePendingReferralCode(code){
    if(window.PLATFORM?.savePendingReferralCode) window.PLATFORM.savePendingReferralCode(REF_PENDING_K,code);
  }

  function getPendingReferralCode(){
    return window.PLATFORM?.getPendingReferralCode ? window.PLATFORM.getPendingReferralCode(REF_PENDING_K) : '';
  }

  function clearPendingReferralCode(){
    if(window.PLATFORM?.clearPendingReferralCode) window.PLATFORM.clearPendingReferralCode(REF_PENDING_K);
  }

  function capturePendingReferralCode(){
    if(window.PLATFORM?.capturePendingReferralCode) window.PLATFORM.capturePendingReferralCode(REF_PENDING_K);
  }

  function buildReferralLink(){
    return window.PLATFORM?.buildReferralLink ? window.PLATFORM.buildReferralLink(window.currentUser?.referralCode||'') : '';
  }

  async function copyReferralLink(){
    const link=buildReferralLink();
    if(!link){
      showToast('Ссылка появится после входа');
      return;
    }
    try{
      await navigator.clipboard?.writeText(link);
      showToast('Ссылка скопирована');
    }catch(e){
      showToast('Не удалось скопировать');
    }
  }

  function getTelegramReturnUrl(){
    return window.PLATFORM?.getTelegramReturnUrl ? window.PLATFORM.getTelegramReturnUrl() : window.location.origin+window.location.pathname;
  }

  const AUTH_FIELD_IDS=['login-email','login-pass','reg-name','reg-email','reg-pass','forgot-email','reset-pass','reset-pass2'];
  const AUTH_INVALID_CLASS='login-input--invalid';

  function isValidEmail(email){
    return window.PLATFORM?.isValidEmail ? window.PLATFORM.isValidEmail(email) : String(email||'').trim().includes('@');
  }

  function setAuthFieldError(fieldId, message){
    if(window.PLATFORM?.setFormFieldError){
      window.PLATFORM.setFormFieldError(fieldId, message, AUTH_INVALID_CLASS);
      return;
    }
    const input = document.getElementById(fieldId);
    if(input){
      input.classList.toggle(AUTH_INVALID_CLASS,!!message);
      input.setAttribute('aria-invalid',String(!!message));
    }
    const err = input?.parentElement?.querySelector('.form-error');
    if(err) {
      err.textContent = message || '';
      err.setAttribute('role','alert');
      err.setAttribute('aria-live','polite');
    }
  }

  function clearAuthFieldError(fieldId){
    setAuthFieldError(fieldId, '');
  }

  function clearAuthErrors(fieldIds){
    const ids = Array.isArray(fieldIds) ? fieldIds : AUTH_FIELD_IDS;
    if(window.PLATFORM?.clearFormErrors){
      window.PLATFORM.clearFormErrors(ids, AUTH_INVALID_CLASS);
      return;
    }
    for(const fieldId of ids){
      clearAuthFieldError(fieldId);
    }
  }

  function focusFirstInvalid(fieldIds){
    const ids = Array.isArray(fieldIds) ? fieldIds : AUTH_FIELD_IDS;
    if(window.PLATFORM?.focusFirstInvalid){
      return window.PLATFORM.focusFirstInvalid(ids);
    }
    for(const fieldId of ids){
      const input = document.getElementById(fieldId);
      if(input?.classList?.contains(AUTH_INVALID_CLASS)){
        input.focus();
        return;
      }
    }
  }

  window.authStartOAuthLogin = startOAuthLogin;
  window.startOAuthLogin = startOAuthLogin;
  window.authProcessOAuthCallback = processOAuthCallback;
  window.processOAuthCallback = processOAuthCallback;
  window.authGetOAuthRedirectUri = getOAuthRedirectUri;
  window.getOAuthRedirectUri = getOAuthRedirectUri;
  window.authCreateOAuthPkce = createOAuthPkce;
  window.createOAuthPkce = createOAuthPkce;
  window.authRememberOAuthState = rememberOAuthState;
  window.rememberOAuthState = rememberOAuthState;
  window.authConsumeOAuthState = consumeOAuthState;
  window.consumeOAuthState = consumeOAuthState;
  window.authIsVkMiniAppContext = isVkMiniAppContext;
  window.isVkMiniAppContext = isVkMiniAppContext;
  window.authGetTelegramStartTokenFromLaunch = getTelegramStartTokenFromLaunch;
  window.getTelegramStartTokenFromLaunch = getTelegramStartTokenFromLaunch;
  window.authNormalizeReferralCode = normalizeReferralCode;
  window.normalizeReferralCode = normalizeReferralCode;
  window.authGetReferralCodeFromLaunch = getReferralCodeFromLaunch;
  window.getReferralCodeFromLaunch = getReferralCodeFromLaunch;
  window.authSavePendingReferralCode = savePendingReferralCode;
  window.savePendingReferralCode = savePendingReferralCode;
  window.authGetPendingReferralCode = getPendingReferralCode;
  window.getPendingReferralCode = getPendingReferralCode;
  window.authClearPendingReferralCode = clearPendingReferralCode;
  window.clearPendingReferralCode = clearPendingReferralCode;
  window.authCapturePendingReferralCode = capturePendingReferralCode;
  window.capturePendingReferralCode = capturePendingReferralCode;
  window.authBuildReferralLink = buildReferralLink;
  window.buildReferralLink = buildReferralLink;
  window.copyReferralLink = copyReferralLink;
  window.getTelegramReturnUrl = getTelegramReturnUrl;
  window.isValidEmail = isValidEmail;
  window.setAuthFieldError = setAuthFieldError;
  window.clearAuthFieldError = clearAuthFieldError;
  window.clearAuthErrors = clearAuthErrors;
  window.focusFirstInvalid = focusFirstInvalid;

  window.startOAuthLogin = startOAuthLogin;
  window.processOAuthCallback = processOAuthCallback;
  window.getOAuthRedirectUri = getOAuthRedirectUri;
  window.createOAuthPkce = createOAuthPkce;
  window.rememberOAuthState = rememberOAuthState;
  window.consumeOAuthState = consumeOAuthState;
  window.isVkMiniAppContext = isVkMiniAppContext;
  window.getTelegramStartTokenFromLaunch = getTelegramStartTokenFromLaunch;
  window.normalizeReferralCode = normalizeReferralCode;
  window.getReferralCodeFromLaunch = getReferralCodeFromLaunch;
  window.savePendingReferralCode = savePendingReferralCode;
  window.getPendingReferralCode = getPendingReferralCode;
  window.clearPendingReferralCode = clearPendingReferralCode;
  window.capturePendingReferralCode = capturePendingReferralCode;
})(window);
