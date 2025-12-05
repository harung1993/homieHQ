# api/integrations.py
from flask import Blueprint, request, jsonify, current_app
from app import db
from app.models.api_key import APIKey
from app.models.maintenance import Maintenance
from app.models.property import Property
from app.utils.api_key_auth import require_api_key, get_api_user_id
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

integrations_bp = Blueprint('integrations', __name__)

# ============================================================================
# API Key Management Endpoints (Require JWT authentication)
# ============================================================================

@integrations_bp.route('/api-keys', methods=['GET'])
@jwt_required()
def list_api_keys():
    """List all API keys for the current user"""
    user_id = get_jwt_identity()

    api_keys = APIKey.query.filter_by(user_id=user_id).all()

    return jsonify({
        'api_keys': [key.to_dict() for key in api_keys]
    }), 200


@integrations_bp.route('/api-keys', methods=['POST'])
@jwt_required()
def create_api_key():
    """Create a new API key"""
    user_id = get_jwt_identity()
    data = request.get_json()

    name = data.get('name')
    scopes = data.get('scopes', ['read:maintenance', 'write:maintenance'])
    expires_days = data.get('expires_days')  # Optional expiration in days

    if not name:
        return jsonify({'error': 'API key name is required'}), 400

    # Generate new API key
    api_key_value = APIKey.generate_key()
    key_hash = APIKey.hash_key(api_key_value)
    key_prefix = api_key_value[:12]  # pp_live_xxxx

    # Calculate expiration if provided
    expires_at = None
    if expires_days:
        from datetime import timedelta
        expires_at = datetime.utcnow() + timedelta(days=expires_days)

    # Create API key record
    api_key = APIKey(
        user_id=user_id,
        name=name,
        key_hash=key_hash,
        key_prefix=key_prefix,
        scopes=','.join(scopes) if isinstance(scopes, list) else scopes,
        expires_at=expires_at
    )

    db.session.add(api_key)
    db.session.commit()

    # Return the actual key ONLY on creation (it won't be shown again)
    return jsonify({
        'message': 'API key created successfully',
        'api_key': api_key_value,  # Show the actual key ONLY once
        'key_info': api_key.to_dict(),
        'warning': 'Save this key now! You will not be able to see it again.'
    }), 201


@integrations_bp.route('/api-keys/<int:key_id>', methods=['DELETE'])
@jwt_required()
def delete_api_key(key_id):
    """Delete an API key"""
    user_id = get_jwt_identity()

    api_key = APIKey.query.filter_by(id=key_id, user_id=user_id).first()

    if not api_key:
        return jsonify({'error': 'API key not found'}), 404

    db.session.delete(api_key)
    db.session.commit()

    return jsonify({'message': 'API key deleted successfully'}), 200


@integrations_bp.route('/api-keys/<int:key_id>/toggle', methods=['PUT'])
@jwt_required()
def toggle_api_key(key_id):
    """Activate or deactivate an API key"""
    user_id = get_jwt_identity()

    api_key = APIKey.query.filter_by(id=key_id, user_id=user_id).first()

    if not api_key:
        return jsonify({'error': 'API key not found'}), 404

    api_key.is_active = not api_key.is_active
    db.session.commit()

    return jsonify({
        'message': f'API key {"activated" if api_key.is_active else "deactivated"}',
        'key_info': api_key.to_dict()
    }), 200


# ============================================================================
# Home Assistant Integration Endpoints (Require API Key authentication)
# ============================================================================

@integrations_bp.route('/ha/maintenance', methods=['GET'])
@require_api_key('read:maintenance')
def ha_get_maintenance_tasks():
    """
    Get all maintenance tasks for Home Assistant

    Headers:
        X-API-Key: your_api_key_here
        or
        Authorization: Bearer your_api_key_here

    Query Parameters:
        property_id: Filter by property ID
        status: Filter by status (pending, in-progress, completed)
        priority: Filter by priority (low, medium, high)
    """
    user_id = get_api_user_id()

    # Build query
    query = Maintenance.query.filter_by(user_id=user_id)

    # Apply filters
    property_id = request.args.get('property_id', type=int)
    status = request.args.get('status')
    priority = request.args.get('priority')

    if property_id:
        query = query.filter_by(property_id=property_id)
    if status:
        query = query.filter_by(status=status)
    if priority:
        query = query.filter_by(priority=priority)

    tasks = query.order_by(Maintenance.due_date.asc()).all()

    # Format for Home Assistant
    ha_tasks = []
    for task in tasks:
        ha_tasks.append({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status,
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else None,
            'created_at': task.created_at.isoformat() if task.created_at else None,
            'completed_at': task.completed_at.isoformat() if task.completed_at else None,
            'property_id': task.property_id
        })

    return jsonify({
        'tasks': ha_tasks,
        'count': len(ha_tasks)
    }), 200


@integrations_bp.route('/ha/maintenance', methods=['POST'])
@require_api_key('write:maintenance')
def ha_create_maintenance_task():
    """
    Create a new maintenance task from Home Assistant

    Headers:
        X-API-Key: your_api_key_here

    Body:
        {
            "title": "Replace air filter",
            "description": "HVAC filter needs replacement",
            "priority": "high",
            "property_id": 1,
            "due_date": "2025-12-15"
        }
    """
    user_id = get_api_user_id()
    data = request.get_json()

    # Validate required fields
    title = data.get('title')
    if not title:
        return jsonify({'error': 'Title is required'}), 400

    # Get property_id
    property_id = data.get('property_id')
    if property_id:
        # Verify user owns this property
        property_obj = Property.query.filter_by(id=property_id, user_id=user_id).first()
        if not property_obj:
            return jsonify({'error': 'Property not found or access denied'}), 404

    # Parse due_date if provided
    due_date = None
    if data.get('due_date'):
        try:
            due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')).date()
        except:
            return jsonify({'error': 'Invalid due_date format. Use ISO format (YYYY-MM-DD)'}), 400

    # Create maintenance task
    task = Maintenance(
        user_id=user_id,
        property_id=property_id,
        title=title,
        description=data.get('description'),
        priority=data.get('priority', 'medium'),
        status=data.get('status', 'pending'),
        due_date=due_date
    )

    db.session.add(task)
    db.session.commit()

    return jsonify({
        'message': 'Maintenance task created',
        'task': {
            'id': task.id,
            'title': task.title,
            'status': task.status,
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else None
        }
    }), 201


@integrations_bp.route('/ha/maintenance/<int:task_id>', methods=['PUT'])
@require_api_key('write:maintenance')
def ha_update_maintenance_task(task_id):
    """
    Update a maintenance task from Home Assistant

    Headers:
        X-API-Key: your_api_key_here

    Body:
        {
            "status": "completed",
            "priority": "low"
        }
    """
    user_id = get_api_user_id()

    task = Maintenance.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    data = request.get_json()

    # Update fields
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'status' in data:
        task.status = data['status']
        if data['status'] == 'completed':
            task.completed_at = datetime.utcnow()
    if 'priority' in data:
        task.priority = data['priority']
    if 'due_date' in data:
        try:
            task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')).date()
        except:
            return jsonify({'error': 'Invalid due_date format'}), 400

    task.updated_at = datetime.utcnow()
    db.session.commit()

    return jsonify({
        'message': 'Task updated',
        'task': {
            'id': task.id,
            'title': task.title,
            'status': task.status,
            'priority': task.priority
        }
    }), 200


@integrations_bp.route('/ha/maintenance/<int:task_id>', methods=['DELETE'])
@require_api_key('write:maintenance')
def ha_delete_maintenance_task(task_id):
    """Delete a maintenance task"""
    user_id = get_api_user_id()

    task = Maintenance.query.filter_by(id=task_id, user_id=user_id).first()

    if not task:
        return jsonify({'error': 'Task not found'}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({'message': 'Task deleted'}), 200


@integrations_bp.route('/ha/properties', methods=['GET'])
@require_api_key('read:maintenance')
def ha_get_properties():
    """Get all properties for the user"""
    user_id = get_api_user_id()

    properties = Property.query.filter_by(user_id=user_id).all()

    return jsonify({
        'properties': [{
            'id': p.id,
            'address': p.address,
            'city': p.city,
            'state': p.state,
            'zip_code': p.zip_code
        } for p in properties]
    }), 200
