# models/api_key.py
from app import db
from datetime import datetime
import secrets
import hashlib

class APIKey(db.Model):
    __tablename__ = 'api_keys'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)  # e.g., "Home Assistant", "Mobile App"
    key_hash = db.Column(db.String(255), nullable=False, unique=True)  # Hashed API key
    key_prefix = db.Column(db.String(10), nullable=False)  # First few chars for identification
    scopes = db.Column(db.String(500), default='read:maintenance,write:maintenance')  # Comma-separated permissions
    is_active = db.Column(db.Boolean, default=True)
    last_used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=True)  # Optional expiration

    # Relationships
    user = db.relationship('User', backref=db.backref('api_keys', lazy=True, cascade='all, delete-orphan'))

    @staticmethod
    def generate_key():
        """Generate a secure API key"""
        # Format: pp_live_<32 random hex chars>
        random_part = secrets.token_hex(32)
        return f"pp_live_{random_part}"

    @staticmethod
    def hash_key(key):
        """Hash an API key for storage"""
        return hashlib.sha256(key.encode()).hexdigest()

    def verify_key(self, key):
        """Verify an API key against the stored hash"""
        return self.key_hash == self.hash_key(key)

    def has_scope(self, scope):
        """Check if this API key has a specific scope"""
        if not self.scopes:
            return False
        return scope in self.scopes.split(',')

    def to_dict(self):
        """Return API key info (without the actual key)"""
        return {
            'id': self.id,
            'name': self.name,
            'key_prefix': self.key_prefix,
            'scopes': self.scopes.split(',') if self.scopes else [],
            'is_active': self.is_active,
            'last_used_at': self.last_used_at.isoformat() if self.last_used_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None
        }

    def __repr__(self):
        return f'<APIKey {self.id}: {self.name} ({self.key_prefix}...)>'
