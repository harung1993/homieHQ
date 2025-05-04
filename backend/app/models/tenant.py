# models/tenant.py
from app import db
from datetime import datetime

class Tenant(db.Model):
    __tablename__ = 'tenants'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    lease_start = db.Column(db.Date, nullable=True)
    lease_end = db.Column(db.Date, nullable=True)
    monthly_rent = db.Column(db.Float, nullable=True)
    security_deposit = db.Column(db.Float, nullable=True)
    rent_paid_through = db.Column(db.Date, nullable=True)
    emergency_contact_name = db.Column(db.String(100), nullable=True)
    emergency_contact_phone = db.Column(db.String(20), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='active')  # active, former, prospective
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='tenants')
    property = db.relationship('Property', back_populates='tenants')
    documents = db.relationship('Document', back_populates='tenant', cascade='all, delete-orphan')
    
    def __repr__(self):
        return f'<Tenant {self.id}: {self.first_name} {self.last_name}>'