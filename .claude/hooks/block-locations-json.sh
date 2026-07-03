
#!/bin/bash
if echo "$CLAUDE_TOOL_INPUT" | grep -q "locations\.json"; then
  echo "BLOCKED: locations.json is deprecated. Do not edit or recreate it. Fix only as part of Phase D spa registration rebuild." >&2
  exit 1
fi
