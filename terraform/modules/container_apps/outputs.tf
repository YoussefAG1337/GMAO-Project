# Stable, revision-agnostic hostnames — see the NEXT_PUBLIC_API_URL comment in
# main.tf for why latest_revision_fqdn isn't used here.
output "backend_fqdn" {
  value       = "${azurerm_container_app.backend.name}.${azurerm_container_app_environment.main.default_domain}"
  description = "The fully qualified domain name of the backend container app"
}

output "frontend_fqdn" {
  value       = "${azurerm_container_app.frontend.name}.${azurerm_container_app_environment.main.default_domain}"
  description = "The fully qualified domain name of the frontend container app"
}