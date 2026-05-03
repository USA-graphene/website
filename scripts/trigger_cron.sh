#!/bin/bash
SECRET="tioKZgJqBpcubBqFSNNxWFRddnet06xK4iPr+tgYVco="
URL="https://usa-graphene.com/api/cron/publish-daily?limit=1"

echo "🚀 Triggering live blog generation..."
curl -L -X GET "$URL" \
     -H "x-cron-secret: $SECRET" \
     -H "Content-Type: application/json"

echo -e "\n\n✅ Done."
