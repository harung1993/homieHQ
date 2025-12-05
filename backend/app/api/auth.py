from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from app import db
from app.services.email_service import send_password_reset_email,send_welcome_email,send_verification_email
import secrets
from datetime import datetime, timedelta
from app.models.pending_invitation import PendingInvitation
from app.models.Property_user import PropertyUser

# Create blueprint
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Check if required fields are provided
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data.get('email')).first():
        return jsonify({"error": "User already exists"}), 409
    
    # Create new user
    new_user = User(
        email=data.get('email'),
        first_name=data.get('first_name', ''),
        last_name=data.get('last_name', ''),
        phone=data.get('phone', ''),
        email_verified=False  # Default to unverified
    )
    new_user.password = data.get('password')  # This will use the password setter method to hash
    
    # Generate verification token
    verification_token = secrets.token_urlsafe(32)
    new_user.verification_token = verification_token
    new_user.verification_token_expiry = datetime.utcnow() + timedelta(hours=24)
    
    # Save user to database
    db.session.add(new_user)
    db.session.commit()
    
    # Check for pending invitations for this email
    invitation_token = data.get('invitation_token')
    
    if invitation_token:
        # Look for specific invitation if token provided
        pending_invitation = PendingInvitation.query.filter_by(
            invitation_token=invitation_token,
            email=data.get('email')
        ).filter(PendingInvitation.expires_at > datetime.utcnow()).first()
    else:
        # Otherwise check for any invitations for this email
        pending_invitation = PendingInvitation.query.filter_by(
            email=data.get('email')
        ).filter(PendingInvitation.expires_at > datetime.utcnow()).first()
    
    if pending_invitation:
        # Create property association
        property_user = PropertyUser(
            property_id=pending_invitation.property_id,
            user_id=new_user.id,
            role=pending_invitation.role,
            status='active',  # Automatically activate it
            invited_by=pending_invitation.invited_by,
            accepted_at=datetime.utcnow()
        )
        
        db.session.add(property_user)
        
        # Delete the pending invitation
        db.session.delete(pending_invitation)
        db.session.commit()
    
    # Generate verification URL
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    verification_url = f"{frontend_url}/verify-email?token={verification_token}"
    
    # Send verification email instead of welcome email initially
    send_verification_email(new_user, verification_url)
    
    return jsonify({
        "message": "User registered successfully. Please check your email to verify your account.",
        "user_id": new_user.id,
        "invitation_processed": pending_invitation is not None
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user and return JWT token"""
    data = request.get_json()
    
    # Check if required fields are provided
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"error": "Email and password are required"}), 400
    
    # Check if user exists
    user = User.query.filter_by(email=data.get('email')).first()
    if not user or not user.verify_password(data.get('password')):
        return jsonify({"error": "Invalid credentials"}), 401
    
    # Check if email is verified (skip in development mode)
    # Skip email verification check in development/debug mode
    if not current_app.config.get('DEBUG', False):
        if not user.email_verified:
            return jsonify({"error": "Please verify your email address before logging in", "email_verified": False}), 401
    
    # Create access and refresh tokens - Convert to string
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email_verified": user.email_verified
        }
    }), 200

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user_id = get_jwt_identity()
    access_token = create_access_token(identity=str(current_user_id))
    
    return jsonify({
        "access_token": access_token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_user():
    """Get current authenticated user's information"""
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

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Generate a password reset token and send reset email"""
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=data.get('email')).first()
    
    # Always return success message even if email doesn't exist (for security)
    if not user:
        return jsonify({
            "message": "If an account with that email exists, a password reset link has been sent."
        }), 200
    
    # Generate a secure random token
    reset_token = secrets.token_urlsafe(32)
    
    # Set token expiry (60 minutes from now)
    reset_token_expiry = datetime.utcnow() + timedelta(minutes=60)
    
    # Save token to user
    user.reset_token = reset_token
    user.reset_token_expiry = reset_token_expiry
    db.session.commit()
    
    # Generate reset URL - this should be your frontend URL
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"
    
    # Send password reset email
    send_password_reset_email(user, reset_url)
    
    return jsonify({
        "message": "If an account with that email exists, a password reset link has been sent."
    }), 200

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    """Reset user password using token"""
    data = request.get_json()
    
    if not data or not data.get('token') or not data.get('password'):
        return jsonify({"error": "Token and new password are required"}), 400
    
    # Find user with this token
    user = User.query.filter_by(reset_token=data.get('token')).first()
    
    # Check if user exists and token is valid/not expired
    if not user or not user.reset_token_expiry or user.reset_token_expiry < datetime.utcnow():
        return jsonify({"error": "Invalid or expired reset token"}), 400
    
    # Update password
    user.password = data.get('password')
    
    # Clear reset token and expiry
    user.reset_token = None
    user.reset_token_expiry = None
    
    db.session.commit()
    
    return jsonify({
        "message": "Password has been reset successfully. You can now log in with your new password."
    }), 200

@auth_bp.route('/verify-email', methods=['POST'])
def verify_email():
    """Verify user email with token"""
    data = request.get_json()
    
    if not data or not data.get('token'):
        return jsonify({"error": "Verification token is required"}), 400
    
    # Find user with this verification token
    user = User.query.filter_by(verification_token=data.get('token')).first()
    
    # Check if user exists and token is valid/not expired
    if not user or not user.verification_token_expiry or user.verification_token_expiry < datetime.utcnow():
        return jsonify({"error": "Invalid or expired verification token"}), 400
    
    # Mark email as verified
    user.email_verified = True
    
    # Clear verification token and expiry
    user.verification_token = None
    user.verification_token_expiry = None
    
    db.session.commit()
    
    # Now send the welcome email since the user is verified
    send_welcome_email(user)
    
    return jsonify({
        "message": "Email verified successfully. You can now log in to your account."
    }), 200

@auth_bp.route('/resend-verification', methods=['POST'])
def resend_verification():
    """Resend verification email"""
    data = request.get_json()
    
    if not data or not data.get('email'):
        return jsonify({"error": "Email is required"}), 400
    
    user = User.query.filter_by(email=data.get('email')).first()
    
    # Don't disclose if the email exists or not
    if not user or user.email_verified:
        return jsonify({
            "message": "If your email is registered and not verified, a new verification link has been sent."
        }), 200
    
    # Generate new verification token
    verification_token = secrets.token_urlsafe(32)
    user.verification_token = verification_token
    user.verification_token_expiry = datetime.utcnow() + timedelta(hours=24)
    
    db.session.commit()
    
    # Generate verification URL
    frontend_url = current_app.config.get('FRONTEND_URL', 'http://localhost:3000')
    verification_url = f"{frontend_url}/verify-email?token={verification_token}"
    
    # Send verification email
    send_verification_email(user, verification_url)
    
    return jsonify({
        "message": "If your email is registered and not verified, a new verification link has been sent."
    }), 200