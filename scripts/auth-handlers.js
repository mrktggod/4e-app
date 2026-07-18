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


function isDashboardSubscriptionPreviewHost(){
  const host=String(location.hostname||'').toLowerCase();
  return host==='redesign-dashboard-subscript.4-ai-staging.pages.dev';
}

function renderDashboardSubscriptionPreviewDemo(){
  const setText=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text;};
  setText('focus-day-text','3 задачи требуют внимания');
  setText('focus-day-sub','4 уже расставил приоритеты');
  setText('stat-done','25');
  setText('stat-done-meta','+4');
  setText('stat-tasks','14');
  setText('stat-tasks-meta','2 с вчера');
  setText('stat-promises','5');
  setText('stat-promises-meta','1 просрочено');
  setText('stat-progress','57%');
  setText('stat-progress-meta','неделя');
  const arc=document.getElementById('progress-arc');
  if(arc)arc.setAttribute('stroke-dashoffset','40');
  const list=document.getElementById('home-task-list');
  if(list){
    list.innerHTML=[
      ['1','Сегодня · Работа · скоро','Юрий — Проверить кнопку после правок','Связана с текущим релизом'],
      ['2','Сегодня, 19:00 · Бизнес · важно','Принять решение по ценам: расписать стратегию','Ожидают: Антон и команда'],
      ['3','Завтра · Работа · позже','Продолжить разработку: дописать дорожную карту и основные баги','Длинная задача · 3 подзадачи']
    ].map(item=>'<div class="home-ai-row glass" style="padding:16px;display:grid;grid-template-columns:44px 1fr;gap:12px;align-items:center"><div style="width:38px;height:38px;border-radius:50%;display:grid;place-items:center;color:var(--green);border:1px solid rgba(154,194,60,.35);font-weight:800">'+item[0]+'</div><div style="min-width:0"><div style="font-size:11px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+item[1]+'</div><div style="font-size:15px;color:var(--text);font-weight:650;line-height:1.25;margin-top:5px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;overflow-wrap:anywhere">'+item[2]+'</div><div style="font-size:12px;color:var(--text2);margin-top:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+item[3]+'</div></div></div>').join('');
  }
}

function tryDashboardSubscriptionPreviewLogin(email,pass){
  if(!isDashboardSubscriptionPreviewHost())return false;
  if(String(email||'').trim().toLowerCase()!=='preview-dashboard-20260718@example.com'||String(pass||'')!=='Preview12345!')return false;
  const now=Date.now();
  const user={id:'preview-dashboard-user',email:'preview-dashboard-20260718@example.com',name:'Юрий',plan:'trial',trialEndsAt:now+14*864e5,referralCode:'preview',entitlement:{status:'active',accessUntil:now+14*864e5,source:'preview',updatedAt:now}};
  setLegacyToken('preview-dashboard-demo-token');
  localStorage.setItem(ONBOARD_K,'1');
  currentUser=user;
  window.currentUser=user;
  chatId='user_'+user.id;
  window.chatId=chatId;
  applyUserInfo();
  showScreen('home');
  renderDashboardSubscriptionPreviewDemo();
  showToast('Демо-вход для preview');
  return true;
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
  if(tryDashboardSubscriptionPreviewLogin(email,pass))return;
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
function getTelegramManualStartCommand(startToken){
  const token=String(startToken||'').trim();
  return token ? '/start auth_' + token : '/start';
}

function getTelegramManualStartPanel(){
  let panel=document.getElementById('telegram-manual-start-panel');
  if(panel)return panel;

  panel=document.createElement('section');
  panel.id='telegram-manual-start-panel';
  panel.hidden=true;
  panel.setAttribute('aria-live','polite');
  panel.style.cssText='margin:12px 0 0;padding:12px 14px;border-radius:16px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);display:flex;flex-direction:column;gap:10px;';
  panel.innerHTML=`
    <div style="font-size:13px;line-height:1.45;opacity:.92;">Если Telegram просто открыл чат с ботом и не отправил команду сам, отправьте её вручную:</div>
    <code data-telegram-start-command style="display:block;padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.24);font-size:14px;word-break:break-all;">/start</code>
    <div style="display:flex;gap:8px;flex-wrap:wrap;">
      <button type="button" data-telegram-start-copy class="chip-btn">Скопировать команду</button>
      <button type="button" data-telegram-start-open class="chip-btn">Открыть Telegram ещё раз</button>
    </div>
    <div style="font-size:12px;line-height:1.45;opacity:.75;">Если бот сам не ответил, отправьте эту команду вручную в текущий чат с ботом.</div>
  `;

  const loginForm=document.getElementById('form-login');
  const loginHost=loginForm?.parentElement || document.getElementById('auth') || document.getElementById('login') || document.body;
  if(loginForm){
    loginForm.insertAdjacentElement('afterend',panel);
  }else{
    loginHost.appendChild(panel);
  }

  panel.querySelector('[data-telegram-start-copy]')?.addEventListener('click',async ()=>{
    const command=panel.querySelector('[data-telegram-start-command]')?.textContent||'/start';
    try{
      if(typeof copyMsg==='function'){
        copyMsg(command,'Команда скопирована');
        return;
      }
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(command);
        showToast('Команда скопирована');
        return;
      }
    }catch(e){}
    showToast('Скопируйте команду вручную');
  });

  panel.querySelector('[data-telegram-start-open]')?.addEventListener('click',()=>{
    const token=panel.dataset.startToken||'';
    openTelegramLoginUrl(buildTelegramBotLoginUrl(token));
  });

  return panel;
}

function showTelegramManualStartFallback(startToken){
  if(!startToken)return;
  const panel=getTelegramManualStartPanel();
  const command=getTelegramManualStartCommand(startToken);
  panel.dataset.startToken=String(startToken);
  const commandNode=panel.querySelector('[data-telegram-start-command]');
  if(commandNode)commandNode.textContent=command;
  panel.hidden=false;
}

function hideTelegramManualStartFallback(){
  const panel=document.getElementById('telegram-manual-start-panel');
  if(panel)panel.hidden=true;
}

async function loginWithTelegram(startToken=''){
  if(startToken){
    showTelegramManualStartFallback(startToken);
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
        hideTelegramManualStartFallback();
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
    showTelegramManualStartFallback(tokenData.startToken);
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


function togglePassField(id){
  PLATFORM.togglePasswordVisibility(id||'cp-current');
}

function checkPassReqs(){
  const v = document.getElementById('cp-new')?.value || '';
  const setReq=(id,ok)=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.classList.toggle('ok',ok);
    const dot=el.querySelector('.pass-req-dot');
    if(dot) dot.style.background=ok?'var(--green)':'var(--muted)';
  };
  setReq('req-len', v.length>=8);
  setReq('req-case', /[a-z]/.test(v)&&/[A-Z]/.test(v));
  setReq('req-special', /[0-9!@#$%^&*]/.test(v));
}

function savePassword(){
  const cur = document.getElementById('cp-current')?.value || '';
  const nw = document.getElementById('cp-new')?.value || '';
  const conf = document.getElementById('cp-confirm')?.value || '';
  if(!cur){showToast('Current password is required');return;}
  if(nw.length < 8){showToast('Password must be at least 8 characters');return;}
  if(nw !== conf){showToast('Passwords do not match');return;}
  showToast('Password updated');
  setTimeout(()=>showSubScreen('security'),800);
}

function bindChangePasswordHandlers(){
  ['cp-current','cp-new','cp-confirm'].forEach((id)=>{
    const input=document.getElementById(id);
    if(!input) return;
    const eye=input.closest('.pass-input-wrap')?.querySelector('.pass-eye');
    if(eye) eye.addEventListener('click',()=>togglePassField(id));
  });

  const cpNew=document.getElementById('cp-new');
  if(cpNew) cpNew.addEventListener('input',checkPassReqs);
  const saveBtn=document.getElementById('change-password-save-btn');
  if(saveBtn) saveBtn.addEventListener('click',savePassword);
}

document.addEventListener('DOMContentLoaded',bindChangePasswordHandlers);


