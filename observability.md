# GMAO — Self-Hosted Observability Stack

Vendor-neutral observability: OpenTelemetry (instrumentation + Collector), Tempo (traces), Prometheus (metrics), Grafana (dashboards), with Loki (logs) and Alertmanager (alerts) planned. Replaces the former Azure Monitor / Application Insights setup (see [azure.md](azure.md) — that work was a learning exercise; this stack is deployment-agnostic, LAN-friendly, and cost-free). See also: [dev.md](dev.md), [ci-cd.md](ci-cd.md), [iac.md](iac.md).

## Architecture

```
gmao-backend (Node/Express) ──┐  OTLP/HTTP (:4318)      ┌─> Tempo   (traces, :3200)
gmao-frontend (Next.js/Node) ─┴──> OTel Collector ──────┼─> Prometheus exporter (:8889) <── Prometheus (:9090) <── Grafana (:3300)
                                   (single gateway)     └─> [Milestone 3: Loki (logs)]
```

- **One pipe for everything:** apps export OTLP to the Collector; each backend (Tempo/Prometheus/Loki) hangs off Collector pipelines. Apps never know which vendor stores their telemetry.
- **Opt-in by env var:** no `OTEL_EXPORTER_OTLP_ENDPOINT` set → no telemetry export, no crash. Standard OTel env vars only (`OTEL_SERVICE_NAME`, `OTEL_EXPORTER_OTLP_ENDPOINT`) — see `.env.example` in both apps.
- **Files:** `docker-compose.observability.yml` (repo root) + `observability/` (Collector, Tempo, Prometheus, Grafana provisioning, Alertmanager configs).

### Run it

```bash
docker compose -f docker-compose.observability.yml up -d
cd gmao-backend && npm run dev        # entry point is src/tracing.ts (see below)
# Grafana: http://localhost:3300 (admin/admin) — port 3300 because 3000 is gmao-frontend
# Prometheus: http://localhost:9090 · Tempo API: http://localhost:3200
```

## Milestone log

### Milestone 0 — Foundations (done ✅)

- **Structured logging:** added `pino` (+ `pino-pretty` dev-only). New `gmao-backend/src/utils/logger.ts` — JSON in production, pretty in dev, `err` serializer for stack traces, `LOG_LEVEL` env override. Replaced all 27 `console.*` calls across 8 files with module-scoped child loggers (`logger.child({ module: '...' })`). `errorHandler.middleware.ts` went from a decorative multi-line dev banner + unstructured prod one-liner to a single structured log call carrying method/url/status/code/err — machine-parseable for Loki later.
- **`.env.example`** created for both apps (neither existed) — sanitized, documents every var including the new `OTEL_*` ones.
- **Compose scaffold:** `docker-compose.observability.yml` with a named `gmao-observability` bridge network. Kept separate from `gmao-backend/docker-compose.yml` (mysql/redis) — this stack is cross-cutting infra.

### Milestone 1 — OTel Collector + Tempo, Azure SDK swap (done ✅)

- **SDK swap:** removed `@azure/monitor-opentelemetry` from both apps; replaced with `@opentelemetry/sdk-node` (`NodeSDK`) + `@opentelemetry/auto-instrumentations-node` + `@opentelemetry/exporter-trace-otlp-http`. Kept the existing `@prisma/instrumentation` registration. Frontend keeps the `NEXT_RUNTIME === 'nodejs'` guard in `instrumentation.ts` (Edge runtime would crash) and drops the misnamed `NEXT_PUBLIC_`-prefixed connection-string var.
- **Nice side effect:** backend `npm audit` went from 27 moderate findings to 0 (all were transitive via the Azure SDK's outdated OTel internals); frontend from 29 to 2.
- **Collector + Tempo services** added with real, verified image tags (`otel/opentelemetry-collector-contrib:0.156.0`, `grafana/tempo:2.10.7`). Collector config: OTLP receivers (gRPC 4317 / HTTP 4318), `memory_limiter` + `resourcedetection` + `batch` processors, `debug` exporter (kept for pipeline debugging) + `otlp/tempo`.
- **Verified:** real `prisma:client:*` spans observed in Collector debug output and queried back out of Tempo's API by trace ID.

### Milestone 2 — Prometheus + Grafana, RED dashboard (done ✅)

- **Collector:** added `prometheus` exporter (`:8889` — the Collector is the scrape target, apps never expose `/metrics`) and self-telemetry metrics on `:8888` (must be declared explicitly in `service.telemetry` on current Collector versions).
- **Apps:** added `@opentelemetry/exporter-metrics-otlp-http` + `PeriodicExportingMetricReader` (10s interval) to both SDK bootstraps.
- **Prometheus** (`prom/prometheus:v3.13.1`): scrapes Collector `:8889` (app metrics) + `:8888` (Collector health).
- **Grafana** (`grafana/grafana:12.4.5`, host port **3300**): datasources (Prometheus + Tempo, with exemplar/correlation links) and dashboards provisioned **as code** from `observability/grafana/`.
- **RED dashboard** (`observability/grafana/dashboards/gmao-red.json`, uid `gmao-red`): request rate by route, 5xx error rate, p50/p95 latency (histogram_quantile), error-% stat with thresholds, per-route/status table. Service selector template variable. Built against the *verified* metric name `http_server_duration_milliseconds_*` with labels `job`, `http_route`, `http_status_code`.
- **Verified end-to-end:** live traffic → Server spans in Collector/Tempo, `http_server_duration` in Prometheus with `job="gmao-backend"`, and a real panel query returning data through Grafana's own `/api/ds/query`.

## Hard-won gotchas (read before touching this stack)

1. **OTel instrumentation must be the process entry point — `src/tracing.ts`.** TypeScript/CJS hoists static `import`s above inline code, so "SDK init at the top of index.ts" still requires `express`/`http` *before* `sdk.start()` — and the HTTP instrumentation patches at require-time. Result: Prisma spans work (lazy patching), HTTP server spans/metrics silently absent. Fix: `tracing.ts` starts the SDK then **dynamically** imports the app; `package.json` (`dev`/`start`), `main`, and the backend Dockerfile CMD all point at it. Don't "simplify" this back inline.
2. **`honor_labels: true` on the Collector scrape job.** The Collector's prometheus exporter stamps series with `job=<service.name>`; without honor_labels Prometheus silently renames it to `exported_job` and every `job="gmao-backend"` query returns nothing.
3. **Tempo binds its OTLP receivers to 127.0.0.1 by default** (unlike the Collector). Without explicit `endpoint: 0.0.0.0:4317/4318` in `tempo.yaml`, the Collector can't reach it — connection-refused loops in Collector logs.
4. **Telemetry flushes are periodic, not instant:** span batches ~5s, metrics 10s (ours; 60s SDK default). Short-lived test processes killed before the flush look like "no data" — a phantom we chased for a while. Keep the process alive past the interval when verifying, and remember Windows `pkill` doesn't reliably kill detached node children (stale processes on port 5000 served unpatched responses during debugging).
5. **The Collector's `debug` exporter is the first diagnostic stop:** `docker compose -f docker-compose.observability.yml logs otel-collector` shows every span/metric received. If data is there but not in Tempo/Prometheus, the problem is downstream; if absent, it's the app SDK.

## Remaining milestones (planned, not started)

- **Milestone 3 — Loki (logs):** `observability/loki-config.yaml` is already written (filesystem storage, native OTLP ingestion via `/otlp`, `allow_structured_metadata`). To do: add `loki` service + Collector `logs` pipeline (`otlphttp` exporter → Loki, *not* the deprecated lokiexporter), add `@opentelemetry/sdk-logs` + `@opentelemetry/exporter-logs-otlp-http` + `logRecordProcessors` to the backend SDK (note: `instrumentation-pino` ships inside `auto-instrumentations-node` — verify before adding it separately), Grafana Loki datasource with Tempo↔Loki trace↔log correlation on `trace_id`. Verify: trigger an error, click from the Loki log line to the Tempo trace in Grafana.
- **Milestone 4 — Alertmanager:** `observability/alertmanager.yml` is already written. Secrets via `smtp_auth_password_file` + Docker secrets (`observability/secrets/`, gitignored, see its README) — Alertmanager has **no** `${VAR}` env expansion (verified upstream). To do: fill in real SMTP user/recipient, add `alertmanager` service + Prometheus `rule_files`/`alerting` config, app-level rules only (5xx rate, p95 latency, collector-down via `up == 0`). Verify with a forced 5xx spike.
- **Milestone 5 (stretch) — Browser RUM:** replace `AppInsightsProvider.tsx` (`@microsoft/applicationinsights-web` — still installed, still Azure-pointed) with `@opentelemetry/sdk-trace-web` + OTLP from the browser; requires CORS on the Collector's HTTP receiver.
