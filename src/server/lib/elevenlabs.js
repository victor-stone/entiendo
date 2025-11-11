import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'stream';
import 'dotenv/config';
import { Voices } from '../models/index.js';
import { generateNameFromText, uploadAudioToS3 } from './aws/s3audioBucket.js';
import debug from 'debug';

const debug11 = debug('api:11labs');

const elevenlabs = new ElevenLabsClient();

let voices = null;

export async function generateSpeech(text, voice = selectVoice()) {

  debug11('generate audio with ' + voice.name);
  
  const audio = await elevenlabs.textToSpeech.convert(
    voice.serviceId, 
    {
      text,
      outputFormat: 'mp3_22050_32', // 'mp3_44100_128',
    });

    const readableStream   = Readable.from(audio);
    const audioArrayBuffer = await streamToArrayBuffer(readableStream);
    const name             = generateNameFromText(text);
    return uploadAudioToS3( audioArrayBuffer, name );
}

export function selectVoice() {
  if (!voices) {
    const _voices = new Voices();
    voices = _voices.all();
  }
  const r = Math.random();
  const voice = voices[ r < 0.5 ? 0 : 1];
  return voice;
}

function streamToArrayBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks).buffer);
    });
    readableStream.on('error', reject);
  });
}
