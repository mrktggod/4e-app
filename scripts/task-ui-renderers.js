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
  if(tags.length)return{label:tags[0].slice(0,18),cls:'cat-badge-work'};
  const directionLabel=getDirectionLabel(t?.directionLabel || t?.direction || '');
  return{label:directionLabel,cls:t?.deadline?'cat-badge-work':'cat-badge-personal'};
}
function getTaskCardTitle(t){return(t?.person?(t.person+' — '):'')+(t?.text||'Задача');}
function renderTaskCard(t,i){
  const id=e2(String(t?.id||''));
  const priority=getTaskCardPriority(t);
  const cat=getTaskCardCategory(t);
  const deadline=formatTaskCardDeadline(t);
  const number=String(i+1).padStart(2,'0');
  const overdueClass=deadline.overdue?' is-overdue':'';
  return '<div class="task-card-shell priority-'+priority+overdueClass+'" data-task-id="'+id+'">'+
    '<div class="task-swipe-actions task-swipe-actions-right" ><button type="button" class="task-swipe-btn task-swipe-done" data-task-action="done" onclick="handleTaskSwipeButton(this,event)">Завершить</button></div>'+
    '<div class="task-swipe-actions task-swipe-actions-left" ><button type="button" class="task-swipe-btn task-swipe-cancel" data-task-action="cancel" onclick="handleTaskSwipeButton(this,event)">Отменить</button><button type="button" class="task-swipe-btn task-swipe-move" data-task-action="move" onclick="handleTaskSwipeButton(this,event)">Перенести</button></div>'+
    '<div class="task-row task-card" onclick="openTaskCard(\''+id+'\','+i+',this)" onpointerdown="taskSwipeStart(event,this)" onpointermove="taskSwipeMove(event,this)" onpointerup="taskSwipeEnd(event,this)" onpointercancel="taskSwipeEnd(event,this)">'+
      '<div class="task-card-head"><div class="task-num-badge priority-'+priority+'"><span class="task-priority-dot"></span>'+number+'</div><span class="task-card-tag '+cat.cls+'">'+e2(cat.label)+'</span><span class="task-card-deadline '+deadline.cls+'">'+e2(deadline.text)+'</span></div>'+
      '<div class="task-row-title task-card-title">'+e2(getTaskCardTitle(t))+'</div>'+
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
function handleTaskSwipeButton(btn, event){
  if(!btn||!btn.matches||!btn.matches('.task-swipe-btn'))return;
  const shell = btn?.closest?.('.task-card-shell');
  if(!shell)return;
  if(event){
    event.preventDefault();
    event.stopPropagation();
  }
  const taskId=shell.dataset.taskId;
  vibrateTaskCard(20,'light');
  if(btn.dataset.taskAction==='cancel'){resetTaskSwipe(shell);return;}
  if(btn.dataset.taskAction==='move'){
    resetTaskSwipe(shell);
    openTaskMove(taskId);
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
  if(Math.abs(dx)>=56&&!taskSwipeState.vibrated)vibrateTaskCard(10,'medium');
  if(dx<-56)setTaskSwipe(shell,'left');
  else if(dx>56)setTaskSwipe(shell,'right');
  else resetTaskSwipe(shell);
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
  input.value=d?d.toISOString().slice(0,10):'';
  if(input.showPicker)input.showPicker();else input.click();
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
async function markDoneKV(btn,taskId){const row=btn.closest('.task-row')||btn.closest('.promise-row');if(row){row.style.opacity='0.3';row.style.pointerEvents='none';}try{await fetch(WORKER,{method:'POST',headers:{...authHeaders(),'x-action':'done-task'},body:JSON.stringify({chatId,taskId})});recordAdaptiveActivity('task_done',2);showToast('Готово ✓');setTimeout(loadTasks,600);}catch(e){console.log(e);}}

function setNavActive(id){
  document.querySelectorAll('.nav-item,.nav-mic,.nav-mic-v2').forEach(n=>n.classList.remove('active'));
  document.querySelectorAll('[data-nav="'+id+'"]').forEach(n=>n.classList.add('active'));
}

function showScreen(id){
  const publicScreens=['onboarding','login','forgot-password','reset-password'];
  if(!publicScreens.includes(id)&&!getToken()){
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
  const noNav=['onboarding','login','forgot-password','reset-password','voice','home','chats','msng-settings','chat-conv'];
  if(nav)nav.classList.toggle('hidden',noNav.includes(id));
  // bottom-nav-v2 is inside #home so it's only visible when home is active — no action needed
  const hs=document.querySelector('.scroll-body');
  if(hs)hs.style.paddingBottom=id==='home'?'96px':'16px';
}
function goHome(){showScreen('home');setNavActive('tasks');loadTasks();}
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
  el.classList.add('active');
  renderNotifs(notifCache);
}

function renderNotifs(notifs){
  const list = document.getElementById('notif-list');
  if(!list) return;

  const filtered = notifFilter === 'all' ? notifs : notifs.filter(n => n.type === notifFilter);

  if(filtered.length === 0){
    list.innerHTML = '<div class="notif-empty">Нет уведомлений этого типа</div>';
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
  var icons = {task:taskIcon, deadline:deadlineIcon, reminder:reminderIcon, system:systemIcon};
  var out = '<div class="notif-group-label">' + label + '</div>';
  items.forEach(function(n){
    var isRead = notifReadSet.has(n.id);
    var isUnread = n.unread && !isRead;
    var clr = isUnread ? 'var(--green)' : 'var(--muted)';
    var svg = (icons[n.type]||icons.system).replace('stroke-width', 'stroke="'+clr+'" stroke-width');
    out += '<div class="notif-card' + (isUnread?' unread':'') + '" id="ncard-'+n.id+'">';
    out += '<div class="notif-card-header" onclick="toggleNotif(this)" data-nid="'+n.id+'">';
    out += '<div class="notif-card-icon">'+svg+'</div>';
    out += '<div class="notif-card-body">';
    out += '<div class="notif-card-title">'+e2(n.title)+'</div>';
    out += '<div class="notif-card-time">'+e2(n.time)+'</div>';
    out += '</div>';
    out += '<div class="notif-card-right">';
    if(isUnread) out += '<div class="notif-unread-dot"></div>';
    out += '<span class="notif-chevron" id="nchev-'+n.id+'">&#8250;</span>';
    out += '</div></div>';
    out += '<div class="notif-detail" id="ndet-'+n.id+'">';
    out += '<div class="notif-detail-text">'+e2(n.detail)+'</div>';
    out += '<div class="notif-actions">';
    if(n.type==='task'||n.type==='deadline'||n.type==='reminder'){
      out += '<button class="notif-act-btn notif-act-task" onclick="notifGoToTask(this)" data-nid="'+n.id+'">&#8250; К задаче</button>';
    }
    out += '<button class="notif-act-btn notif-act-read" onclick="notifMarkRead(this)" data-nid="'+n.id+'">✓ Прочитано</button>';
    out += '<button class="notif-act-btn notif-act-del" onclick="notifDelete(this)" data-nid="'+n.id+'">✕</button>';
    out += '</div></div></div>';
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
  const card = document.getElementById('ncard-' + id);
  if(card){ card.style.opacity='0'; card.style.transform='translateX(20px)'; card.style.transition='.2s'; setTimeout(()=>card.remove(),200); }
  showToast('Уведомление удалено');
  updateBellDot(notifCache);
  if(getToken()) fetch(WORKER, { method:'POST', headers:{...authHeaders(),'x-action':'delete-notif'}, body:JSON.stringify({notifId:id}) }).catch(()=>{});
}

function notifGoToTask(el){ var id=(typeof el==='string')?el:el.dataset?.nid;
  showToast('Открываю задачу...');
  goHome();
}
