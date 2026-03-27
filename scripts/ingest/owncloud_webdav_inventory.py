#!/usr/bin/env python3
"""Read-only ownCloud WebDAV inventory/downloader for graphene KB ingestion.

Features
- Authenticated WebDAV traversal via PROPFIND only (no remote writes/deletes)
- Inventory-first: writes a manifest even if downloads are disabled
- Optional keyword/path filtering for graphene-related material
- Optional downloads into a staging folder with sha256-based dedupe
- JSON manifest suitable for later merge/index steps

Environment
  OWNCLOUD_BASE_URL=http://cloud.usa-graphene.com:8080
  OWNCLOUD_USERNAME=...
  OWNCLOUD_PASSWORD=...

Examples
  python3 owncloud_webdav_inventory.py \
    --remote-root /remote.php/dav/files/$OWNCLOUD_USERNAME/ \
    --manifest /Users/raimis/aa/out/owncloud_inventory.json

  python3 owncloud_webdav_inventory.py \
    --remote-root /remote.php/dav/files/$OWNCLOUD_USERNAME/ \
    --download \
    --dest /Users/raimis/aa/database/graphene_knowledge_base/raw_files \
    --manifest /Users/raimis/aa/out/owncloud_inventory.json
"""
from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
import posixpath
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Iterable

DEFAULT_BASE_URL = os.environ.get("OWNCLOUD_BASE_URL", "http://cloud.usa-graphene.com:8080")
DEFAULT_DEST = Path("/Users/raimis/aa/database/graphene_knowledge_base/raw_files")
DEFAULT_MANIFEST = Path("/Users/raimis/aa/out/owncloud_inventory.json")
DEFAULT_KEYWORDS = [
    "graphene",
    "turbostratic",
    "flash graphene",
    "graphenecell",
    "usa-graphene",
]
ALLOWED_EXTS = {
    ".pdf", ".doc", ".docx", ".txt", ".md", ".rtf", ".pages", ".csv", ".xls", ".xlsx", ".xlsm", ".numbers",
    ".ppt", ".pptx", ".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".webarchive", ".zip", ".wpress",
    ".bib", ".ris", ".mobi", ".epub", ".mp4", ".mov", ".stp", ".step", ".f3d", ".dot", ".py"
}
DAV_NS = {"d": "DAV:", "oc": "http://owncloud.org/ns"}
PROPFIND_BODY = b'''<?xml version="1.0" encoding="utf-8"?>
<d:propfind xmlns:d="DAV:" xmlns:oc="http://owncloud.org/ns">
  <d:prop>
    <d:displayname/>
    <d:getcontentlength/>
    <d:getcontenttype/>
    <d:getetag/>
    <d:getlastmodified/>
    <d:resourcetype/>
    <oc:fileid/>
  </d:prop>
</d:propfind>
'''


def sanitize(name: str) -> str:
    return re.sub(r"[^A-Za-z0-9._ -]+", "_", name)


def sha256_of(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def build_opener(username: str, password: str):
    token = base64.b64encode(f"{username}:{password}".encode()).decode()
    auth_header = f"Basic {token}"

    class AuthHandler(urllib.request.BaseHandler):
        def http_request(self, req):
            req.add_unredirected_header("Authorization", auth_header)
            return req
        https_request = http_request

    return urllib.request.build_opener(AuthHandler())


@dataclass
class RemoteEntry:
    href: str
    path: str
    name: str
    is_dir: bool
    size: int | None
    etag: str | None
    modified: str | None
    content_type: str | None
    file_id: str | None
    ext: str
    matched: bool
    match_reason: str | None
    download_url: str
    local_sha256: str | None = None
    local_dest: str | None = None
    status: str | None = None


def encode_remote_path(remote_path: str) -> str:
    """Percent-encode a remote DAV path while preserving WebDAV path semantics.

    Encodes each path segment separately so `/` stays structural, existing `%HH`
    escapes are preserved, and literal `%` characters remain `%25` instead of
    being accidentally decoded into another character.
    """
    parsed = urllib.parse.urlsplit(remote_path)
    raw_path = parsed.path or remote_path
    trailing_slash = raw_path.endswith("/")
    encoded_segments = [
        urllib.parse.quote_from_bytes(urllib.parse.unquote_to_bytes(segment), safe="")
        for segment in raw_path.split("/")
    ]
    encoded_path = "/".join(encoded_segments)
    if trailing_slash and not encoded_path.endswith("/"):
        encoded_path += "/"
    return encoded_path


def build_remote_url(base_url: str, remote_path: str) -> str:
    return urllib.parse.urljoin(base_url.rstrip("/") + "/", encode_remote_path(remote_path).lstrip("/"))


def propfind(opener, base_url: str, remote_path: str) -> list[RemoteEntry]:
    url = build_remote_url(base_url, remote_path)
    req = urllib.request.Request(url, data=PROPFIND_BODY, method="PROPFIND")
    req.add_header("Depth", "1")
    req.add_header("Content-Type", "application/xml; charset=utf-8")
    try:
        with opener.open(req, timeout=30) as resp:
            payload = resp.read()
    except urllib.error.HTTPError as e:
        # WebDAV PROPFIND commonly returns 207 Multi-Status, and some servers
        # surface that through urllib's HTTPError path even though the XML body
        # contains successful per-property responses. Treat 207 as usable.
        if e.code != 207:
            raise
        payload = e.read()
    root = ET.fromstring(payload)
    out: list[RemoteEntry] = []
    for response in root.findall("d:response", DAV_NS):
        href = response.findtext("d:href", default="", namespaces=DAV_NS)
        prop = response.find("d:propstat/d:prop", DAV_NS)
        if prop is None:
            continue
        is_dir = prop.find("d:resourcetype/d:collection", DAV_NS) is not None
        size_text = prop.findtext("d:getcontentlength", default=None, namespaces=DAV_NS)
        parsed = urllib.parse.urlparse(href)
        path = urllib.parse.unquote(parsed.path)
        name = posixpath.basename(path.rstrip("/")) or path.rstrip("/")
        out.append(RemoteEntry(
            href=href,
            path=path,
            name=name,
            is_dir=is_dir,
            size=int(size_text) if size_text and size_text.isdigit() else None,
            etag=prop.findtext("d:getetag", default=None, namespaces=DAV_NS),
            modified=prop.findtext("d:getlastmodified", default=None, namespaces=DAV_NS),
            content_type=prop.findtext("d:getcontenttype", default=None, namespaces=DAV_NS),
            file_id=prop.findtext("oc:fileid", default=None, namespaces=DAV_NS),
            ext=Path(name).suffix.lower(),
            matched=False,
            match_reason=None,
            download_url=build_remote_url(base_url, path),
        ))
    return out


def remote_fingerprint(entry: RemoteEntry) -> str:
    return json.dumps({
        "path": entry.path,
        "etag": entry.etag,
        "size": entry.size,
        "modified": entry.modified,
        "file_id": entry.file_id,
    }, sort_keys=True)


def match_entry(entry: RemoteEntry, keywords: list[str], allowed_exts: set[str]) -> tuple[bool, str | None]:
    hay = f"{entry.path} {entry.name}".lower()
    if entry.is_dir:
        if any(k in hay for k in keywords):
            return True, "keyword-in-directory"
        return False, None
    if entry.ext not in allowed_exts:
        return False, None
    if any(k in hay for k in keywords):
        return True, "keyword-in-path"
    return False, None


def iter_tree(opener, base_url: str, remote_root: str, keywords: list[str], allowed_exts: set[str]) -> Iterable[RemoteEntry]:
    queue = [remote_root]
    seen_dirs = set()
    while queue:
        current = queue.pop(0)
        if current in seen_dirs:
            continue
        seen_dirs.add(current)
        entries = propfind(opener, base_url, current)
        for entry in entries:
            if entry.path.rstrip("/") == current.rstrip("/"):
                continue
            matched, reason = match_entry(entry, keywords, allowed_exts)
            entry.matched = matched
            entry.match_reason = reason
            yield entry
            if entry.is_dir:
                queue.append(entry.path + ("/" if not entry.path.endswith("/") else ""))


def load_existing_hashes(dest: Path) -> dict[str, str]:
    hashes = {}
    if not dest.exists():
        return hashes
    for path in dest.iterdir():
        if path.is_file():
            try:
                hashes[sha256_of(path)] = str(path)
            except Exception:
                pass
    return hashes


def download_entry(opener, entry: RemoteEntry, dest: Path, existing_hashes: dict[str, str]) -> RemoteEntry:
    safe_prefix = entry.path.strip("/").replace("/", "__")
    stem = sanitize(Path(entry.name).stem) or "file"
    suffix = entry.ext
    out_name = f"owncloud__{safe_prefix}__{stem}{suffix}"
    out_path = dest / out_name
    counter = 2
    while out_path.exists():
        out_name = f"owncloud__{safe_prefix}__{stem}__{counter}{suffix}"
        out_path = dest / out_name
        counter += 1

    tmp = out_path.with_suffix(out_path.suffix + ".part")
    req = urllib.request.Request(entry.download_url, method="GET")
    with opener.open(req, timeout=120) as resp, tmp.open("wb") as f:
        while True:
            chunk = resp.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)

    digest = sha256_of(tmp)
    if digest in existing_hashes:
        tmp.unlink(missing_ok=True)
        entry.local_sha256 = digest
        entry.local_dest = existing_hashes[digest]
        entry.status = "duplicate-local-sha256"
        return entry

    tmp.rename(out_path)
    existing_hashes[digest] = str(out_path)
    entry.local_sha256 = digest
    entry.local_dest = str(out_path)
    entry.status = "downloaded"
    return entry


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--base-url", default=DEFAULT_BASE_URL)
    ap.add_argument("--remote-root", required=True, help="Example: /remote.php/dav/files/<username>/")
    ap.add_argument("--manifest", type=Path, default=DEFAULT_MANIFEST)
    ap.add_argument("--dest", type=Path, default=DEFAULT_DEST)
    ap.add_argument("--download", action="store_true", help="Download matched files into --dest")
    ap.add_argument("--username", default=os.environ.get("OWNCLOUD_USERNAME"))
    ap.add_argument("--password", default=os.environ.get("OWNCLOUD_PASSWORD"))
    ap.add_argument("--keyword", action="append", default=[])
    ap.add_argument("--max-files", type=int, default=0, help="Stop after this many matched files (0 = unlimited)")
    args = ap.parse_args()

    if not args.username or not args.password:
        print("Missing credentials: set OWNCLOUD_USERNAME and OWNCLOUD_PASSWORD or pass --username/--password", file=sys.stderr)
        return 2

    keywords = sorted(set(DEFAULT_KEYWORDS + [k.lower() for k in args.keyword]))
    opener = build_opener(args.username, args.password)
    args.manifest.parent.mkdir(parents=True, exist_ok=True)
    if args.download:
        args.dest.mkdir(parents=True, exist_ok=True)
    existing_hashes = load_existing_hashes(args.dest) if args.download else {}

    started = time.time()
    inventory = []
    matched_count = 0
    downloaded_count = 0
    for entry in iter_tree(opener, args.base_url, args.remote_root, keywords, ALLOWED_EXTS):
        if entry.matched and not entry.is_dir:
            matched_count += 1
            if args.download:
                try:
                    entry = download_entry(opener, entry, args.dest, existing_hashes)
                    if entry.status == "downloaded":
                        downloaded_count += 1
                except Exception as exc:
                    entry.status = f"download-error: {exc}"
        inventory.append(asdict(entry))
        if args.max_files and matched_count >= args.max_files:
            break

    manifest = {
        "source": "owncloud-webdav",
        "base_url": args.base_url,
        "remote_root": args.remote_root,
        "generated_at_epoch": int(time.time()),
        "duration_seconds": round(time.time() - started, 2),
        "download_enabled": args.download,
        "keyword_filters": keywords,
        "allowed_exts": sorted(ALLOWED_EXTS),
        "counts": {
            "entries_seen": len(inventory),
            "matched_files": matched_count,
            "downloaded_files": downloaded_count,
        },
        "entries": inventory,
        "dedupe_strategy": {
            "remote_inventory_key": ["path", "etag", "size", "modified", "file_id"],
            "local_download_key": "sha256",
            "notes": [
                "Inventory can be diffed by remote fingerprint before any downloads.",
                "Downloads are skipped if sha256 already exists in the local destination.",
                "No remote write/delete methods are used by this script.",
            ],
            "example_remote_fingerprint": hashlib.sha256(remote_fingerprint(RemoteEntry(
                href="", path=args.remote_root, name="root", is_dir=True, size=None, etag=None, modified=None,
                content_type=None, file_id=None, ext="", matched=False, match_reason=None, download_url=""
            )).encode()).hexdigest(),
        },
    }
    args.manifest.write_text(json.dumps(manifest, indent=2))
    print(json.dumps({
        "manifest": str(args.manifest),
        "entries_seen": len(inventory),
        "matched_files": matched_count,
        "downloaded_files": downloaded_count,
    }, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
