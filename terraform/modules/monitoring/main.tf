


#   - Centralized logging (Log Analytics Workspace)
#   - Application Performance Monitoring (Application Insights)
#   - Diagnostic pipelines (App Services + MySQL → Log Analytics)
#   - Availability tests (multi-region health pings)
#   - Multi-severity metric alerts with email notifications


# 1. Centralized Log Sink
resource "azurerm_log_analytics_workspace" "main" {
  name                = "law-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}


# 2. Application Insights (APM)

resource "azurerm_application_insights" "main" {
  name                = "appi-${var.project_name}-${var.environment}"
  location            = var.location
  resource_group_name = var.resource_group_name
  workspace_id        = azurerm_log_analytics_workspace.main.id
  application_type    = "Node.JS"
}


# 3. Diagnostic Settings — Stream platform logs and metrics to Log Analytics


/*resource "azurerm_monitor_diagnostic_setting" "backend" {
  name                       = "diag-backend"
  target_resource_id         = var.backend_app_id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }
  enabled_log {
    category = "AppServiceConsoleLogs"
  }
  enabled_log {
    category = "AppServiceAppLogs"
  }
  enabled_log {
    category = "AppServicePlatformLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}

resource "azurerm_monitor_diagnostic_setting" "frontend" {
  name                       = "diag-frontend"
  target_resource_id         = var.frontend_app_id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "AppServiceHTTPLogs"
  }
  enabled_log {
    category = "AppServiceConsoleLogs"
  }
  enabled_log {
    category = "AppServiceAppLogs"
  }
  enabled_log {
    category = "AppServicePlatformLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}*/

resource "azurerm_monitor_diagnostic_setting" "mysql" {
  name                       = "diag-mysql"
  target_resource_id         = var.mysql_server_id
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id

  enabled_log {
    category = "MySqlSlowLogs"
  }
  enabled_log {
    category = "MySqlAuditLogs"
  }

  metric {
    category = "AllMetrics"
    enabled  = true
  }
}


# 4. Availability Tests — Multi-region

/*resource "azurerm_application_insights_standard_web_test" "backend_health" {
  name                    = "webtest-backend-health-${var.project_name}"
  resource_group_name     = var.resource_group_name
  location                = var.location
  application_insights_id = azurerm_application_insights.main.id
  frequency               = 300
  timeout                 = 30
  enabled                 = true

  geo_locations = [
    "emea-nl-ams-azr", # West Europe
    "us-va-ash-azr",   # East US
    "apac-sg-sin-azr"  # Southeast Asia
  ]

  request {
    url       = "https://${var.backend_hostname}/api/health"
    http_verb = "GET"
  }

  validation_rules {
    expected_status_code        = 200
    ssl_check_enabled           = true
    ssl_cert_remaining_lifetime = 7
  }
}

resource "azurerm_application_insights_standard_web_test" "frontend_health" {
  name                    = "webtest-frontend-health-${var.project_name}"
  resource_group_name     = var.resource_group_name
  location                = var.location
  application_insights_id = azurerm_application_insights.main.id
  frequency               = 300
  timeout                 = 30
  enabled                 = true

  geo_locations = [
    "emea-nl-ams-azr", # West Europe
    "us-va-ash-azr",   # East US
    "apac-sg-sin-azr"  # Southeast Asia
  ]

  request {
    url       = "https://${var.frontend_hostname}"
    http_verb = "GET"
  }

  validation_rules {
    expected_status_code        = 200
    ssl_check_enabled           = true
    ssl_cert_remaining_lifetime = 7
  }
}


# 5. Alert Action Group — Email Notifications

resource "azurerm_monitor_action_group" "critical" {
  name                = "ag-${var.project_name}-critical"
  resource_group_name = var.resource_group_name
  short_name          = "GMAOCrit"

  email_receiver {
    name                    = "admin-email"
    email_address           = var.alert_email
    use_common_alert_schema = true
  }
}


# 6. Metric Alerts — Multi-Severity

# Sev 0 (Critical) — Backend health endpoint is DOWN from 2+ locations
resource "azurerm_monitor_metric_alert" "availability" {
  name                = "alert-availability-${var.project_name}"
  resource_group_name = var.resource_group_name
  scopes              = [azurerm_application_insights.main.id]
  description         = "Backend health endpoint is failing from multiple locations"
  severity            = 0
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Insights/components"
    metric_name      = "availabilityResults/availabilityPercentage"
    aggregation      = "Average"
    operator         = "LessThan"
    threshold        = 100
  }

  action {
    action_group_id = azurerm_monitor_action_group.critical.id
  }
}

# Sev 1 — Backend HTTP 5xx errors spike
resource "azurerm_monitor_metric_alert" "backend_5xx" {
  name                = "alert-backend-5xx-${var.project_name}"
  resource_group_name = var.resource_group_name
  scopes              = [var.backend_app_id]
  description         = "Backend returning excessive HTTP 5xx errors"
  severity            = 1
  frequency           = "PT1M"
  window_size         = "PT5M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "Http5xx"
    aggregation      = "Total"
    operator         = "GreaterThan"
    threshold        = 5
  }

  action {
    action_group_id = azurerm_monitor_action_group.critical.id
  }
}

# Sev 2 — Backend response time is degraded
resource "azurerm_monitor_metric_alert" "backend_response_time" {
  name                = "alert-backend-latency-${var.project_name}"
  resource_group_name = var.resource_group_name
  scopes              = [var.backend_app_id]
  description         = "Backend average response time exceeds 3 seconds"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.Web/sites"
    metric_name      = "HttpResponseTime"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 3
  }

  action {
    action_group_id = azurerm_monitor_action_group.critical.id
  }
}

# Sev 2 — MySQL CPU is overloaded
resource "azurerm_monitor_metric_alert" "mysql_cpu" {
  name                = "alert-mysql-cpu-${var.project_name}"
  resource_group_name = var.resource_group_name
  scopes              = [var.mysql_server_id]
  description         = "MySQL CPU usage exceeds 85% sustained over 15 minutes"
  severity            = 2
  frequency           = "PT5M"
  window_size         = "PT15M"

  criteria {
    metric_namespace = "Microsoft.DBforMySQL/flexibleServers"
    metric_name      = "cpu_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 85
  }

  action {
    action_group_id = azurerm_monitor_action_group.critical.id
  }
}

# Sev 1 — MySQL storage is running out
resource "azurerm_monitor_metric_alert" "mysql_storage" {
  name                = "alert-mysql-storage-${var.project_name}"
  resource_group_name = var.resource_group_name
  scopes              = [var.mysql_server_id]
  description         = "MySQL storage usage exceeds 85%"
  severity            = 1
  frequency           = "PT15M"
  window_size         = "PT1H"

  criteria {
    metric_namespace = "Microsoft.DBforMySQL/flexibleServers"
    metric_name      = "storage_percent"
    aggregation      = "Average"
    operator         = "GreaterThan"
    threshold        = 85
  }

  action {
    action_group_id = azurerm_monitor_action_group.critical.id
  }
}
*/