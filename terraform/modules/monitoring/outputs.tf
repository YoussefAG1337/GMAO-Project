# modules/monitoring/outputs.tf

output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.main.id
  description = "The ID of the Log Analytics Workspace"
}

# Application Insights resource is disabled (see main.tf) to avoid APM cost.
# Outputs return "" so callers (container_apps) get a harmless empty setting
# instead of a broken reference; re-enable both together when needed.
output "app_insights_connection_string" {
  value       = "" # azurerm_application_insights.main.connection_string
  description = "The Application Insights connection string for SDK integration"
  sensitive   = true
}

output "app_insights_instrumentation_key" {
  value       = "" # azurerm_application_insights.main.instrumentation_key
  description = "The Application Insights instrumentation key (legacy)"
  sensitive   = true
}
