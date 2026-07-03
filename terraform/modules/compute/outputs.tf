# modules/compute/outputs.tf

output "backend_app_id" {
  value       = azurerm_linux_web_app.backend.id
  description = "The resource ID of the backend App Service"
}

output "frontend_app_id" {
  value       = azurerm_linux_web_app.frontend.id
  description = "The resource ID of the frontend App Service"
}

output "backend_hostname" {
  value       = azurerm_linux_web_app.backend.default_hostname
  description = "The default hostname of the backend App Service"
}

output "frontend_hostname" {
  value       = azurerm_linux_web_app.frontend.default_hostname
  description = "The default hostname of the frontend App Service"
}

output "backend_identity_principal_id" {
  value       = azurerm_linux_web_app.backend.identity[0].principal_id
  description = "The principal ID of the backend's System Assigned Managed Identity"
}
