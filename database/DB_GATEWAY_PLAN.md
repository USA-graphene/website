# Implementation Plan: Secure Graphene DB Gateway

This plan outlines the steps to expose the local PostgreSQL database on `192.168.1.38` via `db.usa-graphene.com` securely, using a REST API layer instead of raw SQL exposure.

## Architecture Overview

- **Database**: PostgreSQL (`graphene_kb`) on Ubuntu host (`192.168.1.38`).
- **REST Layer**: **PostgREST** (runs on the Ubuntu host, proxies to local PG).
- **Reverse Proxy**: **Nginx** (handles SSL, domain mapping, and extra auth).
- **DNS**: `A` record for `db.usa-graphene.com` pointing to the public IP.
- **Security**: 
  - SSL/TLS via Let's Encrypt.
  - JWT or Basic Authentication.
  - Port 5432 remains blocked from the public.

---

## Step 1: Install PostgREST on Ubuntu

1. Download the latest PostgREST binary:
   ```bash
   wget https://github.com/PostgREST/postgrest/releases/download/v12.2.0/postgrest-v12.2.0-linux-static-x64.tar.xz
   tar xf postgrest-v12.2.0-linux-static-x64.tar.xz
   sudo mv postgrest /usr/local/bin/
   ```

2. Create a configuration file `/etc/postgrest/graphene.conf`:
   ```ini
   db-uri = "postgres://graphene_app:graphene_local_2026@localhost:5432/graphene_kb"
   db-schema = "public"
   db-anon-role = "graphene_app" # Suggest creating a read-only role for production
   server-port = 3000
   ```

3. Setup a systemd service to keep it running.

---

## Step 2: Configure Nginx Reverse Proxy

1. Create a new Nginx site configuration `/etc/nginx/sites-available/db.usa-graphene.com`:
   ```nginx
   server {
       listen 80;
       server_name db.usa-graphene.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

2. Enable the site and restart Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/db.usa-graphene.com /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

---

## Step 3: SSL and Security

1. **Let's Encrypt**: Run Certbot to get an SSL certificate.
   ```bash
   sudo certbot --nginx -d db.usa-graphene.com
   ```

2. **Firewall (UFW)**: 
   ```bash
   sudo ufw allow 'Nginx Full'
   sudo ufw deny 5432
   ```

---

## Step 4: DNS and Port Forwarding

1. **DNS**: Go to your DNS provider (e.g. Namecheap) and add:
   - Type: `A`
   - Host: `db`
   - Value: `<Your-Public-IP>`
2. **Router**: Forward ports **80** and **443** to `192.168.1.38`.

---

## Future Hardening (Optional)

- **JWT Authentication**: Configure PostgREST to require JWT tokens for all queries.
- **Read-Only User**: Create a specific PostgreSQL user for the web API with limited permissions.
- **Rate Limiting**: Add Nginx `limit_req` to prevent abuse.
