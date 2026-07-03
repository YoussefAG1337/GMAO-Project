# modules/identity/main.tf

data "azurerm_subscription" "current" {}

resource "azurerm_user_assigned_identity" "github_actions" {
  name                = "id-${var.project_name}-github-actions"
  resource_group_name = var.resource_group_name
  location            = var.location
}

resource "azurerm_role_assignment" "github_actions_contributor" {
  scope                = data.azurerm_subscription.current.id
  role_definition_name = "Contributor"
  principal_id         = azurerm_user_assigned_identity.github_actions.principal_id
}

resource "azurerm_federated_identity_credential" "github_actions" {
  name                = "fic-${var.project_name}-github-actions"
  resource_group_name = var.resource_group_name
  audience            = ["api://AzureADTokenExchange"]
  issuer              = "https://token.actions.githubusercontent.com"
  parent_id           = azurerm_user_assigned_identity.github_actions.id
  subject             = "repo:${var.github_organization}/${var.github_repository}:ref:refs/heads/main"
}
