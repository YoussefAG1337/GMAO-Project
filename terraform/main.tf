# terraform/main.tf

# 1. Define the Resource Group
resource "azurerm_resource_group" "rg" {
  # We construct the name dynamically: e.g., "rg-gmao-dev"
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# 2. Define the App Service Plan (The Server)
resource "azurerm_service_plan" "app_plan" {
  name                = "plan-${var.project_name}-${var.environment}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_resource_group.rg.location
  os_type             = "Linux" # Option: Windows or Linux
  sku_name            = "F1"    # Option: F1 (Free) or B1 (Basic)
}

# 3. Define the Backend App Service
resource "azurerm_linux_web_app" "backend" {
  name                = "${var.project_name}-backend-${var.environment}-supra"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.app_plan.location
  service_plan_id     = azurerm_service_plan.app_plan.id
  https_only          = true

  site_config {
    always_on = false # ADD THIS LINE
    application_stack {
      node_version = "20-lts"
    }
    cors {
      allowed_origins     = ["https://${var.project_name}-frontend-${var.environment}-supra.azurewebsites.net"]
      support_credentials = true
    }
  }

   app_settings = {
    "NODE_ENV"                           = "production"
    "PORT"                               = "8080"
    
    # Security Configurations (Constants)
    "BCRYPT_SALT_ROUNDS"       = "12"
    "MAX_LOGIN_ATTEMPTS"       = "5"
    "LOCKOUT_DURATION_MINUTES" = "15"
    "ACCESS_TOKEN_EXPIRY"      = "15m"
    "REFRESH_TOKEN_EXPIRY"     = "7d"
    # Dynamically generated URLs and Secrets
    "FRONTEND_URL" = "https://${var.project_name}-frontend-${var.environment}-supra.azurewebsites.net"
    "DATABASE_URL"         = "mysql://${azurerm_mysql_flexible_server.db.administrator_login}:${urlencode(random_password.db_password.result)}@${azurerm_mysql_flexible_server.db.fqdn}:3306/gmao_db?sslaccept=strict"
    "ACCESS_TOKEN_SECRET"  = random_password.access_token_secret.result
    "REFRESH_TOKEN_SECRET" = random_password.refresh_token_secret.result
  }
}

# 4. Define the Frontend App Service
resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend-${var.environment}-supra"
  resource_group_name = azurerm_resource_group.rg.name
  location            = azurerm_service_plan.app_plan.location
  service_plan_id     = azurerm_service_plan.app_plan.id
  https_only          = true

  site_config {
    always_on = false 
    application_stack {
      node_version = "20-lts" # Azure Linux App Service officially uses 20-lts currently for standard support
    }
    app_command_line = "node server.js" # The Next.js standalone startup command
  }

   app_settings = {
    "PORT"                = "8080"
    "NEXT_PUBLIC_API_URL" = "https://${var.project_name}-backend-${var.environment}-supra.azurewebsites.net/api"
  }
}

# 5. Generate a highly secure random password
resource "random_password" "db_password" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}
# Generate a highly secure JWT Access Token Secret
resource "random_password" "access_token_secret" {
  length  = 64
  special = true
}
# Generate a highly secure JWT Refresh Token Secret
resource "random_password" "refresh_token_secret" {
  length  = 64
  special = true
}

# 6. Define the MySQL Flexible Server
resource "azurerm_mysql_flexible_server" "db" {
  name                   = "${var.project_name}-db-${var.environment}-supra"
  resource_group_name    = azurerm_resource_group.rg.name
  location               = azurerm_resource_group.rg.location
  administrator_login    = "gmaoadmin"
  administrator_password = random_password.db_password.result
  sku_name               = "B_Standard_B1ms" # The burstable, cost-effective tier
  version                = "8.0.21"
  zone                   = "1" 

  # We use local redundant storage to keep costs down
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

# 7. Allow Azure App Services to talk to the Database
resource "azurerm_mysql_flexible_server_firewall_rule" "allow_azure" {
  name                = "AllowAllAzureIPs"
  resource_group_name = azurerm_resource_group.rg.name
  server_name         = azurerm_mysql_flexible_server.db.name
  # Setting start and end to 0.0.0.0 is Azure's special flag to allow internal Azure services
  start_ip_address    = "0.0.0.0"
  end_ip_address      = "0.0.0.0" 
}
