# PropertyPal Home Assistant Integration

Connect PropertyPal maintenance tasks and todos with Home Assistant for smart home automation!

## Features

- **View maintenance tasks** as Home Assistant todo lists
- **Create tasks** automatically based on sensor readings or automations
- **Update task status** from Home Assistant dashboard
- **Trigger automations** when tasks are due or completed
- **Secure API key authentication**

## Setup Guide

### Step 1: Generate an API Key

1. Log into PropertyPal web interface
2. Go to **Settings** → **API Keys**
3. Click **"Create New API Key"**
4. Give it a name: `Home Assistant`
5. Select scopes:
   - `read:maintenance` - Read maintenance tasks
   - `write:maintenance` - Create and update tasks
6. Click **Create**
7. **Copy the API key immediately** - it will only be shown once!

### Step 2: Configure Home Assistant

Add the following to your `configuration.yaml`:

```yaml
# RESTful sensors for PropertyPal
rest:
  - resource: "https://your-propertypal-domain.com/api/integrations/ha/maintenance"
    headers:
      X-API-Key: "pp_live_your_api_key_here"
    scan_interval: 300  # Check every 5 minutes
    sensor:
      - name: "PropertyPal Pending Tasks"
        value_template: "{{ value_json.count }}"
        json_attributes_path: "$.tasks"
        json_attributes:
          - id
          - title
          - priority
          - due_date

# Todo list integration
todo:
  - platform: rest
    name: PropertyPal Maintenance
    resource: "https://your-propertypal-domain.com/api/integrations/ha/maintenance"
    headers:
      X-API-Key: "pp_live_your_api_key_here"
```

### Step 3: Restart Home Assistant

```bash
# From Home Assistant UI
Settings → System → Restart

# Or via CLI
ha core restart
```

## Usage Examples

### 1. Display Maintenance Count in Dashboard

```yaml
# In your Lovelace dashboard (dashboard.yaml or via UI)
type: entities
title: PropertyPal Maintenance
entities:
  - entity: sensor.propertypal_pending_tasks
    name: Pending Tasks
    icon: mdi:clipboard-check
```

### 2. Create Task from Automation

Automatically create a maintenance task when a sensor triggers:

```yaml
automation:
  - alias: "Create HVAC Filter Task"
    trigger:
      - platform: time
        at: "00:00:00"
    condition:
      - condition: template
        value_template: "{{ now().day == 1 }}"  # First day of month
    action:
      - service: rest_command.create_maintenance_task
        data:
          title: "Replace HVAC Filter"
          description: "Monthly HVAC filter replacement due"
          priority: "medium"
          property_id: 1
```

Add this to `configuration.yaml`:

```yaml
rest_command:
  create_maintenance_task:
    url: "https://your-propertypal-domain.com/api/integrations/ha/maintenance"
    method: POST
    headers:
      X-API-Key: "pp_live_your_api_key_here"
      Content-Type: "application/json"
    payload: >
      {
        "title": "{{ title }}",
        "description": "{{ description }}",
        "priority": "{{ priority }}",
        "property_id": {{ property_id }}
      }
```

### 3. Update Task Status

Mark a task as completed:

```yaml
rest_command:
  complete_maintenance_task:
    url: "https://your-propertypal-domain.com/api/integrations/ha/maintenance/{{ task_id }}"
    method: PUT
    headers:
      X-API-Key: "pp_live_your_api_key_here"
      Content-Type: "application/json"
    payload: >
      {
        "status": "completed"
      }
```

### 4. Notification for Overdue Tasks

Send notification when tasks are overdue:

```yaml
automation:
  - alias: "Notify Overdue Maintenance"
    trigger:
      - platform: time
        at: "09:00:00"
    action:
      - service: notify.mobile_app
        data:
          title: "PropertyPal: Overdue Tasks"
          message: "You have {{ states('sensor.propertypal_pending_tasks') }} pending maintenance tasks"
```

### 5. Smart Home Integration - Leak Detector

Automatically create urgent task when water leak detected:

```yaml
automation:
  - alias: "Water Leak Detected"
    trigger:
      - platform: state
        entity_id: binary_sensor.water_leak_sensor
        to: "on"
    action:
      - service: rest_command.create_maintenance_task
        data:
          title: "🚨 URGENT: Water Leak Detected"
          description: "Water leak sensor triggered in {{ trigger.to_state.attributes.friendly_name }}"
          priority: "high"
          property_id: 1
      - service: notify.mobile_app
        data:
          title: "Water Leak Emergency!"
          message: "Check PropertyPal for maintenance task details"
```

## API Reference

### Get All Maintenance Tasks

```http
GET /api/integrations/ha/maintenance
Headers:
  X-API-Key: pp_live_your_api_key_here

Query Parameters:
  property_id (optional): Filter by property
  status (optional): pending, in-progress, completed
  priority (optional): low, medium, high

Response:
{
  "tasks": [
    {
      "id": 1,
      "title": "Replace air filter",
      "description": "HVAC filter replacement",
      "status": "pending",
      "priority": "medium",
      "due_date": "2025-12-15",
      "property_id": 1
    }
  ],
  "count": 1
}
```

### Create Maintenance Task

```http
POST /api/integrations/ha/maintenance
Headers:
  X-API-Key: pp_live_your_api_key_here
  Content-Type: application/json

Body:
{
  "title": "Fix leaky faucet",
  "description": "Kitchen sink is dripping",
  "priority": "high",
  "property_id": 1,
  "due_date": "2025-12-20"
}

Response: 201 Created
{
  "message": "Maintenance task created",
  "task": {
    "id": 2,
    "title": "Fix leaky faucet",
    "status": "pending",
    "priority": "high"
  }
}
```

### Update Task

```http
PUT /api/integrations/ha/maintenance/{task_id}
Headers:
  X-API-Key: pp_live_your_api_key_here
  Content-Type: application/json

Body:
{
  "status": "completed",
  "priority": "low"
}
```

### Delete Task

```http
DELETE /api/integrations/ha/maintenance/{task_id}
Headers:
  X-API-Key: pp_live_your_api_key_here
```

### Get Properties

```http
GET /api/integrations/ha/properties
Headers:
  X-API-Key: pp_live_your_api_key_here

Response:
{
  "properties": [
    {
      "id": 1,
      "address": "123 Main St",
      "city": "Portland",
      "state": "OR",
      "zip_code": "97201"
    }
  ]
}
```

## Security

- **API keys are hashed** and stored securely in the database
- **Scope-based permissions** - keys only have access to specified resources
- **Automatic expiration** - set expiration dates for temporary access
- **Activity tracking** - last used timestamp for monitoring
- **Easy revocation** - disable or delete keys instantly

## Troubleshooting

### Tasks not showing in Home Assistant

1. Check API key is valid:
   ```bash
   curl -H "X-API-Key: your_key" https://your-domain.com/api/integrations/ha/maintenance
   ```

2. Verify API key has correct scopes (read:maintenance)

3. Check Home Assistant logs for errors:
   ```
   Settings → System → Logs
   ```

### API returns 401 Unauthorized

- API key is invalid, expired, or inactive
- Regenerate a new key from PropertyPal settings

### API returns 403 Forbidden

- API key doesn't have the required scope
- Create a new key with `read:maintenance` and `write:maintenance` scopes

## Advanced: Custom Sensors

Create a sensor that shows high-priority tasks count:

```yaml
template:
  - sensor:
      - name: "High Priority Maintenance"
        state: >
          {% set tasks = state_attr('sensor.propertypal_pending_tasks', 'tasks') %}
          {{ tasks | selectattr('priority', 'eq', 'high') | list | count if tasks else 0 }}
        icon: mdi:alert-circle
```

## Examples

See the `examples/home_assistant/` directory for complete configuration examples:

- `basic_setup.yaml` - Simple task display
- `automations.yaml` - Automated task creation
- `dashboard.yaml` - Full dashboard integration
- `notifications.yaml` - Smart notifications

## Support

For issues or questions:
- Check API key permissions
- Review Home Assistant logs
- Verify network connectivity
- Contact support via GitHub issues
