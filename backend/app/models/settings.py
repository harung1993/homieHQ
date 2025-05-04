# models/settings.py
from app import db
from datetime import datetime
import json

class Settings(db.Model):
    __tablename__ = 'user_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    _notifications = db.Column('notifications', db.Text, nullable=False, default='{}')
    _appearance = db.Column('appearance', db.Text, nullable=False, default='{}')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Define relationship with user
    user = db.relationship('User', back_populates='settings')
    
    @property
    def notifications(self):
        return json.loads(self._notifications)
    
    @notifications.setter
    def notifications(self, value):
        self._notifications = json.dumps(value)
    
    @property
    def appearance(self):
        return json.loads(self._appearance)
    
    @appearance.setter
    def appearance(self, value):
        self._appearance = json.dumps(value)
    
    def __repr__(self):
        return f'<Settings {self.id} for User {self.user_id}>'