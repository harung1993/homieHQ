# api/documents.py
from flask import Blueprint, request, jsonify, send_file, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
import os
import uuid
from app import db
from app.models.document import Document
from app.models.user import User
from app.models.tenant import Tenant
from app.models.property import Property
from datetime import datetime
from app.utils.constants import DOCUMENT_CATEGORIES, EXPIRING_DOCUMENT_CATEGORIES

documents_bp = Blueprint('documents', __name__)

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'txt'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@documents_bp.route('/', methods=['GET'])
@jwt_required()
def get_documents():
    """Get all documents for the current user"""
    current_user_id = int(get_jwt_identity())

    property_id = request.args.get('property_id')
    tenant_id = request.args.get('tenant_id')
    category = request.args.get('category')
    
    query = Document.query.filter_by(user_id=current_user_id)
    
    if property_id:
        query = query.filter_by(property_id=property_id)
    
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    
    if category:
        query = query.filter_by(category=category)
    
    documents = query.order_by(Document.created_at.desc()).all()
    
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
            'tenant_id': doc.tenant_id,
            'expiration_date': doc.expiration_date.isoformat() if doc.expiration_date else None
        })
    
    return jsonify(result)

@documents_bp.route('/', methods=['POST'])
@jwt_required()
def upload_document():
    """Upload a new document"""
    current_user_id = int(get_jwt_identity())

    
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
    property_id = request.form.get('property_id')
    tenant_id = request.form.get('tenant_id')
    expiration_date = request.form.get('expiration_date')
    
    if not title:
        return jsonify({"error": "Title is required"}), 400
    
    if not category:
        return jsonify({"error": "Category is required"}), 400
    
    # Validate tenant_id if provided
    if tenant_id:
        tenant = Tenant.query.filter_by(id=tenant_id, user_id=current_user_id).first()
        if not tenant:
            return jsonify({"error": "Tenant not found or access denied"}), 404
    
    # Save the file
    file.save(file_path)
    
    # Get file metadata
    file_size = os.path.getsize(file_path)
    file_type = file.content_type or 'application/octet-stream'
    
    # Create document record
    new_document = Document(
        user_id=current_user_id,
        property_id=property_id if property_id else None,
        tenant_id=tenant_id if tenant_id else None,
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
        'message': 'Document uploaded successfully'
    }), 201

@documents_bp.route('/<int:document_id>', methods=['PUT'])
@jwt_required()
def update_document(document_id):
    """Update document metadata"""
    current_user_id = int(get_jwt_identity())

    
    document = Document.query.filter_by(id=document_id, user_id=current_user_id).first()
    if not document:
        return jsonify({"error": "Document not found or access denied"}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        document.title = data['title']
    
    if 'description' in data:
        document.description = data['description']
    
    if 'category' in data:
        document.category = data['category']
    
    if 'property_id' in data:
        document.property_id = data['property_id']
    
    if 'tenant_id' in data:
        # Validate tenant_id if provided and not null
        if data['tenant_id']:
            tenant = Tenant.query.filter_by(id=data['tenant_id'], user_id=current_user_id).first()
            if not tenant:
                return jsonify({"error": "Tenant not found or access denied"}), 404
        document.tenant_id = data['tenant_id']
    
    if 'expiration_date' in data and data['expiration_date']:
        document.expiration_date = datetime.strptime(data['expiration_date'], '%Y-%m-%d').date()
    
    db.session.commit()
    
    return jsonify({
        'id': document.id,
        'title': document.title,
        'message': 'Document updated successfully'
    })

@documents_bp.route('/<int:document_id>', methods=['DELETE'])
@jwt_required()
def delete_document(document_id):
    """Delete a document"""
    current_user_id = int(get_jwt_identity())

    
    document = Document.query.filter_by(id=document_id, user_id=current_user_id).first()
    if not document:
        return jsonify({"error": "Document not found or access denied"}), 404
    
    # Delete the file from storage
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    # Delete from database
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({
        'message': 'Document deleted successfully'
    })

@documents_bp.route('/<int:document_id>/download', methods=['GET'])
@jwt_required()
def download_document(document_id):
    """Download a document"""
    current_user_id = int(get_jwt_identity())

    
    document = Document.query.filter_by(id=document_id, user_id=current_user_id).first()
    if not document:
        return jsonify({"error": "Document not found or access denied"}), 404
    
    # Check if file exists
    if not os.path.exists(document.file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(document.file_path, as_attachment=True)

@documents_bp.route('/tenant/<int:tenant_id>', methods=['GET'])
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
            'tenant_id': doc.tenant_id,
            'expiration_date': doc.expiration_date.isoformat() if doc.expiration_date else None
        })
    
    return jsonify(result)

@documents_bp.route('/expiring', methods=['GET'])
@jwt_required()
def get_expiring_documents():
    """Get documents that are expiring soon (within 30 days by default)"""
    current_user_id = int(get_jwt_identity())

    days = int(request.args.get('days', 30))
    
    # Calculate the date threshold
    today = datetime.now().date()
    expiration_threshold = today + datetime.timedelta(days=days)
    
    # Get documents that have an expiration date and are expiring within the threshold
    documents = Document.query.filter(
        Document.user_id == current_user_id,
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
            'days_until_expiration': (doc.expiration_date - today).days,
            'property_id': doc.property_id,
            'tenant_id': doc.tenant_id
        })
    
    return jsonify(result)

@documents_bp.route('/category/<category>', methods=['GET'])
@jwt_required()
def get_documents_by_category(category):
    """Get documents by category"""
    current_user_id = int(get_jwt_identity())

    tenant_id = request.args.get('tenant_id')
    
    query = Document.query.filter_by(user_id=current_user_id, category=category)
    
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    
    documents = query.order_by(Document.created_at.desc()).all()
    
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
            'tenant_id': doc.tenant_id,
            'expiration_date': doc.expiration_date.isoformat() if doc.expiration_date else None
        })
    
    return jsonify(result)

@documents_bp.route('/search', methods=['GET'])
@jwt_required()
def search_documents():
    """Search documents by keyword"""
    current_user_id = int(get_jwt_identity())

    keyword = request.args.get('q', '')
    tenant_id = request.args.get('tenant_id')
    
    query = Document.query.filter(
        Document.user_id == current_user_id,
        (Document.title.ilike(f'%{keyword}%') | Document.description.ilike(f'%{keyword}%'))
    )
    
    if tenant_id:
        query = query.filter_by(tenant_id=tenant_id)
    
    documents = query.order_by(Document.created_at.desc()).all()
    
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
            'tenant_id': doc.tenant_id,
            'expiration_date': doc.expiration_date.isoformat() if doc.expiration_date else None
        })
    
    return jsonify(result)