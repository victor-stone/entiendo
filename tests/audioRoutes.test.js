import test from 'node:test';
import assert from 'node:assert/strict';

import { getRouteHandler } from '../src/server/http/routeTable.js';

test('the idempotent exercise audio route is authenticated and extracts parameters', () => {
  const route = getRouteHandler(
    'PUT',
    '/api/exercises/example-123/audio/education',
  );

  assert.ok(route);
  assert.equal(route.auth, true);
  assert.deepEqual(route.params, {
    exampleId: 'example-123',
    voiceType: 'education',
  });
});

test('admin example reads and mutations require authentication', () => {
  assert.equal(
    getRouteHandler('GET', '/api/example/example-123').auth,
    true,
  );
  assert.equal(
    getRouteHandler('GET', '/api/example/idiom/idiom-123').auth,
    true,
  );
  assert.equal(
    getRouteHandler('POST', '/api/example/example-123').auth,
    true,
  );
});

test('removed homework and assignment endpoints do not resolve', () => {
  assert.equal(getRouteHandler('POST', '/api/editor/assign'), null);
  assert.equal(getRouteHandler('POST', '/api/editor/publish'), null);
  assert.equal(getRouteHandler('POST', '/api/editor/fulfill'), null);
  assert.equal(getRouteHandler('POST', '/api/editor/homeworkreports'), null);
  assert.equal(getRouteHandler('GET', '/api/editors'), null);
});
