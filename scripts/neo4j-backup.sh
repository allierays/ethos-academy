#!/usr/bin/env bash
#
# Neo4j pre-commit backup — exports all data via the Python driver.
#
# Why Python, not tar?
# Neo4j Community has no online checkpoint or dump command for a running
# database. Tarring /data while Neo4j writes produces corrupt snapshots
# with missing data. The Python driver reads through the transaction
# layer, so the export always reflects committed state.
#
# Output: backups/neo4j-backup-<timestamp>.cypher
# Restore: cat backups/<file>.cypher | docker exec -i ethos-neo4j-1 \
#          cypher-shell -u neo4j -p password
#
# Keeps the 5 most recent backups and deletes older ones.

set -euo pipefail

CONTAINER="ethos-neo4j-1"
BACKUP_DIR="backups"
MAX_BACKUPS=5

# ── Check container ────────────────────────────────────────────────
if ! docker ps --format '{{.Names}}' 2>/dev/null | grep -q "^${CONTAINER}$"; then
    echo "Neo4j not running, skipping backup"
    exit 0
fi

mkdir -p "${BACKUP_DIR}"

# ── Run Python export ─────────────────────────────────────────────
uv run python scripts/neo4j_export.py "${BACKUP_DIR}"
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
    echo "ERROR: Neo4j backup failed"
    exit 1
fi

# ── Rotate old backups ─────────────────────────────────────────────
ls -t "${BACKUP_DIR}"/neo4j-backup-*.cypher 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs rm -f

exit 0
