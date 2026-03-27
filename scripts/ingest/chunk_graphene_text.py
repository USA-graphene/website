#!/usr/bin/env python3
import json
import re
from pathlib import Path

EXTRACTED = Path('/Users/raimis/aa/database/graphene_knowledge_base/processed/extracted.ndjson')
OUT = Path('/Users/raimis/aa/database/graphene_knowledge_base/chunks/chunks.ndjson')
TARGET_CHARS = 3200
MIN_CHARS = 900
MAX_CHARS = 5200
OVERLAP_CHARS = 400

HEADING_PATTERNS = [
    re.compile(r'^(chapter|section|appendix)\b', re.IGNORECASE),
    re.compile(r'^\d+(?:\.\d+)*\s+[A-Z][^\n]{0,120}$'),
    re.compile(r'^[A-Z][A-Z0-9\-\s,:;()]{8,120}$'),
]


def normalize_for_chunking(text: str) -> str:
    text = text.replace('\r', '\n')
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()


def looks_like_heading(line: str) -> bool:
    line = line.strip()
    if not line or len(line) > 140:
        return False
    if len(line.split()) <= 12:
        return any(pattern.match(line) for pattern in HEADING_PATTERNS)
    return False


def split_long_piece(piece: str):
    piece = piece.strip()
    if len(piece) <= MAX_CHARS:
        return [piece] if piece else []
    parts = []
    start = 0
    n = len(piece)
    while start < n:
        target_end = min(n, start + TARGET_CHARS)
        end = target_end
        if target_end < n:
            window_start = max(start + MIN_CHARS, target_end - 500)
            candidate = piece.rfind('\n\n', window_start, target_end)
            if candidate == -1:
                candidate = piece.rfind('. ', window_start, target_end)
            if candidate == -1:
                candidate = piece.rfind(' ', window_start, target_end)
            if candidate != -1:
                end = candidate + (2 if piece[candidate:candidate+2] == '. ' else 0)
        part = piece[start:end].strip()
        if part:
            parts.append(part)
        if end >= n:
            break
        start = max(end - OVERLAP_CHARS, start + 1)
    return parts


def chunk_sections(text: str):
    text = normalize_for_chunking(text)
    if not text:
        return []

    lines = [ln.rstrip() for ln in text.split('\n')]
    sections = []
    current_heading = None
    current_lines = []

    for raw_line in lines:
        line = raw_line.strip()
        if not line:
            current_lines.append('')
            continue
        if looks_like_heading(line):
            if current_lines:
                sections.append((current_heading, '\n'.join(current_lines).strip()))
                current_lines = []
            current_heading = line
        else:
            current_lines.append(line)

    if current_lines:
        sections.append((current_heading, '\n'.join(current_lines).strip()))

    chunks = []
    for heading, section_text in sections:
        if not section_text:
            continue
        paragraphs = [p.strip() for p in re.split(r'\n\s*\n', section_text) if p.strip()]
        current = ''
        for para in paragraphs:
            para = re.sub(r'\s+', ' ', para).strip()
            if not para:
                continue
            candidate = f"{current}\n\n{para}".strip() if current else para
            if len(candidate) <= TARGET_CHARS:
                current = candidate
                continue
            if current:
                chunks.extend([(heading, part) for part in split_long_piece(current)])
                current = ''
            if len(para) > TARGET_CHARS:
                chunks.extend([(heading, part) for part in split_long_piece(para)])
            else:
                current = para
        if current:
            chunks.extend([(heading, part) for part in split_long_piece(current)])

    return [(heading, chunk) for heading, chunk in chunks if len(chunk) >= MIN_CHARS or len(chunk.split()) >= 80]


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    chunk_count = 0
    source_count = 0
    with EXTRACTED.open() as src, OUT.open('w') as out:
        for line in src:
            rec = json.loads(line)
            text = rec.get('extracted_text') or ''
            if not text.strip():
                continue
            source_count += 1
            page_start = rec.get('page_start')
            page_end = rec.get('page_end') or page_start
            base_title = rec.get('title')
            for idx, (heading, chunk) in enumerate(chunk_sections(text)):
                out.write(json.dumps({
                    'source_path': rec['source_path'],
                    'source_name': rec['source_name'],
                    'source_group': rec.get('source_group'),
                    'source_type': rec.get('source_type'),
                    'title': base_title,
                    'section_heading': heading,
                    'page_start': page_start,
                    'page_end': page_end,
                    'chunk_index': idx,
                    'content': chunk,
                    'content_hash': rec.get('sha256', '') + f':{idx}',
                    'token_estimate': max(1, len(chunk) // 4),
                    'metadata': rec.get('metadata', {}),
                }) + '\n')
                chunk_count += 1
    print(json.dumps({'sources_with_text': source_count, 'chunk_count': chunk_count, 'out': str(OUT)}, indent=2))


if __name__ == '__main__':
    main()
