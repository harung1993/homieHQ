# models/appliance.py
from app import db
from datetime import datetime

class Appliance(db.Model):
    __tablename__ = 'appliances'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    brand = db.Column(db.String(100), nullable=True)
    model = db.Column(db.String(100), nullable=True)
    serial_number = db.Column(db.String(100), nullable=True)
    purchase_date = db.Column(db.Date, nullable=True)
    warranty_expiration = db.Column(db.Date, nullable=True)
    location = db.Column(db.String(100), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='appliances')
    property = db.relationship('Property', back_populates='appliances')
    documents = db.relationship('Document', back_populates='appliance', cascade='all, delete-orphan')

    def __repr__(self):
        return f'<Appliance {self.id}: {self.name}>'