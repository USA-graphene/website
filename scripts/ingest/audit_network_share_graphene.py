#!/usr/bin/env python3
import hashlib
import json
import os
import re
from collections import Counter, defaultdict
from pathlib import Path

DEST = Path('/Users/raimis/aa/database/graphene_knowledge_base/raw_files')
OUT = Path('/Users/raimis/aa/database/graphene_knowledge_base/network_share_audit_2026-03-25.json')
ROOTS = [
    Path('/Volumes/Raimis'),
    Path('/Volumes/Public'),
    Path('/Volumes/gajus'),
    Path('/Volumes/inta'),
    Path('/Volumes/BEATA'),
    Path('/Volumes/SmartWare'),
    Path('/Volumes/TimeMachineBackup'),
]
KEYWORDS = ['graphene', 'turbostratic', 'flash graphene', 'usa-graphene', 'graphenecell']
ALLOWED_EXTS = {
    '.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.pages', '.csv', '.xls', '.xlsx', '.xlsm', '.numbers',
    '.ppt', '.pptx', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.webarchive', '.zip', '.wpress',
    '.bib', '.ris', '.mobi', '.epub', '.mp4', '.mov', '.stp', '.step', '.f3d', '.dot', '.py', '.key'
}


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def load_existing_hashes(dest: Path):
    hashes = {}
    for path in dest.iterdir():
        if path.is_file():
            try:
                hashes[sha256_of(path)] = str(path)
            except Exception:
                pass
    return hashes


def match_keywords(s: str) -> bool:
    s = s.lower()
    return any(k in s for k in KEYWORDS)


def main():
    existing = load_existing_hashes(DEST)
    candidates = []
    unique_to_add = []
    duplicates = []
    blocked = []
    by_root = defaultdict(lambda: Counter())

    for root in ROOTS:
        root_key = str(root)
        if not root.exists():
            blocked.append({'path': str(root), 'reason': 'missing-root'})
            by_root[root_key]['missing_root'] += 1
            continue
        for dirpath, dirnames, filenames in os.walk(root, topdown=True, onerror=None):
            # prune noisy/system dirs where useful
            dirnames[:] = [d for d in dirnames if d not in {'.Trashes', '.Spotlight-V100', '.fseventsd', '.TemporaryItems'}]
            for name in filenames:
                path = Path(dirpath) / name
                try:
                    suffix = path.suffix.lower()
                    lower = str(path).lower()
                except Exception as e:
                    blocked.append({'path': str(path), 'reason': f'metadata-error: {e}'})
                    by_root[root_key]['metadata_error'] += 1
                    continue
                if suffix not in ALLOWED_EXTS:
                    continue
                if not match_keywords(lower):
                    continue
                by_root[root_key]['candidates'] += 1
                rec = {'source': str(path), 'size': None, 'sha256': None, 'ext': suffix}
                try:
                    rec['size'] = path.stat().st_size
                    rec['sha256'] = sha256_of(path)
                except Exception as e:
                    blocked.append({'path': str(path), 'reason': f'hash-error: {e}'})
                    by_root[root_key]['hash_error'] += 1
                    continue
                candidates.append(rec)
                if rec['sha256'] in existing:
                    rec2 = dict(rec)
                    rec2['existing_stage_path'] = existing[rec['sha256']]
                    duplicates.append(rec2)
                    by_root[root_key]['duplicates'] += 1
                else:
                    unique_to_add.append(rec)
                    by_root[root_key]['unique'] += 1

    ext_counter = Counter(r['ext'] for r in unique_to_add)
    report = {
        'roots': [str(r) for r in ROOTS],
        'staging_folder': str(DEST),
        'candidate_count': len(candidates),
        'unique_to_add_count': len(unique_to_add),
        'duplicate_count': len(duplicates),
        'blocked_count': len(blocked),
        'unique_by_extension': dict(ext_counter.most_common()),
        'by_root': {k: dict(v) for k, v in by_root.items()},
        'unique_to_add': sorted(unique_to_add, key=lambda x: x['source'].lower()),
        'duplicates': sorted(duplicates, key=lambda x: x['source'].lower()),
        'blocked': blocked,
    }
    OUT.write_text(json.dumps(report, indent=2))
    print(json.dumps({
        'report': str(OUT),
        'candidate_count': len(candidates),
        'unique_to_add_count': len(unique_to_add),
        'duplicate_count': len(duplicates),
        'blocked_count': len(blocked),
    }, indent=2))


if __name__ == '__main__':
    main()
