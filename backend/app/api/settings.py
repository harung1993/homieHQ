# api/settings.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.settings import Settings  # You'll need to create this model

settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/', methods=['GET'])
@jwt_required()
def get_settings():
    """Get user settings"""
    current_user_id = int(get_jwt_identity())
    
    # Get user settings from database
    settings = Settings.query.filter_by(user_id=current_user_id).first()
    
    if not settings:
        # Create default settings if none exist
        settings = Settings(
            user_id=current_user_id,
            notifications={
                "email_notifications": True,
                "maintenance_reminders": True,
                "payment_reminders": True,
                "project_updates": True,
                "document_updates": False
            },
            appearance={
                "theme": "dark",
                "dashboard_layout": "default"
            }
        )
        db.session.add(settings)
        db.session.commit()
    
    return jsonify({
        "notifications": settings.notifications,
        "appearance": settings.appearance
    }), 200

@settings_bp.route('/notifications', methods=['PUT'])
@jwt_required()
def update_notifications():
    """Update notification settings"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    settings = Settings.query.filter_by(user_id=current_user_id).first()
    
    if not settings:
        # Create settings if none exist
        settings = Settings(
            user_id=current_user_id,
            notifications=data,
            appearance={
                "theme": "dark",
                "dashboard_layout": "default"
            }
        )
        db.session.add(settings)
    else:
        # Update existing settings
        settings.notifications = data
    
    db.session.commit()
    
    return jsonify({
        "message": "Notification settings updated successfully",
        "notifications": settings.notifications
    }), 200

@settings_bp.route('/appearance', methods=['PUT'])
@jwt_required()
def update_appearance():
    """Update appearance settings"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    settings = Settings.query.filter_by(user_id=current_user_id).first()
    
    if not settings:
        # Create settings if none exist
        settings = Settings(
            user_id=current_user_id,
            notifications={
                "email_notifications": True,
                "maintenance_reminders": True,
                "payment_reminders": True,
                "project_updates": True,
                "document_updates": False
            },
            appearance=data
        )
        db.session.add(settings)
    else:
        # Update existing settings
        settings.appearance = data
    
    db.session.commit()
    
    return jsonify({
        "message": "Appearance settings updated successfully",
        "appearance": settings.appearance
    }), 200


@settings_bp.route('/timezone', methods=['PUT'])
@jwt_required()
def update_timezone():
    """Update user timezone"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    if not data or 'timezone' not in data:
        return jsonify({"error": "Timezone is required"}), 400
    
    user = User.query.get(current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    user.timezone = data['timezone']
    db.session.commit()
    
    return jsonify({
        "message": "Timezone updated successfully",
        "timezone": user.timezone
    }), 200