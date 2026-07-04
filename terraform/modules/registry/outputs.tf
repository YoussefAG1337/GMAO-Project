output "login_server" {
  value       = azurerm_container_registry.acr.login_server
  description = "The URL of the container registry"
}

output "admin_username" {
  value       = azurerm_container_registry.acr.admin_username
  description = "The username to log into the container registry"
}

output "admin_password" {
  value       = azurerm_container_registry.acr.admin_password
  description = "The password to log into the container registry"
  sensitive   = true
}