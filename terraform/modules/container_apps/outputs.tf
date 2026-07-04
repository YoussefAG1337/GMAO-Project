output "backend_fqdn" {
  value       = azurerm_container_app.backend.latest_revision_fqdn
  description = "The fully qualified domain name of the backend container app"
}

output "frontend_fqdn" {
  value       = azurerm_container_app.frontend.latest_revision_fqdn
  description = "The fully qualified domain name of the frontend container app"
}