# Graphene Knowledge Forge - Ingestion UI Plan

To make feeding your AI bot super easy, we will build a local "Knowledge Forge" app on your Mac.

### 1. Architecture
- **Frontend**: A sleek, dark-themed drag-and-drop zone using vanilla CSS (Glassmorphism).
- **Backend (Local Flask)**: Handles the file upload, runs your existing ingestion scripts, and pushes results to the Ubuntu server.
- **Connectivity**: Uses direct LAN connection (192.168.1.38:5432) to update the database.

### 2. Files to Create
- `/Users/raimis/aa/uploader/app.py`: The Flask server orchestration.
- `/Users/raimis/aa/uploader/templates/index.html`: The premium UI.
- `/Users/raimis/aa/uploader/start.sh`: A simple runner script.

### 3. Dependencies
- `flask`: For the web service.
- `pypdf`: For PDF reading (if not present).
- `openai`: For embeddings (using your existing scripts).

### 4. Workflow
1. User drops PDF into browser.
2. `app.py` saves file to `raw_files`.
3. `app.py` executes `run_full_ingest.sh`.
4. Browser shows progress: `Extracting...` -> `Chunking...` -> `Embedding...` -> `Done!`.
