/* LO_Review — 대문(보드)
 * 논문 리뷰 카드와 Conceptual Map 카드를 각각 불러와 박스형으로 보여 줍니다.
 * 카드를 누르면 본문 페이지로 이동하며, 누구나 열람할 수 있습니다.
 * 주차별로 묶고, 마감이 지난 주는 접힌 묶음으로 숨깁니다.
 */
(function () {
  'use strict';

  var PL = window.PL;

  var state = {
    reviews: [],
    maps: []
  };

  var els = {
    reviewEntries: document.getElementById('reviewEntries'),
    reviewSub: document.getElementById('reviewSub'),
    mapEntries: document.getElementById('mapEntries'),
    mapSub: document.getElementById('mapSub')
  };

  function tags(values) {
    var list = values.filter(Boolean);
    if (!list.length) return '';
    return '<div class="tags">' + list.map(function (v) {
      return '<span class="badge">' + PL.esc(v) + '</span>';
    }).join('') + '</div>';
  }

  // 제출자 이름 — 카드 맨 위에 크게
  function who(name) {
    return '<div class="inst-who">' + PL.esc(name || '이름 없음') + '</div>';
  }

  function summaryOf(row) {
    return PL.snippet(row.r5_message || row.r2_problem || row.r1_reason || '', 200);
  }

  /* ---------- 주차 묶음 ----------
   * 한 주(월~일) 단위로 묶습니다. 다음 주 월요일 0시가 되면 그 주는 접힌 묶음이 됩니다.
   * 제출물은 자동으로 지우지 않습니다(삭제는 교수님 요청 시 구글 시트에서 직접).
   */
  var FOLD_AFTER = { reviews: 7, maps: 7 }; // 주 시작(월요일)부터 며칠 뒤 = 다음 주 월요일
  var FOLD_HOUR = 0;

  function foldAt(key, kind) {
    var d = PL.weekKeyToDate(key);
    if (!d) return null;
    d.setDate(d.getDate() + FOLD_AFTER[kind]);
    d.setHours(FOLD_HOUR, 0, 0, 0);
    return d;
  }

  function weekTitle(key) {
    var n = PL.courseWeek(key);
    return n ? n + '주차' : (key || '주차 없음');
  }

  function foldNote(d) {
    var days = ['일', '월', '화', '수', '목', '금', '토'];
    return (d.getMonth() + 1) + '.' + d.getDate() + '(' + days[d.getDay()] + ')에 한 묶음으로 정리';
  }

  // list → [{ key, rows }] 최신 주차부터, 주 안에서는 이름순
  function groupByWeek(list) {
    var groups = {};
    list.forEach(function (r) {
      var k = r.week_key || '';
      (groups[k] = groups[k] || []).push(r);
    });
    return Object.keys(groups)
      .sort(function (a, b) { return b.localeCompare(a); })
      .map(function (k) {
        return {
          key: k,
          rows: groups[k].sort(function (a, b) {
            return String(a.student || '').localeCompare(String(b.student || ''), 'ko');
          })
        };
      });
  }

  /* ---------- Sample 묶음 ----------
   * 작성 예시. PRO-AX Lab Review의 김예서·김재현 리뷰를 이 시트로 복사해 두었습니다.
   * 주차 묶음에서 빼고 맨 위의 'Sample' 묶음에 따로 둡니다. 시트의 id 로 지정합니다.
   */
  var SAMPLE_IDS = {
    reviews: [
      'c5374508-9bb7-4edc-94ae-58270ffad141', // 김예서 — Making transparency transparent
      'db8b1498-3dbb-42d4-b446-af22fe119b6f'  // 김재현 — Transfer of training
    ],
    maps: []
  };

  function isSample(row, kind) {
    return SAMPLE_IDS[kind].indexOf(row.id) !== -1;
  }

  function countLabel(list, kind) {
    var n = list.filter(function (r) { return isSample(r, kind); }).length;
    return '전체 ' + (list.length - n) + '편' + (n ? ' · Sample ' + n + '편' : '');
  }

  function sampleGroup(rows, gridClass, card) {
    if (!rows.length) return '';
    return '<details class="wk-fold wk-sample">' +
      '<summary class="wk-head">Sample<small>' + rows.length + '편</small>' +
        '<span class="wk-note">작성 예시</span></summary>' +
      '<div class="' + gridClass + '">' + rows.map(card).join('') + '</div>' +
    '</details>';
  }

  function renderWeeks(container, list, kind, gridClass, card) {
    var now = new Date();
    var samples = list.filter(function (r) { return isSample(r, kind); });
    var rest = list.filter(function (r) { return !isSample(r, kind); });
    container.innerHTML = sampleGroup(samples, gridClass, card) + groupByWeek(rest).map(function (g) {
      var at = foldAt(g.key, kind);
      var cards = '<div class="' + gridClass + '">' + g.rows.map(card).join('') + '</div>';
      var count = '<small>' + g.rows.length + '편</small>';
      if (at && now < at) {
        return '<section class="wk-open">' +
          '<h3 class="wk-head">' + PL.esc(weekTitle(g.key)) + count +
            '<span class="wk-note">' + PL.esc(foldNote(at)) + '</span></h3>' +
          cards +
        '</section>';
      }
      return '<details class="wk-fold">' +
        '<summary class="wk-head">' + PL.esc(weekTitle(g.key)) + count + '</summary>' +
        cards +
      '</details>';
    }).join('');
  }

  /* ---------- 논문 리뷰 ---------- */

  function renderReviews() {
    var list = state.reviews;
    els.reviewEntries.setAttribute('aria-busy', 'false');
    els.reviewSub.textContent = countLabel(list, 'reviews');

    if (!list.length) {
      els.reviewEntries.innerHTML = '<div class="empty"><strong>아직 제출된 논문 리뷰가 없습니다</strong>' +
        '첫 리뷰를 제출하면 이곳에 카드로 표시되고, 누구나 클릭해 전체 내용을 읽을 수 있습니다. ' +
        '<a href="submit.html">첫 리뷰 제출하기</a></div>';
      return;
    }

    renderWeeks(els.reviewEntries, list, 'reviews', 'entries', function (r) {
      var sum = summaryOf(r);
      return '<a class="inst" href="review.html?id=' + encodeURIComponent(r.id) + '">' +
        who(r.student) +
        tags([r.journal_name, r.pub_year]) +
        '<h3>' + PL.esc(r.paper_title || '(제목 없음)') + '</h3>' +
        (sum ? '<p>' + PL.esc(sum) + '</p>' : '') +
      '</a>';
    });
  }

  /* ---------- Conceptual Map ---------- */

  function thumb(row) {
    var ref = String(row.cm_diagram_ref || '').trim();
    if (!ref) return '';
    var src = PL.fileUrl('concept-maps', ref);
    return '<img class="cm-thumb" src="' + PL.esc(src) + '" alt="' +
      PL.esc((row.student || '') + ' ' + PL.weekShort(row.week_key) + ' Conceptual Map 도식') + '" loading="lazy" />';
  }

  function renderMaps() {
    var list = state.maps;
    els.mapEntries.setAttribute('aria-busy', 'false');
    els.mapSub.textContent = countLabel(list, 'maps');

    if (!list.length) {
      els.mapEntries.innerHTML = '<div class="empty"><strong>아직 제출된 Conceptual Map이 없습니다</strong>' +
        'Conceptual Map을 제출하면 이곳에 도식과 함께 표시됩니다. ' +
        '<a href="concept.html">첫 Conceptual Map 제출하기</a></div>';
      return;
    }

    renderWeeks(els.mapEntries, list, 'maps', 'cm-grid', function (m) {
      return '<a class="inst" href="concept-detail.html?id=' + encodeURIComponent(m.id) + '">' +
        who(m.student) +
        '<h3>' + PL.esc(PL.snippet(m.cm_theory || 'Conceptual Map', 60)) + '</h3>' +
        thumb(m) +
        (m.cm_explanation ? '<p>' + PL.esc(PL.snippet(m.cm_explanation, 200)) + '</p>' : '') +
      '</a>';
    });
  }

  /* ---------- 이벤트 ---------- */

  function boot() {
    PL.table('reviews').list()
      .then(function (rows) {
        state.reviews = rows || [];
        renderReviews();
      })
      .catch(function (err) {
        els.reviewEntries.setAttribute('aria-busy', 'false');
        els.reviewEntries.innerHTML = '<div class="empty"><strong>논문 리뷰를 불러오지 못했습니다</strong>' +
          PL.esc(err.message || '네트워크 오류') + '</div>';
      });

    PL.table('concept_maps').list()
      .then(function (rows) {
        state.maps = rows || [];
        renderMaps();
      })
      .catch(function (err) {
        els.mapEntries.setAttribute('aria-busy', 'false');
        els.mapEntries.innerHTML = '<div class="empty"><strong>Conceptual Map을 불러오지 못했습니다</strong>' +
          PL.esc(err.message || '네트워크 오류') + '</div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
