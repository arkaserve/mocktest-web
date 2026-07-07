-- ══════════════════════════════════════════════════════════════
-- MockTest AI — FINAL COMPLETE MIGRATION
-- Merges all 4 SQL files safely into one script
-- Safe to run even if some parts already ran (IF NOT EXISTS)
-- Run order matters — follow top to bottom
-- ══════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────
-- BLOCK 1: Extensions
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- pgvector for RAG (safe to skip if not using RAG yet)
CREATE EXTENSION IF NOT EXISTS vector;


-- ────────────────────────────────────────────────────────────
-- BLOCK 2: Fix questions table
-- Adds columns that engines now produce
-- ────────────────────────────────────────────────────────────
ALTER TABLE questions
    ADD COLUMN IF NOT EXISTS option_e       TEXT,
    ADD COLUMN IF NOT EXISTS sub_type       TEXT,
    ADD COLUMN IF NOT EXISTS rag_grounded   BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS is_pyq         BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS source_year    INTEGER,
    ADD COLUMN IF NOT EXISTS source_paper   TEXT,
    ADD COLUMN IF NOT EXISTS pyq_badge      TEXT;

-- Fix correct_answer to allow E (was only A/B/C/D before)
-- No constraint to change — it is just TEXT, so E already works


-- ────────────────────────────────────────────────────────────
-- BLOCK 3: Fix tests table
-- master_seed was missing → caused 0% scores on every submit
-- category needed for peer comparison
-- ────────────────────────────────────────────────────────────
ALTER TABLE tests
    ADD COLUMN IF NOT EXISTS master_seed  TEXT    DEFAULT '',
    ADD COLUMN IF NOT EXISTS category     TEXT    DEFAULT 'UR',
    ADD COLUMN IF NOT EXISTS test_id_str  TEXT;   -- safety fallback

-- Remove wrong FK that pointed to students table
-- (main.py saves auth.users UUID, not students.id)
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'tests_student_id_fkey'
        AND table_name = 'tests'
    ) THEN
        ALTER TABLE tests DROP CONSTRAINT tests_student_id_fkey;
    END IF;
END $$;

-- Make student_id nullable so inserts never fail on FK
ALTER TABLE tests ALTER COLUMN student_id DROP NOT NULL;


-- ────────────────────────────────────────────────────────────
-- BLOCK 4: Fix results table
-- Multiple FK issues were causing silent insert failures
-- ────────────────────────────────────────────────────────────

-- Add missing columns
ALTER TABLE results
    ADD COLUMN IF NOT EXISTS exam         TEXT    DEFAULT 'bank_clerk_prelims',
    ADD COLUMN IF NOT EXISTS test_id_str  TEXT;   -- text copy of test_id (FK-free)

-- Drop broken FK to students table
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'results_student_id_fkey'
        AND table_name = 'results'
    ) THEN ALTER TABLE results DROP CONSTRAINT results_student_id_fkey; END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'results_student_id_fkey1'
        AND table_name = 'results'
    ) THEN ALTER TABLE results DROP CONSTRAINT results_student_id_fkey1; END IF;
END $$;

-- Drop broken FK to tests table
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'results_test_id_fkey'
        AND table_name = 'results'
    ) THEN ALTER TABLE results DROP CONSTRAINT results_test_id_fkey; END IF;
END $$;

-- Make nullable so inserts never fail on missing FK
ALTER TABLE results ALTER COLUMN student_id DROP NOT NULL;
ALTER TABLE results ALTER COLUMN test_id    DROP NOT NULL;

-- Disable RLS on results (backend inserts, no auth context)
ALTER TABLE results DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "results_insert"     ON results;
DROP POLICY IF EXISTS "results_select"     ON results;
DROP POLICY IF EXISTS "results_insert_own" ON results;
DROP POLICY IF EXISTS "results_select_own" ON results;


-- ────────────────────────────────────────────────────────────
-- BLOCK 5: Fix student_answers table
-- Same FK issue as results
-- ────────────────────────────────────────────────────────────
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'student_answers_student_id_fkey'
        AND table_name = 'student_answers'
    ) THEN
        ALTER TABLE student_answers DROP CONSTRAINT student_answers_student_id_fkey;
    END IF;
END $$;
ALTER TABLE student_answers ALTER COLUMN student_id DROP NOT NULL;

-- Disable RLS on student_answers (backend inserts)
ALTER TABLE student_answers DISABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "answers_select_own" ON student_answers;
DROP POLICY IF EXISTS "answers_insert_own" ON student_answers;


-- ────────────────────────────────────────────────────────────
-- BLOCK 6: Fix test_questions table
-- Needs option_e for 5-option questions
-- ────────────────────────────────────────────────────────────
ALTER TABLE test_questions
    ADD COLUMN IF NOT EXISTS shuffled_option_e TEXT;

-- Disable RLS (backend inserts)
ALTER TABLE test_questions DISABLE ROW LEVEL SECURITY;


-- ────────────────────────────────────────────────────────────
-- BLOCK 7: Create PROFILES table (was missing entirely)
-- Stores category, state, target_exam per student
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id              UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name       TEXT,
    email           TEXT,
    phone           TEXT        DEFAULT '',
    target_exam     TEXT        DEFAULT 'bank_clerk_prelims',
    category        TEXT        DEFAULT 'UR',
    state           TEXT        DEFAULT '',
    onboarding_done BOOLEAN     DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for profiles: each student sees only their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_profiles_updated_at();


-- ────────────────────────────────────────────────────────────
-- BLOCK 8: Create PLAN_DATA table (was missing entirely)
-- Stores study planner JSON per student
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS plan_data (
    id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
    exam        TEXT,
    plan_json   JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE plan_data ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plan_select_own" ON plan_data;
DROP POLICY IF EXISTS "plan_insert_own" ON plan_data;
DROP POLICY IF EXISTS "plan_update_own" ON plan_data;

CREATE POLICY "plan_select_own" ON plan_data
    FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "plan_insert_own" ON plan_data
    FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "plan_update_own" ON plan_data
    FOR UPDATE USING (auth.uid() = student_id);


-- ────────────────────────────────────────────────────────────
-- BLOCK 9: RAG table (syllabi chunks for PDF ingestion)
-- Safe to skip if not using RAG yet — won't affect anything
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS syllabi_chunks (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    exam_id     TEXT        NOT NULL,
    text        TEXT        NOT NULL,
    embedding   VECTOR(384),
    page_num    INT,
    chunk_index INT,
    source      TEXT,
    chunk_hash  TEXT        UNIQUE,
    metadata    JSONB       DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_syllabi_chunks_exam_id
    ON syllabi_chunks(exam_id);

-- HNSW vector index (only if pgvector is enabled)
CREATE INDEX IF NOT EXISTS idx_syllabi_chunks_embedding
    ON syllabi_chunks USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Match function for retriever.py
CREATE OR REPLACE FUNCTION match_syllabus_chunks(
    query_embedding      VECTOR(384),
    exam_filter          TEXT,
    match_count          INT   DEFAULT 5,
    similarity_threshold FLOAT DEFAULT 0.3
)
RETURNS TABLE (
    id         UUID,
    text       TEXT,
    page_num   INT,
    source     TEXT,
    similarity FLOAT
)
LANGUAGE SQL STABLE AS $$
    SELECT sc.id, sc.text, sc.page_num, sc.source,
           1 - (sc.embedding <=> query_embedding) AS similarity
    FROM syllabi_chunks sc
    WHERE sc.exam_id = exam_filter
      AND 1 - (sc.embedding <=> query_embedding) > similarity_threshold
    ORDER BY sc.embedding <=> query_embedding
    LIMIT match_count;
$$;


-- ────────────────────────────────────────────────────────────
-- BLOCK 9.5: Create STUDENT_ONBOARDING table
-- Captures the inputs a student provides in the onboarding wizard:
--   selected exam(s), exam date, hours/day, prep level, weak topics.
-- One row per student (UNIQUE student_id) → upsert on re-onboarding.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_onboarding (
    id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id      UUID        UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    phone           TEXT,                       -- mobile number (from registration)
    exam_id         TEXT,                       -- primary exam (e.g. bank_clerk_prelims)
    selected_exams  JSONB       DEFAULT '[]',   -- all chosen exams (JSON array)
    exam_date       DATE,                       -- target exam date
    hours_per_day   INTEGER,                    -- daily study hours
    level           TEXT,                       -- beginner | intermediate | advanced
    weak_topics     JSONB       DEFAULT '{}',   -- weak topics grouped by section {section:[topics]}
    onboarding_done BOOLEAN     DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Add phone column if the table already existed without it
ALTER TABLE student_onboarding ADD COLUMN IF NOT EXISTS phone TEXT;

-- If the table already existed with array columns as text[], convert to jsonb.
-- Drop the old default FIRST (a text[] default cannot auto-cast to jsonb).
DO $$ BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'student_onboarding'
          AND column_name = 'weak_topics'
          AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE student_onboarding ALTER COLUMN weak_topics DROP DEFAULT;
        ALTER TABLE student_onboarding
            ALTER COLUMN weak_topics TYPE JSONB USING to_jsonb(weak_topics);
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'student_onboarding'
          AND column_name = 'selected_exams'
          AND data_type = 'ARRAY'
    ) THEN
        ALTER TABLE student_onboarding ALTER COLUMN selected_exams DROP DEFAULT;
        ALTER TABLE student_onboarding
            ALTER COLUMN selected_exams TYPE JSONB USING to_jsonb(selected_exams);
    END IF;
END $$;
ALTER TABLE student_onboarding ALTER COLUMN weak_topics    SET DEFAULT '{}'::jsonb;
ALTER TABLE student_onboarding ALTER COLUMN selected_exams SET DEFAULT '[]'::jsonb;

-- RLS: each student sees/edits only their own onboarding row
ALTER TABLE student_onboarding ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "onboarding_select_own" ON student_onboarding;
DROP POLICY IF EXISTS "onboarding_insert_own" ON student_onboarding;
DROP POLICY IF EXISTS "onboarding_update_own" ON student_onboarding;

CREATE POLICY "onboarding_select_own" ON student_onboarding
    FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "onboarding_insert_own" ON student_onboarding
    FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "onboarding_update_own" ON student_onboarding
    FOR UPDATE USING (auth.uid() = student_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_student_onboarding_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS student_onboarding_updated_at ON student_onboarding;
CREATE TRIGGER student_onboarding_updated_at
    BEFORE UPDATE ON student_onboarding
    FOR EACH ROW EXECUTE FUNCTION update_student_onboarding_updated_at();


-- ────────────────────────────────────────────────────────────
-- BLOCK 9b: Previous-year papers (PYQ) — downloadable PDFs
-- Stores metadata + a PDF link for each past paper. Browsing is
-- public (anon SELECT); only published rows with a pdf_url show a
-- download button on the frontend.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS previous_papers (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_group    TEXT    NOT NULL,
    exam_id       TEXT    NOT NULL,
    exam_name     TEXT    NOT NULL,
    year          INTEGER NOT NULL,
    stage         TEXT    NOT NULL,
    total_questions INTEGER DEFAULT 0,
    duration_mins   INTEGER DEFAULT 0,
    negative_mark   NUMERIC DEFAULT 0.25,
    pdf_url       TEXT,
    is_published  BOOLEAN DEFAULT TRUE,
    sort_order    INTEGER DEFAULT 0,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE previous_papers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "previous_papers_public_read" ON previous_papers;
CREATE POLICY "previous_papers_public_read" ON previous_papers
    FOR SELECT USING (is_published = TRUE);

CREATE INDEX IF NOT EXISTS idx_previous_papers_exam
    ON previous_papers(exam_group, exam_id, year);


-- ────────────────────────────────────────────────────────────
-- BLOCK 10: Performance indexes
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_questions_is_pyq
    ON questions(is_pyq, exam);
CREATE INDEX IF NOT EXISTS idx_tests_student_id
    ON tests(student_id);
CREATE INDEX IF NOT EXISTS idx_tests_exam_category
    ON tests(exam, category);
CREATE INDEX IF NOT EXISTS idx_results_student_id
    ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_student_answers_test_id
    ON student_answers(test_id);
CREATE INDEX IF NOT EXISTS idx_profiles_category
    ON profiles(category);
CREATE INDEX IF NOT EXISTS idx_student_onboarding_student_id
    ON student_onboarding(student_id);
CREATE INDEX IF NOT EXISTS idx_student_onboarding_exam_id
    ON student_onboarding(exam_id);


-- ────────────────────────────────────────────────────────────
-- VERIFY — run this to confirm everything worked
-- ────────────────────────────────────────────────────────────
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns c
     WHERE c.table_name = t.table_name
     AND c.table_schema = 'public') AS columns
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;
