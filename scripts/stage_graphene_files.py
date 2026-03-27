#!/usr/bin/env python3
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path

SEARCH_ROOTS = [
    Path('/Users/raimis/Desktop'),
    Path('/Users/raimis/Documents'),
    Path('/Users/raimis/Downloads'),
    Path('/Users/raimis/ownCloud'),
]
DEST = Path('/Users/raimis/aa/database/graphene_knowledge_base/raw_files')
MANIFEST = Path('/Users/raimis/aa/database/graphene_knowledge_base/manifest.json')
KEYWORDS = ['graphene', 'turbostratic', 'flash graphene', 'graphenecell']
ALLOWED_EXTS = {
    '.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.pages', '.csv', '.xls', '.xlsx', '.xlsm', '.numbers',
    '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.webarchive', '.zip', '.wpress',
    '.bib', '.ris', '.mobi', '.epub', '.mp4', '.mov', '.stp', '.step', '.f3d', '.dot', '.py'
}


def sanitize(name: str) -> str:
    return re.sub(r'[^A-Za-z0-9._ -]+', '_', name)


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def candidate_files() -> list[Path]:
    cmd = ['find']
    for root in SEARCH_ROOTS:
        if root.exists():
            cmd.append(str(root))
    cmd += ['-type', 'f']
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    files = []
    for line in proc.stdout.splitlines():
        p = Path(line)
        lower = str(p).lower()
        if p.suffix.lower() not in ALLOWED_EXTS:
            continue
        if any(k in lower for k in KEYWORDS):
            files.append(p)
    return files


def main():
    DEST.mkdir(parents=True, exist_ok=True)
    # Clean only the staging folder contents before rebuilding it
    for item in DEST.iterdir():
        if item.is_file() or item.is_symlink():
            item.unlink()
        elif item.is_dir():
            shutil.rmtree(item)

    seen_hashes: dict[str, str] = {}
    copied = []
    skipped_duplicates = []
    candidates = candidate_files()

    for path in candidates:
        try:
            digest = sha256_of(path)
        except Exception:
            continue

        if digest in seen_hashes:
            skipped_duplicates.append({
                'source': str(path),
                'kept_as': seen_hashes[digest],
                'sha256': digest,
            })
            continue

        rel_hint = str(path.parent).replace('/Users/raimis/', '').replace('/', '__')
        safe_name = sanitize(path.stem)
        safe_suffix = path.suffix.lower()
        out_name = f"{rel_hint}__{safe_name}{safe_suffix}"
        out_path = DEST / out_name

        counter = 2
        while out_path.exists():
            out_name = f"{rel_hint}__{safe_name}__{counter}{safe_suffix}"
            out_path = DEST / out_name
            counter += 1

        shutil.copy2(path, out_path)
        seen_hashes[digest] = str(out_path)
        copied.append({
            'source': str(path),
            'dest': str(out_path),
            'sha256': digest,
            'size': out_path.stat().st_size,
            'ext': safe_suffix,
        })

    summary = {
        'search_roots': [str(p) for p in SEARCH_ROOTS if p.exists()],
        'destination': str(DEST),
        'candidate_count': len(candidates),
        'copied_count': len(copied),
        'duplicate_count': len(skipped_duplicates),
        'copied': copied,
        'duplicates_skipped_in_database_folder': skipped_duplicates,
    }
    MANIFEST.parent.mkdir(parents=True, exist_ok=True)
    MANIFEST.write_text(json.dumps(summary, indent=2))
    print(json.dumps({
        'candidate_count': len(candidates),
        'copied_count': len(copied),
        'duplicate_count': len(skipped_duplicates),
        'destination': str(DEST),
        'manifest': str(MANIFEST),
    }, indent=2))


if __name__ == '__main__':
    main()
