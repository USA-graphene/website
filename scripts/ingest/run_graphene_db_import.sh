#!/bin/zsh
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-postgresql://graphene_app:graphene_local_2026@localhost:5432/graphene_kb}"

python3 /Users/raimis/aa/scripts/ingest/import_graphene_to_postgres.py

echo "DB import complete."
