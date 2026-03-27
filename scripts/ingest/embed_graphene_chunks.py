#!/usr/bin/env python3
import json
import os
import time
from pathlib import Path

import psycopg
import requests

MODEL = os.environ.get('OPENAI_EMBEDDING_MODEL', 'text-embedding-3-small')
BATCH_SIZE = int(os.environ.get('EMBED_BATCH_SIZE', '50'))
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://graphene_app:graphene_local_2026@localhost:5432/graphene_kb')
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
LOG = Path('/Users/raimis/aa/database/graphene_knowledge_base/logs/embedding_runs.ndjson')

if not OPENAI_API_KEY:
    raise SystemExit('OPENAI_API_KEY is required')


def fetch_pending_chunks(cur, limit):
    cur.execute(
        """
        select id, content
        from knowledge_chunks
        where embedding is null
        order by created_at, id
        limit %s
        """,
        (limit,),
    )
    return cur.fetchall()


def get_embeddings(texts):
    response = requests.post(
        'https://api.openai.com/v1/embeddings',
        headers={
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json',
        },
        json={
            'model': MODEL,
            'input': texts,
        },
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()
    return [item['embedding'] for item in data['data']]


def vector_literal(values):
    return '[' + ','.join(f'{float(v):.8f}' for v in values) + ']'


def main():
    LOG.parent.mkdir(parents=True, exist_ok=True)
    total = 0
    started = time.time()
    with psycopg.connect(DATABASE_URL) as conn:
        while True:
            with conn.cursor() as cur:
                rows = fetch_pending_chunks(cur, BATCH_SIZE)
                if not rows:
                    break
                ids = [row[0] for row in rows]
                texts = [row[1][:8000] for row in rows]
                embeddings = get_embeddings(texts)
                for chunk_id, embedding in zip(ids, embeddings):
                    cur.execute(
                        "update knowledge_chunks set embedding = %s::vector where id = %s",
                        (vector_literal(embedding), chunk_id),
                    )
                conn.commit()
                total += len(rows)
                print(json.dumps({'embedded_batch': len(rows), 'embedded_total': total}))
    with LOG.open('a') as f:
        f.write(json.dumps({'embedded_total': total, 'model': MODEL, 'seconds': round(time.time() - started, 2)}) + '\n')
    print(json.dumps({'embedded_total': total, 'model': MODEL, 'seconds': round(time.time() - started, 2)}, indent=2))


if __name__ == '__main__':
    main()
