#!/usr/bin/env bash
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

# Real project paths have at least one path character after the drive prefix.
# A bare quoted prefix in docs is ok.
pattern='[Cc]:\\[[:alnum:]_.-]'

if git grep -n -I -E "$pattern" -- . \
  ':!:docs/**' \
  ':!:pm/**' \
  ':!:cowork-docs/**' \
  ':!:*DEVELOPMENT_HISTORY*.md' \
  ':!:*DEVELOPMENT_LOG*.md' \
  ':!:*ROADMAP*.md'; then
  echo
  echo 'Found forbidden absolute C-drive project paths in tracked files.'
  echo 'Use repo-relative paths or PATH-resolved tools instead.'
  exit 1
fi

echo 'Portable path check passed.'
