# GHA — GitHub Trending from GH Archive

A service that pulls hourly event dumps from [GH Archive](https://www.gharchive.org/), keeps the repository events we care about in Postgres, and works out which repositories are **taking off right now**. A React dashboard shows trending repos, lets you filter them by stars and language, and lets a user sign in with GitHub and star repos without leaving the app.

## Product

- **Main page: Trending Repos.** Ranked by the anomalous-growth formula (stage 4) over the last 24h and 7d. A second section shows the most-starred repositories.
- **Filters:** star count (min/max), language (needs stage 7 enrichment), time window.
- **Repo page:** star, fork and event history over time.
- **GitHub integration:** OAuth login with GitHub. A signed-in user can star or unstar a repo from the app (`PUT/DELETE /user/starred/{owner}/{repo}` with the user's token). Request only the scope starring needs (`public_repo`). Store tokens server-side and never send them to the frontend.
- **Extras:** a Telegram bot (Python) and anti-gaming detection (optional).

## Stack

| Layer | Tech |
|---|---|
| Backend | Spring Boot 4.1, Java 25, Maven (`backend/`), base package `com.gha` |
| DB | Postgres 18, Flyway migrations, tables partitioned by time |
| HTTP | Spring `RestClient` (GH Archive downloads, GitHub API) |
| Tests | JUnit against the Docker Compose Postgres (no H2) |
| Resilience | Resilience4j (retries and rate limits for the GitHub API) |
| Observability | Micrometer → Prometheus → Grafana |
| Load / profiling | Locust, `EXPLAIN (ANALYZE, BUFFERS)`, `pg_stat_statements`, JFR, async-profiler |
| Frontend | React 19 + TypeScript + Vite (`frontend/`) |
| Bot | Python, Telegram |
| Infra | Docker Compose, GitHub Actions CI, a cheap VPS |

## Domain notes

- GH Archive serves one gzipped JSON-lines file per hour: `https://data.gharchive.org/YYYY-MM-DD-H.json.gz`. The hour has **no leading zero**, and times are UTC.
- Import only these events:
  - `WatchEvent`, which is a **star** (GitHub's legacy name for it)
  - `ForkEvent`
  - `CreateEvent`, only when `payload.ref_type = "repository"`
- Stream the import: HTTP body → `GZIPInputStream` → read line by line → Jackson. **Never load a whole file into memory**, because one hour can be hundreds of MB once decompressed.
- GH Archive does not give a repository's **total** star count. It only shows the star events inside the window we have imported. Absolute stars, language and description come from the GitHub API during enrichment (stage 7). The star filter needs those values.
- A file for the current hour is published with a delay. A 404 means "not yet published", so retry later and don't treat it as an error.

## Invariants (must always hold)

- **Imports are idempotent.** Re-importing the same hour leaves the row count unchanged. Enforce this with a DB constraint or by replacing the hour's data in one transaction, not with checks in app code.
- **An interrupted import recovers.** On restart it finishes the hour with no duplicates. Track each hour's import state in the DB.
- **Retention drops whole partitions.** Never remove old data with `DELETE`.
- **The task queue uses Postgres `FOR UPDATE SKIP LOCKED`.** Hitting the GitHub rate limit must not crash the service or lose tasks, and work resumes where it stopped.

## Roadmap

Each stage has a **Done when** line, and a stage is not finished until its criteria are actually checked.

1. **Skeleton.** Spring Boot 4 / Java 25, Docker Compose with Postgres 18, one integration test, and GitHub Actions CI from day one so regressions show up during optimization.
   *Done when:* `docker compose up` brings everything up and CI is green.
2. **Import one hour.** Download the file, stream gzip → lines → Jackson, filter the events, and write them to a time-partitioned events table.
   *Done when:* re-importing an hour doesn't change the row count (covered by a test), and an import interrupted midway finishes on restart with no duplicates.
3. **Scheduled import and backfill.** An hourly job, correct handling of "file not published yet", a command or endpoint that loads a date range, and partition-drop retention.
   *Done when:* the service runs on its own for 24h with no missed hours, and two weeks of history load with one command.
4. **Trends.** Hourly per-repo aggregates, the anomalous-growth formula, and endpoints for 24h trends, 7d trends and repo history.
   *Done when:* trends return fast on two weeks of data **and** the top repos look like real risers when you check them by hand. The second criterion matters more: if the top is junk, change the formula.
5. **Metrics.** Micrometer, Prometheus and Grafana covering import speed and duration, endpoint latency, the connection pool and the JVM.
   *Done when:* the dashboard shows what the service is doing without reading logs.
6. **Load and optimization (the main stage).** Scale the data to a month or more, generate load with Locust, and find bottlenecks with EXPLAIN, `pg_stat_statements`, JFR and async-profiler.
   *Done when:* at least three real bottlenecks are found and fixed, each logged in `docs/optimization-log.md` with before/after numbers.
7. **Metadata enrichment.** Pull language, description and total stars from the GitHub API through a `SKIP LOCKED` task queue with Resilience4j retries and rate limits, and add a language filter to trends.
   *Done when:* hitting the GitHub API limit neither crashes the service nor loses tasks, and work resumes where it left off.
8. **Showcase.** React + TS dashboard (trending page, star and language filters, repo page, GitHub OAuth login and star button), a Python Telegram bot, a VPS deploy with a live link, and a README covering the architecture and the stage 6 optimization log.
   *Done when:* someone opening the repo for the first time understands within 5 minutes what it does and which problems were solved.
9. **Anti-gaming (optional).** Only if there's still motivation after stage 8. The project is complete without it.

## Current state

Stage 1 skeleton (no real logic yet, `TODO stage N` marks the gaps):
- `backend/`: `V1__init.sql` (`import_hour` state table, `event` partitioned by `created_at`, no partitions yet), `importer/` (`GhArchiveClient`, `ImportService`, `POST /api/import?from&to`), `trends/` (`GET /api/trends`, `GET /api/repos/{owner}/{name}/history` returning empty lists). Tests start Postgres via `compose.yaml` (`spring.docker.compose.skip.in-tests=false`).
- `frontend/`: react-router, trending page with filters, repo page, `src/api.ts` mirrors backend records. Vite proxies `/api` to `localhost:8080`.
- `.github/workflows/ci.yml`: backend `mvnw verify` + frontend lint/build.

## Commands

```bash
# backend
cd backend && ./mvnw spring-boot:run   # starts Postgres through spring-boot-docker-compose
cd backend && ./mvnw test

# frontend
cd frontend && npm install && npm run dev
cd frontend && npm run build && npm run lint
```

## Conventions

- Schema changes go only through Flyway migrations in `backend/src/main/resources/db/migration` (`V<n>__<description>.sql`). Never edit a migration that has already been applied; add a new one.
- Tests use the real Postgres from Docker Compose.
- Put performance claims in the optimization log with numbers. A claim without before/after numbers doesn't count.
