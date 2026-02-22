#!/bin/bash

set -o pipefail   # fail if any piped command fails

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

# ---------- quality checks ----------

# run_step "ESLint" npm run lint

# run_step "Prettier format" npm run format

run_step "TypeScript typecheck" npx tsc --noEmit --skipLibCheck

# ---------- builds ----------

run_step "TS bundle" node esbuild.config.mjs production

run_step "CSS bundle" node scripts/build-styles.mjs production

# ---------- final decision ----------

if [ $BUILD_ERRORS -eq 0 ]; then
    echo -e "\nAll steps succeeded → syncing to Obsidian"
    node scripts/copyToObsidian.mjs

    if [ $? -ne 0 ]; then
        echo "❌ Sync failed"
        exit 1
    fi

    echo -e "\n=== BUILD SUCCESS ==="
else
    echo -e "\n=== BUILD FAILED ($BUILD_ERRORS step(s)) ==="
    exit 1
fi
