#!/usr/bin/env python3
import json
import os
from pathlib import Path

try:
    import psycopg
except ImportError:
    raise SystemExit("psycopg is required. Install with: python3 -m pip install psycopg[binary]")

SOURCES = Path('/Users/raimis/aa/database/graphene_knowledge_base/processed/extracted.ndjson')
CHUNKS = Path('/Users/raimis/aa/database/graphene_knowledge_base/chunks/chunks.ndjson')

SQL_UPSERT_SOURCE = """
insert into knowledge_sources (
  source_path, source_name, source_group, source_type, title, sha256, mime_type, size_bytes, metadata, extraction_status, extracted_text, extracted_at
) values (
  %(source_path)s, %(source_name)s, %(source_group)s, %(source_type)s, %(title)s, %(sha256)s, %(mime_type)s, %(size_bytes)s, %(metadata)s::jsonb, %(extraction_status)s, %(extracted_text)s,
  case when %(extraction_status)s = 'extracted' then now() else null end
)
on conflict (source_path) do update set
  source_name = excluded.source_name,
  source_group = excluded.source_group,
  source_type = excluded.source_type,
  title = excluded.title,
  sha256 = excluded.sha256,
  mime_type = excluded.mime_type,
  size_bytes = excluded.size_bytes,
  metadata = excluded.metadata,
  extraction_status = excluded.extraction_status,
  extracted_text = excluded.extracted_text,
  extracted_at = case when excluded.extraction_status = 'extracted' then now() else knowledge_sources.extracted_at end
returning id;
"""

SQL_FETCH_SOURCE_ID = "select id from knowledge_sources where source_path = %s"
SQL_DELETE_CHUNKS = "delete from knowledge_chunks where source_id = %s"
SQL_INSERT_CHUNK = """
insert into knowledge_chunks (
  source_id, chunk_index, title, content, token_estimate, metadata, section_heading, page_start, page_end, content_hash
)
values (%s, %s, %s, %s, %s, %s::jsonb, %s, %s, %s, %s)
on conflict (source_id, chunk_index) do update set
  title = excluded.title,
  content = excluded.content,
  token_estimate = excluded.token_estimate,
  metadata = excluded.metadata,
  section_heading = excluded.section_heading,
  page_start = excluded.page_start,
  page_end = excluded.page_end,
  content_hash = excluded.content_hash
"""


def main():
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        raise SystemExit('DATABASE_URL is not set')

    source_ids = {}
    imported_sources = 0
    imported_chunks = 0

    with psycopg.connect(database_url) as conn:
        with conn.cursor() as cur:
            with SOURCES.open() as f:
                for line in f:
                    rec = json.loads(line)
                    payload = {
                        'source_path': rec['source_path'],
                        'source_name': rec['source_name'],
                        'source_group': rec.get('source_group'),
                        'source_type': rec.get('source_type'),
                        'title': rec.get('title'),
                        'sha256': rec.get('sha256') or rec.get('metadata', {}).get('sha256', ''),
                        'mime_type': rec.get('mime_type'),
                        'size_bytes': rec.get('size_bytes'),
                        'metadata': json.dumps(rec.get('metadata', {})),
                        'extraction_status': rec.get('extraction_status', 'pending'),
                        'extracted_text': rec.get('extracted_text', ''),
                    }
                    cur.execute(SQL_UPSERT_SOURCE, payload)
                    source_id = cur.fetchone()[0]
                    source_ids[rec['source_path']] = source_id
                    imported_sources += 1

            with CHUNKS.open() as f:
                for line in f:
                    rec = json.loads(line)
                    source_path = rec['source_path']
                    source_id = source_ids.get(source_path)
                    if not source_id:
                        cur.execute(SQL_FETCH_SOURCE_ID, (source_path,))
                        row = cur.fetchone()
                        if not row:
                            continue
                        source_id = row[0]
                        source_ids[source_path] = source_id

                    cur.execute(
                        SQL_INSERT_CHUNK,
                        (
                            source_id,
                            rec['chunk_index'],
                            rec.get('title'),
                            rec['content'],
                            rec.get('token_estimate'),
                            json.dumps(rec.get('metadata', {})),
                            rec.get('section_heading'),
                            rec.get('page_start'),
                            rec.get('page_end'),
                            rec.get('content_hash') or '',
                        ),
                    )
                    imported_chunks += 1
        conn.commit()

    print(json.dumps({'imported_sources': imported_sources, 'imported_chunks': imported_chunks}, indent=2))


if __name__ == '__main__':
    main()
