#!/usr/bin/env python3
import hashlib
import json
import os
import re
import shutil
import sys
from pathlib import Path

DEST = Path('/Users/raimis/aa/database/graphene_knowledge_base/raw_files')
MANIFEST = Path('/Users/raimis/aa/database/graphene_knowledge_base/network_share_manifest.json')
KEYWORDS = ['graphene', 'turbostratic', 'flash graphene', 'graphenecell']
ALLOWED_EXTS = {
    '.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.pages', '.csv', '.xls', '.xlsx', '.xlsm', '.numbers',
    '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.webarchive', '.zip', '.wpress',
    '.bib', '.ris', '.mobi', '.epub', '.mp4', '.mov', '.stp', '.step', '.f3d', '.dot', '.py'
}
EXCLUDED_PATH_PARTS = {
    '.app',
    'site-packages',
    'frameworks',
    '__pycache__',
    '.dist-info',
    '.egg-info',
    'node_modules',
}


def keyword_context(path: Path) -> str:
    parts = [path.name]
    parts.extend(parent.name for parent in path.parents[:4])
    return ' '.join(parts).lower()


def should_skip_path(path: Path) -> bool:
    lowered_parts = [part.lower() for part in path.parts]
    return any(
        excluded == part or part.endswith(excluded)
        for part in lowered_parts
        for excluded in EXCLUDED_PATH_PARTS
    )


def sanitize(name: str) -> str:
    return re.sub(r'[^A-Za-z0-9._ -]+', '_', name)


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def load_existing_hashes():
    hashes = {}
    for path in DEST.iterdir():
        if path.is_file():
            try:
                hashes[sha256_of(path)] = str(path)
            except Exception:
                pass
    return hashes


def main():
    roots = [Path(p) for p in sys.argv[1:]]
    DEST.mkdir(parents=True, exist_ok=True)
    seen_hashes = load_existing_hashes()
    copied = []
    duplicates = []
    candidates = 0

    for root in roots:
        if not root.exists():
            continue
        for dirpath, dirnames, filenames in os.walk(root):
            current_dir = Path(dirpath)
            dirnames[:] = [d for d in dirnames if not should_skip_path(current_dir / d)]
            for filename in filenames:
                path = current_dir / filename
                if should_skip_path(path):
                    continue
                if path.suffix.lower() not in ALLOWED_EXTS:
                    continue
                lower = keyword_context(path)
                if not any(k in lower for k in KEYWORDS):
                    continue
                candidates += 1
                try:
                    digest = sha256_of(path)
                except Exception:
                    continue
                if digest in seen_hashes:
                    duplicates.append({'source': str(path), 'kept_as': seen_hashes[digest], 'sha256': digest})
                    continue

                rel_hint = str(path.parent).replace('/Volumes/', 'Volumes/').replace('/', '__')
                safe_name = sanitize(path.stem)
                safe_suffix = path.suffix.lower()
                out_name = f"{rel_hint}__{safe_name}{safe_suffix}"
                out_path = DEST / out_name
                counter = 2
                while out_path.exists():
                    out_name = f"{rel_hint}__{safe_name}__{counter}{safe_suffix}"
                    out_path = DEST / out_name
                    counter += 1
                shutil.copyfile(path, out_path)
                seen_hashes[digest] = str(out_path)
                copied.append({'source': str(path), 'dest': str(out_path), 'sha256': digest, 'size': out_path.stat().st_size, 'ext': safe_suffix})

    summary = {
        'roots': [str(r) for r in roots],
        'candidate_count': candidates,
        'copied_count': len(copied),
        'duplicate_count': len(duplicates),
        'copied': copied,
        'duplicates_skipped_in_database_folder': duplicates,
    }
    MANIFEST.write_text(json.dumps(summary, indent=2))
    print(json.dumps({'candidate_count': candidates, 'copied_count': len(copied), 'duplicate_count': len(duplicates), 'manifest': str(MANIFEST)}, indent=2))


if __name__ == '__main__':
    main()
