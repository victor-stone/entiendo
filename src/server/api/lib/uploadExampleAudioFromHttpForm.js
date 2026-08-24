import { uploadAudioToS3 } from "../../lib/aws/s3audioBucket.js"

export async function uploadExampleAudioFromHTTPForm(payload, filename) {
  const directFile = payload?.file && typeof payload.file === 'object'
    ? payload.file
    : null;
  const multipartFile = payload?.files?.file;
  const file = directFile || multipartFile || null;

  if (!file?.data) {
    return { key: null, url: null, expires: 0 };
  }

  return uploadAudioToS3(
    file.data,
    filename,
    file.mimetype || "audio/mpeg"
  );
}
