# modules/monitoring/variables.tf

variable "project_name" {
  type        = string
  description = "The project name, used for resource naming"
}

variable "environment" {
  type        = string
  description = "The deployment environment (e.g., tf, dev, prod)"
}

variable "location" {
  type        = string
  description = "The Azure region for all resources"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group"
}

variable "backend_app_id" {
  type        = string
  description = "The resource ID of the backend App Service"
}

variable "frontend_app_id" {
  type        = string
  description = "The resource ID of the frontend App Service"
}

variable "mysql_server_id" {
  type        = string
  description = "The resource ID of the MySQL Flexible Server"
}

variable "backend_hostname" {
  type        = string
  description = "The default hostname of the backend App Service"
}

variable "frontend_hostname" {
  type        = string
  description = "The default hostname of the frontend App Service"
}

variable "alert_email" {
  type        = string
  description = "Email address for alert notifications"
}
