import 'dotenv/config';

import './config/env';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { PrismaInstrumentation } from '@prisma/instrumentation';

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
