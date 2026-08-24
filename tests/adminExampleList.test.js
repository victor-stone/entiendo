import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAdminExampleList } from '../src/client/components/admin/exampleListState.js';
import { createExamplesStore } from '../src/client/stores/createExamplesStore.js';

test('the admin list waits for its own response instead of using learner examples', () => {
  const state = resolveAdminExampleList({
    data: null,
    error: null,
    expectedIdiomId: 'idiom-one',
    loading: false,
    responseIdiomId: null,
  });

  assert.deepEqual(state, { status: 'loading', examples: [] });
});

test('the admin list exposes request and response-shape errors', () => {
  assert.deepEqual(resolveAdminExampleList({
    data: null,
    error: 'Forbidden',
    expectedIdiomId: 'idiom-one',
    loading: false,
    responseIdiomId: 'idiom-one',
  }), {
    status: 'error',
    error: 'Forbidden',
    examples: [],
  });

  assert.deepEqual(resolveAdminExampleList({
    data: { examples: null },
    error: null,
    expectedIdiomId: 'idiom-one',
    loading: false,
    responseIdiomId: 'idiom-one',
  }), {
    status: 'error',
    error: 'The admin examples response is invalid',
    examples: [],
  });
});

test('the admin list accepts empty and populated canonical responses', () => {
  assert.equal(resolveAdminExampleList({
    data: { examples: [] },
    error: null,
    expectedIdiomId: 'idiom-one',
    loading: false,
    responseIdiomId: 'idiom-one',
  }).status, 'empty');

  const example = { exampleId: 'example-one', audioVariants: {} };
  assert.deepEqual(resolveAdminExampleList({
    data: { examples: [example] },
    error: null,
    expectedIdiomId: 'idiom-one',
    loading: false,
    responseIdiomId: 'idiom-one',
  }), {
    status: 'ready',
    examples: [example],
  });
});

test('a late response from a previous idiom cannot replace the current response', async () => {
  const pending = new Map();
  const store = createExamplesStore((idiomId) => new Promise((resolve) => {
    pending.set(idiomId, resolve);
  }));

  const first = store.getState().fetch('idiom-one', 'token');
  const second = store.getState().fetch('idiom-two', 'token');

  pending.get('idiom-one')({
    examples: [{ exampleId: 'stale', audioVariants: {} }],
  });
  await first;

  assert.equal(store.getState().idiomId, 'idiom-two');
  assert.equal(store.getState().data, null);
  assert.equal(store.getState().loading, true);

  const currentData = {
    examples: [{ exampleId: 'current', audioVariants: {} }],
  };
  pending.get('idiom-two')(currentData);
  await second;

  assert.deepEqual(store.getState().data, currentData);
  assert.equal(store.getState().loading, false);
});

test('reset invalidates an in-flight admin examples request', async () => {
  let resolveRequest;
  const store = createExamplesStore(() => new Promise((resolve) => {
    resolveRequest = resolve;
  }));

  const request = store.getState().fetch('idiom-one', 'token');
  store.getState().reset();
  resolveRequest({ examples: [{ exampleId: 'stale', audioVariants: {} }] });
  await request;

  assert.deepEqual(store.getState(), {
    loading: false,
    error: null,
    data: null,
    idiomId: null,
    fetch: store.getState().fetch,
    reset: store.getState().reset,
  });
});
