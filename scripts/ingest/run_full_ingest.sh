#!/bin/zsh
set -euo pipefail

ROOT="/Users/raimis/aa"
DB_URL="postgresql://graphene_app:graphene_local_2026@192.168.1.38:5432/graphene_kb"

cd "$ROOT"
python3 "$ROOT/scripts/ingest/index_graphene_manifest.py"
python3 "$ROOT/scripts/ingest/extract_graphene_text.py"
python3 "$ROOT/scripts/ingest/chunk_graphene_text.py"
export DATABASE_URL="$DB_URL"
python3 "$ROOT/scripts/ingest/import_graphene_to_postgres.py"
python3 "$ROOT/scripts/ingest/run_graphene_embeddings.sh"

echo "Full ingest complete."
