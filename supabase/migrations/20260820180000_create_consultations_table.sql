-- ============================================================
-- Usherverse: Consultations table
-- Run this in your Supabase SQL editor or via: supabase db push
-- ============================================================

CREATE TABLE IF NOT EXISTS consultations (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at             timestamptz NOT NULL DEFAULT now(),
  status                 text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'booked', 'archived')),
  business_name          text,
  industry               text,
  target_audience        text,
  website_goals          text,
  recommended_pages      text[]  DEFAULT '{}',
  recommended_features   text[]  DEFAULT '{}',
  suggested_design_style text,
  seo_recommendations    text[]  DEFAULT '{}',
  ux_recommendations     text[]  DEFAULT '{}',
  detailed_prompt        text,
  chat_history           jsonb   DEFAULT '[]'::jsonb,
  phone                  text,
  notes                  text
);

-- Index for fast status filtering
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_created ON consultations(created_at DESC);

-- Row Level Security: only service role can read/write
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- No public access — admin only via service role key
-- (The admin API uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS)
