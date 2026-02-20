-- =============================================================================
-- tunix-crm full schema
-- Reconciled against db_cluster-21-10-2025@07-40-19.backup
-- Idempotent: safe to run against an empty public schema
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('Admin', 'Coach', 'Client');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'session_type') THEN
    CREATE TYPE public.session_type AS ENUM (
      'Stretch',
      'Personal Training',
      'Group Training',
      'Neuromuscular Reconstruction'
    );
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  email       public.citext       NOT NULL,
  role        public.user_role    NOT NULL DEFAULT 'Client',
  first_name  TEXT                NOT NULL,
  last_name   TEXT                NOT NULL,
  phone       CHARACTER VARYING,
  bio         TEXT,
  created_at  TIMESTAMP WITH TIME ZONE,

  CONSTRAINT users_email_unique UNIQUE (email)
);

-- ---------------------------------------------------------------------------
-- clients
-- trainer_id references users(id) (NOT NULL in backup)
-- current_program FK to programs added after that table is created (circular dep)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.clients (
  id               UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_id       UUID     NOT NULL,
  is_active        BOOLEAN  NOT NULL DEFAULT true,
  client_id        UUID     NOT NULL,
  current_program  UUID,
  goals            TEXT[],
  last_session     TIMESTAMP WITH TIME ZONE,
  next_session     TIMESTAMP WITH TIME ZONE
);

-- ---------------------------------------------------------------------------
-- exercises
-- tags is plain TEXT (not array) to match backup
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercises (
  id          UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  name        CHARACTER VARYING   NOT NULL,
  difficulty  CHARACTER VARYING,
  tags        TEXT
);

-- ---------------------------------------------------------------------------
-- programs
-- client_id → users(id) (not clients, matching backup FK)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.programs (
  id         UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID     NOT NULL,
  status     CHARACTER VARYING,
  workout    JSONB,
  tags       TEXT,
  name       TEXT
);

-- ---------------------------------------------------------------------------
-- notes
-- client_id → users(id) (not clients, matching backup FK)
-- created_at / updated_at are DATE type (matching backup)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notes (
  id          UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID  NOT NULL,
  tags        TEXT[],
  content     TEXT,
  created_at  DATE  NOT NULL,
  updated_at  DATE
);

-- ---------------------------------------------------------------------------
-- sessions
-- client_id / trainer_id → users(id) (matching backup FK)
-- No first_name / last_name / email columns (not in backup)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sessions (
  id            UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     UUID                NOT NULL,
  session_type  public.session_type NOT NULL DEFAULT 'Personal Training',
  start_time    TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time      TIMESTAMP WITH TIME ZONE NOT NULL,
  description   TEXT,
  trainer_id    UUID                NOT NULL
);

-- ---------------------------------------------------------------------------
-- knex migration tracking (managed by Knex, included for completeness)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.knex_migrations (
  id              SERIAL PRIMARY KEY,
  name            CHARACTER VARYING(255),
  batch           INTEGER,
  migration_time  TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS public.knex_migrations_lock (
  index      SERIAL PRIMARY KEY,
  is_locked  INTEGER
);

-- ---------------------------------------------------------------------------
-- Primary key constraints (idempotent guard via DO block)
-- Already declared inline above via PRIMARY KEY; listed here for clarity
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Foreign key constraints
-- ---------------------------------------------------------------------------

-- clients.client_id → users.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_client_id_foreign') THEN
    ALTER TABLE ONLY public.clients
      ADD CONSTRAINT clients_client_id_foreign
      FOREIGN KEY (client_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- clients.trainer_id → users.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_trainer_id_foreign') THEN
    ALTER TABLE ONLY public.clients
      ADD CONSTRAINT clients_trainer_id_foreign
      FOREIGN KEY (trainer_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- clients.current_program → programs.id (no ON DELETE — defaults to RESTRICT)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'clients_current_program_fkey') THEN
    ALTER TABLE ONLY public.clients
      ADD CONSTRAINT clients_current_program_fkey
      FOREIGN KEY (current_program) REFERENCES public.programs(id);
  END IF;
END $$;

-- notes.client_id → users.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'notes_client_id_fkey') THEN
    ALTER TABLE ONLY public.notes
      ADD CONSTRAINT notes_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES public.users(id);
  END IF;
END $$;

-- programs.client_id → users.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'programs_client_id_fkey') THEN
    ALTER TABLE ONLY public.programs
      ADD CONSTRAINT programs_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES public.users(id);
  END IF;
END $$;

-- sessions.client_id → users.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_client_id_fkey') THEN
    ALTER TABLE ONLY public.sessions
      ADD CONSTRAINT sessions_client_id_fkey
      FOREIGN KEY (client_id) REFERENCES public.users(id);
  END IF;
END $$;

-- sessions.trainer_id → users.id
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'sessions_trainer_id_fkey') THEN
    ALTER TABLE ONLY public.sessions
      ADD CONSTRAINT sessions_trainer_id_fkey
      FOREIGN KEY (trainer_id) REFERENCES public.users(id);
  END IF;
END $$;
