variable "project_name" { type = string }
variable "environment" { type = string }
variable "location" { type = string }
variable "resource_group_name" { type = string }

# We need the Log Analytics Workspace to store the container console logs
variable "log_analytics_workspace_id" { type = string }

# We need the registry credentials so ACA can download our private images
variable "registry_login_server" { type = string }
variable "registry_username" { type = string }
variable "registry_password" { type = string }

# Environment variables our apps need to run
variable "database_url" { type = string }
variable "app_insights_connection_string" { type = string }