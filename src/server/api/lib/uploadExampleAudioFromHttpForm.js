import { uploadAudioToS3 } from "../../lib/audio.js"

export async function uploadExampleAudioFromHTTPForm(payload, filename) {
  const audioContent = payload.file !== "" && (payload.file || payload.files.file).data;
  const contentType = audioContent
    ? (payload.file || payload.files.file).mimetype || "audio/mpeg"
    : undefined;
  const audio = audioContent
    ? await uploadAudioToS3(audioContent, filename, contentType)
    : undefined;
  return audio;
}

