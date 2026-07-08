// AUTH HANDLERS extracted for BACK-055
const AUTH_FIELD_IDS=['login-email','login-pass','reg-name','reg-email','reg-pass','forgot-email','reset-pass','reset-pass2'];

function switchAuthTab(tab, focusFirst){
  const isLogin=tab==='login';
  const loginForm=document.getElementById('form-login');
  const registerForm=document.getElementById('form-register');
  const loginTab=document.getElementById('tab-login');
  const registerTab=document.getElementById('tab-register');
  if(loginForm){
    loginForm.style.display=isLogin?'flex':'none';
    loginForm.hidden=!isLogin;
    loginForm.setAttribute('aria-hidden',isLogin?'false':'true');
  }
  if(registerForm){
    registerForm.style.display=isLogin?'none':'flex';
    registerForm.hidden=isLogin;
    registerForm.setAttribute('aria-hidden',isLogin?'true':'false');
  }
  if(loginTab){
    loginTab.classList.toggle('active',isLogin);
    loginTab.setAttribute('aria-selected',isLogin?'true':'false');
    loginTab.tabIndex=isLogin?0:-1;
  }
  if(registerTab){
    registerTab.classList.toggle('active',!isLogin);
    registerTab.setAttribute('aria-selected',isLogin?'false':'true');
    registerTab.tabIndex=isLogin?-1:0;
  }
  if(focusFirst){
    const firstId=isLogin?'login-email':'reg-name';
    setTimeout(()=>document.getElementById(firstId)?.focus(),0);
  }
}

// ── register ─────────────────────────────────────────────────
async function doRegister(){
  const name=document.getElementById('reg-name').value.trim();
  const email=document.getElementById('reg-email').value.trim();
  const pass=document.getElementById('reg-pass').value.trim();
  const fields=['reg-name','reg-email','reg-pass'];
  clearAuthErrors(fields);
  let ok=true;
  if(!name){setAuthFieldError('reg-name','Введите имя');ok=false;}
  if(!email){setAuthFieldError('reg-email','Введите email');ok=false;}
  else if(!isValidEmail(email)){setAuthFieldError('reg-email','Введите корректный email');ok=false;}
  if(!pass){setAuthFieldError('reg-pass','Введите пароль');ok=false;}
  else if(pass.length<6){setAuthFieldError('reg-pass','Пароль минимум 6 символов');ok=false;}
  if(!ok){showToast('Проверьте поля регистрации');focusFirstInvalid(fields);return;}
  const btn=document.getElementById('reg-submit-btn');
  btn.disabled=true; btn.textContent='Создаём аккаунт...';
  try{
    const pendingRef=getPendingReferralCode();
    const r=await fetch(WORKER+'/auth/register',{method:'POST',headers:authHeaders(),body:JSON.stringify({name,email,password:pass,...(pendingRef?{ref:pendingRef}:{})})});
    const d=await r.json();
    if(d.ok){
      setLegacyToken(d.token);
      currentUser=d.user;
      chatId='user_'+currentUser.id;
      clearPendingReferralCode();
      applyUserInfo();
      localStorage.setItem(ONBOARD_K,'1');
      showScreen('home');
      loadTasks();
      linkTelegram();
      showToast(d.referralApplied?'Добро пожаловать! +30 дней вам обоим':'Добро пожаловать! 30 дней Premium 🎁');
    } else {
      const message=d.error||'Ошибка регистрации';
      setAuthFieldError('reg-email',message);
      showToast(message);
    }
  }catch(e){setAuthFieldError('reg-email','Нет соединения. Попробуйте ещё раз.');showToast('Нет соединения');}
  btn.disabled=false; btn.textContent='Создать аккаунт';
}

// ── login ─────────────────────────────────────────────────────
function submitLoginOnEnter(event){
  if(!PLATFORM.shouldHandleEnterSubmit(event))return;
  event.preventDefault();
  const btn=document.getElementById('login-submit-btn');
  if(btn&&btn.disabled)return;
  doLogin();
}

function showAccountMergeToast(data) {
  if (data && data.accountMerged) {
    showToast('Мы объединили ваш аккаунт с ранее использованным, все задачи сохранены');
  }
}

async function doLogin(){
  const email=document.getElementById('login-email').value.trim();
  const pass=document.getElementById('login-pass').value.trim();
  const fields=['login-email','login-pass'];
  clearAuthErrors(fields);
  let ok=true;
  if(!email){setAuthFieldError('login-email','Введите email');ok=false;}
  else if(!isValidEmail(email)){setAuthFieldError('login-email','Введите корректный email');ok=false;}
  if(!pass){setAuthFieldError('login-pass','Введите пароль');ok=false;}
  if(!ok){showToast('Введи email и пароль');focusFirstInvalid(fields);return;}
  const btn=document.getElementById('login-submit-btn');
  btn.disabled=true; btn.textContent='Входим...';
  try{
    const r=await withTimeout(fetch(WORKER+'/auth/login',{method:'POST',headers:authHeaders(),body:JSON.stringify({email,password:pass})}),10000);
    const d=await readJsonSafe(r);
    if(d.ok){
      setLegacyToken(d.token);
      localStorage.removeItem(LOGOUT_K);
      currentUser=d.user;
      chatId='user_'+currentUser.id;
      clearPendingReferralCode();
      applyUserInfo();
      showScreen('home');
      loadTasks();
      showAccountMergeToast(d);
      linkTelegram();
    } else {
      const message=d.error||'Ошибка входа';
      setAuthFieldError('login-pass',message);
      showToast(message);
    }
  }catch(e){setAuthFieldError('login-pass','Нет соединения. Попробуйте ещё раз.');showToast('Нет соединения');}
  btn.disabled=false; btn.textContent='Войти';
}

async function loginWithTelegramLegacy(){
  if(!tgUser||!tgInitData){
    showToast('Открой бота и нажми Start — получишь ссылку для входа');
    showScreen('login');
    return false;
  }
  try{
    const r=await withTimeout(fetch(WORKER+'/auth/telegram',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({initData:tgInitData, user:tgUser, ...(getPendingReferralCode()?{ref:getPendingReferralCode()}: {})})
    }),8000);
    const d=await readJsonSafe(r);
    if(d.ok&&d.token){
      setLegacyToken(d.token);
      currentUser=d.user;
      chatId='user_'+currentUser.id;
      clearPendingReferralCode();
      applyUserInfo();
      localStorage.setItem(ONBOARD_K,'1');
      showScreen('home');
      loadTasks();
      showAccountMergeToast(d);
      if(!d.accountMerged){
        showToast(d.isNew?'Добро пожаловать! 30 дней Premium 🎁':'С возвращением!');
      }
      return true;
    } else {
      showToast(d.error||'Ошибка Telegram авторизации');
      showScreen('login');
      return false;
    }
  }catch(e){
    showToast('Нет соединения');
    showScreen('login');
    return false;
  }
}


// Привязываем Telegram ID к аккаунту после логина
async function loginWithTelegram(startToken=''){
  if(startToken){
    const body = { startToken };
    const pendingRef = getPendingReferralCode();
    if (pendingRef)
      body.ref = pendingRef;
    if (tgInitData) {
      body.initData = tgInitData;
      if (tgUser) body.user = tgUser;
    }
    try {
      const r = await withTimeout(fetch(WORKER + '/auth/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      }),8000);
      const d = await readJsonSafe(r);
      if (d.ok && d.token) {
        setLegacyToken(d.token);
        currentUser = d.user;
        chatId = 'user_' + currentUser.id;
        applyUserInfo();
        localStorage.setItem(ONBOARD_K, '1');
        clearPendingReferralCode();
        clearTelegramPendingStart();
        cleanTelegramAuthUrl();
        showScreen('home');
        loadTasks();
        showAccountMergeToast(d);
        return true;
      }
      showToast(d.error || 'Ошибка Telegram авторизации');
      showScreen('login');
      return false;
    } catch (e) {
      showToast('Нет соединения');
      showScreen('login');
      return false;
    }
  }

  if (tgUser && tgInitData) {
    return loginWithTelegramLegacy();
  }

  showToast('Открываем Telegram-бота для входа');
  let tokenData = { ok: false };
  try {
    const tokenR = await withTimeout(fetch(WORKER + '/auth/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        generateStartToken: true,
        returnUrl: getTelegramReturnUrl(),
        ...(tgInitData ? { initData: tgInitData } : {}),
        ...(tgUser ? { user: tgUser } : {})
      })
    }),8000);
    tokenData = await readJsonSafe(tokenR);
  } catch (e) {}
  if (tokenData.ok && tokenData.startToken) {
    saveTelegramPendingStart(tokenData.startToken);
    openTelegramLoginUrl(buildTelegramBotLoginUrl(tokenData.startToken));
    return true;
  }

  openTelegramLoginUrl(buildTelegramBotLoginUrl(''));
  showToast(tokenData.error || 'Открываем Telegram-бота для входа');
  showScreen('login');
  return false;
}

let telegramPendingLoginInFlight=false;
async function resumePendingTelegramLogin(){
  if(getToken()||telegramPendingLoginInFlight)return false;
  const startToken=getTelegramStartTokenFromLaunch()||getTelegramPendingStart();
  if(!startToken)return false;
  telegramPendingLoginInFlight=true;
  const ok=await withTimeout(loginWithTelegram(startToken),8000).catch(()=>false);
  telegramPendingLoginInFlight=false;
  return ok;
}

window.addEventListener('pageshow',()=>{resumePendingTelegramLogin();});
window.addEventListener('focus',()=>{resumePendingTelegramLogin();});

async function linkTelegram() {
  if (!tgInitData || !getToken()) return;
  try {
    await fetch(WORKER + '/auth/link-telegram', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ initData: tgInitData })
    });
    console.log('✅ Telegram linked');
  } catch(e) { console.log('link-telegram error:', e); }
}

function doLogout(){
  localStorage.removeItem(TOKEN_K);
  clearD1Token();
  localStorage.setItem(LOGOUT_K,'1');
  sessionStorage.clear();
  currentUser=null;
  chatId='global';
  allTasksCache=[];
  setNavActive('');
  showScreen('login');
  switchAuthTab('login');
}

function togglePass(id){
  PLATFORM.togglePasswordVisibility(id||'login-pass');
}

// ── CloudPayments config ──────────────────────────────────────
// ⚠️ Замени на свой Public ID из личного кабинета CloudPayments

