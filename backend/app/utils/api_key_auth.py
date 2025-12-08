# utils/api_key_auth.py
from functools import wraps
from flask import request, jsonify, current_app
from app import db
from app.models.api_key import APIKey
from datetime import datetime

def require_api_key(required_scope=None):
    """
    Decorator to require API key authentication

    Usage:
        @require_api_key()  # Just check for valid key
        @require_api_key('read:maintenance')  # Require specific scope
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Get API key from header
            auth_header = request.headers.get('Authorization')
            api_key = request.headers.get('X-API-Key')

            # Try Authorization: Bearer <key> or X-API-Key: <key>
            if auth_header and auth_header.startswith('Bearer '):
                api_key = auth_header.replace('Bearer ', '', 1)

            if not api_key:
                return jsonify({'error': 'API key required'}), 401

            # Validate API key format
            if not api_key.startswith('pp_live_'):
                return jsonify({'error': 'Invalid API key format'}), 401

            # Hash and look up the key
            key_hash = APIKey.hash_key(api_key)
            api_key_obj = APIKey.query.filter_by(key_hash=key_hash).first()

            if not api_key_obj:
                return jsonify({'error': 'Invalid API key'}), 401

            # Check if key is active
            if not api_key_obj.is_active:
                return jsonify({'error': 'API key is inactive'}), 401

            # Check if key is expired
            if api_key_obj.expires_at and api_key_obj.expires_at < datetime.utcnow():
                return jsonify({'error': 'API key has expired'}), 401

            # Check scope if required
            if required_scope and not api_key_obj.has_scope(required_scope):
                return jsonify({'error': f'API key missing required scope: {required_scope}'}), 403

            # Update last used timestamp
            api_key_obj.last_used_at = datetime.utcnow()
            db.session.commit()

            # Add user and api_key to request context
            request.api_user_id = api_key_obj.user_id
            request.api_key_obj = api_key_obj

            return f(*args, **kwargs)

        return decorated_function
    return decorator


def get_api_user_id():
    """Get the user ID from the current API request context"""
    return getattr(request, 'api_user_id', None)


def get_api_key_obj():
    """Get the API key object from the current request context"""
    return getattr(request, 'api_key_obj', None)
