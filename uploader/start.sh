#!/bin/zsh
echo "--- Graphene Knowledge Forge ---"
echo "Checking dependencies..."

# Check for flask
python3 -c "import flask" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "Installing Flask..."
    python3 -m pip install flask
fi

# Load local .env if it exists
if [ -f /Users/raimis/aa/uploader/.env ]; then
    set -a; source /Users/raimis/aa/uploader/.env; set +a
    echo "API Key loaded from .env."
fi

# Ensure OpenAI and Psycopg are around (assumed parts of project)
echo "Launching local uploader..."
python3 /Users/raimis/aa/uploader/app.py
