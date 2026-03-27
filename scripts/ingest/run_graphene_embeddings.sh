#!/bin/zsh
set -euo pipefail

export DATABASE_URL="${DATABASE_URL:-postgresql://graphene_app:graphene_local_2026@localhost:5432/graphene_kb}"
export OPENAI_EMBEDDING_MODEL="${OPENAI_EMBEDDING_MODEL:-text-embedding-3-small}"

python3 /Users/raimis/aa/scripts/ingest/embed_graphene_chunks.py

echo "Embedding generation complete."
