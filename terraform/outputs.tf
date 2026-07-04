


# GitHub Actions OIDC (CI/CD Secrets)


output "github_actions_client_id" {
  description = "The Client ID of the User Assigned Identity for GitHub Actions (add to AZURE_CLIENT_ID secret)"
  value       = module.identity.github_actions_client_id
}

output "tenant_id" {
  description = "The Azure Tenant ID (add to AZURE_TENANT_ID secret)"
  value       = module.identity.tenant_id
}

output "subscription_id" {
  description = "The Azure Subscription ID (add to AZURE_SUBSCRIPTION_ID secret)"
  value       = module.identity.subscription_id
}


# Monitoring (for reference)

output "log_analytics_workspace_id" {
  description = "The ID of the Log Analytics Workspace"
  value       = module.monitoring.log_analytics_workspace_id
}

output "app_insights_connection_string" {
  description = "The Application Insights connection string"
  value       = module.monitoring.app_insights_connection_string
  sensitive   = true
}

output "backend_url" {
  value       = "https://${module.container_apps.backend_fqdn}"
  description = "The URL of the backend application"
}

output "frontend_url" {
  value       = "https://${module.container_apps.frontend_fqdn}"
  description = "The URL of the frontend application"
}