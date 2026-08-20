-- ============================================================
-- Usherverse: Projects table
-- ============================================================

CREATE TABLE IF NOT EXISTS projects (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text UNIQUE NOT NULL,
  title           text NOT NULL,
  short_description text,
  client_name     text,
  industry        text,
  category        text,
  project_date    date,
  status          text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  featured        boolean NOT NULL DEFAULT false,
  project_url     text,
  github_url      text,
  technologies    text[],
  problem         text,
  solution        text,
  results         text,
  role            text,
  key_features    text[],
  metrics         jsonb DEFAULT '[]'::jsonb,
  featured_image  text,
  gallery         jsonb DEFAULT '[]'::jsonb,
  video_url       text,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for fast slug lookups
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);

-- Index for filtering published + featured
CREATE INDEX IF NOT EXISTS idx_projects_status_featured ON projects(status, featured);

-- Row Level Security: public read for published, full access for service role
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Public can read published projects
CREATE POLICY "Public can read published projects"
  ON projects FOR SELECT
  USING (status = 'published');
