-- ============================================================
-- V4__enhance_places_and_add_trip_saved.sql
-- Enhance places metadata with tags, photos, reviews and add trip_saved_places
-- ============================================================

-- Ensure unaccent and pg_trgm extensions are enabled for accent-insensitive search
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add CAFE to place_type enum if not present
ALTER TYPE place_type ADD VALUE IF NOT EXISTS 'CAFE';

-- 1. Enhance places table
ALTER TABLE places
    ADD COLUMN IF NOT EXISTS destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
    ADD COLUMN IF NOT EXISTS photo_urls TEXT[],
    ADD COLUMN IF NOT EXISTS reviews_count INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS price_level VARCHAR(100),
    ADD COLUMN IF NOT EXISTS open_hours VARCHAR(100),
    ADD COLUMN IF NOT EXISTS area VARCHAR(200),
    ADD COLUMN IF NOT EXISTS distance_info VARCHAR(100),
    ADD COLUMN IF NOT EXISTS description TEXT,
    ADD COLUMN IF NOT EXISTS review_summary TEXT,
    ADD COLUMN IF NOT EXISTS tags TEXT[],
    ADD COLUMN IF NOT EXISTS google_place_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS data_id VARCHAR(255),
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_places_destination_id ON places(destination_id);
CREATE INDEX IF NOT EXISTS idx_places_google_place_id ON places(google_place_id);
CREATE INDEX IF NOT EXISTS idx_places_data_id ON places(data_id);
CREATE INDEX IF NOT EXISTS idx_places_tags ON places USING GIN(tags);

-- 2. Create trip_saved_places table (Bookmarks / Saved Options)
CREATE TABLE IF NOT EXISTS trip_saved_places (
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    notes TEXT,
    saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (trip_id, place_id)
);
CREATE INDEX IF NOT EXISTS idx_trip_saved_places_trip_id ON trip_saved_places(trip_id);
