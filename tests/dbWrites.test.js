import test from 'node:test';
import assert from 'node:assert/strict';

import db from '../src/server/models/db.js';

class TestRecords extends db {
  constructor() {
    super('test-write-queue', 'id');
    this.data = [];
  }
}

test('full-dataset writes are serialized and retain their call-time snapshots', async () => {
  const originalWriteJson = db.writeJson;
  const originalPreventWrite = db.preventWrite;
  const writes = [];
  let releaseFirstWrite;
  const firstWriteGate = new Promise(resolve => { releaseFirstWrite = resolve; });

  db.preventWrite = false;
  db.writeJson = async (_path, data) => {
    writes.push(structuredClone(data));
    if (writes.length === 1) await firstWriteGate;
    return `version-${writes.length}`;
  };

  try {
    const records = new TestRecords();
    records.data = [{ id: 'one', value: 1 }];
    const first = records.commit();

    records.data = [
      { id: 'one', value: 1 },
      { id: 'two', value: 2 },
    ];
    const second = records.commit();

    await Promise.resolve();
    await Promise.resolve();
    assert.equal(writes.length, 1);

    releaseFirstWrite();
    await Promise.all([first, second]);

    assert.deepEqual(writes, [
      [{ id: 'one', value: 1 }],
      [
        { id: 'one', value: 1 },
        { id: 'two', value: 2 },
      ],
    ]);
  } finally {
    db.writeJson = originalWriteJson;
    db.preventWrite = originalPreventWrite;
  }
});

