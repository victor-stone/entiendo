import { uploadAudioToS3 } from "../../lib/audio.js"

export async function uploadExampleAudioFromHTTPForm(payload, filename) {
  const audioContent = payload.file !== "" && (payload.file || payload.files.file).data;
  const contentType = audioContent
    ? (payload.file || payload.files.file).mimetype || "audio/mpeg"
    : undefined;
  const s3Info = audioContent
    ? await uploadAudioToS3(audioContent, filename, contentType)
    : { key: null };
  return s3Info;
}

