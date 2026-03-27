#!/usr/bin/env python3
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path('/Users/raimis/aa/database/graphene_knowledge_base')
MANIFEST = ROOT / 'manifest.json'
OUT_DIR = ROOT / 'publish_review'
OUT_NDJSON = OUT_DIR / 'heuristic_review_manifest.ndjson'
OUT_SUMMARY = OUT_DIR / 'heuristic_review_summary.json'
OUT_README = OUT_DIR / 'README.md'

PUBLIC_PATH_HINTS = [
    'graphene-blog-posts',
    'graphene-blog-images',
    'usa-graphene-images',
    'public',
]

INTERNAL_PATH_HINTS = [
    'graphene production',
    'graphene testing',
    'graphene nano materials',
    'invoice',
    'incoice',
    'purchase-order',
    'price list',
    'prices',
    'nda',
    'controller',
    'logozip',
    'nmaterials logo',
    'nm logo',
    'gopro video',
    'spain graphene test results',
    'raman',
    'xps',
    'chn resultados',
    'machine manual',
    'graphene equipment',
    'killogram scale graphene machine',
    'desktop - raimis',
]

REVIEW_PATH_HINTS = [
    'usa-graphene-drafts',
    'graphene articles',
    'graphene & books',
    'keynote',
    'archives',
    'downloads_data',
    'pictures_all',
    'pdf/',
    'documents - docx,pdf,txt',
    'wpress',
    '.zip',
]

TEXTISH_EXTS = {'.txt', '.md', '.csv', '.pdf', '.doc', '.docx', '.rtf', '.pages', '.ppt', '.pptx', '.xls', '.xlsx', '.xlsm', '.numbers', '.bib', '.ris', '.py', '.webarchive'}
IMAGE_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.tif', '.pxm'}
VIDEO_EXTS = {'.mp4', '.mov'}
CAD_EXTS = {'.stp', '.step', '.f3d', '.dot'}
ARCHIVE_EXTS = {'.zip', '.wpress', '.epub', '.mobi'}


def norm(s: str) -> str:
    return s.lower()


def classify_group(source: str) -> str:
    s = norm(source)
    if 'graphene-blog-posts' in s:
        return 'blog_posts'
    if 'graphene-blog-images' in s:
        return 'blog_images'
    if 'usa-graphene-images' in s:
        return 'site_images'
    if 'usa-graphene-drafts' in s:
        return 'draft_assets'
    if 'graphene production' in s:
        return 'production_docs'
    if 'graphene nano materials' in s:
        return 'business_docs'
    if 'graphene equipment' in s or 'killogram scale graphene machine' in s or 'graphene controller' in s or 'graphene_controller' in s:
        return 'machine_docs'
    if 'graphene & books' in s:
        return 'books'
    if 'graphene articles' in s:
        return 'articles'
    if '/pdf/' in s or 'documents - docx,pdf,txt' in s:
        return 'papers'
    return 'misc'


def media_type(ext: str) -> str:
    e = ext.lower()
    if e in TEXTISH_EXTS:
        return 'document'
    if e in IMAGE_EXTS:
        return 'image'
    if e in VIDEO_EXTS:
        return 'video'
    if e in CAD_EXTS:
        return 'cad'
    if e in ARCHIVE_EXTS:
        return 'archive'
    return 'other'


def decision_for(item: dict) -> tuple[str, list[str]]:
    source = norm(item['source'])
    ext = item['ext'].lower()
    reasons = []

    if any(h in source for h in INTERNAL_PATH_HINTS):
        reasons.append('matched_internal_path_hint')
        return 'internal_only', reasons

    if any(h in source for h in PUBLIC_PATH_HINTS):
        reasons.append('matched_public_path_hint')
        if ext in {'.md', '.txt', '.png', '.jpg', '.jpeg', '.webp'}:
            reasons.append('compatible_public_media_type')
            return 'public_safe_candidate', reasons
        reasons.append('nonstandard_public_media_type')
        return 'review_needed', reasons

    if any(h in source for h in REVIEW_PATH_HINTS):
        reasons.append('matched_review_path_hint')
        return 'review_needed', reasons

    if ext in CAD_EXTS:
        reasons.append('cad_or_design_file')
        return 'internal_only', reasons
    if ext in VIDEO_EXTS:
        reasons.append('video_requires_manual_review')
        return 'review_needed', reasons
    if ext in ARCHIVE_EXTS:
        reasons.append('archive_or_bundle_requires_review')
        return 'review_needed', reasons
    if ext in {'.xlsx', '.xlsm', '.xls', '.numbers'}:
        reasons.append('spreadsheet_requires_review')
        return 'review_needed', reasons

    reasons.append('default_conservative_review')
    return 'review_needed', reasons


def main():
    data = json.loads(MANIFEST.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    decision_counts = Counter()
    group_counts = Counter()
    group_by_decision = defaultdict(Counter)

    with OUT_NDJSON.open('w') as f:
        for item in data['copied']:
            decision, reasons = decision_for(item)
            group = classify_group(item['source'])
            rec = {
                'dest': item['dest'],
                'source': item['source'],
                'sha256': item['sha256'],
                'ext': item['ext'].lower(),
                'size_bytes': item['size'],
                'group': group,
                'media_type': media_type(item['ext']),
                'publish_decision': decision,
                'decision_reasons': reasons,
                'recommended_sync_tag': {
                    'public_safe_candidate': 'sync:public-candidate',
                    'review_needed': 'sync:review-needed',
                    'internal_only': 'sync:internal-only',
                }[decision],
            }
            f.write(json.dumps(rec) + '\n')
            decision_counts[decision] += 1
            group_counts[group] += 1
            group_by_decision[decision][group] += 1

    summary = {
        'source_manifest': str(MANIFEST),
        'output_manifest': str(OUT_NDJSON),
        'total_files_reviewed': sum(decision_counts.values()),
        'decision_counts': dict(decision_counts),
        'group_counts': dict(group_counts),
        'group_breakdown_by_decision': {k: dict(v) for k, v in group_by_decision.items()},
        'policy': {
            'public_safe_candidate': 'Only clearly site/blog-style assets based on path heuristics. Still requires human approval before prod sync.',
            'review_needed': 'Default bucket for ambiguous, research, downloaded, archive, video, spreadsheet, and mixed-origin material.',
            'internal_only': 'Business, machine, testing, pricing, invoice, controller, logo, NDA, and production-related material.',
        },
    }
    OUT_SUMMARY.write_text(json.dumps(summary, indent=2))

    readme = f"""# Publish review manifest

This folder adds a non-destructive safety layer on top of the existing graphene staging corpus.

## Files
- `heuristic_review_manifest.ndjson` — one line per staged file with a conservative publish/sync decision
- `heuristic_review_summary.json` — aggregate counts by decision and source group

## Decision meanings
- `public_safe_candidate` — path strongly suggests already-public site/blog content; still requires human approval before prod sync
- `review_needed` — ambiguous or mixed-origin content; do not sync automatically
- `internal_only` — likely internal/business/ops/testing material; exclude from prod sync

## Recommended usage
Use `recommended_sync_tag` as the initial gate:
- `sync:public-candidate`
- `sync:review-needed`
- `sync:internal-only`

Then only promote reviewed items into an explicit allowlist for production.
"""
    OUT_README.write_text(readme)
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
