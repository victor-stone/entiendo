import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Readable } from 'stream';
import 'dotenv/config';
import { Voices } from '../models/index.js';
import { generateNameFromText, uploadAudioToS3 } from './aws/s3audioBucket.js';
import { VOICE_CONVERSATION } from '../../shared/constants/voiceTypes.js';
import {
  selectVoiceFromList,
  voiceSpeedForVoice,
  voiceTypeForVoice,
} from '../api/lib/audioVariantUtils.js';
import debug from 'debug';

const debug11 = debug('api:11labs');

const elevenlabs = new ElevenLabsClient();

export async function generateSpeech(text, voice = selectVoice()) {
  debug11('generate audio with ' + voice.name);

  const voiceType = voiceTypeForVoice(voice);
  const speed = voiceSpeedForVoice(voice, voiceType);
  const audio = await elevenlabs.textToSpeech.convert(
    voice.serviceId,
    {
      text,
      outputFormat: 'mp3_22050_32', // 'mp3_44100_128',
      voiceSettings: { speed },
    });

  const readableStream = Readable.from(audio);
  const audioBuffer = await streamToBuffer(readableStream);
  // Keep independently generated styles from resolving to the same S3 key.
  const name = generateNameFromText(`${voiceType}_${text}`);
  return uploadAudioToS3(audioBuffer, name);
}

export function selectVoice(
  voiceType = VOICE_CONVERSATION,
  availableVoices = null,
  random = Math.random,
) {
  const voices = availableVoices || new Voices().all();
  return selectVoiceFromList(voices, voiceType, random);
}

export async function streamToBuffer(readableStream) {
  const chunks = [];
  for await (const chunk of readableStream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
