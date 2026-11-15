#!/usr/bin/env bash

# Runs only the Gradle task that fails in CI (:app:processDebugResources), the
# Android resource link. checkZiggySync is skipped: it only checks the native
# library is present, and resource linking does not use that library.

set -euo pipefail

source "$(dirname "${BASH_SOURCE[0]}")/../scripts/android-common.sh"

echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "commit: $(git -C "$ZIGGY_EXAMPLE_DIR" rev-parse HEAD)"
echo "JAVA_HOME: $JAVA_HOME"
echo "ANDROID_HOME: $ANDROID_HOME"
echo "--- values-v31/styles.xml ---"
cat "$ZIGGY_ANDROID_PROJECT_DIR/app/src/main/res/values-v31/styles.xml"
echo "--- gradle ---"
ziggy_android_gradle --no-daemon :app:processDebugResources -x checkZiggySync
