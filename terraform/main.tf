# terraform/main.tf

# 1. Define the Resource Group
resource "azurerm_resource_group" "rg" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# 2. Define the Virtual Network and Subnets
resource "azurerm_virtual_network" "vnet" {
  name                = "vnet-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.0.0/16"]
}

resource "azurerm_subnet" "app_subnet" {
  name                 = "snet-app"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.1.0/24"]

  delegation {
    name = "appservice-delegation"
    service_delegation {
      name    = "Microsoft.Web/serverFarms"
      actions = ["Microsoft.Network/virtualNetworks/subnets/action"]
    }
  }
}

resource "azurerm_subnet" "db_subnet" {
  name                 = "snet-db"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefixes     = ["10.0.2.0/24"]

  delegation {
    name = "mysql-delegation"
    service_delegation {
      name    = "Microsoft.DBforMySQL/flexibleServers"
      actions = ["Microsoft.Network/virtualNetworks/subnets/join/action"]
    }
  }
}

# 3. Private DNS Zone for MySQL
resource "azurerm_private_dns_zone" "db_dns_zone" {
  name                = "${var.project_name}-db.private.mysql.database.azure.com"
  resource_group_name = azurerm_resource_group.rg.name
}

resource "azurerm_private_dns_zone_virtual_network_link" "dns_vnet_link" {
  name                  = "dns-vnet-link"
  resource_group_name   = azurerm_resource_group.rg.name
  private_dns_zone_name = azurerm_private_dns_zone.db_dns_zone.name
  virtual_network_id    = azurerm_virtual_network.vnet.id
}

# 4. Define the App Service Plan (The Server)
resource "azurerm_service_plan" "app_plan" {
  name                = "plan-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux" 
  sku_name            = "B1"    # VNet Integration requires at least B1
}

# 5. Define the Backend App Service
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend-${var.environment}-supra"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.app_plan.location
  service_plan_id     = azurerm_service_plan.app_plan.id
  https_only          = true

  virtual_network_subnet_id = azurerm_subnet.app_subnet.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    always_on = false 
    application_stack {
      node_version = "20-lts"
    }
    app_command_line = "npx prisma migrate deploy && npm run db:seed && npm start"
    cors {
      allowed_origins     = ["https://${var.project_name}-frontend-${var.environment}-supra.azurewebsites.net"]
      support_credentials = true
    }
  }

   app_settings = {
    "NODE_ENV"                           = "production"
    "PORT"                               = "8080"
    
    # Security Configurations
    "BCRYPT_SALT_ROUNDS"       = "12"
    "MAX_LOGIN_ATTEMPTS"       = "5"
    "LOCKOUT_DURATION_MINUTES" = "15"
    "ACCESS_TOKEN_EXPIRY"      = "15m"
    "REFRESH_TOKEN_EXPIRY"     = "7d"
    "FRONTEND_URL"             = "https://${var.project_name}-frontend-${var.environment}-supra.azurewebsites.net"
    "DATABASE_URL"             = "mysql://${azurerm_mysql_flexible_server.db.administrator_login}:${urlencode(random_password.db_password.result)}@${azurerm_mysql_flexible_server.db.fqdn}:3306/gmao_db?sslaccept=strict"
    "ACCESS_TOKEN_SECRET"      = random_password.access_token_secret.result
    "REFRESH_TOKEN_SECRET"     = random_password.refresh_token_secret.result
  }
}

# 6. Define the Frontend App Service
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend-${var.environment}-supra"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.app_plan.location
  service_plan_id     = azurerm_service_plan.app_plan.id
  https_only          = true

  site_config {
    always_on = false 
    application_stack {
      node_version = "20-lts" 
    }
    app_command_line = "node server.js" 
  }

   app_settings = {
    "PORT"                = "8080"
    "NEXT_PUBLIC_API_URL" = "https://${var.project_name}-backend-${var.environment}-supra.azurewebsites.net/api"
  }
}

# 7. Generate Secrets
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}
resource "random_password" "access_token_secret" {
  length  = 64
  special = true
}
resource "random_password" "refresh_token_secret" {
  length  = 64
  special = true
}

# 8. Define the MySQL Flexible Server
resource "azurerm_mysql_flexible_server" "db" {
  name                   = "${var.project_name}-db-${var.environment}-supra"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  administrator_login    = "gmaoadmin"
  administrator_password = random_password.db_password.result
  sku_name               = "B_Standard_B1ms" 
  version                = "8.0.21"
  zone                   = "1" 

  delegated_subnet_id    = azurerm_subnet.db_subnet.id
  private_dns_zone_id    = azurerm_private_dns_zone.db_dns_zone.id

  depends_on = [azurerm_private_dns_zone_virtual_network_link.dns_vnet_link]

  storage {
    iops    = 360
    size_gb = 20
  }
  
  lifecycle {
    ignore_changes = [
      zone
    ]
  }
}
