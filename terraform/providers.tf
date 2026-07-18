# terraform/providers.tf

terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.81.0" # Locking the major version is a best practice
    }
  }
}

provider "azurerm" {
  features {}
}