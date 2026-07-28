export async function register() {
 
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
      const { NodeSDK } = await import('@opentelemetry/sdk-node');
      const { getNodeAutoInstrumentations } =
        await import('@opentelemetry/auto-instrumentations-node');
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
        instrumentations: [
          getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-http': {
              requestHook: (span, request) => {
                const path = 'path' in request ? request.path : request.url;
                if (path) span.updateName(`${request.method} ${path}`);
              },
            },
          }),
        ],
      });
      otelSdk.start();
    }
  }
}
