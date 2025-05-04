# api/users.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models.user import User
from app.models.settings import Settings  # You'll need to create this model

users_bp = Blueprint('users', __name__)

@users_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile information"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone
    }), 200

@users_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if 'first_name' in data:
        user.first_name = data['first_name']
    
    if 'last_name' in data:
        user.last_name = data['last_name']
    
    if 'phone' in data:
        user.phone = data['phone']
    
    # Update email only if it's different and not already taken
    if 'email' in data and data['email'] != user.email:
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user:
            return jsonify({"error": "Email already in use"}), 400
        user.email = data['email']
    
    db.session.commit()
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone
        }
    }), 200

@users_bp.route('/password', methods=['PUT'])
@jwt_required()
def update_password():
    """Update user password"""
    current_user_id = int(get_jwt_identity())
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    if not data or not data.get('current_password') or not data.get('new_password'):
        return jsonify({"error": "Current password and new password are required"}), 400
    
    # Verify current password
    if not user.verify_password(data.get('current_password')):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # Update password
    user.password = data.get('new_password')
    db.session.commit()
    
    return jsonify({"message": "Password updated successfully"}), 200