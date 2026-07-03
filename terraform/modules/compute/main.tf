
# Secrets


resource "random_password" "access_token_secret" {
  length  = 64
  special = true
}

resource "random_password" "refresh_token_secret" {
  length  = 64
  special = true
}


# App Service Plan (Shared by both apps)


resource "azurerm_service_plan" "main" {
  name                = "plan-${var.project_name}-${var.environment}"
  resource_group_name = var.resource_group_name
  location            = var.location
  os_type             = "Linux"
  sku_name            = "B1" # VNet Integration requires at least B1
}


# Backend App Service (Express.js API)


resource "azurerm_linux_web_app" "backend" {
  name                      = "${var.project_name}-backend-${var.environment}-supra"
  resource_group_name       = var.resource_group_name
  location                  = var.location
  service_plan_id           = azurerm_service_plan.main.id
  https_only                = true
  virtual_network_subnet_id = var.app_subnet_id

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
    "NODE_ENV" = "production"
    "PORT"     = "8080"

    # Security
    "BCRYPT_SALT_ROUNDS"       = "12"
    "MAX_LOGIN_ATTEMPTS"       = "5"
    "LOCKOUT_DURATION_MINUTES" = "15"
    "ACCESS_TOKEN_EXPIRY"      = "15m"
    "REFRESH_TOKEN_EXPIRY"     = "7d"

    # Connectivity
    "FRONTEND_URL" = "https://${var.project_name}-frontend-${var.environment}-supra.azurewebsites.net"
    "DATABASE_URL" = var.database_url

    # Authentication Secrets
    "ACCESS_TOKEN_SECRET"  = random_password.access_token_secret.result
    "REFRESH_TOKEN_SECRET" = random_password.refresh_token_secret.result

    # Observability — Auto-configures the Application Insights SDK
    "APPLICATIONINSIGHTS_CONNECTION_STRING" = var.app_insights_connection_string
  }
}


# Frontend App Service 


resource "azurerm_linux_web_app" "frontend" {
  name                = "${var.project_name}-frontend-${var.environment}-supra"
  resource_group_name = var.resource_group_name
  location            = var.location
  service_plan_id     = azurerm_service_plan.main.id
  https_only          = true

  site_config {
    always_on = false
    application_stack {
      node_version = "20-lts"
    }
    app_command_line = "node server.js"
  }

  app_settings = {
    "PORT"           = "8080"
    "SERVER_API_URL" = "https://${var.project_name}-backend-${var.environment}-supra.azurewebsites.net/api"
  }
}
