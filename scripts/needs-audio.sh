#!/bin/bash

# Check if the first argument (subdirectory name) is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <stage[#]>"
    exit 1
fi

STAGE="$1"

mkdir -p ../staging/stages/$STAGE

node needs-audio > ../staging/stages/$STAGE/$STAGE.csv
cat ../staging/stages/$STAGE/$STAGE.csv