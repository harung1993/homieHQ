# models/finance.py
from app import db
from datetime import datetime

class Expense(db.Model):
    __tablename__ = 'expenses'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255), nullable=False)
    # Keep same column name but use Integer instead of Numeric
    amount = db.Column(db.Integer, nullable=False)  # Store in cents
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text)
    recurring = db.Column(db.Boolean, default=False)
    recurring_interval = db.Column(db.String(20))
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = db.relationship('Property', back_populates='expenses')
    user = db.relationship('User', back_populates='expenses')
    
    def __repr__(self):
        return f'<Expense {self.id}: {self.title}>'
    
    # Helper methods for conversion
    def get_amount_dollars(self):
        return self.amount / 100.0 if self.amount is not None else None
    
    def set_amount_dollars(self, dollars):
        self.amount = int(float(dollars) * 100) if dollars is not None else None
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'amount': self.get_amount_dollars(),  # Convert to dollars for API
            'category': self.category,
            'date': self.date.isoformat() if self.date else None,
            'description': self.description,
            'recurring': self.recurring,
            'recurring_interval': self.recurring_interval,
            'property_id': self.property_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Budget(db.Model):
    __tablename__ = 'budgets'
    
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(50), nullable=False)
    # Keep same column name but use Integer instead of Numeric
    amount = db.Column(db.Integer, nullable=False)  # Store in cents
    month = db.Column(db.Integer, nullable=False)  # 1-12
    year = db.Column(db.Integer, nullable=False)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    property = db.relationship('Property', back_populates='budgets')
    user = db.relationship('User', back_populates='budgets')
    
    # Define unique constraint
    __table_args__ = (
        db.UniqueConstraint('category', 'month', 'year', 'property_id', name='uq_budget_category_month_year_property'),
    )
    
    # Helper methods for conversion
    def get_amount_dollars(self):
        return self.amount / 100.0 if self.amount is not None else None
    
    def set_amount_dollars(self, dollars):
        self.amount = int(float(dollars) * 100) if dollars is not None else None
    
    def __repr__(self):
        return f'<Budget {self.id}: {self.category} ({self.month}/{self.year})>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'category': self.category,
            'amount': self.get_amount_dollars(),  # Convert to dollars for API
            'month': self.month,
            'year': self.year,
            'property_id': self.property_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }