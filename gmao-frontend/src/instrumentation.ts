export async function register() {
  // Next.js evaluates this file in both Node.js and Edge runtimes.
  // The Azure SDK is a Node.js library and will crash the Edge runtime if imported statically.
  // We must use a dynamic import inside a check for the 'nodejs' runtime.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING) {
      const { useAzureMonitor: initializeAzureMonitor } =
        await import('@azure/monitor-opentelemetry');
      initializeAzureMonitor({
        azureMonitorExporterOptions: {
          connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
        },
      });
    }
  }
}
