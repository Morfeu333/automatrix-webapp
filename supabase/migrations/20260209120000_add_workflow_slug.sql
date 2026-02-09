-- Sprint 3: Add slug column to workflows for URL-friendly detail pages
-- Slug is derived from filename, lowercased with underscores→hyphens

ALTER TABLE workflows ADD COLUMN slug TEXT UNIQUE;

-- Generate slugs from existing filenames (remove leading number prefix, lowercase, underscores→hyphens)
UPDATE workflows
SET slug = LOWER(REPLACE(
  REGEXP_REPLACE(filename, '^\d+_', ''),
  '_', '-'
));

-- Make slug NOT NULL after populating existing rows
ALTER TABLE workflows ALTER COLUMN slug SET NOT NULL;

-- Index for fast slug lookups
CREATE INDEX idx_workflows_slug ON workflows(slug);
