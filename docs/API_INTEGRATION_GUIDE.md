# PropertyPal API Integration Guide

Complete guide for integrating PropertyPal with external services using API keys.

## Quick Start

### 1. Generate API Key

```bash
# Via Web Interface:
Settings → API Keys → Create New API Key

# The API key format: pp_live_<64_character_hex>
# Example: pp_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 2. Test API Key

```bash
curl -H "X-API-Key: pp_live_your_key_here" \
     http://localhost:5008/api/integrations/ha/maintenance
```

## API Endpoints

### API Key Management (Requires JWT)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/api-keys` | GET | List all API keys |
| `/api/integrations/api-keys` | POST | Create new API key |
| `/api/integrations/api-keys/{id}` | DELETE | Delete API key |
| `/api/integrations/api-keys/{id}/toggle` | PUT | Enable/disable key |

### Home Assistant Integration (Requires API Key)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/ha/maintenance` | GET | Get all maintenance tasks |
| `/api/integrations/ha/maintenance` | POST | Create new task |
| `/api/integrations/ha/maintenance/{id}` | PUT | Update task |
| `/api/integrations/ha/maintenance/{id}` | DELETE | Delete task |
| `/api/integrations/ha/properties` | GET | Get all properties |

## Authentication

### API Key in Header

```bash
# Option 1: X-API-Key header (recommended)
curl -H "X-API-Key: pp_live_your_key" \
     http://localhost:5008/api/integrations/ha/maintenance

# Option 2: Authorization Bearer
curl -H "Authorization: Bearer pp_live_your_key" \
     http://localhost:5008/api/integrations/ha/maintenance
```

### API Key Scopes

Available scopes:
- `read:maintenance` - Read maintenance tasks
- `write:maintenance` - Create, update, delete tasks
- `read:properties` - Read property information
- `read:expenses` - Read financial data (future)
- `write:expenses` - Manage expenses (future)

## Examples

### Create API Key (via curl)

```bash
# First, login and get JWT token
TOKEN=$(curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# Create API key
curl -X POST http://localhost:5008/api/integrations/api-keys \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home Assistant",
    "scopes": ["read:maintenance", "write:maintenance"],
    "expires_days": 365
  }'

# Response:
# {
#   "api_key": "pp_live_a1b2c3d4...",
#   "key_info": {...},
#   "warning": "Save this key now! You will not be able to see it again."
# }
```

### Get Maintenance Tasks

```bash
# Get all tasks
curl -H "X-API-Key: pp_live_your_key" \
     http://localhost:5008/api/integrations/ha/maintenance

# Filter by property
curl -H "X-API-Key: pp_live_your_key" \
     "http://localhost:5008/api/integrations/ha/maintenance?property_id=1"

# Filter by status
curl -H "X-API-Key: pp_live_your_key" \
     "http://localhost:5008/api/integrations/ha/maintenance?status=pending"

# Filter by priority
curl -H "X-API-Key: pp_live_your_key" \
     "http://localhost:5008/api/integrations/ha/maintenance?priority=high"
```

### Create Maintenance Task

```bash
curl -X POST \
  -H "X-API-Key: pp_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Replace HVAC Filter",
    "description": "Monthly filter replacement",
    "priority": "medium",
    "property_id": 1,
    "due_date": "2025-12-15"
  }' \
  http://localhost:5008/api/integrations/ha/maintenance
```

### Update Task Status

```bash
curl -X PUT \
  -H "X-API-Key: pp_live_your_key" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }' \
  http://localhost:5008/api/integrations/ha/maintenance/1
```

### Delete Task

```bash
curl -X DELETE \
  -H "X-API-Key: pp_live_your_key" \
  http://localhost:5008/api/integrations/ha/maintenance/1
```

## Python Integration

```python
import requests

class PropertyPalClient:
    def __init__(self, api_key, base_url="http://localhost:5008"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {"X-API-Key": api_key}

    def get_tasks(self, property_id=None, status=None, priority=None):
        """Get maintenance tasks"""
        params = {}
        if property_id:
            params['property_id'] = property_id
        if status:
            params['status'] = status
        if priority:
            params['priority'] = priority

        response = requests.get(
            f"{self.base_url}/api/integrations/ha/maintenance",
            headers=self.headers,
            params=params
        )
        return response.json()

    def create_task(self, title, description=None, priority="medium",
                    property_id=None, due_date=None):
        """Create new maintenance task"""
        data = {
            "title": title,
            "description": description,
            "priority": priority
        }
        if property_id:
            data['property_id'] = property_id
        if due_date:
            data['due_date'] = due_date

        response = requests.post(
            f"{self.base_url}/api/integrations/ha/maintenance",
            headers={**self.headers, "Content-Type": "application/json"},
            json=data
        )
        return response.json()

    def update_task(self, task_id, status=None, priority=None):
        """Update task"""
        data = {}
        if status:
            data['status'] = status
        if priority:
            data['priority'] = priority

        response = requests.put(
            f"{self.base_url}/api/integrations/ha/maintenance/{task_id}",
            headers={**self.headers, "Content-Type": "application/json"},
            json=data
        )
        return response.json()

# Usage
client = PropertyPalClient("pp_live_your_key_here")

# Get all high priority tasks
tasks = client.get_tasks(priority="high")
print(f"Found {tasks['count']} high priority tasks")

# Create a task
new_task = client.create_task(
    title="Fix leaky faucet",
    description="Kitchen sink is dripping",
    priority="high",
    property_id=1
)
print(f"Created task ID: {new_task['task']['id']}")

# Mark as completed
client.update_task(new_task['task']['id'], status="completed")
```

## Node.js Integration

```javascript
const axios = require('axios');

class PropertyPalClient {
  constructor(apiKey, baseURL = 'http://localhost:5008') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
    this.headers = { 'X-API-Key': apiKey };
  }

  async getTasks(filters = {}) {
    const response = await axios.get(
      `${this.baseURL}/api/integrations/ha/maintenance`,
      {
        headers: this.headers,
        params: filters
      }
    );
    return response.data;
  }

  async createTask(taskData) {
    const response = await axios.post(
      `${this.baseURL}/api/integrations/ha/maintenance`,
      taskData,
      { headers: { ...this.headers, 'Content-Type': 'application/json' } }
    );
    return response.data;
  }

  async updateTask(taskId, updates) {
    const response = await axios.put(
      `${this.baseURL}/api/integrations/ha/maintenance/${taskId}`,
      updates,
      { headers: { ...this.headers, 'Content-Type': 'application/json' } }
    );
    return response.data;
  }
}

// Usage
const client = new PropertyPalClient('pp_live_your_key_here');

(async () => {
  // Get tasks
  const tasks = await client.getTasks({ status: 'pending' });
  console.log(`Pending tasks: ${tasks.count}`);

  // Create task
  const newTask = await client.createTask({
    title: 'Test Task',
    priority: 'medium',
    property_id: 1
  });
  console.log('Created:', newTask.task);
})();
```

## Security Best Practices

1. **Store API keys securely**
   - Never commit keys to git
   - Use environment variables or secrets management
   - Rotate keys regularly

2. **Use appropriate scopes**
   - Only grant necessary permissions
   - Create separate keys for different integrations

3. **Monitor API key usage**
   - Check `last_used_at` timestamp regularly
   - Disable unused keys
   - Set expiration dates

4. **Rate limiting**
   - Implement client-side rate limiting
   - Cache responses when possible
   - Use appropriate scan_interval in Home Assistant

## Error Handling

| Status Code | Meaning | Solution |
|-------------|---------|----------|
| 401 | Invalid/expired API key | Regenerate key |
| 403 | Missing required scope | Create key with proper scopes |
| 404 | Resource not found | Verify IDs |
| 429 | Rate limit exceeded | Reduce request frequency |
| 500 | Server error | Check logs, contact support |

## Troubleshooting

### API key not working

```bash
# Test key directly
curl -v -H "X-API-Key: pp_live_your_key" \
     http://localhost:5008/api/integrations/ha/maintenance

# Check response:
# - 401: Key is invalid or expired
# - 403: Key lacks required scope
# - 200: Key is working
```

### Check API key status

```bash
# Login and check keys
TOKEN=$(curl -X POST http://localhost:5008/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5008/api/integrations/api-keys
```

## Support

- Documentation: [HOME_ASSISTANT_INTEGRATION.md](HOME_ASSISTANT_INTEGRATION.md)
- Examples: `examples/home_assistant/`
- Issues: GitHub Issues
