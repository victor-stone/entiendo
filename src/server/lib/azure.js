import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import path from 'path';
import os from 'os';

/**
 * NOTE: This module (should be) dead.
 * 
 * the app is now using 11labs for TTS
 */

const azureTTS = {
  /**
   * Generates speech from text using Azure TTS and uploads to S3
   * @param {string} text - The Spanish text to convert to speech
   * @param {string} [voice='es-UY-ValentinaNeural'] - The voice to use
   * @returns {Promise<{key: string, url: string, expires: number}>} - The S3 URL, presigned URL, and expiry timestamp
   */
  generateSpeech: async (text, voice = 'es-UY-ValentinaNeural') => {
    try {
      debugTTS(`[TTS] Starting speech generation for text: "${text}"`);
      debugTTS(`[TTS] Using voice: ${voice}`);

      // Generate a unique filename
      const filename = generateNameFromText(text);

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

    selectVoice() {
    const voiceOptions = [
      { id: 'es-UY-MateoNeural',     name: 'Mateo',     gender: 'Male',   weight: 0.5 },
      { id: 'es-UY-ValentinaNeural', name: 'Valentina', gender: 'Female', weight: 0.3 },
      { id: 'es-AR-TomasNeural',     name: 'Matias',    gender: 'Male',   weight: 0.1 },
      { id: 'es-AR-ElenaNeural',     name: 'Elena',     gender: 'Female', weight: 0.1 }
    ];

    const r = Math.random();
    let sum = 0;
    for (let i = 0; i < voiceOptions.length; i++) {
      sum += voiceOptions[i].weight;
      if (r < sum) 
        return voiceOptions[i];
    }
  }
}

export default azureTTS;


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
