# api/property_users.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.Property_user import PropertyUser
from app.models.property import Property
from app.models.user import User
from app.services.email_service import send_property_invitation_email
from datetime import datetime, timedelta
import uuid

property_users_bp = Blueprint('property_users', __name__)

@property_users_bp.route('/<int:property_id>/users', methods=['GET'])
@jwt_required()
def get_property_users(property_id):
    """Get all users associated with a property"""
    current_user_id = int(get_jwt_identity())
    
    # Check if the current user has permission to view this property's users
    user_property = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        status='active'
    ).first()
    
    if not user_property or user_property.role not in ['owner', 'manager']:
        return jsonify({"error": "You don't have permission to view users for this property"}), 403
    
    # Get all property users
    property_users = PropertyUser.query.filter_by(
        property_id=property_id
    ).all()
    
    result = []
    for pu in property_users:
        user = User.query.get(pu.user_id)
        if user:
            result.append({
                'id': pu.id,
                'user_id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': pu.role,
                'status': pu.status,
                'invited_at': pu.invited_at.isoformat() if pu.invited_at else None,
                'accepted_at': pu.accepted_at.isoformat() if pu.accepted_at else None
            })
    
    return jsonify(result)

@property_users_bp.route('/<int:property_id>/users', methods=['POST'])
@jwt_required()
def invite_user(property_id):
    """Invite a user to a property with a specific role"""
    current_user_id = int(get_jwt_identity())
    
    # Check if the current user is an owner of this property
    user_property = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        role='owner',
        status='active'
    ).first()
    
    if not user_property:
        return jsonify({"error": "You don't have permission to invite users to this property"}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('email') or not data.get('role'):
        return jsonify({"error": "Email and role are required"}), 400
    
    # Validate role
    valid_roles = ['owner', 'manager', 'tenant']
    if data.get('role') not in valid_roles:
        return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
    
    # Check if the property exists
    property = Property.query.get(property_id)
    if not property:
        return jsonify({"error": "Property not found"}), 404
    
    # Check if the user exists
    user = User.query.filter_by(email=data.get('email')).first()
    
    if user:
        # Check if the user is already associated with this property
        existing = PropertyUser.query.filter_by(
            property_id=property_id,
            user_id=user.id
        ).first()
        
        if existing:
            if existing.status == 'active':
                return jsonify({"error": "User is already associated with this property"}), 409
            
            # Update the existing invitation
            existing.role = data.get('role')
            existing.invited_by = current_user_id
            existing.invited_at = datetime.utcnow()
            existing.status = 'pending'
            db.session.commit()
            
            # Send invitation email
            inviter = User.query.get(current_user_id)
            invitation_token = str(uuid.uuid4())
            
            # Save the token temporarily (can also be stored in a separate table)
            existing.invitation_token = invitation_token
            db.session.commit()
            
            # Generate invitation URL
            frontend_url = request.headers.get('Origin', 'http://localhost:3000')
            invitation_url = f"{frontend_url}/accept-invitation?token={invitation_token}"
            
            # Send email
            send_property_invitation_email(
                user=user,
                inviter=inviter,
                property=property,
                role=data.get('role'),
                invitation_url=invitation_url
            )
            
            return jsonify({
                "message": "Invitation updated and sent successfully",
                "property_user_id": existing.id
            })
        
        # Create a new property-user association
        new_property_user = PropertyUser(
            property_id=property_id,
            user_id=user.id,
            role=data.get('role'),
            status='pending',
            invited_by=current_user_id
        )
        
        db.session.add(new_property_user)
        db.session.commit()
        
        # Send invitation email
        inviter = User.query.get(current_user_id)
        invitation_token = str(uuid.uuid4())
        
        # Save the token
        new_property_user.invitation_token = invitation_token
        db.session.commit()
        
        # Generate invitation URL
        frontend_url = request.headers.get('Origin', 'http://localhost:3000')
        invitation_url = f"{frontend_url}/accept-invitation?token={invitation_token}"
        
        # Send email
        send_property_invitation_email(
            user=user,
            inviter=inviter,
            property=property,
            role=data.get('role'),
            invitation_url=invitation_url
        )
        
        return jsonify({
            "message": "Invitation sent successfully",
            "property_user_id": new_property_user.id
        }), 201
    else:
        # User doesn't exist, create a pending invitation
        invitation_token = str(uuid.uuid4())
        expiration = datetime.utcnow() + timedelta(days=7)  # Expires in 7 days
        
        # Create a new PendingInvitation model and import it at the top of your file
        # You'll need to create this model as described earlier
        from app.models.pending_invitation import PendingInvitation
        
        # Create pending invitation
        pending_invitation = PendingInvitation(
            email=data.get('email'),
            property_id=property_id,
            role=data.get('role'),
            invited_by=current_user_id,
            invitation_token=invitation_token,
            expires_at=expiration
        )
        
        db.session.add(pending_invitation)
        db.session.commit()
        
        # Generate invitation URL for registration
        frontend_url = request.headers.get('Origin', 'http://localhost:3000')
        invitation_url = f"{frontend_url}/register?invitation={invitation_token}"
        
        # Send email inviting them to register
        inviter = User.query.get(current_user_id)
        
        # Import the new email function at the top of your file
        from app.services.email_service import send_property_invitation_email_to_new_user
        
        # Send invitation email
        send_property_invitation_email_to_new_user(
            email=data.get('email'),
            inviter=inviter,
            property=property,
            role=data.get('role'),
            invitation_url=invitation_url
        )
        
        return jsonify({
            "message": "Invitation sent to new user",
            "pending_invitation_id": pending_invitation.id
        }), 201
        

@property_users_bp.route('/<int:property_id>/users/<int:property_user_id>', methods=['PUT'])
@jwt_required()
def update_property_user(property_id, property_user_id):
    """Update a user's role for a property"""
    current_user_id = int(get_jwt_identity())
    
    # Check if the current user is an owner of this property
    user_property = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        role='owner',
        status='active'
    ).first()
    
    if not user_property:
        return jsonify({"error": "You don't have permission to update user roles for this property"}), 403
    
    # Get the property user to update
    property_user = PropertyUser.query.filter_by(
        id=property_user_id,
        property_id=property_id
    ).first()
    
    if not property_user:
        return jsonify({"error": "Property user association not found"}), 404
    
    data = request.get_json()
    
    # Validate role if provided
    if 'role' in data:
        valid_roles = ['owner', 'manager', 'tenant']
        if data['role'] not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
        property_user.role = data['role']
    
    # Update other fields if provided
    if 'status' in data:
        valid_statuses = ['active', 'pending', 'declined']
        if data['status'] not in valid_statuses:
            return jsonify({"error": f"Invalid status. Must be one of: {', '.join(valid_statuses)}"}), 400
        property_user.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        "message": "Property user updated successfully",
        "property_user_id": property_user.id,
        "role": property_user.role,
        "status": property_user.status
    })

@property_users_bp.route('/<int:property_id>/users/<int:property_user_id>', methods=['DELETE'])
@jwt_required()
def remove_property_user(property_id, property_user_id):
    """Remove a user's access to a property"""
    current_user_id = int(get_jwt_identity())
    
    # Check if the current user is an owner of this property
    user_property = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=current_user_id,
        role='owner',
        status='active'
    ).first()
    
    if not user_property:
        return jsonify({"error": "You don't have permission to remove users from this property"}), 403
    
    # Get the property user to remove
    property_user = PropertyUser.query.filter_by(
        id=property_user_id,
        property_id=property_id
    ).first()
    
    if not property_user:
        return jsonify({"error": "Property user association not found"}), 404
    
    # Prevent removing oneself
    if property_user.user_id == current_user_id:
        return jsonify({"error": "You cannot remove yourself from the property"}), 400
    
    db.session.delete(property_user)
    db.session.commit()
    
    return jsonify({
        "message": "User removed from property successfully"
    })

@property_users_bp.route('/invitations/accept', methods=['POST'])
@jwt_required()
def accept_invitation():
    """Accept a property invitation"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('token'):
        return jsonify({"error": "Invitation token is required"}), 400
    
    # Find the invitation
    invitation = PropertyUser.query.filter_by(
        user_id=current_user_id,
        status='pending',
        invitation_token=data.get('token')
    ).first()
    
    if not invitation:
        return jsonify({"error": "Invalid or expired invitation"}), 404
    
    # Accept the invitation
    invitation.status = 'active'
    invitation.accepted_at = datetime.utcnow()
    invitation.invitation_token = None  # Clear the token
    
    db.session.commit()
    
    # Get property details
    property = Property.query.get(invitation.property_id)
    
    return jsonify({
        "message": "Invitation accepted successfully",
        "property": {
            "id": property.id,
            "address": property.address,
            "city": property.city,
            "state": property.state
        },
        "role": invitation.role
    })

@property_users_bp.route('/invitations/decline', methods=['POST'])
@jwt_required()
def decline_invitation():
    """Decline a property invitation"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or not data.get('token'):
        return jsonify({"error": "Invitation token is required"}), 400
    
    # Find the invitation
    invitation = PropertyUser.query.filter_by(
        user_id=current_user_id,
        status='pending',
        invitation_token=data.get('token')
    ).first()
    
    if not invitation:
        return jsonify({"error": "Invalid or expired invitation"}), 404
    
    # Decline the invitation
    invitation.status = 'declined'
    invitation.invitation_token = None  # Clear the token
    
    db.session.commit()
    
    return jsonify({
        "message": "Invitation declined successfully"
    })

@property_users_bp.route('/invitations', methods=['GET'])
@jwt_required()
def get_invitations():
    """Get all pending invitations for the current user"""
    current_user_id = int(get_jwt_identity())
    
    invitations = PropertyUser.query.filter_by(
        user_id=current_user_id,
        status='pending'
    ).all()
    
    result = []
    for inv in invitations:
        property = Property.query.get(inv.property_id)
        inviter = User.query.get(inv.invited_by) if inv.invited_by else None
        
        result.append({
            'id': inv.id,
            'property': {
                'id': property.id,
                'address': property.address,
                'city': property.city,
                'state': property.state
            },
            'role': inv.role,
            'invited_by': {
                'id': inviter.id if inviter else None,
                'name': f"{inviter.first_name} {inviter.last_name}" if inviter else "Unknown"
            },
            'invited_at': inv.invited_at.isoformat() if inv.invited_at else None,
            'token': inv.invitation_token
        })
    
    return jsonify(result)


@property_users_bp.route('/<int:property_id>', methods=['GET'])
@jwt_required()
def get_property_users_simple(property_id):
    """Alternative route for getting users by property ID"""
    return get_property_users(property_id)  # Reuse the existing handler


@property_users_bp.route('/<int:property_id>/invite/', methods=['POST'])
@jwt_required()
def invite_user_alt_with_slash(property_id):
    """Alternative route for inviting users (with trailing slash)"""
    return invite_user(property_id)



# For inviteUser
@property_users_bp.route('/<int:property_id>/invite', methods=['POST'])
@jwt_required()
def invite_user_alt(property_id):
    """Alternative route for inviting users"""
    return invite_user(property_id)  # Reuse the existing handler

# For updatePropertyUser and removePropertyUser
@property_users_bp.route('/<int:property_id>/user/<int:user_id>', methods=['PUT', 'DELETE'])
@jwt_required()
def manage_property_user(property_id, user_id):
    """Handle user management operations"""
    if request.method == 'PUT':
        # Simulate updating by property_user_id instead of user_id
        # You'll need to find the property_user record first
        property_user = PropertyUser.query.filter_by(
            property_id=property_id,
            user_id=user_id
        ).first()
        
        if not property_user:
            return jsonify({"error": "Property user association not found"}), 404
            
        return update_property_user(property_id, property_user.id)
    
    elif request.method == 'DELETE':
        # Simulate removing by property_user_id instead of user_id
        property_user = PropertyUser.query.filter_by(
            property_id=property_id,
            user_id=user_id
        ).first()
        
        if not property_user:
            return jsonify({"error": "Property user association not found"}), 404
            
        return remove_property_user(property_id, property_user.id)
    
