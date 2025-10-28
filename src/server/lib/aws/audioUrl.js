import { generatePresignedUrl } from '../../lib/audio.js';

const urlMap = new Map();

export async function getAudioUrl(key) {
  const mapping = urlMap.get(key);
  if( !mapping ) {
    mapping = { url: '', expires: 0 };
  }
  if( mapping.expires < Date.now() ) {
    mapping.url = await generatePresignedUrl(key);
  } 
  urlMap.set(key, mapping);
  return mapping.url;
}

export function setAudioUrl(key, url, expires) {
  urlMap.set( key, { url, expires })
}