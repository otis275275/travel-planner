-- ============================================================
-- V1__init.sql  —  Travel AI MVP Schema
-- ============================================================

CREATE SCHEMA IF NOT EXISTS public;
SET search_path TO public;

-- ---------- ENUMS ----------
-- Using UPPERCASE to match Java enum constant names exactly
-- so @Enumerated(EnumType.STRING) works without custom converters.

CREATE TYPE oauth_provider   AS ENUM ('GOOGLE', 'FACEBOOK');
CREATE TYPE trip_status      AS ENUM ('DRAFT', 'PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE place_type       AS ENUM ('ATTRACTION', 'RESTAURANT', 'HOTEL', 'CAMPING', 'OTHER');
CREATE TYPE activity_type    AS ENUM ('VISIT', 'CAMPING', 'MEAL', 'STAY', 'EVENT', 'TRANSPORT', 'OTHER');
CREATE TYPE message_role     AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE trip_role        AS ENUM ('OWNER', 'EDITOR', 'VIEWER');
CREATE TYPE split_type       AS ENUM ('EQUAL', 'EXACT', 'PERCENTAGE', 'SHARES');
CREATE TYPE payment_source   AS ENUM ('GROUP_FUND', 'PERSONAL_POCKET');

-- ---------- USERS & AUTH ----------

CREATE TABLE users (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name     VARCHAR(150),
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE oauth_accounts (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider         oauth_provider NOT NULL,
    provider_user_id VARCHAR(255)  NOT NULL,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CONSTRAINT uq_oauth_provider_user UNIQUE (provider, provider_user_id)
);
CREATE INDEX idx_oauth_accounts_user_id ON oauth_accounts(user_id);

-- ---------- TRIPS & MEMBERS ----------

CREATE TABLE trips (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id      UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title         VARCHAR(200) NOT NULL,
    destination   VARCHAR(200),
    start_date    DATE,
    end_date      DATE,
    total_budget  DECIMAL(14, 0),
    status        trip_status  NOT NULL DEFAULT 'DRAFT',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_trips_owner_status ON trips(owner_id, status);

CREATE TABLE trip_members (
    id        UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id   UUID       NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id   UUID       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role      trip_role  NOT NULL DEFAULT 'EDITOR',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_trip_member UNIQUE (trip_id, user_id)
);

CREATE TABLE trip_days (
    id         UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id    UUID  NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    day_number INT   NOT NULL,
    date       DATE,
    notes      TEXT,
    CONSTRAINT uq_trip_day UNIQUE (trip_id, day_number)
);

-- ---------- PLACES & ACTIVITIES ----------

CREATE TABLE places (
    id          UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    type        place_type NOT NULL DEFAULT 'ATTRACTION',
    address     TEXT,
    latitude    DOUBLE PRECISION,
    longitude   DOUBLE PRECISION,
    rating      REAL,
    external_id VARCHAR(255) UNIQUE
);
CREATE INDEX idx_places_type ON places(type);

CREATE TABLE activities (
    id          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_day_id UUID          NOT NULL REFERENCES trip_days(id) ON DELETE CASCADE,
    place_id    UUID          REFERENCES places(id) ON DELETE SET NULL,
    type        activity_type NOT NULL DEFAULT 'VISIT',
    title       VARCHAR(200)  NOT NULL,
    start_time  TIME,
    end_time    TIME,
    est_cost    DECIMAL(14, 0),
    position    INT           NOT NULL DEFAULT 0,
    notes       TEXT
);
CREATE INDEX idx_activities_trip_day_position ON activities(trip_day_id, position);
CREATE INDEX idx_activities_place_id          ON activities(place_id);

-- ---------- EXPENSES & BILL SPLITTING ----------

CREATE TABLE fund_contributions (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id    UUID        NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount     DECIMAL(14, 0) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_fund_contributions_trip_id ON fund_contributions(trip_id);

CREATE TABLE expenses (
    id               UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id          UUID           NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    activity_id      UUID           REFERENCES activities(id) ON DELETE SET NULL,
    title            VARCHAR(200)   NOT NULL,
    amount           DECIMAL(14, 0) NOT NULL,
    source           payment_source NOT NULL DEFAULT 'GROUP_FUND',
    paid_by_user_id  UUID           REFERENCES users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ    NOT NULL DEFAULT now()
);
CREATE INDEX idx_expenses_trip_id     ON expenses(trip_id);
CREATE INDEX idx_expenses_activity_id ON expenses(activity_id);

-- ---------- CHAT ----------

CREATE TABLE conversations (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    trip_id    UUID         REFERENCES trips(id) ON DELETE SET NULL,
    title      VARCHAR(200),
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_trip_id ON conversations(trip_id);

CREATE TABLE messages (
    id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID         NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role            message_role NOT NULL,
    content         TEXT         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at);
