from flask import Flask, session, request, render_template, jsonify
import os
import subprocess
from pathlib import Path
import time
import json
import secrets
from dotenv import load_dotenv

# Load key from .env
load_dotenv(Path("/Users/raimis/aa/uploader/.env"))

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)

# Configuration
PROJECT_ROOT = Path("/Users/raimis/aa")
RAW_FILES_DIR = PROJECT_ROOT / "database" / "graphene_knowledge_base" / "raw_files"
INGEST_SCRIPT = PROJECT_ROOT / "scripts" / "ingest" / "run_full_ingest.sh"

# Ensure directories exist
RAW_FILES_DIR.mkdir(parents=True, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    filename = file.filename
    save_path = RAW_FILES_DIR / filename
    
    try:
        file.save(str(save_path))
        return jsonify({"success": True, "filename": filename, "message": f"File {filename} received. Starting pipeline..."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/process", methods=["POST"])
def process_data():
    filename = request.json.get("filename")
    if not filename:
        return jsonify({"error": "No filename provided"}), 400
    
    file_path = RAW_FILES_DIR / filename
    try:
        # Run the NEW fast-track script for this ONE file
        result = subprocess.run(
            ["python3", str(PROJECT_ROOT / "scripts" / "ingest" / "ingest_one.py"), str(file_path)],
            cwd=str(PROJECT_ROOT),
            capture_output=True,
            text=True,
            check=True,
            env={**os.environ, "OPENAI_API_KEY": os.environ.get("OPENAI_API_KEY", "")}
        )
        return jsonify({
            "success": True, 
            "output": result.stdout,
            "message": "AI Knowledge Forge complete"
        })
    except subprocess.CalledProcessError as e:
        return jsonify({
            "error": "Forge failed",
            "details": e.stderr
        }), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("--- USA Graphene Knowledge Forge ---")
    print(f"Project Home: {PROJECT_ROOT}")
    print(f"Uploader listening on http://127.0.0.1:5005")
    app.run(host="127.0.0.1", port=5005, debug=True)
