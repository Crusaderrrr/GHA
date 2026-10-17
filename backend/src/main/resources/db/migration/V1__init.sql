-- One row per GH Archive hour: drives idempotent, resumable imports.
CREATE TABLE import_hour (
    hour        timestamptz PRIMARY KEY,
    status      text        NOT NULL CHECK (status IN ('PENDING', 'IN_PROGRESS', 'DONE')),
    event_count int,
    started_at  timestamptz,
    finished_at timestamptz
);

-- Imported events (WatchEvent = star, ForkEvent, CreateEvent of a repository).
-- Partitions (e.g. one per day) are created by the importer; retention drops them.
CREATE TABLE event (
    id         bigint      NOT NULL,
    type       text        NOT NULL,
    repo_id    bigint      NOT NULL,
    repo_name  text        NOT NULL,
    actor_id   bigint      NOT NULL,
    created_at timestamptz NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);
