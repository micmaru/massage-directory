#!/bin/bash
TARGET="$1"
WARN_PATHS=(
  "node_modules"
  "functions/node_modules"
  ".firebase"
  "dist"
  "build"
  ".git"
)
for path in "${WARN_PATHS[@]}"; do
  if echo "$TARGET" | grep -q "$path"; then
    echo "WARNING: Attempting to modify '$path'. Confirm with Johan."
    exit 1
  fi
done
exit 0
