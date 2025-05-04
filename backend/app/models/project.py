# models/project.py
from app import db
from datetime import datetime

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='planning')  # planning, in-progress, on-hold, completed
    budget = db.Column(db.Float, nullable=True)
    spent = db.Column(db.Float, nullable=True)
    start_date = db.Column(db.Date, nullable=True)
    projected_end_date = db.Column(db.Date, nullable=True)
    completed_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='projects')
    property = db.relationship('Property', back_populates='projects')
    
    def __repr__(self):
        return f'<Project {self.id}: {self.name}>'