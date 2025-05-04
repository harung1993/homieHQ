# api/tenants.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.tenant import Tenant
from app.models.property import Property
from app.models.document import Document
from app.models.user import User
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime, timedelta
from flask import current_app
from app.utils.constants import DOCUMENT_CATEGORIES, TENANT_DOCUMENT_CATEGORY_CHOICES

# Create the blueprint
tenants_bp = Blueprint('tenants', __name__)

# Constants
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'}

# Helper function to check file extension
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@tenants_bp.route('/', methods=['GET'])
@jwt_required()
def get_tenants():
    """Get all tenants for the current user"""
    current_user_id = int(get_jwt_identity())
    property_id = request.args.get('property_id')
    
    query = Tenant.query.filter_by(user_id=current_user_id)
    
    if property_id:
        query = query.filter_by(property_id=property_id)
    
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    tenants = query.order_by(Tenant.created_at.desc()).all()
    
    result = []
    for tenant in tenants:
        result.append({
            'id': tenant.id,
            'property_id': tenant.property_id,
            'first_name': tenant.first_name,
            'last_name': tenant.last_name,
            'email': tenant.email,
            'phone': tenant.phone,
            'lease_start': tenant.lease_start.isoformat() if tenant.lease_start else None,
            'lease_end': tenant.lease_end.isoformat() if tenant.lease_end else None,
            'monthly_rent': tenant.monthly_rent,
            'security_deposit': tenant.security_deposit,
            'rent_paid_through': tenant.rent_paid_through.isoformat() if tenant.rent_paid_through else None,
            'emergency_contact_name': tenant.emergency_contact_name,
            'emergency_contact_phone': tenant.emergency_contact_phone,
            'notes': tenant.notes,
            'status': tenant.status,
            'created_at': tenant.created_at.isoformat(),
            'updated_at': tenant.updated_at.isoformat()
        })
    
    return jsonify(result)

@tenants_bp.route('/', methods=['POST'])
@jwt_required()
def create_tenant():
    """Add a new tenant"""
    current_user_id = int(get_jwt_identity())
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['property_id', 'first_name', 'last_name', 'email']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Verify property exists and belongs to the current user
    property = Property.query.filter_by(id=data.get('property_id'), user_id=current_user_id).first()
    if not property:
        return jsonify({"error": "Property not found or access denied"}), 404
    
    # Create new tenant
    new_tenant = Tenant(
        user_id=current_user_id,
        property_id=data.get('property_id'),
        first_name=data.get('first_name'),
        last_name=data.get('last_name'),
        email=data.get('email'),
        phone=data.get('phone', ''),
        lease_start=datetime.strptime(data.get('lease_start'), '%Y-%m-%d').date() if data.get('lease_start') else None,
        lease_end=datetime.strptime(data.get('lease_end'), '%Y-%m-%d').date() if data.get('lease_end') else None,
        monthly_rent=data.get('monthly_rent'),
        security_deposit=data.get('security_deposit'),
        rent_paid_through=datetime.strptime(data.get('rent_paid_through'), '%Y-%m-%d').date() if data.get('rent_paid_through') else None,
        emergency_contact_name=data.get('emergency_contact_name', ''),
        emergency_contact_phone=data.get('emergency_contact_phone', ''),
        notes=data.get('notes', ''),
        status=data.get('status', 'active')
    )
    
    db.session.add(new_tenant)
    db.session.commit()
    
    return jsonify({
        'id': new_tenant.id,
        'name': f"{new_tenant.first_name} {new_tenant.last_name}",
        'message': 'Tenant added successfully'
    }), 201

@tenants_bp.route('/<int:tenant_id>', methods=['GET'])
@jwt_required()
def get_tenant(tenant_id):
    """Get a specific tenant"""
    current_user_id = int(get_jwt_identity())
    
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    result = {
        'id': tenant.id,
        'property_id': tenant.property_id,
        'first_name': tenant.first_name,
        'last_name': tenant.last_name,
        'email': tenant.email,
        'phone': tenant.phone,
        'lease_start': tenant.lease_start.isoformat() if tenant.lease_start else None,
        'lease_end': tenant.lease_end.isoformat() if tenant.lease_end else None,
        'monthly_rent': tenant.monthly_rent,
        'security_deposit': tenant.security_deposit,
        'rent_paid_through': tenant.rent_paid_through.isoformat() if tenant.rent_paid_through else None,
        'emergency_contact_name': tenant.emergency_contact_name,
        'emergency_contact_phone': tenant.emergency_contact_phone,
        'notes': tenant.notes,
        'status': tenant.status,
        'created_at': tenant.created_at.isoformat(),
        'updated_at': tenant.updated_at.isoformat()
    }
    
    return jsonify(result)

@tenants_bp.route('/<int:tenant_id>', methods=['PUT'])
@jwt_required()
def update_tenant(tenant_id):
    """Update a tenant"""
    current_user_id = int(get_jwt_identity())
    
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    data = request.get_json()
    
    # If property_id is being updated, verify it exists and belongs to the user
    if 'property_id' in data:
        property = Property.query.filter_by(id=data['property_id'], user_id=current_user_id).first()
        if not property:
            return jsonify({"error": "Property not found or access denied"}), 404
        tenant.property_id = data['property_id']
    
    # Update fields if provided
    if 'first_name' in data:
        tenant.first_name = data['first_name']
    
    if 'last_name' in data:
        tenant.last_name = data['last_name']
    
    if 'email' in data:
        tenant.email = data['email']
    
    if 'phone' in data:
        tenant.phone = data['phone']
    
    if 'lease_start' in data and data['lease_start']:
        tenant.lease_start = datetime.strptime(data['lease_start'], '%Y-%m-%d').date()
    
    if 'lease_end' in data and data['lease_end']:
        tenant.lease_end = datetime.strptime(data['lease_end'], '%Y-%m-%d').date()
    
    if 'monthly_rent' in data:
        tenant.monthly_rent = data['monthly_rent']
    
    if 'security_deposit' in data:
        tenant.security_deposit = data['security_deposit']
    
    if 'rent_paid_through' in data and data['rent_paid_through']:
        tenant.rent_paid_through = datetime.strptime(data['rent_paid_through'], '%Y-%m-%d').date()
    
    if 'emergency_contact_name' in data:
        tenant.emergency_contact_name = data['emergency_contact_name']
    
    if 'emergency_contact_phone' in data:
        tenant.emergency_contact_phone = data['emergency_contact_phone']
    
    if 'notes' in data:
        tenant.notes = data['notes']
    
    if 'status' in data:
        tenant.status = data['status']
    
    db.session.commit()
    
    return jsonify({
        'id': tenant.id,
        'name': f"{tenant.first_name} {tenant.last_name}",
        'message': 'Tenant updated successfully'
    })

@tenants_bp.route('/<int:tenant_id>', methods=['DELETE'])
@jwt_required()
def delete_tenant(tenant_id):
    """Delete a tenant"""
    current_user_id = int(get_jwt_identity())
    
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    db.session.delete(tenant)
    db.session.commit()
    
    return jsonify({
        'message': 'Tenant deleted successfully'
    })

@tenants_bp.route('/property/<int:property_id>', methods=['GET'])
@jwt_required()
def get_tenants_by_property(property_id):
    """Get all tenants for a specific property"""
    current_user_id = int(get_jwt_identity())
    
    # Verify property exists and belongs to the user
    property = Property.query.filter_by(id=property_id, user_id=current_user_id).first()
    if not property:
        return jsonify({"error": "Property not found or access denied"}), 404
    
    # Get tenants
    tenants = Tenant.query.filter_by(
        property_id=property_id, 
        user_id=current_user_id
    ).order_by(Tenant.created_at.desc()).all()
    
    result = []
    for tenant in tenants:
        result.append({
            'id': tenant.id,
            'property_id': tenant.property_id,
            'first_name': tenant.first_name,
            'last_name': tenant.last_name,
            'email': tenant.email,
            'phone': tenant.phone,
            'lease_start': tenant.lease_start.isoformat() if tenant.lease_start else None,
            'lease_end': tenant.lease_end.isoformat() if tenant.lease_end else None,
            'monthly_rent': tenant.monthly_rent,
            'security_deposit': tenant.security_deposit,
            'status': tenant.status,
            'created_at': tenant.created_at.isoformat()
        })
    
    return jsonify(result)

@tenants_bp.route('/active', methods=['GET'])
@jwt_required()
def get_active_tenants():
    """Get all active tenants"""
    current_user_id = int(get_jwt_identity())
    
    tenants = Tenant.query.filter_by(
        user_id=current_user_id,
        status='active'
    ).order_by(Tenant.created_at.desc()).all()
    
    result = []
    for tenant in tenants:
        result.append({
            'id': tenant.id,
            'property_id': tenant.property_id,
            'first_name': tenant.first_name,
            'last_name': tenant.last_name,
            'email': tenant.email,
            'lease_end': tenant.lease_end.isoformat() if tenant.lease_end else None,
            'monthly_rent': tenant.monthly_rent
        })
    
    return jsonify(result)

@tenants_bp.route('/search', methods=['GET'])
@jwt_required()
def search_tenants():
    """Search tenants by name or email"""
    current_user_id = int(get_jwt_identity())
    query = request.args.get('q', '')
    
    tenants = Tenant.query.filter(
        Tenant.user_id == current_user_id,
        (Tenant.first_name.ilike(f'%{query}%') | 
         Tenant.last_name.ilike(f'%{query}%') | 
         Tenant.email.ilike(f'%{query}%'))
    ).order_by(Tenant.created_at.desc()).all()
    
    result = []
    for tenant in tenants:
        result.append({
            'id': tenant.id,
            'property_id': tenant.property_id,
            'first_name': tenant.first_name,
            'last_name': tenant.last_name,
            'email': tenant.email,
            'phone': tenant.phone,
            'status': tenant.status
        })
    
    return jsonify(result)

# Document-related endpoints
@tenants_bp.route('/<int:tenant_id>/documents', methods=['GET'])
@jwt_required()
def get_tenant_documents(tenant_id):
    """Get all documents for a specific tenant"""
    current_user_id = int(get_jwt_identity())
    
    # Verify tenant exists and belongs to the user
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    # Get documents
    documents = Document.query.filter_by(
        tenant_id=tenant_id, 
        user_id=current_user_id
    ).order_by(Document.created_at.desc()).all()
    
    result = []
    for doc in documents:
        result.append({
            'id': doc.id,
            'title': doc.title,
            'description': doc.description,
            'file_type': doc.file_type,
            'file_size': doc.file_size,
            'category': doc.category,
            'created_at': doc.created_at.isoformat(),
            'updated_at': doc.updated_at.isoformat(),
            'property_id': doc.property_id,
            'expiration_date': doc.expiration_date.isoformat() if doc.expiration_date else None
        })
    
    return jsonify(result)

@tenants_bp.route('/<int:tenant_id>/documents', methods=['POST'])
@jwt_required()
def upload_tenant_document(tenant_id):
    """Upload a document for a specific tenant"""
    current_user_id = int(get_jwt_identity())
    
    # Verify tenant exists and belongs to the user
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    # Check if request has the file
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Check if file type is allowed
    if not allowed_file(file.filename):
        return jsonify({"error": f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"}), 400
    
    # Secure the filename and generate a unique filename
    filename = secure_filename(file.filename)
    unique_filename = f"{uuid.uuid4()}_{filename}"
    
    UPLOAD_FOLDER = os.path.join(current_app.root_path, 'uploads/documents')
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
    
    # Get form data
    title = request.form.get('title')
    description = request.form.get('description', '')
    category = request.form.get('category')
    expiration_date = request.form.get('expiration_date')
    
    if not title:
        return jsonify({"error": "Title is required"}), 400
    
    if not category:
        return jsonify({"error": "Category is required"}), 400
    
    # Save the file
    file.save(file_path)
    
    # Get file metadata
    file_size = os.path.getsize(file_path)
    file_type = file.content_type or 'application/octet-stream'
    
    # Create document record
    new_document = Document(
        user_id=current_user_id,
        property_id=tenant.property_id,
        tenant_id=tenant_id,
        title=title,
        description=description,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        category=category,
        expiration_date=datetime.strptime(expiration_date, '%Y-%m-%d').date() if expiration_date else None
    )
    
    db.session.add(new_document)
    db.session.commit()
    
    return jsonify({
        'id': new_document.id,
        'title': new_document.title,
        'message': 'Document uploaded successfully for tenant'
    }), 201

@tenants_bp.route('/<int:tenant_id>/documents/<int:document_id>', methods=['DELETE'])
@jwt_required()
def delete_tenant_document(tenant_id, document_id):
    """Delete a tenant's document"""
    current_user_id = int(get_jwt_identity())
    
    # Verify tenant exists and belongs to the user
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    # Verify document exists, belongs to the user, and is associated with the tenant
    document = Document.query.filter_by(
        id=document_id, 
        user_id=current_user_id,
        tenant_id=tenant_id
    ).first()
    
    if not document:
        return jsonify({"error": "Document not found or access denied"}), 404
    
    # Delete the file from storage
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete from database
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({
        'message': 'Tenant document deleted successfully'
    })

@tenants_bp.route('/<int:tenant_id>/documents/categories', methods=['GET'])
@jwt_required()
def get_tenant_document_categories(tenant_id):
    """Get document categories used for a specific tenant"""
    current_user_id = int(get_jwt_identity())
    
    # Verify tenant exists and belongs to the user
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    # Get distinct categories
    categories = db.session.query(Document.category).filter_by(
        tenant_id=tenant_id,
        user_id=current_user_id
    ).distinct().all()
    
    # Extract category names from result tuples
    result = [category[0] for category in categories]
    
    return jsonify(result)

@tenants_bp.route('/<int:tenant_id>/documents/expiring', methods=['GET'])
@jwt_required()
def get_tenant_expiring_documents(tenant_id):
    """Get documents for a tenant that are expiring soon (within 30 days by default)"""
    current_user_id = int(get_jwt_identity())
    days = int(request.args.get('days', 30))
    
    # Verify tenant exists and belongs to the user
    tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
    if not tenant:
        return jsonify({"error": "Tenant not found or access denied"}), 404
    
    # Calculate the date threshold
    today = datetime.now().date()
    expiration_threshold = today + timedelta(days=days)
    
    # Get documents that have an expiration date and are expiring within the threshold
    documents = Document.query.filter(
        Document.user_id == current_user_id,
        Document.tenant_id == tenant_id,
        Document.expiration_date.isnot(None),
        Document.expiration_date <= expiration_threshold,
        Document.expiration_date >= today
    ).order_by(Document.expiration_date.asc()).all()
    
    result = []
    for doc in documents:
        result.append({
            'id': doc.id,
            'title': doc.title,
            'file_type': doc.file_type,
            'category': doc.category,
            'expiration_date': doc.expiration_date.isoformat(),
            'days_until_expiration': (doc.expiration_date - today).days
        })
    
    return jsonify(result)