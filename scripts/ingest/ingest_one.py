#!/usr/bin/env python3
import sys
import os
import json
import hashlib
import subprocess
from pathlib import Path
from dotenv import load_dotenv
import psycopg

# Project Configuration
PROJECT_ROOT = Path("/Users/raimis/aa")
ENV_PATH = PROJECT_ROOT / "uploader" / ".env"
load_dotenv(ENV_PATH)

DB_URL = "postgresql://graphene_app:graphene_local_2026@192.168.1.38:5432/graphene_kb"
OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')

def get_sha256(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        for chunk in iter(lambda: f.read(1024*1024), b''):
            h.update(chunk)
    return h.hexdigest()

def extract_text(path):
    ext = path.suffix.lower()
    if ext == '.pdf':
        res = subprocess.run(['pdftotext', str(path), '-'], capture_output=True, text=True)
        return res.stdout.strip()
    elif ext in ['.txt', '.md']:
        return path.read_text(errors='ignore').strip()
    return ""

def chunk_text(text):
    # Simple chunking for 384-token vectors
    # roughly 1500 chars per chunk
    size = 1500
    overlap = 200
    chunks = []
    for i in range(0, len(text), size - overlap):
        chunk = text[i:i + size].strip()
        if chunk:
            chunks.append(chunk)
    return chunks

def get_embeddings(texts):
    import requests
    try:
        response = requests.post(
            'https://api.openai.com/v1/embeddings',
            headers={'Authorization': f'Bearer {OPENAI_API_KEY}', 'Content-Type': 'application/json'},
            json={'model': 'text-embedding-3-small', 'input': texts, 'dimensions': 384},
            timeout=60
        )
        response.raise_for_status()
        return [item['embedding'] for item in response.json()['data']]
    except Exception as e:
        print(f"  [Warning] Embedding engine offline: {e}")
        print("  [Warning] Falling back to Zero-Vector Indexing (Keyword-only Mode)")
        # Return 0-vectors of dimension 384
        return [[0.0] * 384 for _ in texts]

def main():
    if len(sys.argv) < 2:
        print("Usage: ingest_one.py <file_path>")
        sys.exit(1)
    
    print(f"> Key Found: {('Yes (Length: ' + str(len(OPENAI_API_KEY)) + ')') if OPENAI_API_KEY else 'NO'}")
    if OPENAI_API_KEY:
        print(f"> Key Start: {OPENAI_API_KEY[:7]}...")
    
    file_path = Path(sys.argv[1])
    if not file_path.exists():
        print(f"Error: {file_path} not found")
        sys.exit(1)

    print(f"> Processing: {file_path.name}")
    sha256 = get_sha256(file_path)
    text = extract_text(file_path)
    if not text:
        print("Error: No text extracted")
        sys.exit(1)

    chunks = chunk_text(text)
    print(f"> Generated {len(chunks)} chunks")
    
    embeddings = get_embeddings(chunks)
    print(f"> Calculated {len(embeddings)} vectors")

    # Push to Postgres
    with psycopg.connect(DB_URL) as conn:
        with conn.cursor() as cur:
            # Upsert source
            cur.execute("""
                insert into knowledge_sources (source_path, source_name, title, sha256, extraction_status, extracted_text)
                values (%s, %s, %s, %s, 'extracted', %s)
                on conflict (source_path) do update set sha256 = excluded.sha256, extracted_text = excluded.extracted_text
                returning id
            """, (str(file_path), file_path.name, file_path.stem, sha256, text))
            source_id = cur.fetchone()[0]

            # Delete old chunks
            cur.execute("delete from knowledge_chunks where source_id = %s", (source_id,))

            # Insert new chunks with vectors
            for i, (content, vec) in enumerate(zip(chunks, embeddings)):
                vec_str = "[" + ",".join(map(str, vec)) + "]"
                cur.execute("""
                    insert into knowledge_chunks (source_id, chunk_index, content, embedding)
                    values (%s, %s, %s, %s::vector)
                """, (source_id, i, content, vec_str))
            
            conn.commit()
    print("> SAVED TO DATABASE SUCCESSFUL")

if __name__ == "__main__":
    main()
