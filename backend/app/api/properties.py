from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.property import Property
from app.models.user import User
from app.models.Property_user import PropertyUser
from app import db
from datetime import datetime

properties_bp = Blueprint('properties', __name__)

@properties_bp.route('/', methods=['GET'])
@jwt_required()
def get_properties():
    """Get all properties for the current user"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Get property associations for this user
    property_associations = PropertyUser.query.filter_by(
        user_id=current_user_id,
        status='active'
    ).all()
    
    property_ids = [assoc.property_id for assoc in property_associations]
    
    # Get all properties based on associations
    properties = Property.query.filter(Property.id.in_(property_ids)).all()
    
    # Convert properties to JSON format
    properties_data = []
    for prop in properties:
        # Get the user's role for this property
        association = next((a for a in property_associations if a.property_id == prop.id), None)
        role = association.role if association else None
        
        properties_data.append({
            'id': prop.id,
            'address': prop.address,
            'city': prop.city,
            'state': prop.state,
            'zip': prop.zip,
            'property_type': prop.property_type,
            'status': prop.status,
            'purchase_date': prop.purchase_date.isoformat() if prop.purchase_date else None,
            'purchase_price': prop.purchase_price,
            'current_value': prop.current_value,
            'bedrooms': prop.bedrooms,
            'bathrooms': prop.bathrooms,
            'square_footage': prop.square_footage,
            'is_primary_residence': prop.is_primary_residence,
            'created_at': prop.created_at.isoformat(),
            'role': role  # Add user's role for this property
        })
    
    return jsonify(properties_data), 200

@properties_bp.route('/', methods=['POST'])
@jwt_required()
def create_property():
    """Create a new property"""
    current_user_id = int(get_jwt_identity())

    data = request.get_json()
    
    # Validate required fields
    required_fields = ['address', 'city', 'state', 'zip', 'property_type']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Create new property
    new_property = Property(
        user_id=current_user_id,
        address=data['address'],
        city=data['city'],
        state=data['state'],
        zip=data['zip'],
        property_type=data['property_type'],
        status=data.get('status', 'active'),
        bedrooms=data.get('bedrooms'),
        bathrooms=data.get('bathrooms'),
        square_footage=data.get('square_footage'),
        purchase_date=data.get('purchase_date'),
        purchase_price=data.get('purchase_price'),
        current_value=data.get('current_value'),
        description=data.get('description', '')
    )
    
    db.session.add(new_property)
    db.session.commit()
    
    # After creating the property, make the current user an owner
    property_user = PropertyUser(
        property_id=new_property.id,
        user_id=current_user_id,
        role='owner',
        status='active',
        accepted_at=datetime.utcnow()
    )
    db.session.add(property_user)
    db.session.commit()
    
    return jsonify({
        'id': new_property.id,
        'address': new_property.address,
        'message': 'Property created successfully'
    }), 201

@properties_bp.route('/<int:property_id>', methods=['GET'])
@jwt_required()
def get_property(property_id):
    """Get a specific property by ID"""
    current_user_id = int(get_jwt_identity())
    
    # Check if user has access to this property through PropertyUser
    property_user = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        status='active'
    ).first()
    
    if not property_user:
        return jsonify({"error": "Property not found or you don't have permission to access it"}), 404
    
    # Find the property
    property = Property.query.get(property_id)
    
    if not property:
        return jsonify({"error": "Property not found"}), 404
    
    # Convert property to JSON format
    property_data = {
        'id': property.id,
        'address': property.address,
        'city': property.city,
        'state': property.state,
        'zip': property.zip,
        'property_type': property.property_type,
        'status': property.status,
        'purchase_date': property.purchase_date.isoformat() if property.purchase_date else None,
        'purchase_price': property.purchase_price,
        'current_value': property.current_value,
        'bedrooms': property.bedrooms,
        'bathrooms': property.bathrooms,
        'square_footage': property.square_footage,
        'created_at': property.created_at.isoformat(),
        'role': property_user.role  # Add user's role for this property
    }
    
    return jsonify(property_data), 200

@properties_bp.route('/<int:property_id>', methods=['PUT'])
@jwt_required()
def update_property(property_id):
    """Update an existing property"""
    current_user_id = int(get_jwt_identity())
    
    # Check if user has permission to update this property
    property_user = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        status='active'
    ).first()
    
    if not property_user or property_user.role not in ['owner', 'manager']:
        return jsonify({"error": "You don't have permission to update this property"}), 403
    
    data = request.get_json()
    
    # Find the property
    property = Property.query.get(property_id)
    
    if not property:
        return jsonify({"error": "Property not found"}), 404
    
    # Update property fields if provided in the request
    if 'address' in data:
        property.address = data['address']
    if 'city' in data:
        property.city = data['city']
    if 'state' in data:
        property.state = data['state']
    if 'zip' in data:
        property.zip = data['zip']
    if 'property_type' in data:
        property.property_type = data['property_type']
    if 'status' in data:
        property.status = data['status']
    if 'bedrooms' in data:
        property.bedrooms = data['bedrooms']
    if 'bathrooms' in data:
        property.bathrooms = data['bathrooms']
    if 'square_footage' in data:
        property.square_footage = data['square_footage']
    if 'purchase_date' in data:
        property.purchase_date = data['purchase_date']
    if 'purchase_price' in data:
        property.purchase_price = data['purchase_price']
    if 'current_value' in data:
        property.current_value = data['current_value']
    if 'description' in data:
        property.description = data['description']
    
    db.session.commit()
    
    return jsonify({
        'id': property.id,
        'message': 'Property updated successfully'
    }), 200

@properties_bp.route('/<int:property_id>', methods=['DELETE'])
@jwt_required()
def delete_property(property_id):
    """Delete a property"""
    current_user_id = int(get_jwt_identity())
    
    # Check if user has permission to delete this property
    property_user = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        status='active',
        role='owner'  # Only owners can delete properties
    ).first()
    
    if not property_user:
        return jsonify({"error": "Property not found or you don't have permission to delete it"}), 403
    
    # Find the property
    property = Property.query.get(property_id)
    
    if not property:
        return jsonify({"error": "Property not found"}), 404
    
    # Delete all property user associations first
    PropertyUser.query.filter_by(property_id=property_id).delete()
    
    # Then delete the property
    db.session.delete(property)
    db.session.commit()
    
    return jsonify({
        'message': 'Property deleted successfully'
    }), 200


@properties_bp.route('/<int:property_id>/set-primary', methods=['POST'])
@jwt_required()
def set_primary_residence(property_id):
    """Set a property as primary residence"""
    current_user_id = int(get_jwt_identity())
    
    # Check if user has access to this property
    property_user = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        status='active'
    ).first()
    
    if not property_user:
        return jsonify({"error": "Property not found or access denied"}), 404
    
    # Find the property
    property = Property.query.get(property_id)
    
    if not property:
        return jsonify({"error": "Property not found"}), 404
    
    # Clear any existing primary residence
    user_property_ids = [pu.property_id for pu in PropertyUser.query.filter_by(
        user_id=current_user_id,
        status='active'
    ).all()]
    
    properties = Property.query.filter(
        Property.id.in_(user_property_ids),
        Property.is_primary_residence == True
    ).all()
    
    for prop in properties:
        prop.is_primary_residence = False
    
    # Set this property as primary
    property.is_primary_residence = True
    
    db.session.commit()
    
    return jsonify({
        'id': property.id,
        'address': property.address,
        'message': 'Property set as primary residence successfully'
    })