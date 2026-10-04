#!/usr/bin/env bash
# Fails if a tracked or staged file looks like it contains a secret, or an .env file is tracked.
# Uses gitleaks when installed, otherwise a regex sweep over tracked files.
set -euo pipefail
cd "$(dirname "$0")/.."

fail=0

# 1) .env files must never be tracked (only .env.example).
tracked_env=$(git ls-files | grep -E '(^|/)\.env($|\.)' | grep -v -E '\.env\.example$' || true)
if [ -n "$tracked_env" ]; then
  echo "ERROR: env file(s) tracked by git:"; echo "$tracked_env"; fail=1
fi

# 2) gitleaks if available.
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks detect --no-banner --redact --source . >/dev/null 2>&1 || { echo "ERROR: gitleaks found potential secrets"; fail=1; }
else
  # 3) Fallback: common key shapes in tracked files (this script excluded).
  pattern='(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-[A-Za-z0-9]{32,}|xox[abprs]-[A-Za-z0-9-]{10,}|AIza[0-9A-Za-z_-]{35}|vercel_blob_rw_[A-Za-z0-9_]{10,}|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|postgres(ql)?://[^:@/ ]+:[^@/ ]{4,}@[a-z0-9.-]+\.[a-z]{2,})'
  hits=$(git ls-files -z | xargs -0 grep -I -n -E "$pattern" -- 2>/dev/null | grep -v -E '^(scripts/check-secrets\.sh|pnpm-lock\.yaml):' || true)
  if [ -n "$hits" ]; then
    echo "ERROR: possible secrets in tracked files (values redacted):"
    echo "$hits" | sed -E 's/(:[0-9]+:).*/\1 <redacted>/' | head -20
    fail=1
  fi
fi

if [ "$fail" -ne 0 ]; then exit 1; fi
echo "secrets check: ok"
