#  models/maintenance_checklist.py 
from app import db
from datetime import datetime

class MaintenanceChecklistItem(db.Model):
    __tablename__ = 'maintenance_checklist_items'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=True)
    task = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    season = db.Column(db.String(20), nullable=False)  # Spring, Summer, Fall, Winter
    is_completed = db.Column(db.Boolean, default=False)
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_default = db.Column(db.Boolean, default=True)
    
    # Relationships
    user = db.relationship('User', backref=db.backref('checklist_items', lazy=True))
    property = db.relationship('Property', backref=db.backref('checklist_items', lazy=True))
    
    def __repr__(self):
        return f'<ChecklistItem {self.id}: {self.task}>'