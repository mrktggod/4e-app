// TASK CARD + notifications render helpers
// Extracted from index.html for BACK-055.

function getTaskCardPriority(t){
  const tags=Array.isArray(t?.tags)?t.tags.join(' '):(t?.tags||'');
  const raw=((t?.priority||'')+' '+(t?.urgency||'')+' '+(t?.status||'')+' '+tags+' '+(t?.text||'')).toLowerCase();
  if(/(^|\s|#)p0(\s|$|,|;|#)|срочно|горит|asap|важно/.test(raw))return'p0';
  if(/(^|\s|#)p1(\s|$|,|;|#)/.test(raw))return'p1';
  if(/(^|\s|#)p2(\s|$|,|;|#)/.test(raw))return'p2';
  return'p3';
}
function getDirectionLabel(direction){
  const raw=(direction || '').trim().toLowerCase();
  if(raw==='incoming') return 'Личное';
  if(raw==='outgoing') return 'Исходящее / Я должен';
  return raw ? direction : 'Работа';
}
function getTaskCardCategory(t){
  if(t?.direction==='incoming')return{label:'Личное',cls:'cat-badge-personal'};
  const tags=Array.isArray(t?.tags)?t.tags:(typeof t?.tags==='string'?t.tags.split(',').map(s=>s.trim()).filter(Boolean):[]);
  if(tags.length)return{label:tags[0].slice(0,12),cls:'cat-badge-work'};
  const directionLabel=getDirectionLabel(t?.directionLabel || t?.direction || '');
  return{label:directionLabel,cls:t?.deadline?'cat-badge-work':'cat-badge-personal'};
}
function getTaskCardTitle(t){return(t?.text||'\u0417\u0430\u0434\u0430\u0447\u0430');}
function getTaskCardAssignee(t){
  const raw=String(t?.person||t?.assignee||t?.owner||'\u042e\u0440\u0438\u0439').trim();
  const initial=(raw||'\u042e').slice(0,1).toUpperCase();
  return {name:raw,initial};
}
function renderTaskCard(t,i){
  const id=e2(String(t?.id||''));
  const priority=getTaskCardPriority(t);
  const cat=getTaskCardCategory(t);
  const deadline=formatTaskCardDeadline(t);
  const assignee=getTaskCardAssignee(t);
  const overdueClass=deadline.overdue?' is-overdue':'';
  const syncBadge=t?._offlineQueued?'<span class="task-card-tag tag-med">\u0436\u0434\u0451\u0442 \u0441\u0438\u043d\u0445\u0440.</span>':'';
  return '<div class="task-card-shell priority-'+priority+overdueClass+'" data-task-id="'+id+'">'+
    '<div class="task-swipe-actions task-swipe-actions-right"><button type="button" class="task-swipe-btn task-swipe-done" data-task-action="done" onclick="handleTaskSwipeButton(this,event)">\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044c</button></div>'+
    '<div class="task-swipe-actions task-swipe-actions-left"><button type="button" class="task-swipe-btn task-swipe-move" data-task-action="move" onclick="handleTaskSwipeButton(this,event)">\u041f\u0435\u0440\u0435\u043d\u0435\u0441\u0442\u0438</button></div>'+
    '<div class="task-row task-card" onclick="openTaskCard(\''+id+'\','+i+',this)" onpointerdown="taskSwipeStart(event,this)" onpointermove="taskSwipeMove(event,this)" onpointerup="taskSwipeEnd(event,this)" onpointercancel="taskSwipeEnd(event,this)">'+
      '<div class="task-card-head"><div class="task-assignee-avatar" title="'+e2(assignee.name)+'">'+e2(assignee.initial)+'</div><div class="task-card-main"><div class="task-row-title task-card-title">'+e2(getTaskCardTitle(t))+'</div><div class="task-card-tags"><span class="task-card-tag '+cat.cls+'">'+e2(cat.label)+'</span>'+syncBadge+'</div></div><span class="task-card-deadline '+deadline.cls+'">'+e2(deadline.text)+'</span></div>'+
    '</div>'+
  '</div>';
}
function vibrateTaskCard(ms, style='light'){
  const tgHaptic = window.Telegram?.WebApp?.HapticFeedback;
  if(tgHaptic?.impactOccurred){
    tgHaptic.impactOccurred(style);
    return;
  }
  if(navigator.vibrate)navigator.vibrate(ms);
}
function isTaskActionFeedbackBlocked(btn){
  if(!btn||btn.disabled||btn.getAttribute?.('aria-disabled')==='true')return true;
  if(btn.dataset.feedbackLocked==='1'||btn.dataset.doneLoading==='1'||btn.dataset.doneDone==='1')return true;
  return false;
}
function triggerTaskActionFeedback(btn, options={}){
  if(isTaskActionFeedbackBlocked(btn))return false;
  const ms=Number.isFinite(options.ms)?options.ms:20;
  const style=options.style||'light';
  btn.dataset.feedbackLocked='1';
  btn.classList.add('task-swipe-btn--pressed');
  vibrateTaskCard(ms,style);
  setTimeout(()=>{
    btn.classList.remove('task-swipe-btn--pressed');
    if(btn.dataset.feedbackLocked==='1')delete btn.dataset.feedbackLocked;
  },180);
  return true;
}
function handleTaskSwipeButton(btn, event){
  if(!btn||!btn.matches||!btn.matches('.task-swipe-btn'))return;
  const shell = btn?.closest?.('.task-card-shell');
  if(!shell)return;
  if(event){
    event.preventDefault();
    event.stopPropagation();
  }
  if(!triggerTaskActionFeedback(btn,{ms:20,style:'light'}))return;
  const taskId=shell.dataset.taskId;
  if(btn.dataset.taskAction==='cancel'){resetTaskSwipe(shell);return;}
  if(btn.dataset.taskAction==='move'){
    resetTaskSwipe(shell);
    openTaskReschedule(taskId);
    return;
  }
  if(btn.dataset.taskAction==='done'){quickDoneTask(taskId,btn);}
}
function openTaskCard(taskId,index,card){
  const shell=card?.closest?card.closest('.task-card-shell'):null;
  if(shell&&shell.dataset.swiped==='1'){
    shell.dataset.swiped='0';
    return;
  }
  openTaskById(taskId,index);
}
function openTaskReminderFromCard(source,event){
  if(event){
    event.preventDefault();
    event.stopPropagation();
  }
  const button=source?.closest?.('[data-task-reminder-id]')||source;
  const taskId=String(button?.dataset?.taskReminderId||source||'').trim();
  const rawIndex=button?.dataset?.taskReminderIndex;
  const index=Number.isFinite(Number(rawIndex))?Number(rawIndex):-1;
  if(!taskId){
    showToast('Не нашёл задачу для уведомления');
    return;
  }
  if(typeof openTaskById!=='function'){
    showToast('Открой задачу, чтобы настроить уведомление');
    return;
  }
  openTaskById(taskId,index);
  setTimeout(()=>{
    const active=document.querySelector('.screen.active')?.id;
    const trigger=document.querySelector('#task-detail .detail-redesign-bell');
    if(active==='task-detail'&&trigger){
      trigger.click();
      return;
    }
    showToast('Открой задачу, чтобы настроить уведомление');
  },120);
}
function taskSwipeStart(event,card){
  if(event.pointerType==='mouse'&&event.button!==0)return;
  const shell=card.closest('.task-card-shell');
  if(!shell)return;
  taskSwipeState={shell,card,startX:event.clientX,startY:event.clientY,dx:0,locked:false,vibrated:false};
  resetAllTaskSwipes(shell);
  card.style.transition='none';
}
function taskSwipeMove(event,card){
  if(!taskSwipeState||taskSwipeState.card!==card)return;
  const dx=event.clientX-taskSwipeState.startX;
  const dy=event.clientY-taskSwipeState.startY;
  if(!taskSwipeState.locked&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>10)return;
  if(Math.abs(dx)>8){taskSwipeState.locked=true;event.preventDefault();}
  const limited=Math.max(-144,Math.min(96,dx));
  taskSwipeState.dx=limited;
  if(Math.abs(limited)>=56&&!taskSwipeState.vibrated){taskSwipeState.vibrated=true;vibrateTaskCard(10,'medium');}
  taskSwipeState.shell.classList.toggle('swiping-left',limited<-12);
  taskSwipeState.shell.classList.toggle('swiping-right',limited>12);
  card.style.transform='translateX('+limited+'px)';
}
function taskSwipeEnd(event,card){
  if(!taskSwipeState||taskSwipeState.card!==card)return;
  const shell=taskSwipeState.shell;
  const dx=taskSwipeState.dx;
  card.style.transition='';
  shell.classList.remove('swiping-left','swiping-right');
  if(Math.abs(dx)>12)shell.dataset.swiped='1';
  if(Math.abs(dx)>=88&&!taskSwipeState.vibrated)vibrateTaskCard(12,'medium');
  if(dx<=-56){
    resetTaskSwipe(shell);
    const moveBtn=shell.querySelector('.task-swipe-move');
    if(moveBtn)triggerTaskActionFeedback(moveBtn,{ms:20,style:'medium'});
    openTaskReschedule(shell.dataset.taskId);
  }else if(dx>88){
    resetTaskSwipe(shell);
    const doneBtn=shell.querySelector('.task-swipe-done');
    if(doneBtn)quickDoneTask(shell.dataset.taskId,doneBtn);
  }else resetTaskSwipe(shell);
  taskSwipeState=null;
}
function setTaskSwipe(shell,state){
  const card=shell?.querySelector('.task-card');
  if(!card)return;
  const leftActions=shell.querySelector('.task-swipe-actions-left');
  const rightActions=shell.querySelector('.task-swipe-actions-right');
  if(leftActions)leftActions.style.pointerEvents=state==='left'?'auto':'none';
  if(rightActions)rightActions.style.pointerEvents=state==='right'?'auto':'none';
  shell.classList.remove('swiping-left','swiping-right');
  shell.classList.toggle('swipe-left',state==='left');
  shell.classList.toggle('swipe-right',state==='right');
  card.style.transform=state==='left'?'translateX(-144px)':(state==='right'?'translateX(96px)':'');
  card.style.pointerEvents='none';
  const activeActions = state==='left' ? leftActions : rightActions;
  if(activeActions){
    activeActions.querySelectorAll('.task-swipe-btn').forEach(btn=>{btn.style.pointerEvents='auto';});
  }
}
function resetTaskSwipe(el){
  const shell=el?.closest?el.closest('.task-card-shell'):el;
  if(!shell)return;
  const leftActions=shell.querySelector('.task-swipe-actions-left');
  const rightActions=shell.querySelector('.task-swipe-actions-right');
  if(leftActions)leftActions.style.pointerEvents='none';
  if(rightActions)rightActions.style.pointerEvents='none';
  const card=shell.querySelector('.task-card');
  shell.classList.remove('swipe-left','swipe-right','swiping-left','swiping-right');
  if(card)card.style.transition='transform .18s ease';
  if(card)card.style.transform='';
  if(card)card.style.pointerEvents='';
  shell.querySelectorAll('.task-swipe-btn').forEach(btn=>{btn.style.pointerEvents='';});
}
function resetAllTaskSwipes(except){document.querySelectorAll('.task-card-shell.swipe-left,.task-card-shell.swipe-right').forEach(shell=>{if(shell!==except)resetTaskSwipe(shell);});}
function getTaskRescheduleInput(){
  let input=document.getElementById('task-reschedule-picker');
  if(!input){
    input=document.createElement('input');
    input.type='date';
    input.id='task-reschedule-picker';
    input.style.cssText='position:fixed;left:50%;bottom:80px;transform:translateX(-50%);width:160px;height:44px;opacity:0.01;z-index:9999;font-size:16px;';
    input.addEventListener('change',()=>handleTaskReschedule(input.dataset.taskId,input.value));
    document.body.appendChild(input);
  }
  return input;
}
function openTaskReschedule(taskId){
  const task=(allTasksCache||[]).find(t=>String(t.id)===String(taskId));
  const input=getTaskRescheduleInput();
  const d=parseTaskDate(task?.deadline||task?.date);
  input.dataset.taskId=taskId;
  input.dataset.pickerRequested='1';
  input.value=d?d.toISOString().slice(0,10):'';
  if(input.showPicker){
    try{
      input.showPicker();
      return;
    }catch(_){
      // Telegram WebViews can expose showPicker() but reject its activation.
    }
  }
  input.focus({preventScroll:true});
  input.click();
}
async function handleTaskReschedule(taskId,value){
  if(!taskId||!value)return;
  const date=parseTaskDate(value);
  if(!date)return;
  const deadline=date.getDate()+' '+['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'][date.getMonth()]+' '+date.getFullYear();
  const task=(allTasksCache||[]).find(t=>String(t.id)===String(taskId));
  const shell=task?Array.from(document.querySelectorAll('.task-card-shell')).find(el=>el.dataset.taskId===String(taskId)):null;
  if(shell)shell.style.opacity='0.7';
  try{
    await fetch(WORKER,{method:'POST',headers:{...authHeaders(),'x-action':'update-task'},body:JSON.stringify({chatId,taskId,updates:{deadline}})});
    if(task)task.deadline=deadline;
    showToast('Срок перенесён');
    setTimeout(loadTasks,400);
  }catch(e){console.log(e);showToast('Не удалось перенести срок');if(shell)shell.style.opacity='';}
}
async function markDoneKV(btn,taskId){
  if(!btn||btn.dataset.doneLoading==='1'||btn.dataset.doneDone==='1')return;
  const row=btn.closest('.task-row')||btn.closest('.promise-row')||btn.closest('.task-card-shell');
  const previousText=btn.textContent;
  btn.dataset.doneLoading='1';
  btn.disabled=true;
  btn.setAttribute('aria-busy','true');
  btn.textContent='...';
  if(row){row.style.opacity='0.65';row.style.pointerEvents='none';}
  try{
    if(typeof postTaskChatMutation==='function'){
      await postTaskChatMutation('done-task',{chatId,taskId});
    }else{
      const res=await fetch(WORKER,{method:'POST',headers:{...authHeaders(),'x-action':'done-task'},body:JSON.stringify({chatId,taskId})});
      const data=typeof readJsonSafe==='function'?await readJsonSafe(res):{};
      if(!res.ok||data.ok===false)throw new Error(data?.error||'Не удалось завершить задачу');
    }
    if(typeof recordAdaptiveActivity==='function')recordAdaptiveActivity('task_done',2);
    btn.dataset.doneDone='1';
    btn.removeAttribute('aria-busy');
    btn.textContent='Готово';
    if(row){row.style.opacity='0.55';row.style.pointerEvents='none';}
    showToast('Готово ✓');
    setTimeout(loadTasks,600);
  }catch(e){
    console.log(e);
    if(!(typeof handlePremiumRequiredTaskActionError==='function'&&handlePremiumRequiredTaskActionError(e))){
      showToast(e?.message||'Не удалось завершить задачу');
    }
    btn.dataset.doneLoading='0';
    btn.disabled=false;
    btn.removeAttribute('aria-busy');
    btn.textContent=previousText;
    if(row){row.style.opacity='';row.style.pointerEvents='';}
  }
}

function setNavActive(id){
  document.querySelectorAll('.nav-item,.nav-mic,.nav-mic-v2').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('[data-nav="'+id+'"]').forEach(n=>n.classList.add('active'));
}

function showScreen(id){
  const publicScreens=['onboarding','login','forgot-password','reset-password'];
  const previewScreens=['home','task-detail','profile','subscription','chats','chat-conv'];
  const allowPreviewScreen=typeof isDashboardPreviewActive==='function'&&isDashboardPreviewActive()&&previewScreens.includes(id);
  if(!publicScreens.includes(id)&&!getToken()&&!allowPreviewScreen){
    id=localStorage.getItem(ONBOARD_K)?'login':'onboarding';
  }
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const s=document.getElementById(id);
  if(s){
    s.classList.add('active');
    s.scrollTop=0;
    const scroller=s.querySelector('[data-screen-scroll],.scroll-body');
    if(scroller)scroller.scrollTop=0;
  }
  // Hide global-nav on screens that have their own nav or no nav needed
  const nav=document.getElementById('global-nav');
  const noNav=['onboarding','login','forgot-password','reset-password','voice','home','chats','msng-settings','chat-conv','task-detail','profile','subscription','statistics'];
  if(nav)nav.classList.toggle('hidden',noNav.includes(id));
  // bottom-nav-v2 is inside #home so it's only visible when home is active — no action needed
  const hs=document.querySelector('.scroll-body');
  if(hs)hs.classList.toggle('scroll-body--home', id==='home');
}

// The dashboard itself is the only mobile scroll surface. Native scrolling
// stays untouched; this only clips task pixels once they pass behind the two
// fixed control layers, so cards never show through glass while moving.
function initHomeDashboardScrollCollapse(){
  const home=document.getElementById('home');
  const taskList=document.getElementById('home-task-list');
  const metrics=home?.querySelector('.dash-metrics');
  const nav=home?.querySelector('.dash-bottom-nav');
  if(!home||!taskList||!metrics||!nav||taskList.dataset.dashboardCollapseBound==='native')return;
  taskList.dataset.dashboardCollapseBound='native';
  home.classList.remove('dashboard-list-scrolled');
  if(!window.matchMedia('(max-width: 430px)').matches)return;

  function clipTaskLane(){
    const listRect=taskList.getBoundingClientRect();
    const metricsRect=metrics.getBoundingClientRect();
    const navRect=nav.getBoundingClientRect();
    const topCut=Math.ceil(Math.max(0,Math.min(listRect.height,metricsRect.bottom-listRect.top)));
    const bottomCut=Math.ceil(Math.max(0,Math.min(listRect.height-topCut,listRect.bottom-navRect.top)));
    const clip='inset('+topCut+'px 0 '+bottomCut+'px 0)';
    if(taskList.dataset.taskLaneClip===clip)return;
    taskList.dataset.taskLaneClip=clip;
    taskList.style.setProperty('clip-path',clip,'important');
    taskList.style.setProperty('-webkit-clip-path',clip,'important');
  }
  function scheduleClip(){
    requestAnimationFrame(clipTaskLane);
  }

  home.addEventListener('scroll',clipTaskLane,{passive:true});
  window.addEventListener('resize',scheduleClip,{passive:true});
  if(typeof ResizeObserver==='function'){
    const observer=new ResizeObserver(scheduleClip);
    observer.observe(home);
    observer.observe(taskList);
    observer.observe(metrics);
    observer.observe(nav);
  }
  scheduleClip();
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initHomeDashboardScrollCollapse,{once:true});
else initHomeDashboardScrollCollapse();

function goHome(){showScreen('home');setNavActive('tasks');loadTasks();}
let taskDetailReturnScreen='home';
const TASK_DETAIL_RETURN_SCREENS=new Set(['home','calendar','statistics','profile','chats','chat-conv']);
function getActiveTaskReturnScreen(){
  return document.querySelector('.screen.active')?.id||'home';
}
function rememberTaskDetailReturnScreen(explicitScreen){
  const candidate=explicitScreen||getActiveTaskReturnScreen();
  taskDetailReturnScreen=TASK_DETAIL_RETURN_SCREENS.has(candidate)&&candidate!=='task-detail'?candidate:'home';
  return taskDetailReturnScreen;
}
function returnFromTaskDetail(){
  const target=TASK_DETAIL_RETURN_SCREENS.has(taskDetailReturnScreen)?taskDetailReturnScreen:'home';
  if(target==='home'){goHome();return;}
  showScreen(target);
  if(target==='calendar')setNavActive('cal');
  else if(target==='statistics')setNavActive('stats');
  else if(target==='profile')setNavActive('profile');
}
async function openAsk(){
  if(!checkTrial()) return;
  showScreen('ask');
  setNavActive('brain');
  if(!askHistoryLoaded){
    await loadAskHistoryRemote();
    renderAskHistory();
  }else{
    renderAskHistory();
  }
  setTimeout(()=>{const f=document.getElementById('ask-field');if(f)f.focus();},300);
}
function openCalendar(){showScreen('calendar');setNavActive('cal');renderCalendar();}
function openProfile(){showScreen('profile');setNavActive('profile');closeProfilePersonalData();renderExtendedProfile();}
// ── NOTIFICATIONS (реальные из KV) ───────────────────────────
let notifFilter = 'all';
let notifCache = []; // кэш загруженных уведомлений
const NOTIF_SNOOZE_OPTIONS = [
  {value:'15m', label:'15 мин'},
  {value:'1h', label:'1 час'},
  {value:'3h', label:'3 часа'},
  {value:'tomorrow', label:'Завтра'}
];

async function openNotifications(){
  showScreen('notifications');
  await loadNotifications();
}

async function loadNotifications(){
  const list = document.getElementById('notif-list');
  if(list) list.innerHTML = '<div class="notif-empty"><span class="dots"><span></span><span></span><span></span></span></div>';
  if(!getToken()) { renderNotifs([]); return; }
  try {
    const res = await fetch(WORKER + '/notifications', { headers: authHeaders() });
    if(!res.ok) throw new Error('not ok');
    const data = await res.json();
    notifCache = Array.isArray(data) ? data : [];
    if(notifCache.length) recordAdaptiveActivity('notifications',1);
  } catch(e) {
    console.error('loadNotifications:', e);
    notifCache = [];
  }
  renderNotifs(notifCache);
  updateBellDot(notifCache);
}

function filterNotifs(type, el){
  notifFilter = type;
  document.querySelectorAll('.notif-filter').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderNotifs(notifCache);
}

function getNotifById(id){
  return (notifCache || []).find(function(item){ return String(item?.id || '') === String(id || ''); }) || null;
}

function normalizeNotifType(type){
  const raw = String(type || '').trim().toLowerCase();
  if(raw === 'waiting' || raw === 'wait') return 'waiting';
  if(raw === 'task' || raw === 'deadline' || raw === 'reminder' || raw === 'system') return raw;
  return 'system';
}

function getNotifTaskId(notif){
  return String(
    notif?.taskId ||
    notif?.task_id ||
    notif?.relatedTaskId ||
    notif?.related_task_id ||
    notif?.task?.id ||
    ''
  ).trim();
}

function findTaskIndexById(taskId){
  return (allTasksCache || []).findIndex(function(task){
    return String(task?.id || '') === String(taskId || '');
  });
}

function findTaskById(taskId){
  const idx = findTaskIndexById(taskId);
  return idx >= 0 ? (allTasksCache || [])[idx] : null;
}

function getNotifTask(notif){
  return findTaskById(getNotifTaskId(notif));
}

function getNotifContactMeta(notif, task){
  const source = task || {
    person: notif?.person || notif?.assigneeName || notif?.assignee || '',
    assigneeUsername: notif?.assigneeUsername || notif?.username || '',
    assigneeTgId: notif?.assigneeTgId || notif?.telegramId || notif?.tgId || ''
  };
  return getTaskContactMeta(source) || {person:'Контакт', username:'', tgId:'', url:''};
}

function isNotifWaitingLike(notif){
  const text = String(notif?.title || '') + ' ' + String(notif?.detail || '');
  return normalizeNotifType(notif?.type) === 'waiting' || !!notif?.waiting || /жд[её]ш/i.test(text);
}

function canNotifWrite(notif, task){
  const meta = getNotifContactMeta(notif, task);
  if(!isNotifWaitingLike(notif)) return false;
  return !!meta.username || !!meta.tgId || (!!meta.person && !/^я$/i.test(meta.person));
}

function getNotifKindLabel(notif, task){
  const type = normalizeNotifType(notif?.type);
  if(type === 'deadline'){
    const deadline = formatTaskCardDeadline(task || {});
    return deadline.overdue ? 'Просрочено' : 'Горит';
  }
  if(type === 'reminder') return 'Напоминание';
  if(type === 'task') return 'Задача';
  if(type === 'waiting') return 'Ждём ответ';
  return 'Система';
}

function getNotifTitle(notif, task){
  const raw = String(notif?.title || '').trim();
  if(raw) return raw;
  const type = normalizeNotifType(notif?.type);
  if(type === 'deadline') return 'Горит дедлайн';
  if(type === 'reminder') return 'Сработало напоминание';
  if(type === 'waiting') return 'Ждём ответ';
  if(type === 'task') return task?.text ? 'Новая задача' : 'Задача';
  return 'Системное уведомление';
}

function getNotifDetail(notif, task){
  const raw = String(notif?.detail || '').trim();
  if(raw) return raw;
  if(task){
    const title = String(task?.text || '').trim() || 'Открыть задачу';
    const meta = task?.deadline ? formatTaskDateMeta(task) : '';
    return meta ? (title + ' · ' + meta) : title;
  }
  return 'Когда появится подробность, 4 покажет её здесь.';
}

function getNotifEmptyState(type){
  if(type === 'deadline'){
    return {
      title:'Нет горящих задач',
      text:'Сейчас нет просрочек и дедлайнов на ближайшее время.'
    };
  }
  if(type === 'all'){
    return {
      title:'Пока всё спокойно',
      text:'4 следит за задачами, дедлайнами и напоминаниями. Когда появится важное событие — оно будет здесь.'
    };
  }
  return {
    title:'Пока нет событий',
    text:'Когда появится важное действие, 4 покажет его здесь.'
  };
}

function renderNotifEmptyState(type){
  const state = getNotifEmptyState(type);
  return '<div class="notif-empty notif-empty--panel ui-glass-card ui-glass-card--muted">'
    + '<div class="notif-empty-icon">•</div>'
    + '<div class="notif-empty-title">' + e2(state.title) + '</div>'
    + '<div class="notif-empty-text">' + e2(state.text) + '</div>'
    + '</div>';
}

function toLocalDateTimeValue(date){
  const pad = function(n){ return String(n).padStart(2, '0'); };
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + 'T' + pad(date.getHours()) + ':' + pad(date.getMinutes());
}

function getNotifSnoozeValue(kind){
  const next = new Date();
  if(kind === '15m') next.setMinutes(next.getMinutes() + 15);
  else if(kind === '1h') next.setHours(next.getHours() + 1);
  else if(kind === '3h') next.setHours(next.getHours() + 3);
  else {
    next.setDate(next.getDate() + 1);
    next.setHours(9, 0, 0, 0);
  }
  return toLocalDateTimeValue(next);
}

function renderNotifActionButtons(notif, task){
  const id = e2(String(notif?.id || ''));
  const taskId = e2(getNotifTaskId(notif));
  const type = normalizeNotifType(notif?.type);
  const canOpenTask = !!taskId;
  const canWrite = canNotifWrite(notif, task);
  const canSnooze = type === 'deadline' || type === 'reminder';
  let html = '';

  if(type === 'system'){
    return '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifMarkRead(this)" data-nid="' + id + '">Понятно</button>';
  }

  if(type === 'waiting'){
    if(canWrite){
      html += '<button class="notif-act-btn notif-act-task ui-glass-button ui-glass-button--primary" onclick="notifWrite(this)" data-nid="' + id + '">Написать</button>';
    }
    if(canOpenTask){
      html += '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifGoToTask(this)" data-nid="' + id + '" data-task-id="' + taskId + '">Открыть задачу</button>';
    }
    if(!html){
      html += '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifMarkRead(this)" data-nid="' + id + '">Понятно</button>';
    }
    return html;
  }

  if(type === 'reminder'){
    if(canOpenTask){
      html += '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifMarkDone(this)" data-nid="' + id + '" data-task-id="' + taskId + '">Готово</button>';
      html += '<button class="notif-act-btn notif-act-del ui-glass-button ui-glass-status--danger" onclick="notifToggleSnoozeMenu(this)" data-nid="' + id + '">Отложить</button>';
      html += '<button class="notif-act-btn notif-act-task ui-glass-button ui-glass-button--primary" onclick="notifGoToTask(this)" data-nid="' + id + '" data-task-id="' + taskId + '">К задаче</button>';
    } else {
      html += '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifMarkRead(this)" data-nid="' + id + '">Понятно</button>';
    }
  } else {
    if(canOpenTask){
      html += '<button class="notif-act-btn notif-act-task ui-glass-button ui-glass-button--primary" onclick="notifGoToTask(this)" data-nid="' + id + '" data-task-id="' + taskId + '">К задаче</button>';
    }
    if(canSnooze && canOpenTask){
      html += '<button class="notif-act-btn notif-act-del ui-glass-button ui-glass-status--danger" onclick="notifToggleSnoozeMenu(this)" data-nid="' + id + '">Отложить</button>';
    }
    if(canWrite){
      html += '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifWrite(this)" data-nid="' + id + '">Написать</button>';
    } else if(canOpenTask){
      html += '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifMarkDone(this)" data-nid="' + id + '" data-task-id="' + taskId + '">Готово</button>';
    } else {
      html += '<button class="notif-act-btn notif-act-read ui-glass-button" onclick="notifMarkRead(this)" data-nid="' + id + '">Понятно</button>';
    }
  }

  if(canSnooze && canOpenTask){
    html += '<div class="notif-snooze-menu" id="nsnooze-' + id + '">';
    html += NOTIF_SNOOZE_OPTIONS.map(function(option){
      return '<button class="notif-act-btn notif-act-task notif-act-center ui-glass-button ui-glass-button--primary" onclick="notifSnooze(this)" data-nid="' + id + '" data-task-id="' + taskId + '" data-snooze-kind="' + e2(option.value) + '">' + e2(option.label) + '</button>';
    }).join('');
    html += '</div>';
  }

  return html;
}

function renderNotifs(notifs){
  const list = document.getElementById('notif-list');
  if(!list) return;

  const filtered = notifFilter === 'all' ? notifs : notifs.filter(n => n.type === notifFilter);

  if(filtered.length === 0){
    list.innerHTML = renderNotifEmptyState(notifFilter);
    return;
  }

  // Добавляем time-метку если нет
  filtered.forEach(n => {
    if(!n.time) n.time = formatNotifTime(n.ts);
  });

  // Группировка по дням
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  const yestStart = new Date(todayStart); yestStart.setDate(yestStart.getDate()-1);
  const groups = { today:[], yesterday:[], earlier:[] };
  filtered.forEach(n => {
    if(n.ts >= todayStart.getTime()) groups.today.push(n);
    else if(n.ts >= yestStart.getTime()) groups.yesterday.push(n);
    else groups.earlier.push(n);
  });

  let html = '';
  if(groups.today.length)     html += renderNotifGroup('Сегодня', groups.today);
  if(groups.yesterday.length) html += renderNotifGroup('Вчера', groups.yesterday);
  if(groups.earlier.length)   html += renderNotifGroup('Раньше', groups.earlier);
  list.innerHTML = html;

  // Счётчик непрочитанных
  updateBellDot(notifCache);
  const badge = document.getElementById('notif-unread-count');
  const unread = notifCache.filter(n => n.unread).length;
  if(badge){ badge.textContent = unread + ' новых'; badge.style.display = unread > 0 ? 'block' : 'none'; }
}

function formatNotifTime(ts){
  if(!ts) return '';
  const d = new Date(ts), now = new Date();
  const todayStart = new Date(); todayStart.setHours(0,0,0,0);
  if(d >= todayStart) return d.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
  const yest = new Date(todayStart); yest.setDate(yest.getDate()-1);
  if(d >= yest) return 'Вчера ' + d.toLocaleTimeString('ru-RU', { hour:'2-digit', minute:'2-digit' });
  return d.toLocaleDateString('ru-RU', { day:'numeric', month:'short' });
}

function updateBellDot(notifs){
  const unread = (notifs||[]).filter(n => n.unread).length;
  const dot = document.getElementById('bell-dot');
  if(dot) dot.style.display = unread > 0 ? 'block' : 'none';
}

function renderNotifGroup(label, items){
  var taskIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
  var deadlineIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
  var reminderIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg>';
  var systemIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
  var icons = {task:taskIcon, deadline:deadlineIcon, reminder:reminderIcon, system:systemIcon, waiting:systemIcon};
  var out = '<div class="notif-group-label">' + label + '</div>';
  items.forEach(function(n){
    var task = getNotifTask(n);
    var type = normalizeNotifType(n.type);
    var isRead = typeof notifReadSet !== 'undefined' && notifReadSet?.has ? notifReadSet.has(n.id) : false;
    var isUnread = n.unread && !isRead;
    var clr = isUnread ? 'var(--green)' : 'var(--muted)';
    var svg = (icons[type]||icons.system).replace('stroke-width', 'stroke="'+clr+'" stroke-width');
    var chipClass = type === 'deadline' ? ' notif-kind-chip--deadline' : (type === 'reminder' ? ' notif-kind-chip--reminder' : '');
    var title = getNotifTitle(n, task);
    var detail = getNotifDetail(n, task);
    var kindLabel = getNotifKindLabel(n, task);
    out += '<div class="notif-card ui-glass-card ui-glass-card--interactive' + (isUnread?' unread ui-glass-card--active':'') + '" id="ncard-'+n.id+'">';
    out += '<div class="notif-card-header" onclick="toggleNotif(this)" data-nid="'+n.id+'">';
    out += '<div class="notif-card-icon ui-glass-icon-button">'+svg+'</div>';
    out += '<div class="notif-card-body">';
    out += '<div class="notif-card-meta">';
    out += '<span class="notif-kind-chip ui-glass-status' + chipClass + '">' + e2(kindLabel) + '</span>';
    out += '<div class="notif-card-time">'+e2(n.time)+'</div>';
    out += '</div>';
    out += '<div class="notif-card-title">'+e2(title)+'</div>';
    out += '<div class="notif-card-preview">' + e2(detail) + '</div>';
    out += '</div>';
    out += '<div class="notif-card-right">';
    if(isUnread) out += '<div class="notif-unread-dot"></div>';
    out += '<span class="notif-chevron" id="nchev-'+n.id+'">&#8250;</span>';
    out += '</div></div>';
    out += '<div class="notif-detail" id="ndet-'+n.id+'">';
    out += '<div class="notif-detail-text">' + e2(detail) + '</div>';
    out += '<div class="notif-actions notif-actions--wrap">' + renderNotifActionButtons(n, task) + '</div>';
    out += '</div></div>';
  });
  return out;
}

function toggleNotif(el){ var id=(typeof el==='string')?el:(el.closest?el.closest('[data-nid]'):el)?.dataset?.nid||el.dataset?.nid;
  const det = document.getElementById('ndet-' + id);
  const chev = document.getElementById('nchev-' + id);
  if(!det) return;
  const isOpen = det.classList.contains('open');
  // Close all others
  document.querySelectorAll('.notif-detail.open').forEach(d => d.classList.remove('open'));
  document.querySelectorAll('.notif-chevron.open').forEach(c => c.classList.remove('open'));
  document.querySelectorAll('.notif-snooze-menu').forEach(menu => { menu.style.display = 'none'; });
  if(!isOpen){
    det.classList.add('open');
    if(chev) chev.classList.add('open');
    // Auto-mark as read on open
    notifMarkRead(id, true);
  }
}

function notifMarkRead(el, silent){
  var id=(typeof el==='string')?el:(el&&el.dataset)?el.dataset.nid:el;
  if(!id) return;
  // Обновляем локальный кэш
  const n = notifCache.find(n => n.id === id);
  if(n) n.unread = false;
  const card = document.getElementById('ncard-' + id);
  if(card){ card.classList.remove('unread'); const dot=card.querySelector('.notif-unread-dot'); if(dot)dot.remove(); }
  if(!silent) showToast('Отмечено как прочитанное');
  updateBellDot(notifCache);
  const badge = document.getElementById('notif-unread-count');
  const unread = notifCache.filter(n => n.unread).length;
  if(badge){ badge.textContent = unread + ' новых'; badge.style.display = unread > 0 ? 'block' : 'none'; }
  // Сохраняем на сервере
  if(getToken()) fetch(WORKER, { method:'POST', headers:{...authHeaders(),'x-action':'mark-notif-read'}, body:JSON.stringify({notifId:id}) }).catch(()=>{});
}

function notifDelete(el){
  var id=(typeof el==='string')?el:el.dataset?.nid;
  if(!id) return;
  notifCache = notifCache.filter(n => n.id !== id);
  renderNotifs(notifCache);
  showToast('Уведомление удалено');
  updateBellDot(notifCache);
  if(getToken()) fetch(WORKER, { method:'POST', headers:{...authHeaders(),'x-action':'delete-notif'}, body:JSON.stringify({notifId:id}) }).catch(()=>{});
}

function notifToggleSnoozeMenu(el){
  var id=(typeof el==='string')?el:el.dataset?.nid;
  if(!id) return;
  document.querySelectorAll('.notif-snooze-menu').forEach(function(menu){
    if(menu.id !== 'nsnooze-' + id) menu.style.display = 'none';
  });
  var menu = document.getElementById('nsnooze-' + id);
  if(!menu) return;
  menu.style.display = menu.style.display === 'grid' ? 'none' : 'grid';
}

async function notifSnooze(el){
  var id = (typeof el === 'string') ? el : el.dataset?.nid;
  var notif = getNotifById(id);
  var taskId = (typeof el === 'string') ? getNotifTaskId(notif) : String(el.dataset?.taskId || getNotifTaskId(notif) || '').trim();
  var snoozeKind = (typeof el === 'string') ? 'tomorrow' : String(el.dataset?.snoozeKind || 'tomorrow');
  if(!taskId){
    showToast('Нет связанной задачи');
    return;
  }
  var deadline = getNotifSnoozeValue(snoozeKind);
  var task = findTaskById(taskId);
  try{
    await fetch(WORKER, {
      method:'POST',
      headers:{...authHeaders(),'x-action':'update-task'},
      body:JSON.stringify({chatId, taskId, updates:{deadline:deadline, time:deadline}})
    });
    if(task){
      task.deadline = deadline;
      task.time = deadline;
    }
    notifMarkRead(id, true);
    notifToggleSnoozeMenu(id);
    showToast('Отложено');
    if(typeof loadTasks === 'function') setTimeout(loadTasks, 350);
  }catch(e){
    console.log(e);
    showToast('Не удалось отложить');
  }
}

async function notifMarkDone(el){
  var id = (typeof el === 'string') ? el : el.dataset?.nid;
  var notif = getNotifById(id);
  var taskId = (typeof el === 'string') ? getNotifTaskId(notif) : String(el.dataset?.taskId || getNotifTaskId(notif) || '').trim();
  if(!taskId){
    notifMarkRead(id);
    return;
  }
  notifMarkRead(id, true);
  await markDoneKV(el, taskId);
}

function notifWrite(el){
  var id = (typeof el === 'string') ? el : el.dataset?.nid;
  var notif = getNotifById(id);
  if(!notif) return;
  var task = getNotifTask(notif);
  var meta = getNotifContactMeta(notif, task);
  var person = meta.person || 'Контакт';
  if(!person || /^я$/i.test(person)){
    showToast('Нет контакта для сообщения');
    return;
  }
  var taskText = String(task?.text || notif?.taskText || notif?.detail || notif?.title || 'Нужен ответ').trim();
  notifMarkRead(id, true);
  openWrite(person, (person || '?')[0], 'Обсудить задачу', person + ' — задача: ' + taskText);
}

async function notifGoToTask(el){
  var id = (typeof el === 'string') ? el : el.dataset?.nid;
  var notif = getNotifById(id);
  var taskId = (typeof el === 'string') ? getNotifTaskId(notif) : String(el.dataset?.taskId || getNotifTaskId(notif) || '').trim();
  if(!taskId){
    showToast('Связанная задача не найдена');
    return;
  }
  notifMarkRead(id, true);
  var idx = findTaskIndexById(taskId);
  if(idx < 0 && typeof loadTasks === 'function'){
    try{
      await loadTasks();
    }catch(e){
      console.log(e);
    }
    idx = findTaskIndexById(taskId);
  }
  if(idx < 0){
    showToast('Связанная задача не найдена');
    return;
  }
  showToast('Открываю задачу...');
  openTaskById(taskId, idx);
}
