import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { streamToBuffer } from '../src/server/lib/elevenlabs.js';
import { uploadAudioToS3 } from '../src/server/lib/aws/s3audioBucket.js';

test('ElevenLabs stream collection returns the exact audio bytes as a Buffer', async () => {
  const first = Uint8Array.from([1, 2, 3]);
  const storage = Uint8Array.from([99, 4, 5, 6, 99]);
  const second = storage.subarray(1, 4);

  const audio = await streamToBuffer(Readable.from([first, second]));

  assert.equal(Buffer.isBuffer(audio), true);
  assert.equal(audio.length, 6);
  assert.deepEqual([...audio], [1, 2, 3, 4, 5, 6]);
});

test('the exact Buffer has the same SHA-256 when AWS signs and sends it', async () => {
  const audio = await streamToBuffer(Readable.from([
    Uint8Array.from({ length: 11_000 }, (_, index) => index % 251),
  ]));
  let handled = false;

  const client = new S3Client({
    region: 'us-east-1',
    endpoint: 'https://s3.us-east-1.amazonaws.com',
    credentials: {
      accessKeyId: 'test-access-key',
      secretAccessKey: 'test-secret-key',
    },
    requestHandler: {
      async handle(request) {
        handled = true;
        assert.equal(Buffer.isBuffer(request.body), true);
        const sentHash = createHash('sha256').update(request.body).digest('hex');
        assert.equal(request.headers['x-amz-content-sha256'], sentHash);
        return {
          response: {
            statusCode: 200,
            headers: {},
            body: Readable.from([]),
          },
        };
      },
    },
  });

  await client.send(new PutObjectCommand({
    Bucket: 'test-bucket',
    Key: 'tts/test.mp3',
    Body: audio,
    ContentType: 'audio/mpeg',
  }));

  assert.equal(handled, true);
  client.destroy();
});

test('audio uploads reject backing ArrayBuffers before contacting S3', async () => {
  const pooledBuffer = Buffer.from([1, 2, 3]);

  await assert.rejects(
    uploadAudioToS3(pooledBuffer.buffer, 'invalid.mp3'),
    /audioContent must be a Buffer or file path/,
  );
});
