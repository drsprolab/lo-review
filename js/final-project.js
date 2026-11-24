/* 최종과제 제출 (팀프로젝트 팀) — 대문의 주의사항 옆 칸.
 * PDF 한 개를 드라이브(LO_Review 최종과제 폴더)에 올리고, 팀 이름·제출자·파일 정보를 시트 final_projects 에 저장한다.
 * 제출물은 지우거나 덮어쓰지 않는다(다시 내면 새 행이 추가되며, 최신 제출은 created_at 으로 구분). */
(function () {
  'use strict';
  var MAX = 20 * 1024 * 1024;
  var form = document.getElementById('finalForm');
  if (!form || !window.PL) return;
  var team = document.getElementById('finalTeam'), who = document.getElementById('finalName');
  var fileInput = document.getElementById('finalFile'), drop = document.getElementById('finalDrop');
  var dropTitle = document.getElementById('finalDropTitle'), dropSub = document.getElementById('finalDropSub');
  var msg = document.getElementById('finalMsg'), btn = document.getElementById('finalSubmit');
  var file = null;
  var DEFAULT_TITLE = dropTitle.textContent, DEFAULT_SUB = dropSub.textContent;

  function say(text, kind) { msg.textContent = text || ''; msg.className = 'dz-hint' + (kind ? ' is-' + kind : ''); }
  function size(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB'; }

  function pick(f) {
    if (!f) return;
    if (!/\.pdf$/i.test(f.name) || (f.type && f.type !== 'application/pdf')) { say('PDF 파일만 올릴 수 있습니다.', 'err'); return; }
    if (f.size > MAX) { say('PDF는 20MB 이하만 올릴 수 있습니다. (' + size(f.size) + ')', 'err'); return; }
    if (!f.size) { say('빈 파일입니다.', 'err'); return; }
    file = f; say('');
    drop.classList.add('is-filled');
    dropTitle.textContent = f.name; dropSub.textContent = size(f.size) + ' · 다른 파일을 고르려면 다시 누르세요';
  }
  function reset() {
    file = null; fileInput.value = ''; drop.classList.remove('is-filled');
    dropTitle.textContent = DEFAULT_TITLE; dropSub.textContent = DEFAULT_SUB;
  }

  fileInput.addEventListener('change', function () { pick(fileInput.files && fileInput.files[0]); });
  ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('is-over'); }); });
  ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('is-over'); }); });
  drop.addEventListener('drop', function (e) { pick(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var t = team.value.trim(), n = who.value.trim();
    if (!t) { say('팀 이름을 적어 주세요.', 'err'); team.focus(); return; }
    if (!n) { say('팀원 전체 이름을 띄어쓰기로 구분해 적어 주세요.', 'err'); who.focus(); return; }
    if (!file) { say('제출할 PDF 파일을 골라 주세요.', 'err'); return; }
    btn.disabled = true; btn.textContent = '올리는 중…';
    say('PDF를 올리고 있습니다. 창을 닫지 말아 주세요.');
    window.PL.upload('final_projects', file).then(function (up) {
      return window.PL.table('final_projects').create({
        team_name: t, submitter: n, file_ref: up.reference, file_name: up.original_filename || file.name, file_size: up.size || file.size
      });
    }).then(function () {
      say('제출되었습니다: ' + t + ' · ' + file.name, 'ok');
      if (window.PL.toast) window.PL.toast('최종과제가 제출되었습니다.');
      reset(); form.reset();
    }).catch(function (err) {
      say((err && err.message) || '제출하지 못했습니다. 잠시 후 다시 시도해 주세요.', 'err');
    }).then(function () { btn.disabled = false; btn.textContent = '최종과제 제출'; });
  });
})();
