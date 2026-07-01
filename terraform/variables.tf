# terraform/variables.tf

variable "project_name" {
  type        = string
  description = "The name of the project, used for naming resources"
  default     = "gmao"
}

variable "environment" {
  type        = string
  description = "The environment (e.g., dev, prod)"
  default     = "tf"
}

variable "location" {
  type        = string
  description = "The Azure region to deploy all resources"
  default     = "swedencentral" # Matching your current setup
}

variable "github_organization" {
  type        = string
  description = "The GitHub organization or username for OIDC"
  default     = "YoussefAG1337"
}

variable "github_repository" {
  type        = string
  description = "The GitHub repository name for OIDC"
  default     = "GMAO-Project"
}