# services/email_service.py
from flask import current_app, render_template
from flask_mail import Message
from app import mail
import os
from threading import Thread

def send_async_email(app, msg):
    """Send email asynchronously"""
    with app.app_context():
        mail.send(msg)

def send_email(subject, recipients, html_body, sender=None):
    """Send an email"""
    app = current_app._get_current_object()
    msg = Message(subject, 
                 sender=sender or current_app.config['MAIL_DEFAULT_SENDER'],
                 recipients=recipients)
    msg.html = html_body
    
    # Send email asynchronously to not block the request
    Thread(target=send_async_email, args=(app, msg)).start()

def send_password_reset_email(user, reset_url):
    """Send password reset email to user"""
    subject = "Password Reset Request"
    recipients = [user.email]
    
    # Create HTML content for the email
    html_body = f"""
    <h1>Password Reset</h1>
    <p>Hello {user.first_name or 'there'},</p>
    <p>You requested a password reset for your PropertyPal account.</p>
    <p>Please click on the following link to reset your password:</p>
    <p><a href="{reset_url}">Reset your password</a></p>
    <p>If you did not request a password reset, please ignore this email.</p>
    <p>This link will expire in 60 minutes.</p>
    <p>Thank you,<br>The PropertyPal Team</p>
    """
    
    send_email(subject, recipients, html_body)


def send_welcome_email(user):
    """Send welcome email to newly registered user"""
    subject = "Welcome to PropertyPal!"
    recipients = [user.email]
    
    # Create HTML content for the welcome email
    html_body = f"""
    <h1>Welcome to PropertyPal!</h1>
    <p>Hello {user.first_name or 'there'},</p>
    <p>Thank you for registering with PropertyPal. We're excited to have you on board!</p>
    <p>With PropertyPal, you can:</p>
    <ul>
        <li>Track all your properties in one place</li>
        <li>Manage maintenance requests</li>
        <li>Store important documents securely</li>
        <li>Track expenses and income</li>
        <li>And much more!</li>
    </ul>
    <p>If you have any questions or need help getting started, please don't hesitate to contact our support team.</p>
    <p>Best regards,<br>The PropertyPal Team</p>
    """
    
    send_email(subject, recipients, html_body)

def send_verification_email(user, verification_url):
    """Send email verification link to new user"""
    subject = "Verify Your Email for PropertyPal"
    recipients = [user.email]
    
    # Create HTML content for the verification email
    html_body = f"""
    <h1>Email Verification</h1>
    <p>Hello {user.first_name or 'there'},</p>
    <p>Thank you for registering with PropertyPal. To complete your registration, please verify your email:</p>
    <p><a href="{verification_url}">Verify your email address</a></p>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create this account, please ignore this email.</p>
    <p>Best regards,<br>The PropertyPal Team</p>
    """
    
    send_email(subject, recipients, html_body)

def send_property_invitation_email(user, inviter, property, role, invitation_url):
    """Send property invitation email to a user"""
    subject = f"Invitation to join a property on PropertyPal"
    recipients = [user.email]
    
    inviter_name = f"{inviter.first_name} {inviter.last_name}" if inviter.first_name and inviter.last_name else inviter.email
    
    # Create HTML content for the email
    html_body = f"""
    <h1>Property Invitation</h1>
    <p>Hello {user.first_name or 'there'},</p>
    <p>{inviter_name} has invited you to join their property as a <strong>{role}</strong>.</p>
    <p>Property Details:</p>
    <ul>
        <li>Address: {property.address}</li>
        <li>City: {property.city}, {property.state}</li>
    </ul>
    <p>To accept this invitation, please click the link below:</p>
    <p><a href="{invitation_url}">Accept Invitation</a></p>
    <p>If you did not expect this invitation, you can safely ignore this email.</p>
    <p>Thank you,<br>The PropertyPal Team</p>
    """
    
    send_email(subject, recipients, html_body)


def send_property_invitation_email_to_new_user(email, inviter, property, role, invitation_url):
    """Send property invitation email to a non-registered user inviting them to register"""
    subject = f"Invitation to join PropertyPal and manage a property"
    recipients = [email]
    
    inviter_name = f"{inviter.first_name} {inviter.last_name}" if inviter.first_name and inviter.last_name else inviter.email
    
    # Create HTML content for the email
    html_body = f"""
    <h1>Property Invitation</h1>
    <p>Hello,</p>
    <p>{inviter_name} has invited you to join PropertyPal as a <strong>{role}</strong> for their property.</p>
    <p>Property Details:</p>
    <ul>
        <li>Address: {property.address}</li>
        <li>City: {property.city}, {property.state}</li>
    </ul>
    <p>To accept this invitation, please register for an account using the link below:</p>
    <p><a href="{invitation_url}">Register and Accept Invitation</a></p>
    <p>This invitation link will expire in 7 days.</p>
    <p>Thank you,<br>The PropertyPal Team</p>
    """
    
    send_email(subject, recipients, html_body)