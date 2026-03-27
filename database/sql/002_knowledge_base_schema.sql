create table if not exists knowledge_sources (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  source_path text not null unique,
  source_name text not null,
  source_group text,
  source_type text not null,
  title text,
  sha256 text not null,
  mime_type text,
  size_bytes bigint,
  metadata jsonb not null default '{}'::jsonb,
  extraction_status text not null default 'pending',
  extracted_text text,
  extracted_at timestamptz
);

create index if not exists idx_knowledge_sources_sha256 on knowledge_sources(sha256);
create index if not exists idx_knowledge_sources_type on knowledge_sources(source_type);
create index if not exists idx_knowledge_sources_group on knowledge_sources(source_group);

create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_id uuid not null references knowledge_sources(id) on delete cascade,
  chunk_index integer not null,
  title text,
  content text not null,
  token_estimate integer,
  embedding vector(1536),
  metadata jsonb not null default '{}'::jsonb,
  unique(source_id, chunk_index)
);

create index if not exists idx_knowledge_chunks_source_id on knowledge_chunks(source_id);

create table if not exists ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'running',
  files_seen integer not null default 0,
  files_indexed integer not null default 0,
  files_extracted integer not null default 0,
  chunks_created integer not null default 0,
  notes text,
  metadata jsonb not null default '{}'::jsonb
);
