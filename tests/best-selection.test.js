const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function setup() {
  const rows = {
    reviews: [
      { id: 'old', week_key: '2026-W43', best_of_week: true },
      { id: 'new', week_key: '2026-W43', best_of_week: false },
      { id: 'other-week', week_key: '2026-W44', best_of_week: true, best_selected_at: 1 }
    ],
    concept_maps: [{ id: 'map', week_key: '2026-W43', best_of_week: false }]
  };
  const context = vm.createContext({ Date, Object, String });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), context);
  context.sheetFor = name => name;
  context.getRow = (sheet, id) => rows[sheet].find(row => row.id === id);
  context.listRows = sheet => rows[sheet];
  context.updateRow = (sheet, id, data) => Object.assign(context.getRow(sheet, id), data);
  return { context, rows };
}

test('selecting a review clears a legacy choice in the same week only', () => {
  const { context, rows } = setup();
  const selected = context.updateBest('reviews', 'new', { best_of_week: true });
  assert.equal(rows.reviews[0].best_of_week, false);
  assert.equal(rows.reviews[0].best_selected_at, '');
  assert.equal(selected.best_of_week, true);
  assert.ok(selected.best_selected_at);
  assert.equal(rows.reviews[2].best_of_week, true);
});

test('selecting a concept map replaces a review choice for the same week', () => {
  const { context, rows } = setup();
  const selected = context.updateBest('concept_maps', 'map', { best_of_week: true });
  assert.equal(rows.reviews[0].best_of_week, false);
  assert.equal(selected.best_of_week, true);
});

test('unchecking the selected entry removes its badge flag', () => {
  const { context, rows } = setup();
  context.updateBest('reviews', 'new', { best_of_week: true });
  context.updateBest('reviews', 'new', { best_of_week: false });
  assert.equal(rows.reviews[1].best_of_week, false);
  assert.equal(rows.reviews[1].best_selected_at, '');
});
