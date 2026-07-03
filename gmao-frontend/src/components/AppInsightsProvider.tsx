'use client';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { useEffect } from 'react';

export function AppInsightsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING) {
      const reactPlugin = new ReactPlugin();
      const appInsights = new ApplicationInsights({
        config: {
          connectionString: process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING,
          extensions: [reactPlugin],
          // CRITICAL for correlation with Server-Side OpenTelemetry:
          distributedTracingMode: 2, // DistributedTracingModes.W3C
        },
      });
      appInsights.loadAppInsights();
    }
  }, []);

  return <>{children}</>;
}
