#!/usr/bin/env bash

# This script deploys the database gateway configuration (including Adminer) to the Ubuntu host.
# Run this on your MacStudio.

REMOTE_HOST="192.168.1.38"
REMOTE_USER="raimis" # Adjust this if your Ubuntu username is different

echo "---------------------------------------------------------"
echo "🚀 Deploying Secure DB Gateway: db.usa-graphene.com"
echo "---------------------------------------------------------"

# 1. Copy configurations
echo "Copying files to $REMOTE_HOST..."
scp -r database/gateway/* "$REMOTE_USER@$REMOTE_HOST:/tmp/"

# 2. Execute installation tasks on remote
echo "Installing gateway services on $REMOTE_HOST..."
ssh -t "$REMOTE_USER@$REMOTE_HOST" "
  # (A) Update package list and install PHP
  sudo apt update
  sudo apt install -y php-fpm certbot python3-certbot-nginx wget tar xz-utils

  # (B) Install PostgREST if not present
  if ! command -v postgrest &> /dev/null; then
    echo 'Downloading PostgREST...'
    wget https://github.com/PostgREST/postgrest/releases/download/v12.2.0/postgrest-v12.2.0-linux-static-x64.tar.xz
    tar xf postgrest-v12.2.0-linux-static-x64.tar.xz
    sudo mv postgrest /usr/local/bin/
  fi

  # (C) Set up Adminer (The DB Browser UI)
  sudo mkdir -p /var/www/html
  sudo wget -O /var/www/html/adminer.php https://github.com/vrana/adminer/releases/download/v4.17.1/adminer-4.17.1.php

  # (D) Deploy Configs
  sudo mkdir -p /etc/postgrest
  sudo mv /tmp/postgrest.conf /etc/postgrest/graphene.conf
  sudo mv /tmp/nginx.conf /etc/nginx/sites-available/db.usa-graphene.com
  sudo mv /tmp/postgrest.service /etc/systemd/system/postgrest.service

  # (E) Dynamically fix PHP-FPM path in Nginx
  PHP_FPM_SOCK=\$(find /var/run/php -name \"php*-fpm.sock\" | head -n 1)
  echo 'Found PHP-FPM socket at: '\$PHP_FPM_SOCK
  sudo sed -i \"s|fastcgi_pass unix:/var/run/php/php-fpm.sock;|fastcgi_pass unix:\$PHP_FPM_SOCK;|g\" /etc/nginx/sites-available/db.usa-graphene.com

  # (F) Enable and Restart Services
  sudo ln -sf /etc/nginx/sites-available/db.usa-graphene.com /etc/nginx/sites-enabled/
  sudo systemctl daemon-reload
  sudo systemctl enable postgrest
  sudo systemctl restart postgrest
  sudo nginx -t && sudo systemctl restart nginx

  # (G) Enable SSL
  echo 'Enabling SSL (Certbot)...'
  sudo certbot --nginx -d db.usa-graphene.com --non-interactive --agree-tos -m contact@usa-graphene.com --redirect
"

echo "---------------------------------------------------------"
echo "✅ Finished! Access the DB at: https://db.usa-graphene.com/adminer.php"
echo "---------------------------------------------------------"
