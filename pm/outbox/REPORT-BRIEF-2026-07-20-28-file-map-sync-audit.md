status: DONE

# REPORT-BRIEF-2026-07-20-28-file-map-sync-audit

## Result
Synced `FILE_MAP_UI.md` line numbers for current `index.html` screen anchors and top-level ranges. Product code was not changed.

## Sections Verified
Raw anchor checks used `Select-String` on `index.html` without reading the file end-to-end.

```text
61:<div class="screen active" id="onboarding">
264:<div class="screen" id="login">
330:<div class="screen" id="home">
370:<nav class="dash-bottom-nav dash-glass" aria-label="Нижняя навигация">
444:<div class="screen" id="task-detail">
504:<div class="screen" id="calendar">
613:<div class="screen screen--no-bottom-nav" id="notifications">
633:<div class="screen" id="profile">
696:<div class="screen" id="subscription">
1509:<div class="screen" id="chat-conv">
1761:<nav class="bottom-nav hidden" id="global-nav" aria-label="Глобальная навигация">
2012:async function initApp(){
3114:async function loadTasks(){
5605:function openTask(t,idx){
6843:function renderCalendar(){
7421:function applyTheme(theme){
7552:function showLockScreen() {
7999:function openChats() {
8443:<div class="screen" id="biometric-consent" style="display:none" role="dialog" aria-modal="true" aria-labelledby="bio-consent-title" aria-describedby="bio-consent-text" aria-hidden="true">
8608:</html>
```

## Changes
- `FILE_MAP_UI.md`: top ranges updated to head `1-55`, HTML `56-1858`, JS `1860-8432`, biometric patch `8436-8585`.
- `FILE_MAP_UI.md`: HTML screen anchor line numbers updated for onboarding/login/home/ask/task-detail/calendar/statistics/notifications/profile/subscription/payment/settings/chats/voice/biometric consent.
- `FILE_MAP_UI.md`: first JS range anchors updated from `1842/1937/2329` to `1860/2012/2359`.
- `FILE_MAP_UI.md`: trailing `--1` / `0-8592` ranges replaced with current `8377-8432` and `8436-8585`.
- `FILE_MAP.md`: no obsolete `CODEX_INSTRUCTIONS.md` path was found.

## Open Tail
Some `FILE_MAP_UI.md` JavaScript range descriptions are still semantically broad because several auth/preview handlers now live in `scripts/auth-handlers.js` and platform helpers live in `scripts/platform-adapter.js`. I did not rewrite those descriptions because the brief asked to update numbers without changing semantics; a later map-cleanup pass can split external script maps more precisely.

## Verification
- `node scripts/check-cp1251-mojibake.mjs`: passed, `0 suspicious tokens`.
- `git diff --check`: passed.
- `bash scripts/check-portable-paths.sh`: passed.
- `git diff --cached --check`: passed.

## Commit
This commit; exact pushed SHA is recorded in the automation final summary.
