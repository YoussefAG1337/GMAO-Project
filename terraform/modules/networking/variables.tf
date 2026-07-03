# modules/networking/variables.tf

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
