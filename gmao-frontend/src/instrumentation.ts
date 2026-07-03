import { useAzureMonitor as initializeAzureMonitor } from '@azure/monitor-opentelemetry';

export function register() {
  if (process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING) {
    initializeAzureMonitor({
      azureMonitorExporterOptions: {
        connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
      },
    });
  }
}
