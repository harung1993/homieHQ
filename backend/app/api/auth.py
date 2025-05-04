from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from app.models.user import User
from app import db

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
    )
    new_user.password = data.get('password')  # This will use the password setter method to hash
    
    # Save user to database
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "message": "User registered successfully",
        "user_id": new_user.id
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
            "last_name": user.last_name
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
