# Add to a constants.py file or to the documents.py file

# Document categories
DOCUMENT_CATEGORIES = {
    # General document categories
    'GENERAL': 'general',
    'IMPORTANT': 'important',
    'RECEIPT': 'receipt',
    'CONTRACT': 'contract',
    'INVOICE': 'invoice',
    'REPORT': 'report',
    
    # Property document categories
    'PROPERTY_DEED': 'property_deed',
    'PROPERTY_TITLE': 'property_title',
    'PROPERTY_INSURANCE': 'property_insurance',
    'PROPERTY_TAX': 'property_tax',
    'PROPERTY_INSPECTION': 'property_inspection',
    'MORTGAGE': 'mortgage',
    
    # Tenant document categories
    'TENANT_LEASE': 'tenant_lease',
    'TENANT_ID': 'tenant_id',
    'TENANT_APPLICATION': 'tenant_application',
    'TENANT_SCREENING': 'tenant_screening',
    'TENANT_AGREEMENT': 'tenant_agreement',
    'TENANT_NOTICE': 'tenant_notice',
    'TENANT_COMMUNICATION': 'tenant_communication',
    'TENANT_PAYMENT': 'tenant_payment',
    'TENANT_AUTHORIZATION': 'tenant_authorization',
    'TENANT_INSPECTION': 'tenant_inspection',
    'TENANT_PET_AGREEMENT': 'tenant_pet_agreement',
    
    # Maintenance document categories
    'MAINTENANCE_RECEIPT': 'maintenance_receipt',
    'MAINTENANCE_QUOTE': 'maintenance_quote',
    'MAINTENANCE_INVOICE': 'maintenance_invoice',
    'MAINTENANCE_REPORT': 'maintenance_report',
    'MAINTENANCE_WARRANTY': 'maintenance_warranty',
    
    # Appliance document categories
    'APPLIANCE_MANUAL': 'appliance_manual',
    'APPLIANCE_WARRANTY': 'appliance_warranty',
    'APPLIANCE_RECEIPT': 'appliance_receipt',
    'APPLIANCE_SERVICE': 'appliance_service',
    
    # Project document categories
    'PROJECT_PLAN': 'project_plan',
    'PROJECT_PERMIT': 'project_permit',
    'PROJECT_QUOTE': 'project_quote',
    'PROJECT_INVOICE': 'project_invoice',
    'PROJECT_CONTRACT': 'project_contract',
    'PROJECT_DESIGN': 'project_design',
}

# Map expiration-prone document categories
EXPIRING_DOCUMENT_CATEGORIES = [
    DOCUMENT_CATEGORIES['TENANT_LEASE'],
    DOCUMENT_CATEGORIES['TENANT_ID'],
    DOCUMENT_CATEGORIES['PROPERTY_INSURANCE'],
    DOCUMENT_CATEGORIES['APPLIANCE_WARRANTY'],
    DOCUMENT_CATEGORIES['TENANT_PET_AGREEMENT'],
]

# Document categories for tenant document upload form (frontend)
TENANT_DOCUMENT_CATEGORY_CHOICES = [
    {'value': DOCUMENT_CATEGORIES['TENANT_LEASE'], 'label': 'Lease Agreement'},
    {'value': DOCUMENT_CATEGORIES['TENANT_ID'], 'label': 'Identification Documents'},
    {'value': DOCUMENT_CATEGORIES['TENANT_APPLICATION'], 'label': 'Rental Application'},
    {'value': DOCUMENT_CATEGORIES['TENANT_SCREENING'], 'label': 'Background/Credit Check'},
    {'value': DOCUMENT_CATEGORIES['TENANT_AGREEMENT'], 'label': 'Additional Agreements'},
    {'value': DOCUMENT_CATEGORIES['TENANT_NOTICE'], 'label': 'Notices'},
    {'value': DOCUMENT_CATEGORIES['TENANT_COMMUNICATION'], 'label': 'Communication Records'},
    {'value': DOCUMENT_CATEGORIES['TENANT_PAYMENT'], 'label': 'Payment Records'},
    {'value': DOCUMENT_CATEGORIES['TENANT_AUTHORIZATION'], 'label': 'Authorizations'},
    {'value': DOCUMENT_CATEGORIES['TENANT_INSPECTION'], 'label': 'Inspection Reports'},
    {'value': DOCUMENT_CATEGORIES['TENANT_PET_AGREEMENT'], 'label': 'Pet Agreement'},
    {'value': DOCUMENT_CATEGORIES['GENERAL'], 'label': 'Other Documents'},
]