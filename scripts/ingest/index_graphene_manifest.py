#!/usr/bin/env python3
import hashlib
import json
from pathlib import Path

RAW = Path('/Users/raimis/aa/database/graphene_knowledge_base/raw_files')
OUT = Path('/Users/raimis/aa/database/graphene_knowledge_base/processed/sources.ndjson')

SOURCE_GROUP_HINTS = [
    ('Graphene-Blog-Posts', 'blog_posts'),
    ('Graphene-Blog-Images', 'blog_images'),
    ('PDF', 'papers'),
    ('Graphene production', 'production_docs'),
    ('Graphene Nano Materials', 'business_docs'),
    ('Graphene & books', 'books'),
    ('Graphene articles', 'articles'),
    ('killogram scale graphene machine', 'machine_docs'),
    ('Graphene equipment', 'machine_docs'),
    ('usa-graphene-images', 'site_images'),
    ('usa-graphene-drafts', 'draft_assets'),
    ('Graphene_Controller', 'controller_files'),
    ('Volumes__Raimis__Graphene__', 'targeted_share'),
]

TEXT_EXTS = {'.txt', '.md', '.csv', '.rtf', '.doc', '.docx', '.pdf', '.pages', '.xlsx', '.xlsm', '.xls', '.numbers', '.pptx', '.ppt', '.py', '.bib', '.ris', '.epub', '.mobi'}
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.tif', '.tiff', '.pxm'}
VIDEO_EXTS = {'.mp4', '.mov'}
CAD_EXTS = {'.stp', '.step', '.f3d'}
ARCHIVE_EXTS = {'.zip', '.wpress'}
CODE_EXTS = {'.sh'}
KEY_EXTS = {'.crt', '.key', '.bin'}


def classify_type(ext: str) -> str:
    ext = ext.lower()
    if ext in TEXT_EXTS:
        return 'document'
    if ext in IMAGE_EXTS:
        return 'image'
    if ext in VIDEO_EXTS:
        return 'video'
    if ext in CAD_EXTS:
        return 'cad'
    if ext in ARCHIVE_EXTS:
        return 'archive'
    if ext in CODE_EXTS:
        return 'code'
    if ext in KEY_EXTS:
        return 'binary'
    return 'other'


def group_for(source: str) -> str:
    for hint, group in SOURCE_GROUP_HINTS:
        if hint.lower() in source.lower():
            return group
    if 'desktop' in source.lower():
        return 'desktop_misc'
    if 'owncloud' in source.lower():
        return 'owncloud_misc'
    return 'uncategorized'


def title_for(source: str) -> str:
    return Path(source).stem.replace('_', ' ').strip()


def sha256_for(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def main():
    files = sorted(p for p in RAW.rglob('*') if p.is_file())

    OUT.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with OUT.open('w') as out:
        for path in files:
            source_hint = str(path.relative_to(RAW))
            rec = {
                'source_path': str(path),
                'source_name': path.name,
                'source_type': classify_type(path.suffix),
                'source_group': group_for(source_hint),
                'title': title_for(source_hint),
                'sha256': sha256_for(path),
                'size_bytes': path.stat().st_size,
                'metadata': {
                    'original_source': source_hint,
                    'ext': path.suffix.lower(),
                },
                'extraction_status': 'pending',
            }
            out.write(json.dumps(rec) + '\n')
            count += 1

    print(json.dumps({'indexed_sources': count, 'out': str(OUT)}, indent=2))


if __name__ == '__main__':
    main()
