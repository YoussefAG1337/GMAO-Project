# modules/networking/outputs.tf

output "vnet_id" {
  value       = azurerm_virtual_network.main.id
  description = "The ID of the Virtual Network"
}

output "app_subnet_id" {
  value       = azurerm_subnet.app.id
  description = "The ID of the App Service subnet"
}

output "db_subnet_id" {
  value       = azurerm_subnet.db.id
  description = "The ID of the database subnet"
}

output "dns_zone_id" {
  value       = azurerm_private_dns_zone.db.id
  description = "The ID of the Private DNS Zone for MySQL"
}
