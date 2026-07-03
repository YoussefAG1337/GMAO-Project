# modules/identity/variables.tf

variable "project_name" {
  type        = string
  description = "The project name, used for resource naming"
}

variable "location" {
  type        = string
  description = "The Azure region for all resources"
}

variable "resource_group_name" {
  type        = string
  description = "The name of the resource group"
}

variable "github_organization" {
  type        = string
  description = "The GitHub organization or username for OIDC federation"
}

variable "github_repository" {
  type        = string
  description = "The GitHub repository name for OIDC federation"
}
