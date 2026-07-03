# modules/identity/outputs.tf

output "github_actions_client_id" {
  value       = azurerm_user_assigned_identity.github_actions.client_id
  description = "The Client ID for GitHub Actions OIDC (AZURE_CLIENT_ID secret)"
}

output "tenant_id" {
  value       = azurerm_user_assigned_identity.github_actions.tenant_id
  description = "The Azure Tenant ID (AZURE_TENANT_ID secret)"
}

output "subscription_id" {
  value       = data.azurerm_subscription.current.subscription_id
  description = "The Azure Subscription ID (AZURE_SUBSCRIPTION_ID secret)"
}
