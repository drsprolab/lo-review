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
  const properties = { BEST_ADMIN_PASSWORD: 'private-admin-secret' };
  context.PropertiesService = { getScriptProperties: () => ({ getProperty: key => properties[key] || null }) };
  context.LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../apps-script/Code.gs'), 'utf8'), context);
  context.sheetFor = name => name;
  context.getRow = (sheet, id) => rows[sheet].find(row => row.id === id);
  context.listRows = sheet => rows[sheet];
  context.updateRow = (sheet, id, data) => Object.assign(context.getRow(sheet, id), data);
  return { context, rows, properties };
}

test('BEST authorization fails closed and accepts only the separate admin password', () => {
  const { context, properties } = setup();
  assert.throws(() => context.requireBestAdmin({ best_key: 'shared-viewer-password' }), /BEST_AUTH/);
  assert.throws(() => context.requireBestAdmin({ best_key: 'wrong' }), /BEST_AUTH/);
  assert.doesNotThrow(() => context.requireBestAdmin({ best_key: 'private-admin-secret' }));
  assert.throws(() => context.requireBestAdminForWrite({ data: { best_of_week: true }, key: 'shared-viewer-password' }), /BEST_AUTH/);
  assert.doesNotThrow(() => context.requireBestAdminForWrite({ data: { best_of_week: true }, best_key: 'private-admin-secret' }));
  assert.doesNotThrow(() => context.requireBestAdminForWrite({ data: { paper_title: 'ordinary submission' } }));
  delete properties.BEST_ADMIN_PASSWORD;
  assert.throws(() => context.requireBestAdmin({ best_key: 'private-admin-secret' }), /BEST_AUTH/);
});

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
