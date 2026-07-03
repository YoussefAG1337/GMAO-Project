# modules/database/main.tf

# ──────────────────────────────────────────
# Secrets
# ──────────────────────────────────────────

resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# ──────────────────────────────────────────
# MySQL Flexible Server
# ──────────────────────────────────────────

resource "azurerm_mysql_flexible_server" "main" {
  name                   = "${var.project_name}-db-${var.environment}-supra-v2"
  resource_group_name    = var.resource_group_name
  location               = var.location
  administrator_login    = "gmaoadmin"
  administrator_password = random_password.db_password.result
  sku_name               = "B_Standard_B1ms"
  version                = "8.0.21"
  delegated_subnet_id    = var.db_subnet_id
  private_dns_zone_id    = var.dns_zone_id

  storage {
    iops    = 360
    size_gb = 20
  }

  lifecycle {
    ignore_changes = [zone]
  }
}

# ──────────────────────────────────────────
# MySQL Server Configurations (Observability)
# ──────────────────────────────────────────

resource "azurerm_mysql_flexible_server_configuration" "slow_query_log" {
  name                = "slow_query_log"
  resource_group_name = var.resource_group_name
  server_name         = azurerm_mysql_flexible_server.main.name
  value               = "ON"
}

resource "azurerm_mysql_flexible_server_configuration" "long_query_time" {
  name                = "long_query_time"
  resource_group_name = var.resource_group_name
  server_name         = azurerm_mysql_flexible_server.main.name
  value               = "2"
}

resource "azurerm_mysql_flexible_server_configuration" "audit_log_enabled" {
  name                = "audit_log_enabled"
  resource_group_name = var.resource_group_name
  server_name         = azurerm_mysql_flexible_server.main.name
  value               = "ON"
}
