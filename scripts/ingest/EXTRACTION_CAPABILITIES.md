# Graphene KB extraction capabilities

Updated by subagent on 2026-03-25.

## Improved local extraction paths

`extract_graphene_text.py` now uses only already-available/local tooling:

- `pdftotext` for `.pdf`
- macOS-native Vision OCR fallback (via `swift` + `Vision` + `PDFKit`) for image-only/scanned `.pdf`
- macOS `textutil` for `.doc`, `.docx`, `.dot`, `.rtf`, `.webarchive`
- embedded-image OCR fallback for image-only `.docx` files
- ZIP/XML parsing for `.pptx`, `.xlsx`, `.xlsm`
- ZIP/XML parsing for `.epub`
- plain-text readers for `.txt`, `.md`, `.py`, `.csv`, `.bib`, `.ris`

## Still limited / unsupported without more tooling

- `.pages` — current files expose preview images only; no safe built-in text path found here
- `.mobi` — no native converter available in current environment
- `.numbers`, `.xls` — need additional converter/parser support
- general image captioning / figure interpretation is still out of scope; OCR only helps when the image actually contains text

## Observed test impact on current staged corpus

Earlier improved extractor baseline:
- 241 / 492 files had extracted text
- 15 files remained `no_text_extracted`

After adding native OCR fallbacks and rerunning on the current corpus:
- 281 / 534 files have extracted text
- `no_text_extracted` dropped from `15` to `0`
- chunk output increased to `12111`

Hard-case wins observed in corpus:
- image-only / scan-heavy `.pdf` files now become searchable via Vision OCR
- image-only SEM / instrument `.docx` files now surface OCR text from embedded images

Notes:
- one mislabeled/broken `raman.xlsx` is still the lone `failed` item (`File is not a zip file`)
- OCR on scanned patents / phone snapshots is useful for recall but noisier than native text extraction
- `.pages` / `.mobi` fallback text is noisier than native extraction, but still surfaces useful searchable content without extra installs
