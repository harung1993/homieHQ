# api/maintenance.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.maintenance import Maintenance
from app.models.user import User
from datetime import datetime
from app.models.Property_user import PropertyUser

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('/', methods=['GET'])
@jwt_required()
def get_maintenance_requests():
    """Get all maintenance requests for the current user"""
    current_user_id = int(get_jwt_identity())

    property_id = request.args.get('property_id')
    
    # If property_id is provided, get requests for that property if user has access
    if property_id:
        # Check if user has owner or manager access to this property
        property_user = PropertyUser.query.filter_by(
            property_id=property_id,
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not property_user or property_user.role not in ['owner', 'manager']:
            return jsonify({"error": "Property not found or you don't have permission to view maintenance requests"}), 403
        
        # User has appropriate access, get maintenance requests for this property
        query = Maintenance.query.filter_by(property_id=property_id)
    else:
        # Get all properties the user has owner or manager access to
        property_users = PropertyUser.query.filter(
            PropertyUser.user_id == current_user_id,
            PropertyUser.status == 'active',
            PropertyUser.role.in_(['owner', 'manager'])
        ).all()
        
        property_ids = [pu.property_id for pu in property_users]
        
        # Get requests created by the user OR for properties they have owner/manager access to
        query = Maintenance.query.filter(
            (Maintenance.user_id == current_user_id) | 
            (Maintenance.property_id.in_(property_ids))
        )
    
    # Apply additional filters
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    maintenance_requests = query.order_by(Maintenance.created_at.desc()).all()
    
    result = []
    for req in maintenance_requests:
        result.append({
            'id': req.id,
            'title': req.title,
            'description': req.description,
            'priority': req.priority,
            'status': req.status,
            'due_date': req.due_date.isoformat() if req.due_date else None,
            'created_at': req.created_at.isoformat(),
            'updated_at': req.updated_at.isoformat(),
            'completed_at': req.completed_at.isoformat() if req.completed_at else None,
            'property_id': req.property_id,
            'created_by': req.user_id  # Include who created the request
        })
    
    return jsonify(result)

@maintenance_bp.route('/', methods=['POST'])
@jwt_required()
def create_maintenance_request():
    """Create a new maintenance request"""
    current_user_id = int(get_jwt_identity())

    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('title'):
        return jsonify({"error": "Title is required"}), 400
    
    # If a property_id is provided, check permissions
    property_id = data.get('property_id')
    if property_id:
        property_user = PropertyUser.query.filter_by(
            property_id=property_id,
            user_id=current_user_id,
            status='active'
        ).first()
        
        if not property_user:
            return jsonify({"error": "Property not found or you don't have permission to create maintenance requests"}), 403
    
    # Create new maintenance request
    new_request = Maintenance(
        user_id=current_user_id,
        property_id=property_id,
        title=data.get('title'),
        description=data.get('description', ''),
        priority=data.get('priority', 'medium'),
        status=data.get('status', 'pending'),
        due_date=datetime.strptime(data.get('due_date'), '%Y-%m-%d').date() if data.get('due_date') else None
    )
    
    db.session.add(new_request)
    db.session.commit()
    
    return jsonify({
        'id': new_request.id,
        'title': new_request.title,
        'message': 'Maintenance request created successfully'
    }), 201

@maintenance_bp.route('/<int:request_id>', methods=['GET'])
@jwt_required()
def get_maintenance_request(request_id):
    """Get a specific maintenance request"""
    current_user_id = int(get_jwt_identity())
    
    maintenance_request = Maintenance.query.filter_by(id=request_id).first()
    if not maintenance_request:
        return jsonify({"error": "Maintenance request not found"}), 404
    
    # Check if user owns the request or has permission on the property
    if maintenance_request.user_id != current_user_id:
        # If associated with a property, check property permissions
        if maintenance_request.property_id:
            property_user = PropertyUser.query.filter_by(
                property_id=maintenance_request.property_id,
                user_id=current_user_id,
                status='active'
            ).first()
            
            if not property_user:
                return jsonify({"error": "You don't have permission to view this maintenance request"}), 403
        else:
            # Not user's request and not associated with a property they have access to
            return jsonify({"error": "Maintenance request not found or access denied"}), 404
    
    result = {
        'id': maintenance_request.id,
        'title': maintenance_request.title,
        'description': maintenance_request.description,
        'priority': maintenance_request.priority,
        'status': maintenance_request.status,
        'due_date': maintenance_request.due_date.isoformat() if maintenance_request.due_date else None,
        'created_at': maintenance_request.created_at.isoformat(),
        'updated_at': maintenance_request.updated_at.isoformat(),
        'completed_at': maintenance_request.completed_at.isoformat() if maintenance_request.completed_at else None,
        'property_id': maintenance_request.property_id
    }
    
    return jsonify(result)

@maintenance_bp.route('/<int:request_id>', methods=['PUT'])
@jwt_required()
def update_maintenance_request(request_id):
    """Update a maintenance request"""
    current_user_id = int(get_jwt_identity())
    
    maintenance_request = Maintenance.query.filter_by(id=request_id).first()
    if not maintenance_request:
        return jsonify({"error": "Maintenance request not found"}), 404
    
    # Check if user owns the request or has permission on the property
    if maintenance_request.user_id != current_user_id:
        # If associated with a property, check property permissions
        if maintenance_request.property_id:
            property_user = PropertyUser.query.filter_by(
                property_id=maintenance_request.property_id,
                user_id=current_user_id,
                status='active'
            ).first()
            
            if not property_user or property_user.role not in ['owner', 'manager']:
                return jsonify({"error": "You don't have permission to update this maintenance request"}), 403
        else:
            # Not user's request and not associated with a property they have access to
            return jsonify({"error": "Maintenance request not found or access denied"}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        maintenance_request.title = data['title']
    
    if 'description' in data:
        maintenance_request.description = data['description']
    
    if 'priority' in data:
        maintenance_request.priority = data['priority']
    
    if 'status' in data:
        # If status is changing to completed, record the completion time
        if data['status'] == 'completed' and maintenance_request.status != 'completed':
            maintenance_request.completed_at = datetime.utcnow()
        maintenance_request.status = data['status']
    
    if 'due_date' in data and data['due_date']:
        maintenance_request.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
    
    # If property_id is being updated, check permissions for new property
    if 'property_id' in data and data['property_id'] != maintenance_request.property_id:
        new_property_id = data['property_id']
        if new_property_id:
            property_user = PropertyUser.query.filter_by(
                property_id=new_property_id,
                user_id=current_user_id,
                status='active'
            ).first()
            
            if not property_user or property_user.role not in ['owner', 'manager']:
                return jsonify({"error": "You don't have permission to move this request to the specified property"}), 403
        
        maintenance_request.property_id = new_property_id
    
    db.session.commit()
    
    return jsonify({
        'id': maintenance_request.id,
        'title': maintenance_request.title,
        'message': 'Maintenance request updated successfully'
    })

@maintenance_bp.route('/<int:request_id>', methods=['DELETE'])
@jwt_required()
def delete_maintenance_request(request_id):
    """Delete a maintenance request"""
    current_user_id = int(get_jwt_identity())
    
    maintenance_request = Maintenance.query.filter_by(id=request_id).first()
    if not maintenance_request:
        return jsonify({"error": "Maintenance request not found"}), 404
    
    # Check if user owns the request or has permission on the property
    if maintenance_request.user_id != current_user_id:
        # If associated with a property, check property permissions
        if maintenance_request.property_id:
            property_user = PropertyUser.query.filter_by(
                property_id=maintenance_request.property_id,
                user_id=current_user_id,
                status='active'
            ).first()
            
            if not property_user or property_user.role not in ['owner', 'manager']:
                return jsonify({"error": "You don't have permission to delete this maintenance request"}), 403
        else:
            # Not user's request and not associated with a property they have access to
            return jsonify({"error": "Maintenance request not found or access denied"}), 404
    
    db.session.delete(maintenance_request)
    db.session.commit()
    
    return jsonify({
        'message': 'Maintenance request deleted successfully'
    })