#!/usr/bin/env bash
set -euo pipefail

file="${1:-index.html}"

max_inline_styles=465
max_inline_handlers=402
max_style_tags=0
max_inline_script_tags=3

count_pattern() {
  local pattern="$1"
  local output
  output="$(rg -o "$pattern" "$file" 2>/dev/null || true)"
  if [[ -z "$output" ]]; then
    printf '0'
  else
    printf '%s\n' "$output" | wc -l | tr -d ' '
  fi
}

count_inline_scripts() {
  local output
  output="$(rg -n '<script([^>]*)?>' "$file" 2>/dev/null | rg -v '<script[^>]+src=' || true)"
  if [[ -z "$output" ]]; then
    printf '0'
  else
    printf '%s\n' "$output" | wc -l | tr -d ' '
  fi
}

fail=0

inline_styles="$(count_pattern 'style=')"
inline_handlers="$(count_pattern 'on[a-z]+=')"
style_tags="$(count_pattern '<style')"
inline_script_tags="$(count_inline_scripts)"

check_max() {
  local label="$1"
  local current="$2"
  local max="$3"
  if (( current > max )); then
    printf 'UI architecture guard failed: %s = %s, allowed max = %s\n' "$label" "$current" "$max" >&2
    fail=1
  else
    printf 'UI architecture guard: %s = %s / %s\n' "$label" "$current" "$max"
  fi
}

check_mojibake() {
  # Detect common UTF-8 decode artifacts (cp1251 bytes interpreted as UTF-8),
  # which usually appear as mojibake-like character sequences.
  if rg -q '�|Ð' "$file"; then
    printf 'UI architecture guard failed: encoding suspicion in %s (possible mojibake)\n' "$file" >&2
    fail=1
  fi
}

if [[ ! -f "$file" ]]; then
  printf 'UI architecture guard failed: %s not found\n' "$file" >&2
  exit 1
fi

if ! rg -q '<link[^>]+href="styles\.min\.css"' "$file"; then
  printf 'UI architecture guard failed: %s must link styles.min.css\n' "$file" >&2
  fail=1
fi

check_mojibake

check_max 'inline style attributes' "$inline_styles" "$max_inline_styles"
check_max 'inline event handlers' "$inline_handlers" "$max_inline_handlers"
check_max 'style tags' "$style_tags" "$max_style_tags"
check_max 'inline script tags' "$inline_script_tags" "$max_inline_script_tags"

if (( fail != 0 )); then
  cat >&2 <<'MSG'

New UI code must not increase legacy inline debt.
Use:
- styles/**/*.less for visual styles;
- BEM-like class names for UI blocks and elements;
- addEventListener or delegated JS handlers instead of onclick/oninput/onchange in HTML.

If an exception is truly needed, document it in the task and update this guard in the same review.
MSG
  exit 1
fi
