import { S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import debug from 'debug';

const s3 = new S3();

const debugTTS = debug('api:tts');

/**
 *  UTITILY FUNC - not part of the pap
 * 
 * Lists all objects in the configured S3 bucket (optionally under a prefix).
 * @param {object} [opts]
 * @param {string} [opts.prefix] - Optional key prefix (e.g., 'tts/')
 * @returns {Promise<Array<{key: string, size: number, lastModified: Date, etag?: string}>>}
 */
export async function listBucketFiles(opts = {}) {
  const bucket = process.env.AUDIO_BUCKET;
  if (!bucket) throw new Error('AUDIO_BUCKET env var is not set');

  const prefix = opts.prefix || undefined;

  let continuationToken = undefined;
  const results = [];

  try {
    do {
      const resp = await s3.listObjectsV2({
        Bucket: bucket,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      });

      const contents = resp.Contents || [];
      for (const obj of contents) {
        // Guard against possible undefined keys for folders
        if (!obj.Key) continue;
        results.push({
          key: obj.Key,
          size: obj.Size ?? 0,
          lastModified: obj.LastModified ?? null,
          etag: obj.ETag,
        });
      }

      continuationToken = resp.IsTruncated ? resp.NextContinuationToken : undefined;
    } while (continuationToken);

    return results;
  } catch (err) {
    throw new Error(`Failed to list S3 objects: ${err.message}`);
  }
}

/**
 * Uploads an audio file to S3 and generates URLs for access
 * @param {Buffer|string} audioContent - The audio content as a Buffer or file path
 * @param {string} [filename] - Optional custom filename (will be generated if not provided)
 * @param {string} [contentType='audio/mpeg'] - Content type of the audio file
 * @returns {Promise<{key: string, url: string, expires: number}>} - The S3 URLs and expiry timestamp
 */
export async function uploadAudioToS3(audioContent, filename, contentType = 'audio/mpeg') {
  try {
    // Generate a unique filename if not provided
    let fileBuffer;

    if (!filename) {
      const timestamp = Date.now();
      filename = `audio_${timestamp}.mp3`;
    }

    // Create the S3 key with 'tts/' prefix
    const s3Key = getS3Key(`tts/${filename}`);

    // Handle input as either a file path or buffer
    if (typeof audioContent === 'string') {
      // It's a file path
      fileBuffer = fs.readFileSync(audioContent);
    } else {
      // It's already a buffer
      fileBuffer = audioContent;
    }

    // Upload to S3
    const uploadParams = {
      Bucket: process.env.AUDIO_BUCKET,
      Key: s3Key,
      Body: fileBuffer,
      ContentType: contentType
    };

    await s3.putObject(uploadParams);

    // Generate the permanent S3 URL
    const s3Url = `https://${process.env.AUDIO_BUCKET}.s3.amazonaws.com/${s3Key}`;

    // Generate a presigned URL that expires in 1 hour (3600 seconds)
    const getObjectParams = {
      Bucket: process.env.AUDIO_BUCKET,
      Key: s3Key
    };

    const command = new GetObjectCommand(getObjectParams);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    // Return both URLs
    return {
      key: s3Url,
      url: presignedUrl,
      expires: Date.now() + (3600 * 1000) // 1 hour from now in milliseconds
    };
  } catch (error) {
    throw new Error(`Failed to upload audio to S3: ${error.message}`);
  }
}

/**
 * Generate a presigned URL for an existing audio file
 * @param {string} url - The S3 URL or S3 key of the audio file
 * @param {number} [expiresIn=3600] - Expiration time in seconds (default 1 hour)
 * @returns {Promise<{url: string, expires: number}>} - The presigned URL and expiry timestamp
 */
async function generatePresignedUrl(url, expiresIn = 3600) {
  try {
    const s3Key = getS3Key(url);

    debugTTS(`[TTS] Generating presigned URL for S3 key: ${s3Key}`);

    // Generate presigned URL
    const getObjectParams = {
      Bucket: process.env.AUDIO_BUCKET,
      Key: s3Key
    };

    const command = new GetObjectCommand(getObjectParams);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn });
    const expires = Date.now() + (expiresIn * 1000);
    debugTTS(`[TTS] Presigned URL generated (expires in ${expiresIn}s at ${new Date(expires).toISOString()})`);

    return {
      url: presignedUrl,
      expires
    };
  } catch (error) {
    // console.error('[TTS] Error generating presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
}

export function generateNameFromText(text) {
  return text.substring(0, 30).replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.mp3';
}

/**
 * Utility to extract the S3 key from a URL or key and ensure 'tts/' prefix
 * @param {string} urlOrKey - The S3 URL or S3 key
 * @returns {string} - The normalized S3 key with 'tts/' prefix
 */
function getS3Key(urlOrKey) {
  let s3Key;
  if (urlOrKey.startsWith('https://') || urlOrKey.startsWith('http://')) {
    const urlObj = new URL(urlOrKey);
    s3Key = urlObj.pathname.slice(1); // Remove leading slash
  } else {
    s3Key = urlOrKey;
  }
  if (!s3Key.startsWith('tts/')) {
    s3Key = s3Key.startsWith('/') ? `tts${s3Key}` : `tts/${s3Key}`;
  }
  return s3Key;
}

/**
 * Deletes an audio file from S3 given its URL or S3 key
 * @param {string} url - The S3 URL or S3 key of the audio file
 * @returns {Promise<void>}
 */
export async function deleteAudioFromS3(url) {
  try {
    const s3Key = getS3Key(url);
    return await s3.deleteObject({
      Bucket: process.env.AUDIO_BUCKET,
      Key: s3Key
    });
  } catch (error) {
    throw new Error(`Failed to delete audio from S3: ${error.message}`);
  }
}

/**
 * Renames an audio file in S3 by copying to a new key and deleting the old one
 * @param {string} oldUrlOrKey - The S3 URL or S3 key of the audio file to rename
 * @param {string} newFilename - The new filename (should include extension, e.g. 'newfile.mp3')
 * @returns {Promise<{key: string, url: string, expires: number}>} - The new S3 URLs and expiry timestamp
 */
export async function renameAudioInS3(oldUrlOrKey, newFilename, genPublic = true) {
  try {
    const oldKey = getS3Key(oldUrlOrKey);
    const newKey = getS3Key(`tts/${newFilename}`);
    const bucket = process.env.AUDIO_BUCKET;

    // Copy the object to the new key
    await s3.copyObject({
      Bucket: bucket,
      CopySource: `/${bucket}/${oldKey}`,
      Key: newKey
    });

    // Delete the old object
    await s3.deleteObject({
      Bucket: bucket,
      Key: oldKey
    });

    // Generate the permanent S3 URL
    const s3Url = `https://${bucket}.s3.amazonaws.com/${newKey}`;

    if( !genPublic ) {
      return s3Url;
    }

    // Generate a presigned URL that expires in 1 hour (3600 seconds)
    const getObjectParams = {
      Bucket: bucket,
      Key: newKey
    };

    const EXPIRE = 3600;

    const command = new GetObjectCommand(getObjectParams);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: EXPIRE });

    return {
      key: s3Url,
      url: presignedUrl,
      expires: Date.now() + (EXPIRE * 1000)
    };

  } catch (error) {
    throw new Error(`Failed to rename audio in S3: ${error.message}`);
  }
}

const urlMap = new Map();

export async function getAudioUrl(key) {
  let mapping = urlMap.get(key);
  if (!mapping) {
    mapping = { url: '', expires: 0 };
  }
  if (mapping.expires < Date.now()) {
    mapping = await generatePresignedUrl(key);
  } else {
    debugTTS('audio url is up to date');
  }
  urlMap.set(key, mapping);
  return mapping.url;
}

export function setAudioUrl(key, url, expires) {
  urlMap.set(key, { url, expires });
}
