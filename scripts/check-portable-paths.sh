#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

pattern='/[U]sers/|[A-Za-z]:\\[U]sers\\'

if rg -n --hidden \
  --glob '!.git' \
  --glob '!.git/**' \
  --glob '!node_modules/**' \
  --glob '!dist/**' \
  --glob '!build/**' \
  --glob '!index.backup_*.html' \
  --glob '!index.merge_backup_*.html' \
  -e "$pattern" .; then
  echo
  echo "Found machine-specific absolute paths. Use <repo-root>, <worker-repo-root>, or a relative path instead."
  exit 1
fi

echo "Portable path check passed."
