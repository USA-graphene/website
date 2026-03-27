#!/usr/bin/env python3
import csv
import html
import json
import mimetypes
import re
import subprocess
import tempfile
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

RAW = Path('/Users/raimis/aa/database/graphene_knowledge_base/raw_files')
SOURCES = Path('/Users/raimis/aa/database/graphene_knowledge_base/processed/sources.ndjson')
OUT = Path('/Users/raimis/aa/database/graphene_knowledge_base/processed/extracted.ndjson')
LOG = Path('/Users/raimis/aa/database/graphene_knowledge_base/logs/extraction_failures.ndjson')

TEXT_EXTS = {'.txt', '.md', '.py', '.csv', '.bib', '.ris'}
TEXTUTIL_EXTS = {'.doc', '.docx', '.dot', '.rtf', '.webarchive'}
OFFICE_XML_EXTS = {'.pptx', '.xlsx', '.xlsm'}
SKIP_EXTS = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.mov', '.mp4', '.zip', '.wpress', '.stp', '.step', '.f3d', '.key', '.pages'}
UNSUPPORTED_EXTS = {'.numbers'}
MAX_TEXT = 400000
STRINGS_MIN_LEN = 8
VISION_OCR = Path('/Users/raimis/aa/scripts/ingest/vision_ocr.swift')
OCR_MAX_PDF_PAGES = 12
OCR_MAX_DOCX_IMAGES = 8


def normalize_text(text: str) -> str:
    text = html.unescape(text or '')
    text = text.replace('\r', '\n')
    text = re.sub(r'\n{3,}', '\n\n', text)
    text = re.sub(r'[ \t]+\n', '\n', text)
    text = re.sub(r'\n[ \t]+', '\n', text)
    text = re.sub(r'[ \t]{2,}', ' ', text)
    return text.strip()


def extract_plain(path: Path) -> str:
    return normalize_text(path.read_text(errors='ignore'))


def extract_csv(path: Path) -> str:
    rows = []
    with path.open(newline='', errors='ignore') as f:
        reader = csv.reader(f)
        for i, row in enumerate(reader):
            rows.append(' | '.join(row))
            if i >= 2000:
                break
    return normalize_text('\n'.join(rows))


def run_vision_ocr(mode: str, path: Path, extra_args: list[str] | None = None) -> str:
    cmd = ['swift', str(VISION_OCR), mode, str(path)]
    if extra_args:
        cmd.extend(extra_args)
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or 'vision ocr failed')
    return normalize_text(proc.stdout)


def extract_pdf(path: Path) -> str:
    proc = subprocess.run(['pdftotext', str(path), '-'], capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or 'pdftotext failed')
    text = normalize_text(proc.stdout)
    if text:
        return text
    return run_vision_ocr('pdf', path, [str(OCR_MAX_PDF_PAGES)])


def extract_with_textutil(path: Path) -> str:
    proc = subprocess.run(['textutil', '-convert', 'txt', '-stdout', str(path)], capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or 'textutil failed')
    text = normalize_text(proc.stdout)
    if text or path.suffix.lower() != '.docx':
        return text
    return extract_docx_images_ocr(path)


def extract_xml_text(blob: bytes) -> str:
    try:
        root = ET.fromstring(blob)
    except ET.ParseError:
        return ''
    parts = []
    for elem in root.iter():
        if elem.text and elem.text.strip():
            parts.append(elem.text.strip())
    return '\n'.join(parts)


def extract_docx_images_ocr(path: Path) -> str:
    chunks = []
    with tempfile.TemporaryDirectory() as tmpdir:
        with zipfile.ZipFile(path) as z:
            image_names = [
                n for n in sorted(z.namelist())
                if re.search(r'(^|/)(media|word/media)/.+\.(png|jpe?g|gif|webp)$', n, re.I)
            ][:OCR_MAX_DOCX_IMAGES]
            for idx, name in enumerate(image_names, start=1):
                out_path = Path(tmpdir) / Path(name).name
                out_path.write_bytes(z.read(name))
                text = run_vision_ocr('image', out_path)
                if text:
                    chunks.append(f'[Embedded image {idx}: {Path(name).name}]\n{text}')
    return normalize_text('\n\n'.join(chunks))


def extract_pptx(path: Path) -> str:
    chunks = []
    with zipfile.ZipFile(path) as z:
        slide_names = sorted(
            n for n in z.namelist()
            if n.startswith('ppt/slides/slide') and n.endswith('.xml')
        )
        for i, name in enumerate(slide_names, start=1):
            text = extract_xml_text(z.read(name))
            if text:
                chunks.append(f'[Slide {i}]\n{text}')
    return normalize_text('\n\n'.join(chunks))


def extract_xlsx(path: Path) -> str:
    ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
    with zipfile.ZipFile(path) as z:
        shared = []
        if 'xl/sharedStrings.xml' in z.namelist():
            root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root.findall('main:si', ns):
                pieces = [t.text or '' for t in si.iterfind('.//main:t', ns)]
                shared.append(''.join(pieces))

        workbook = ET.fromstring(z.read('xl/workbook.xml'))
        rel_root = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rel_ns = {'rel': 'http://schemas.openxmlformats.org/package/2006/relationships'}
        rel_map = {
            rel.attrib['Id']: rel.attrib['Target']
            for rel in rel_root.findall('rel:Relationship', rel_ns)
        }

        chunks = []
        for sheet in workbook.findall('main:sheets/main:sheet', ns):
            name = sheet.attrib.get('name', 'Sheet')
            rel_id = sheet.attrib.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id')
            target = rel_map.get(rel_id)
            if not target:
                continue
            sheet_path = 'xl/' + target.lstrip('/') if not target.startswith('xl/') else target
            if sheet_path not in z.namelist():
                continue
            root = ET.fromstring(z.read(sheet_path))
            lines = [f'[Sheet: {name}]']
            for row in root.findall('.//main:sheetData/main:row', ns):
                vals = []
                for cell in row.findall('main:c', ns):
                    cell_type = cell.attrib.get('t')
                    value = cell.findtext('main:v', default='', namespaces=ns)
                    if cell_type == 's' and value.isdigit():
                        idx = int(value)
                        vals.append(shared[idx] if idx < len(shared) else value)
                    else:
                        inline = ''.join(t.text or '' for t in cell.iterfind('.//main:is/main:t', ns))
                        vals.append(inline or value)
                row_text = ' | '.join(v.strip() for v in vals if (v or '').strip())
                if row_text:
                    lines.append(row_text)
            if len(lines) > 1:
                chunks.append('\n'.join(lines))
    return normalize_text('\n\n'.join(chunks))


def extract_epub(path: Path) -> str:
    chunks = []
    with zipfile.ZipFile(path) as z:
        names = [
            n for n in z.namelist()
            if n.lower().endswith(('.xhtml', '.html', '.htm', '.xml'))
            and not n.startswith(('META-INF/', '__MACOSX/'))
        ]
        for name in names:
            text = extract_xml_text(z.read(name))
            if text:
                chunks.append(text)
    return normalize_text('\n\n'.join(chunks))


def extract_printable_strings(path: Path, min_len: int = STRINGS_MIN_LEN, mode: str = 'generic') -> str:
    proc = subprocess.run(['strings', '-n', str(min_len), str(path)], capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or 'strings failed')
    lines = []
    seen = set()
    for raw in proc.stdout.splitlines():
        line = normalize_text(raw)
        if len(line) < min_len:
            continue
        alpha_count = sum(ch.isalpha() for ch in line)
        digit_count = sum(ch.isdigit() for ch in line)
        space_count = sum(ch.isspace() for ch in line)
        if alpha_count < max(4, len(line) // 3):
            continue
        if re.fullmatch(r'[A-Fa-f0-9-]{16,}', line):
            continue
        if mode == 'pages':
            if line.startswith(('Data/', 'Index/', 'Metadata/')):
                continue
            if len(line) < 35 and space_count < 2:
                continue
            if digit_count > alpha_count:
                continue
        if line in seen:
            continue
        seen.add(line)
        lines.append(line)
    return normalize_text('\n'.join(lines))


def extract_pages(path: Path) -> str:
    return extract_printable_strings(path, mode='pages')


def extract_mobi(path: Path) -> str:
    return extract_printable_strings(path)


def maybe_extract(path: Path) -> tuple[str, str]:
    ext = path.suffix.lower()
    if ext in SKIP_EXTS:
        return '', 'skipped'
    if ext in TEXT_EXTS:
        if ext == '.csv':
            return extract_csv(path), 'ok'
        return extract_plain(path), 'ok'
    if ext == '.pdf':
        return extract_pdf(path), 'ok'
    if ext in TEXTUTIL_EXTS:
        return extract_with_textutil(path), 'ok'
    if ext == '.pptx':
        return extract_pptx(path), 'ok'
    if ext in {'.xlsx', '.xlsm'}:
        return extract_xlsx(path), 'ok'
    if ext == '.epub':
        return extract_epub(path), 'ok'
    if ext == '.pages':
        return extract_pages(path), 'ok'
    if ext == '.mobi':
        return extract_mobi(path), 'ok'
    if ext in UNSUPPORTED_EXTS:
        return '', 'unsupported_for_now'
    if ext == '.key':
        return '', 'skipped'

    return '', 'unsupported_for_now'


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    LOG.parent.mkdir(parents=True, exist_ok=True)
    processed = 0
    extracted = 0
    with SOURCES.open() as src, OUT.open('w') as out, LOG.open('w') as log:
        for line in src:
            rec = json.loads(line)
            path = Path(rec['source_path'])
            try:
                text, status = maybe_extract(path)
                rec['mime_type'] = mimetypes.guess_type(str(path))[0]
                rec['extraction_status'] = 'extracted' if text.strip() else ('no_text_extracted' if status == 'ok' else status)
                rec['extracted_text'] = text[:MAX_TEXT]
                out.write(json.dumps(rec) + '\n')
                if text.strip():
                    extracted += 1
            except Exception as e:
                log.write(json.dumps({'path': str(path), 'error': str(e)}) + '\n')
                rec['extraction_status'] = 'failed'
                rec['extracted_text'] = ''
                out.write(json.dumps(rec) + '\n')
            processed += 1
    print(json.dumps({'processed': processed, 'with_text': extracted, 'out': str(OUT)}, indent=2))


if __name__ == '__main__':
    main()
