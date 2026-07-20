export async function register() {
  // Next.js evaluates this file in both Node.js and Edge runtimes.
  // The OTel Node SDK is a Node.js-only library and will crash the Edge runtime
  // if imported statically. We must use a dynamic import inside a check for the
  // 'nodejs' runtime.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Opt-in and vendor-neutral: no OTEL_EXPORTER_OTLP_ENDPOINT set means no
    // telemetry export, not a crash. See observability.md. Note this var is
    // deliberately NOT NEXT_PUBLIC_-prefixed — it's read only in this
    // server-side Node runtime path, never shipped to the browser.
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      const { NodeSDK } = await import('@opentelemetry/sdk-node');
      const { getNodeAutoInstrumentations } = await import(
        '@opentelemetry/auto-instrumentations-node'
      );
      const { OTLPTraceExporter } = await import('@opentelemetry/exporter-trace-otlp-http');
      const { OTLPMetricExporter } = await import('@opentelemetry/exporter-metrics-otlp-http');
      const { PeriodicExportingMetricReader } = await import('@opentelemetry/sdk-metrics');

      const otelSdk = new NodeSDK({
        serviceName: process.env.OTEL_SERVICE_NAME || 'gmao-frontend',
        traceExporter: new OTLPTraceExporter(),
        metricReaders: [
          new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter(),
            exportIntervalMillis: 10000,
          }),
        ],
        instrumentations: [getNodeAutoInstrumentations()],
      });
      otelSdk.start();
    }
  }
}
