#!/bin/bash
#
# This script exists to batch downsample and convert .aif audio files to low-bitrate mono .mp3 files,
# making them smaller and more suitable for entiendo exercises
#
# filepath: /Users/victor/Documents/entiendo/staging/stage_audio_samples.sh

# Usage: ./stage_audio_samples.sh "/path/to/input/*.aif" "/path/to/output"


echo "********* STARTING AUDIO DOWNSAMPLE ******************"
echo "**"
echo "**"

input_mask="$1"
output_dir="$2"

if [[ -z "$input_mask" || -z "$output_dir" ]]; then
  echo "Usage: $0 \"/path/to/input/*.aif\" \"/path/to/output\""
  exit 1
fi

echo "INPUT: $input_mask"
echo "****"
echo "OUTPUT: $output_dir"
echo "****"


mkdir -p "$output_dir"

shopt -s nullglob

# Use find to match the glob pattern, handling spaces safely
find_dir=$(dirname "$input_mask")
find_pattern=$(basename "$input_mask")

find "$find_dir" -maxdepth 1 -type f -name "$find_pattern" -print0 | while IFS= read -r -d '' input_file; do
  base_name=$(basename "$input_file" .aif)
  output_file="$output_dir/${base_name}.mp3"
  ffmpeg -i "$input_file" -ac 1 -ar 22050 -b:a 48k "$output_file"
  echo "Converted $input_file -> $output_file"
done