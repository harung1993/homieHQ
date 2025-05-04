from app import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=True)
    last_name = db.Column(db.String(100), nullable=True)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(20), default='user')  # user, admin, property_manager
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationship with properties
    properties = db.relationship('Property', back_populates='user', cascade='all, delete-orphan')
    documents = db.relationship('Document', back_populates='user', cascade='all, delete-orphan')
    maintenance_requests = db.relationship('Maintenance', back_populates='user', cascade='all, delete-orphan')
    appliances = db.relationship('Appliance', back_populates='user', cascade='all, delete-orphan')
    projects = db.relationship('Project', back_populates='user', cascade='all, delete-orphan')
    tenants = db.relationship('Tenant', back_populates='user', cascade='all, delete-orphan')
    expenses = db.relationship('Expense', back_populates='user', cascade='all, delete-orphan')
    budgets = db.relationship('Budget', back_populates='user', cascade='all, delete-orphan')
    settings = db.relationship('Settings', back_populates='user', uselist=False, cascade='all, delete-orphan')
    @property
    def password(self):
        raise AttributeError('password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.id}: {self.email}>'