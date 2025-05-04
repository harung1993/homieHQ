# api/projects.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.project import Project
from app.models.user import User
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    """Get all projects for the current user"""
    current_user_id = int(get_jwt_identity())

    property_id = request.args.get('property_id')
    
    query = Project.query.filter_by(user_id=current_user_id)
    
    if property_id:
        query = query.filter_by(property_id=property_id)
    
    status = request.args.get('status')
    if status:
        query = query.filter_by(status=status)
    
    projects = query.order_by(Project.created_at.desc()).all()
    
    result = []
    for project in projects:
        result.append({
            'id': project.id,
            'name': project.name,
            'description': project.description,
            'status': project.status,
            'budget': project.budget,
            'spent': project.spent,
            'start_date': project.start_date.isoformat() if project.start_date else None,
            'projected_end_date': project.projected_end_date.isoformat() if project.projected_end_date else None,
            'completed_date': project.completed_date.isoformat() if project.completed_date else None,
            'created_at': project.created_at.isoformat(),
            'updated_at': project.updated_at.isoformat(),
            'property_id': project.property_id
        })
    
    return jsonify(result)

@projects_bp.route('/', methods=['POST'])
@jwt_required()
def create_project():
    """Create a new project"""
    current_user_id = int(get_jwt_identity())

    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('name'):
        return jsonify({"error": "Project name is required"}), 400
    
    # Create new project
    new_project = Project(
        user_id=current_user_id,
        property_id=data.get('property_id'),
        name=data.get('name'),
        description=data.get('description', ''),
        status=data.get('status', 'planning'),
        budget=data.get('budget'),
        spent=data.get('spent', 0),
        start_date=datetime.strptime(data.get('start_date'), '%Y-%m-%d').date() if data.get('start_date') else None,
        projected_end_date=datetime.strptime(data.get('projected_end_date'), '%Y-%m-%d').date() if data.get('projected_end_date') else None
    )
    
    db.session.add(new_project)
    db.session.commit()
    
    return jsonify({
        'id': new_project.id,
        'name': new_project.name,
        'message': 'Project created successfully'
    }), 201

@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    """Get a specific project"""
    current_user_id = int(get_jwt_identity())

    
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    if not project:
        return jsonify({"error": "Project not found or access denied"}), 404
    
    result = {
        'id': project.id,
        'name': project.name,
        'description': project.description,
        'status': project.status,
        'budget': project.budget,
        'spent': project.spent,
        'start_date': project.start_date.isoformat() if project.start_date else None,
        'projected_end_date': project.projected_end_date.isoformat() if project.projected_end_date else None,
        'completed_date': project.completed_date.isoformat() if project.completed_date else None,
        'created_at': project.created_at.isoformat(),
        'updated_at': project.updated_at.isoformat(),
        'property_id': project.property_id
    }
    
    return jsonify(result)

@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    """Update a project"""
    current_user_id = int(get_jwt_identity())

    
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    if not project:
        return jsonify({"error": "Project not found or access denied"}), 404
    
    data = request.get_json()
    
    # Update fields if provided
    if 'name' in data:
        project.name = data['name']
    
    if 'description' in data:
        project.description = data['description']
    
    if 'status' in data:
        old_status = project.status
        project.status = data['status']
        
        # If status changed to completed, set the completed date
        if data['status'] == 'completed' and old_status != 'completed':
            project.completed_date = datetime.utcnow().date()
        # If status changed from completed, clear the completed date
        elif data['status'] != 'completed' and old_status == 'completed':
            project.completed_date = None
    
    if 'budget' in data:
        project.budget = data['budget']
    
    if 'spent' in data:
        project.spent = data['spent']
    
    if 'start_date' in data and data['start_date']:
        project.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    
    if 'projected_end_date' in data and data['projected_end_date']:
        project.projected_end_date = datetime.strptime(data['projected_end_date'], '%Y-%m-%d').date()
    
    if 'property_id' in data:
        project.property_id = data['property_id']
    
    db.session.commit()
    
    return jsonify({
        'id': project.id,
        'name': project.name,
        'message': 'Project updated successfully'
    })

@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    """Delete a project"""
    current_user_id = int(get_jwt_identity())

    
    project = Project.query.filter_by(id=project_id, user_id=current_user_id).first()
    if not project:
        return jsonify({"error": "Project not found or access denied"}), 404
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({
        'message': 'Project deleted successfully'
    })