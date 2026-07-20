import 'dotenv/config';
// Valide toute la configuration d'environnement AVANT tout le reste : un secret
// manquant ou faible (en prod) arrête le process ici, pas à la première requête.
import './config/env';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { PrismaInstrumentation } from '@prisma/instrumentation';

// This MUST be the actual process entry point (see package.json's dev/start
// scripts and the Dockerfile CMD — both point here, not at index.ts).
//
// Why: instrumentations patch their target modules (http, express, ...) at
// require-time. TypeScript/CJS compilation hoists static `import` statements
// to the top of a file regardless of where they appear in the source, so
// setting this up inline at the top of index.ts does NOT work — express
// (and the `http` module it pulls in) still end up required before
// sdk.start() runs. Confirmed by testing: with the inline approach, Prisma
// spans/metrics worked (Prisma instrumentation patches lazily, on first DB
// call, well after startup) but HTTP server spans/metrics never appeared,
// even in a minimal reproduction with zero other instrumentations.
//
// Vendor-neutral OpenTelemetry SDK — exports traces + metrics via OTLP to
// the Collector (see observability.md). The OTLP exporters read
// OTEL_EXPORTER_OTLP_ENDPOINT themselves when constructed with no args, so
// this is opt-in: no endpoint set, no telemetry export, no crash either way.
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const otelSdk = new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || 'gmao-backend',
    traceExporter: new OTLPTraceExporter(),
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 10000,
      }),
    ],
    instrumentations: [getNodeAutoInstrumentations(), new PrismaInstrumentation()],
  });
  otelSdk.start();
}

// Dynamic import, deliberately — a static `import './index'` here would be
// hoisted above the SDK setup above and defeat the entire point of this file.
import('./index');
