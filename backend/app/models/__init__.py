# app/models/__init__.py
# Import models to make them available
from app.models.user import User
from app.models.property import Property
from app.models.document import Document
from app.models.maintenance import Maintenance
from app.models.maintenance_checklist import MaintenanceChecklistItem
from app.models.appliance import Appliance
from app.models.project import Project
from app.models.finance import Expense, Budget
from app.models.settings import Settings
from app.models.tenant import Tenant