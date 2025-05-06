# utils/property_permissions.py
from app.models.Property_user import PropertyUser

def has_property_permission(property_id, user_id, required_roles):
    """
    Check if a user has the required role for a property
    
    Args:
        property_id: ID of the property
        user_id: ID of the user
        required_roles: List of roles that are allowed (e.g., ['owner', 'manager'])
        
    Returns:
        bool: True if the user has permission, False otherwise
    """
    # Query for the user's role on this property
    property_user = PropertyUser.query.filter_by(
        property_id=property_id,
        user_id=user_id,
        status='active'
    ).first()
    
    if not property_user or property_user.role not in required_roles:
        return False
    
    return True