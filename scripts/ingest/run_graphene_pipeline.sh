#!/bin/zsh
set -euo pipefail

python3 /Users/raimis/aa/scripts/ingest/index_graphene_manifest.py
python3 /Users/raimis/aa/scripts/ingest/extract_graphene_text.py
python3 /Users/raimis/aa/scripts/ingest/chunk_graphene_text.py

echo "Pipeline complete."
