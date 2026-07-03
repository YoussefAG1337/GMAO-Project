# modules/monitoring/outputs.tf

output "log_analytics_workspace_id" {
  value       = azurerm_log_analytics_workspace.main.id
  description = "The ID of the Log Analytics Workspace"
}

output "app_insights_connection_string" {
  value       = azurerm_application_insights.main.connection_string
  description = "The Application Insights connection string for SDK integration"
  sensitive   = true
}

output "app_insights_instrumentation_key" {
  value       = azurerm_application_insights.main.instrumentation_key
  description = "The Application Insights instrumentation key (legacy)"
  sensitive   = true
}
