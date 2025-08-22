#!/usr/bin/env bash
set -euo pipefail

# ===== Config =====
# Choose target format: "m4a" (AAC in MP4) or "mp3"
TARGET_FORMAT="mp3"         # change to "mp3" if you want MP3 output instead

# If TARGET_FORMAT=mp3, decide whether to overwrite the original key (ends with .mp3):
OVERWRITE_IN_PLACE="true"  # "true" → upload back to SAME .mp3 key; "false" → write to new .mp3 next to it

# Extra ffmpeg tuning
AAC_BITRATE="128k"
MP3_BITRATE="160k"

# Caching / headers
CACHE_CONTROL="public,max-age=31536000,immutable"
CONTENT_DISPOSITION="inline"

# List your S3 URIs here (one per line)
read -r -d '' URI_LIST <<'URIS'
s3://entiendo-audio-files-426593798727/tts/assigned_08620f4e-7295-4498-9598-5d079387edfa.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_0c1cdbae-cc92-4b70-8faa-6c448690e86b.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_347c9ee7-6428-41a8-8c1e-2708c85fb20d.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_3ad4c54c-a5fa-48e6-a6fd-700b684bfc74.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_3d1cedd3-cefa-4811-b159-2e59cb828bea.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_3e7940c7-8b69-462b-a355-61d930a110d7.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_4060727a-f2e3-41e7-bccb-5722775c8981.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_4892f6c6-1816-472e-849e-a4c33b956157.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_48d679cb-da80-4aba-bbc7-70b3261aa742.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_4c2b82be-3483-4993-9924-c715fea400e9.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_63d89c21-617a-40d5-89bb-e67206945864.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_6777986b-14b8-4e4e-bb91-167d218c7605.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_6b20ef1f-5e72-4b69-8fd1-b51bfde0a6c3.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_71bbcb94-a08d-4e01-81f8-4ac1e24ba58d.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_76ab7798-3fe9-4cf2-b300-768ae5056c2c.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_85ca7536-557f-4622-bd4f-0de3a3d126d9.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_89a58748-6fb9-4c41-a875-94aa1c25ef1c.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_8dc0ea24-679e-4a8d-8ac9-ae187ba445a5.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_995a589d-7bc9-4f5e-a59d-dfa9159151a1.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_a34293c2-1bce-4233-b03b-d96bb39b664b.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_a9f68138-7b6a-48b4-968b-4b05836c106a.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_b55a790b-93a7-47f4-a8d8-31c6fb273e99.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_bf357ca9-b0db-4ad2-97c5-ab1404603a18.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_d5aa0865-d94f-466f-9d81-80551cae8a2d.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_dd550b85-6f89-4563-abd2-d977fa1eb2aa.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_e66d1656-ccd7-40fc-bc0f-824f7ce453db.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_fbd0ea68-8221-4b1f-a1cb-968825ddad61.mp3
s3://entiendo-audio-files-426593798727/tts/assigned_ff5ddc4a-74d4-4209-9250-e2e9e9ac0d11.mp3
URIS

# ===== Script =====
TMPDIR="$(mktemp -d -t s3fix.XXXXXX)"
trap 'rm -rf "$TMPDIR"' EXIT

require_bin() { command -v "$1" >/dev/null 2>&1 || { echo "Missing $1"; exit 1; }; }
require_bin aws
require_bin ffmpeg
require_bin ffprobe

process_uri() {
  local uri="$1"
  [ -z "$uri" ] && return 0
  [[ "$uri" =~ ^s3:// ]] || { echo "Skip (not s3): $uri"; return 0; }

  local rest="${uri#s3://}"
  local bucket="${rest%%/*}"
  local key="${rest#*/}"

  local base="${key##*/}"          # assigned_xxx.mp3
  local stem="${base%.*}"          # assigned_xxx
  local dir="${key%/*}"            # tts

  local inFile="$TMPDIR/in.bin"
  local outFile

  echo "==> Downloading $uri"
  aws s3 cp "$uri" "$inFile" --only-show-errors

  # Inspect container/codec to decide transform
  local format
  format="$(ffprobe -v error -show_entries format=format_name -of default=noprint_wrappers=1:nokey=1 "$inFile" || echo "")"

  # Choose target
  local outKey contentType
  if [[ "$TARGET_FORMAT" == "m4a" ]]; then
    outFile="$TMPDIR/${stem}.m4a"
    outKey="${dir}/${stem}.m4a"
    contentType="audio/mp4"

    echo "   Transcoding -> M4A/AAC ($AAC_BITRATE)"
    ffmpeg -y -hide_banner -loglevel error \
      -i "$inFile" -vn -c:a aac -b:a "$AAC_BITRATE" -movflags +faststart \
      "$outFile"

  elif [[ "$TARGET_FORMAT" == "mp3" ]]; then
    outFile="$TMPDIR/${stem}.mp3"
    contentType="audio/mpeg"
    if [[ "$OVERWRITE_IN_PLACE" == "true" ]]; then
      outKey="$key"  # write back to same key
    else
      outKey="${dir}/${stem}.mp3"
    fi

    echo "   Transcoding -> MP3 ($MP3_BITRATE)"
    ffmpeg -y -hide_banner -loglevel error \
      -i "$inFile" -vn -c:a libmp3lame -b:a "$MP3_BITRATE" \
      "$outFile"
  else
    echo "Unknown TARGET_FORMAT: $TARGET_FORMAT"
    exit 1
  fi

  echo "   Uploading -> s3://$bucket/$outKey ($contentType)"
  aws s3 cp "$outFile" "s3://$bucket/$outKey" \
    --only-show-errors \
    --content-type "$contentType" \
    --cache-control "$CACHE_CONTROL" \
    --metadata-directive REPLACE \
    --content-encoding "" \
    --content-disposition "$CONTENT_DISPOSITION"

  # Optional: delete the original after successful upload
  # echo "   Deleting original $uri"
  # aws s3 rm "$uri" --only-show-errors

  echo "✔  Done: $uri  →  s3://$bucket/$outKey"
}

# Run
while IFS= read -r line; do
  # skip blanks/comments
  [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
  process_uri "$line"
done <<<"$URI_LIST"

echo "All done."