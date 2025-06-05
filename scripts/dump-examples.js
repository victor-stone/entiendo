import { ExampleModel } from '../src/server/models/index.js';

/*
{
    "conjugatedSnippet": "pagó el pato",
    "audio": {
        "publicUrl": "https://entiendo-audio-files-426593798727.s3.amazonaws.com/tts/audio_1748809695412.mp3",
        "voice": "lucia",
        "expires": 1748813296000,
        "url": "https://entiendo-audio-files-426593798727.s3.sa-east-1.amazonaws.com/tts/audio_1748809695412.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAWGUXYZJDRGSAAOEZ%2F20250601%2Fsa-east-1%2Fs3%2Faws4_request&X-Amz-Date=20250601T202815Z&X-Amz-Expires=3600&X-Amz-Signature=303661f8a49ebacd2fa1e66d1804227cf450320e1edab74ae17229923656ff31&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject"
    },
    "createdAt": 1748809696000,
    "idiomId": "83d4e833-49ab-4b28-ba31-77ac22ce1d34",
    "text": "El Nico pagó el pato por algo que hicimos todos, pobrecito.",
    "source": "lucia",
    "exampleId": "f433baea-0946-4cc3-b4b9-9210a8ac6a0f"
    }
*/
async function dumpExamples() {
  const exampleModel = new ExampleModel();
  const allExamples = await exampleModel.findAll();

  console.log('export default { "examples": [');
  for (let i = 0; i < allExamples.length; i++) {
    if (i !== 0) {
      console.log(',');
    }
    // Stub out audio.url if present
    if (allExamples[i].audio && allExamples[i].audio.url) {
      allExamples[i].audio.url = '[STUBBED]';
    }
    console.log(JSON.stringify(allExamples[i], null, 2));
  }
  console.log(']}');
}

dumpExamples().catch(err => {
  console.error('Failed to dump examples:', err);
  process.exit(1);
});
