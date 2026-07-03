
#!/bin/bash
if echo "$CLAUDE_TOOL_INPUT" | grep -qE "register.*\.html|dashboard\.html"; then
  echo "REMINDER: This file relates to registration/dashboard. Confirm facePhotoUrl logic is intact before considering this done." >&2
fi
