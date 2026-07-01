# terraform/outputs.tf

output "github_actions_client_id" {
  description = "The Client ID of the User Assigned Identity for GitHub Actions (add to AZURE_CLIENT_ID secret)"
  value       = azurerm_user_assigned_identity.github_actions.client_id
}

output "tenant_id" {
  description = "The Azure Tenant ID (add to AZURE_TENANT_ID secret)"
  value       = azurerm_user_assigned_identity.github_actions.tenant_id
}

output "subscription_id" {
  description = "The Azure Subscription ID (add to AZURE_SUBSCRIPTION_ID secret)"
  value       = data.azurerm_subscription.current.subscription_id
}
