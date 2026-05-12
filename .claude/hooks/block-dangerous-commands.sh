#!/bin/bash
COMMAND="$1"
BLOCKED_PATTERNS=(
  "rm -rf"
  "git push --force"
  "git push -f"
  "firebase deploy --only firestore:rules"
  "chmod 777"
  "sudo rm"
  "DROP TABLE"
  "deleteCollection"
)
for pattern in "${BLOCKED_PATTERNS[@]}"; do
  if echo "$COMMAND" | grep -qi "$pattern"; then
    echo "BLOCKED: '$pattern' detected. Confirm with Johan before running."
    exit 1
  fi
done
exit 0
