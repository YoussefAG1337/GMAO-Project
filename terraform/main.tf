

# Resource Group

resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}


# Networking — VNet, Subnets, Private DNS


module "networking" {
  source = "./modules/networking"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# Database — MySQL Flexible Server

module "database" {
  source = "./modules/database"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  db_subnet_id        = module.networking.db_subnet_id
  dns_zone_id         = module.networking.dns_zone_id
}


# Monitoring — Log Analytics, App Insights, Diagnostics, Alerts

module "monitoring" {
  source = "./modules/monitoring"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  backend_app_id      = "" #module.compute.backend_app_id
  frontend_app_id     = "" #module.compute.frontend_app_id
  mysql_server_id     = module.database.server_id
  backend_hostname    = "" #module.compute.backend_hostname
  frontend_hostname   = "" #module.compute.frontend_hostname
  alert_email         = var.alert_email
}

# Container Registry (The Docker App Store)

module "registry" {
  source = "./modules/registry"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}


# Compute — Azure Container Apps (ACA)

module "container_apps" {
  source = "./modules/container_apps"

  project_name        = var.project_name
  environment         = var.environment
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  # Connect logging
  log_analytics_workspace_id = module.monitoring.log_analytics_workspace_id

  # Connect the database and App Insights
  database_url                   = module.database.connection_string
  app_insights_connection_string = module.monitoring.app_insights_connection_string

  # Pass the registry credentials so ACA can pull our images later
  registry_login_server = module.registry.login_server
  registry_username     = module.registry.admin_username
  registry_password     = module.registry.admin_password
  app_subnet_id         = module.networking.app_subnet_id
}

# Compute — App Service Plan, Backend,Frontend
/*module "compute" {
  source = "./modules/compute"

  project_name                   = var.project_name
  environment                    = var.environment
  location                       = azurerm_resource_group.main.location
  resource_group_name            = azurerm_resource_group.main.name
  app_subnet_id                  = module.networking.app_subnet_id
  database_url                   = module.database.connection_string
  app_insights_connection_string = module.monitoring.app_insights_connection_string
}
*/

# Identity — GitHub Actions OIDC


module "identity" {
  source = "./modules/identity"

  project_name        = var.project_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  github_organization = var.github_organization
  github_repository   = var.github_repository
}
