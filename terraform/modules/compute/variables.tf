

variable "project_name" {
  type        = string
  description = "The project name, used for resource naming"
}

variable "environment" {
  type        = string
  description = "The deployment environment"
}

variable "location" {
  type        = string
  description = "The Azure region for all resources"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group"
}

variable "app_subnet_id" {
  type        = string
  description = "The ID of the App Service subnet for VNet integration"
}

variable "database_url" {
  type        = string
  description = "The Prisma-compatible MySQL connection string"
  sensitive   = true
}

variable "app_insights_connection_string" {
  type        = string
  description = "The Application Insights connection string for telemetry"
  sensitive   = true
}
