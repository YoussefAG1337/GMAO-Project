# modules/database/outputs.tf

output "server_id" {
  value       = azurerm_mysql_flexible_server.main.id
  description = "The resource ID of the MySQL Flexible Server"
}

output "server_fqdn" {
  value       = azurerm_mysql_flexible_server.main.fqdn
  description = "The fully qualified domain name of the MySQL server"
}

output "admin_login" {
  value       = azurerm_mysql_flexible_server.main.administrator_login
  description = "The administrator login name for the MySQL server"
}

output "admin_password" {
  value       = random_password.db_password.result
  description = "The administrator password for the MySQL server"
  sensitive   = true
}

output "connection_string" {
  value       = "mysql://${azurerm_mysql_flexible_server.main.administrator_login}:${urlencode(random_password.db_password.result)}@${azurerm_mysql_flexible_server.main.fqdn}:3306/gmao_db?sslaccept=strict"
  description = "The full Prisma-compatible MySQL connection string"
  sensitive   = true
}
