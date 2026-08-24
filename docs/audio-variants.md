# Exercise audio variants

Exercises support two server-controlled audio styles:

- `conversation`: the existing natural recordings and rotating conversational TTS voices.
- `education`: Zeta (`8Nz6hV5TPv151P6ZNEBV`) generated at speed `0.85` unless its server voice record specifies another speed.

The browser sends only the style name. ElevenLabs voice IDs and generation settings remain on the server.

## Stored shape

```json
{
  "audioVariants": {
    "conversation": {
      "key": "https://bucket.example/tts/conversation.mp3",
      "voiceName": "Nacho"
    },
    "education": {
      "key": "https://bucket.example/tts/education.mp3",
      "voiceName": "Zeta",
      "voiceId": "8Nz6hV5TPv151P6ZNEBV",
      "speed": 0.85
    }
  }
}
```

`audioVariants` is the only persisted audio field. Every example and shovel record contains that object (empty until its first recording is generated). Variant values are always objects; top-level `audio`, `voice`, `url`, and `playback` fields are invalid. Signed `url`/`expires` values are response data and are also invalid inside persisted variants. Learner API responses do not expose storage keys; they receive a signed `playback` object.

Missing variants are generated on demand. Requests for the same example and style are deduplicated within the server process. If education generation fails and conversation audio exists, the API returns conversation audio with a fallback warning.

Every ElevenLabs voice record must also have an explicit `voiceType`. Zeta is `education`; the rotating native voices are `conversation`.

## Data migration

Only the one-way migration understands the old top-level `audio` input (a string or the former admin `{ key, url, expires }` object). Runtime code does not.

The migration is dry-run by default:

```sh
npm run migrate:audio-variants
npm run migrate:audio-variants:shovels
npm run migrate:voice-types
npm run migrate:assignment-users
```

Apply to the local replica, with an automatic timestamped backup:

```sh
npm run migrate:audio-variants -- --apply
npm run migrate:audio-variants:shovels -- --apply
npm run migrate:voice-types -- --apply
npm run migrate:assignment-users -- --apply
```

Inspect or apply directly against S3:

```sh
npm run migrate:audio-variants -- --source=s3
npm run migrate:audio-variants -- --source=s3 --apply
npm run migrate:audio-variants:shovels -- --source=s3
npm run migrate:audio-variants:shovels -- --source=s3 --apply
npm run migrate:voice-types -- --source=s3
npm run migrate:voice-types -- --source=s3 --apply
npm run migrate:assignment-users -- --source=s3
npm run migrate:assignment-users -- --source=s3 --apply
```

If a target S3 object does not exist, the migration uses its corresponding
local `--file` JSON dataset as the seed. A dry run validates and reports the
seed without writing. `--apply` creates the missing object without a backup,
because there is no prior object to preserve. The create uses an S3
`If-None-Match: *` condition so it stops instead of overwriting an object that
appears after the missing-object check. Errors other than `NoSuchKey` are not
treated as missing objects. `migrate:voice-types` targets
`entiendo/data/voices.json`; it does not create a `voice-types` object. For an
existing voices object, the migration adds Zeta when absent and rejects
duplicate Zeta records.

Run all four dry runs and verify their counts before applying any dataset. This is a one-way cutover: stop the existing application, migrate the examples, shovels, voices, and users production objects, archive/remove the now-unused `entiendo/data/homework.json` object, then deploy the strict application version. The audio migration removes top-level response fields and rejects conflicting legacy/canonical values instead of guessing. The user migration preserves former editor accounts as ordinary users while deleting the dead assignment metadata.
