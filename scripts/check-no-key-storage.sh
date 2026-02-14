#!/usr/bin/env bash
# Pre-commit hook: block client-side API key storage in SDK and frontend code.
#
# API keys must NEVER be stored in localStorage, sessionStorage, cookies,
# IndexedDB, or Cache API. Keys exist only in class instance memory and
# are passed via HTTP header per-request.

FORBIDDEN_PATTERNS="localStorage|sessionStorage|document\.cookie|indexedDB|openDatabase|caches\.open"

if [ "$#" -eq 0 ]; then
    exit 0
fi

matches=$(grep -En "$FORBIDDEN_PATTERNS" "$@" 2>/dev/null)

if [ -n "$matches" ]; then
    echo "$matches"
    echo ""
    echo "ERROR: Client-side storage API detected in SDK/frontend code."
    echo "API keys must NEVER be stored in localStorage, sessionStorage,"
    echo "cookies, IndexedDB, or Cache API."
    echo "Keys must only exist in class instance memory and be passed"
    echo "via HTTP header per-request."
    exit 1
fi
