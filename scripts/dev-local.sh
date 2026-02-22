#!/bin/bash
set -o pipefail

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

BUILD_ERRORS=0

run_step () {
    echo -e "\n=== $1 ==="
    shift
    "$@"
    STATUS=$?
    if [ $STATUS -ne 0 ]; then
        echo "❌ $1 failed"
        BUILD_ERRORS=$((BUILD_ERRORS+1))
    else
        echo "✅ $1 passed"
    fi
}

# --- fast checks for dev ---
run_step "TypeScript typecheck" npx tsc --noEmit --skipLibCheck

# --- dev builds (watch mode) ---
echo -e "\nStarting dev builds..."

node esbuild.config.mjs &
TS_PID=$!

node scripts/build-styles.mjs --watch &
CSS_PID=$!

wait $TS_PID
TS_STATUS=$?

wait $CSS_PID
CSS_STATUS=$?

if [ $TS_STATUS -ne 0 ] || [ $CSS_STATUS -ne 0 ]; then
    echo "❌ Dev build failed"
    exit 1
fi

echo -e "\nDev build running → initial sync"
node scripts/copyToObsidian.mjs
