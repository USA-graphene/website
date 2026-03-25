# Carbon AI Bot - Recommended Database Setup

## Short version

For this project, the cleanest stack is:

- **Sanity** = website CMS and product/blog/application content
- **OpenAI** = answer generation
- **Supabase Postgres** = chat session storage, lead capture, analytics, and later vector search

That gives you a working bot quickly without forcing the database to replace Sanity.

## Recommended architecture

### Phase 1: fastest working version
Use:
- Sanity as the knowledge source
- `/api/chat` in Next.js as the backend
- OpenAI for responses
- browser localStorage for short chat memory

This is enough to get Carbon answering real questions from your live site content.

### Phase 2: production-ready bot
Add Supabase Postgres for:
- storing conversations
- tracking leads and contact requests
- saving user intent analytics
- creating a human handoff queue
- optional pgvector embeddings for better retrieval

## Why Supabase is the best fit here

I recommend **Supabase** over starting with MongoDB, Firebase, or a custom raw Postgres install because:

- it is just Postgres underneath
- easy hosted setup
- built-in SQL editor and auth if needed later
- supports **pgvector** for semantic search
- works well with Next.js and Vercel
- easier to inspect than black-box databases

## Suggested schema

### 1. chat_sessions
```sql
create table if not exists chat_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  visitor_id text,
  source text default 'website',
  landing_page text,
  user_agent text,
  status text default 'active'
);
```

### 2. chat_messages
```sql
create table if not exists chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  metadata jsonb default '{}'::jsonb
);
```

### 3. leads
```sql
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  session_id uuid references chat_sessions(id) on delete set null,
  name text,
  email text,
  company text,
  phone text,
  interest_area text,
  notes text,
  status text default 'new'
);
```

### 4. knowledge_chunks (optional, phase 2)
```sql
create extension if not exists vector;

create table if not exists knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source_type text not null,
  source_id text not null,
  source_url text,
  title text,
  content text not null,
  embedding vector(1536)
);
```

## Minimum production flow

1. Visitor opens Carbon widget
2. Frontend sends messages to `/api/chat`
3. Backend pulls relevant content from Sanity
4. Backend asks OpenAI for response
5. Response returns to widget
6. If DB is connected, save session + messages + lead flags

## What to store in the database vs Sanity

### Keep in Sanity
- products
- blog posts
- application pages
- technical marketing content
- equipment pages

### Keep in Supabase
- conversation history
- lead capture details
- analytics events
- escalations / human follow-up
- optional embeddings for semantic retrieval

## Environment variables you will likely need later

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## My recommendation for you

If you want the fastest path:

### Do now
- keep Sanity as content source
- connect OpenAI key
- launch Carbon with the new `/api/chat` route

### Do next
- create Supabase project
- add `chat_sessions`, `chat_messages`, and `leads`
- log every conversation server-side
- add an admin page or dashboard later

### Do after that
- add embeddings for product sheets, blog content, and PDFs
- rerank sources before generation
- add a contact capture flow when users ask for pricing or quotes

## Good first Supabase setup

- Region: pick the one closest to your Vercel deployment/users
- Enable backups
- Turn on pgvector extension
- Keep Row Level Security simple at first
- Use service role key only on the server, never in the client

## Bottom line

You do **not** need a database just to make Carbon work.

You **do** want a database for:
- persistent chat history
- lead generation
- better analytics
- better retrieval later

So the smart build order is:

1. **Sanity + OpenAI + Next API route**
2. **Supabase for persistence**
3. **pgvector for semantic search**
