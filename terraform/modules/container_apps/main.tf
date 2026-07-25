# 1. Create the Environment (The "Bubble")
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-${var.project_name}-${var.environment}"
  location                   = var.location
  resource_group_name        = var.resource_group_name
  log_analytics_workspace_id = var.log_analytics_workspace_id
  infrastructure_subnet_id   = var.app_subnet_id
}

# 2. Generate secure secrets for JWTs dynamically — must be distinct, the
# backend's env validation rejects REFRESH_TOKEN_SECRET == ACCESS_TOKEN_SECRET
resource "random_password" "access_token_secret" {
  length  = 32
  special = true
}

resource "random_password" "refresh_token_secret" {
  length  = 32
  special = true
}

# 3. Create the Backend App
resource "azurerm_container_app" "backend" {
  name                         = "ca-backend-${var.project_name}-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  # We configure ACA to log into our private ACR
  registry {
    server               = var.registry_login_server
    username             = var.registry_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.registry_password
  }

  secret {
    name  = "database-url"
    value = var.database_url
  }

  template {
    # We define the container and give it minimal CPU/RAM to stay in the free tier
    container {
      name = "backend"
      # Initially, we deploy a dummy hello-world image until GitHub Actions builds ours
      image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      # Pass environment variables to the Express app
      env {
        name        = "DATABASE_URL"
        secret_name = "database-url"
      }
      env {
        name  = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        value = var.app_insights_connection_string
      }
      env {
        name  = "ACCESS_TOKEN_SECRET"
        value = random_password.access_token_secret.result
      }
      env {
        name  = "REFRESH_TOKEN_SECRET"
        value = random_password.refresh_token_secret.result
      }
    }
  }

  # Ingress allows network traffic to hit the container
  ingress {
    external_enabled = true
    target_port      = 8080
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].container[0].image,
      workload_profile_name # Azure auto-sets "Consumption"; config doesn't declare it
    ]
  }
}

# 4. Create the Frontend App
resource "azurerm_container_app" "frontend" {
  name                         = "ca-frontend-${var.project_name}-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = var.resource_group_name
  revision_mode                = "Single"

  registry {
    server               = var.registry_login_server
    username             = var.registry_username
    password_secret_name = "acr-password"
  }

  secret {
    name  = "acr-password"
    value = var.registry_password
  }

  template {
    container {
      name   = "frontend"
      image  = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
      cpu    = 0.25
      memory = "0.5Gi"

      env {
        name  = "APPLICATIONINSIGHTS_CONNECTION_STRING"
        value = var.app_insights_connection_string
      }
      # No BACKEND_URL/NEXT_PUBLIC_API_URL here on purpose: next.config.ts's
      # rewrite and NEXT_PUBLIC_* are both resolved at build time and baked into
      # the image, so setting them as runtime env vars has no effect. They are
      # passed as Docker --build-arg from the CI workflow instead.
    }
  }

  ingress {
    external_enabled = true
    target_port      = 3000
    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].container[0].image,
      workload_profile_name # Azure auto-sets "Consumption"; config doesn't declare it
    ]
  }
}