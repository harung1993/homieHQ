# models/pending_invitation.py
from app import db
from datetime import datetime

class PendingInvitation(db.Model):
    __tablename__ = 'pending_invitations'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    invited_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    invitation_token = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    expires_at = db.Column(db.DateTime, nullable=False)
    
    # Relationships
    property = db.relationship('Property')
    inviter = db.relationship('User')
    
    def __repr__(self):
        return f'<PendingInvitation {self.id}: {self.email} for Property {self.property_id}>'