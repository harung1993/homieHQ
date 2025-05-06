# models/property_user.py
from app import db
from datetime import datetime

class PropertyUser(db.Model):
    __tablename__ = 'property_users'
    
    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='tenant')  # owner, manager, tenant
    status = db.Column(db.String(20), nullable=False, default='pending')  # active, pending, declined
    invited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    invited_at = db.Column(db.DateTime, default=datetime.utcnow)
    accepted_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = db.relationship('Property', back_populates='property_users')
    user = db.relationship('User', foreign_keys=[user_id], back_populates='property_associations')
    inviter = db.relationship('User', foreign_keys=[invited_by], backref='invitations_sent')
    invitation_token = db.Column(db.String(255), nullable=True)
    # Unique constraint to prevent duplicate property-user associations
    __table_args__ = (
        db.UniqueConstraint('property_id', 'user_id', name='uq_property_user'),
    )
    
    def __repr__(self):
        return f'<PropertyUser {self.id}: User {self.user_id} is {self.role} for Property {self.property_id}>'