import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { S3, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import os from 'os';
import debug from 'debug';

const s3 = new S3();

const debugTTS = debug('api:tts');

/**
 * Uploads an audio file to S3 and generates URLs for access
 * @param {Buffer|string} audioContent - The audio content as a Buffer or file path
 * @param {string} [filename] - Optional custom filename (will be generated if not provided)
 * @param {string} [contentType='audio/mpeg'] - Content type of the audio file
 * @returns {Promise<{publicUrl: string, url: string, expires: number}>} - The S3 URLs and expiry timestamp
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
      publicUrl: s3Url,
      url: presignedUrl,
      expires: Date.now() + (3600 * 1000) // 1 hour from now in milliseconds
    };
  } catch (error) {
    throw new Error(`Failed to upload audio to S3: ${error.message}`);
  }
}

/**
 * Azure TTS client for generating speech audio
 */

const azureTTS = {
  /**
   * Generates speech from text using Azure TTS and uploads to S3
   * @param {string} text - The Spanish text to convert to speech
   * @param {string} [voice='es-UY-ValentinaNeural'] - The voice to use
   * @returns {Promise<{url: string, presignedUrl: string, expires: number}>} - The S3 URL, presigned URL, and expiry timestamp
   */
  generateSpeech: async (text, voice = 'es-UY-ValentinaNeural') => {
    try {
      debugTTS(`[TTS] Starting speech generation for text: "${text}"`);
      debugTTS(`[TTS] Using voice: ${voice}`);
      
      // Generate a unique filename
      const timestamp     = Date.now();
      const sanitizedText = text.substring(0, 20).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const filename      = `${sanitizedText}_${timestamp}.mp3`;
      
      // Create a temporary file path
      const tempFilePath = path.join(os.tmpdir(), filename);
      
      debugTTS(`[TTS] Temporary file path: ${tempFilePath}`);
      
      // Generate the audio file
      await _synthesizeSpeechToFile(
        process.env.AZURE_SPEECH_KEY,
        process.env.AZURE_SPEECH_REGION,
        text,
        voice,
        tempFilePath
      );
      
      // Check if the file was created and has content
      const fileStats = fs.statSync(tempFilePath);
      debugTTS(`[TTS] Generated audio file size: ${fileStats.size} bytes`);
      
      if (fileStats.size === 0) {
        throw new Error('Generated audio file is empty');
      }
      
      // Upload to S3 using the extracted function
      const result = await uploadAudioToS3(tempFilePath, filename);
      
      // Clean up the temporary file
      fs.unlinkSync(tempFilePath);
      debugTTS(`[TTS] Temporary file removed`);
      
      debugTTS(`[TTS] Process completed successfully`);
      
      return result;
    } catch (error) {
      // console.error('[TTS] Error generating TTS audio:', error);
      throw new Error(`Failed to generate speech audio: ${error.message}`);
    }
  },
  
  /**
   * Generate a presigned URL for an existing audio file
   * @param {string} url - The S3 URL or S3 key of the audio file
   * @param {number} [expiresIn=3600] - Expiration time in seconds (default 1 hour)
   * @returns {Promise<{presignedUrl: string, expires: number}>} - The presigned URL and expiry timestamp
   */
  generatePresignedUrl: async (url, expiresIn = 3600) => {
    try {
      const s3Key = getS3Key(url);
      
      debugTTS(`[TTS] Generating presigned URL for S3 key: ${s3Key}`);
      
      // Generate presigned URL
      const getObjectParams = {
        Bucket: process.env.AUDIO_BUCKET,
        Key: s3Key
      };
      
      const command      = new GetObjectCommand(getObjectParams);
      const presignedUrl = await getSignedUrl(s3, command, { expiresIn });
      const expires      = Date.now() + (expiresIn * 1000);
      debugTTS(`[TTS] Presigned URL generated, expires in ${expiresIn} seconds: ${new Date(expires)}`);
      
      return {
        url: presignedUrl,
        expires
      };
    } catch (error) {
      // console.error('[TTS] Error generating presigned URL:', error);
      throw new Error(`Failed to generate presigned URL: ${error.message}`);
    }
  },
  
  /**
   * Alternative voice options for Rioplatense Spanish
   * 
   * es-UY-ValentinaNeural
   * es-UY-MateoNeural
   * 
   */
  voiceOptions: [
    { id: 'es-AR-ElenaNeural', name: 'Elena (female)', gender: 'Female' }
    ,{ id: 'es-AR-TomasNeural', name: 'Matias (male)', gender: 'Male' }
    ,{ id: 'es-UY-MateoNeural', name: 'Mateo (male)', gender: 'Male' }
    ,{ id: 'es-UY-ValentinaNeural', name: 'Valentina (female)', gender: 'Female' }
  ]
};

export default azureTTS

// LOCAL HELPER

/**
 * Helper function to synthesize speech to a file
 * @param {string} subscriptionKey - The Azure Speech subscription key
 * @param {string} region - The Azure Speech region
 * @param {string} text - The text to synthesize
 * @param {string} voice - The voice to use
 * @param {string} outputFilePath - The path to save the audio file
 * @returns {Promise<void>}
 */
async function _synthesizeSpeechToFile(subscriptionKey, region, text, voice, outputFilePath) {
  // Create speech config
  const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
  
  // Set output format to MP3
  speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3;
  
  // Create audio config for file output
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(outputFilePath);
  
  // Create synthesizer
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
  
  // Create the SSML
  const ssml = `
  <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="es-AR">
    <voice name="${voice}">
      <prosody rate="0.9">
        ${text}
      </prosody>
    </voice>
  </speak>
  `;
  
  debugTTS(`[TTS] Starting synthesis with SSML`);
  
  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      result => {
        if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
          debugTTS(`[TTS] Synthesis completed successfully`);
          // Add a small delay before closing to ensure all data is flushed to the file
          setTimeout(() => {
            synthesizer.close();
            resolve();
          }, 100);
        } else {
          console.error(`[TTS] Synthesis failed: ${result.errorDetails}`);
          synthesizer.close();
          reject(new Error(`Speech synthesis failed: ${result.errorDetails || 'Unknown error'}`));
        }
      },
      error => {
        console.error(`[TTS] Error in synthesis: ${error}`);
        synthesizer.close();
        reject(new Error(`Speech synthesis error: ${error}`));
      }
    );
  });
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
    await s3.deleteObject({
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
 * @returns {Promise<{publicUrl: string, url: string, expires: number}>} - The new S3 URLs and expiry timestamp
 */
export async function renameAudioInS3(oldUrlOrKey, newFilename) {
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

    // Generate a presigned URL that expires in 1 hour (3600 seconds)
    const getObjectParams = {
      Bucket: bucket,
      Key: newKey
    };
    const command = new GetObjectCommand(getObjectParams);
    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

    return {
      publicUrl: s3Url,
      url: presignedUrl,
      expires: Date.now() + (3600 * 1000)
    };
  } catch (error) {
    throw new Error(`Failed to rename audio in S3: ${error.message}`);
  }
}
