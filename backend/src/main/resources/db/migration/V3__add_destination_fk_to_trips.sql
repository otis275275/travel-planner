-- ============================================================
-- V3__add_destination_fk_to_trips.sql
-- Link Trips to Destinations table via foreign key
-- ============================================================

ALTER TABLE trips
    DROP COLUMN IF EXISTS destination,
    DROP COLUMN IF EXISTS custom_destination;

ALTER TABLE trips
    ADD COLUMN destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL;

CREATE INDEX idx_trips_destination_id ON trips(destination_id);
