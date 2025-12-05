#!/usr/bin/env python3
"""
Script to seed demo accounts for PropertyPal demo mode
Creates 4 demo accounts with sample data
"""

import os
import sys
from datetime import datetime, timedelta
from app import create_app, db
from app.models.user import User
from app.models.property import Property
from app.models.finance import Expense, Budget
from app.models.maintenance import MaintenanceItem
from app.models.appliance import Appliance
from config import DemoConfig

def seed_demo_accounts():
    """Seed 4 demo accounts with sample property data"""

    print("Starting demo account seeding...")

    # Demo users configuration
    demo_users = [
        {
            'email': 'demo1@propertypal.com',
            'password': 'Demo123!',
            'first_name': 'John',
            'last_name': 'Homeowner',
            'property': {
                'address': '123 Maple Street',
                'city': 'Springfield',
                'state': 'IL',
                'zip_code': '62701',
                'property_type': 'Single Family',
                'purchase_price': 250000,
                'purchase_date': '2020-03-15'
            }
        },
        {
            'email': 'demo2@propertypal.com',
            'password': 'Demo123!',
            'first_name': 'Sarah',
            'last_name': 'Landlord',
            'property': {
                'address': '456 Oak Avenue',
                'city': 'Portland',
                'state': 'OR',
                'zip_code': '97201',
                'property_type': 'Condo',
                'purchase_price': 350000,
                'purchase_date': '2019-07-22'
            }
        },
        {
            'email': 'demo3@propertypal.com',
            'password': 'Demo123!',
            'first_name': 'Michael',
            'last_name': 'Investor',
            'property': {
                'address': '789 Pine Road',
                'city': 'Austin',
                'state': 'TX',
                'zip_code': '78701',
                'property_type': 'Townhouse',
                'purchase_price': 285000,
                'purchase_date': '2021-11-10'
            }
        },
        {
            'email': 'demo4@propertypal.com',
            'password': 'Demo123!',
            'first_name': 'Emily',
            'last_name': 'Manager',
            'property': {
                'address': '321 Elm Boulevard',
                'city': 'Seattle',
                'state': 'WA',
                'zip_code': '98101',
                'property_type': 'Multi-family',
                'purchase_price': 450000,
                'purchase_date': '2018-05-03'
            }
        }
    ]

    created_users = []

    for user_data in demo_users:
        # Check if user already exists
        existing_user = User.query.filter_by(email=user_data['email']).first()
        if existing_user:
            print(f"User {user_data['email']} already exists, skipping...")
            created_users.append(existing_user)
            continue

        # Create user
        user = User(
            email=user_data['email'],
            first_name=user_data['first_name'],
            last_name=user_data['last_name'],
            email_verified=True  # Auto-verify demo accounts
        )
        user.set_password(user_data['password'])
        db.session.add(user)
        db.session.flush()  # Get user ID

        print(f"Created user: {user_data['email']}")

        # Create property for user
        property_data = user_data['property']
        property = Property(
            user_id=user.id,
            address=property_data['address'],
            city=property_data['city'],
            state=property_data['state'],
            zip_code=property_data['zip_code'],
            property_type=property_data['property_type'],
            purchase_price=property_data['purchase_price'],
            purchase_date=datetime.strptime(property_data['purchase_date'], '%Y-%m-%d').date()
        )
        db.session.add(property)
        db.session.flush()  # Get property ID

        print(f"  - Created property: {property_data['address']}")

        # Add sample expenses
        sample_expenses = [
            {'description': 'Monthly Mortgage', 'amount': 150000, 'category': 'mortgage', 'recurring': 'monthly'},
            {'description': 'Property Insurance', 'amount': 120000, 'category': 'insurance', 'recurring': 'yearly'},
            {'description': 'Water Bill', 'amount': 8500, 'category': 'utilities', 'recurring': 'monthly'},
            {'description': 'Lawn Care Service', 'amount': 7500, 'category': 'maintenance', 'recurring': 'monthly'},
            {'description': 'HOA Fees', 'amount': 25000, 'category': 'other', 'recurring': 'monthly'},
        ]

        for exp_data in sample_expenses:
            expense = Expense(
                property_id=property.id,
                description=exp_data['description'],
                amount=exp_data['amount'],  # Already in cents
                category=exp_data['category'],
                date=datetime.now().date(),
                recurring=exp_data['recurring']
            )
            db.session.add(expense)

        print(f"  - Added {len(sample_expenses)} sample expenses")

        # Add sample budgets
        sample_budgets = [
            {'category': 'mortgage', 'amount': 150000, 'period': 'monthly'},
            {'category': 'utilities', 'amount': 15000, 'period': 'monthly'},
            {'category': 'maintenance', 'amount': 50000, 'period': 'monthly'},
            {'category': 'insurance', 'amount': 120000, 'period': 'yearly'},
        ]

        for budget_data in sample_budgets:
            budget = Budget(
                property_id=property.id,
                category=budget_data['category'],
                amount=budget_data['amount'],  # Already in cents
                period=budget_data['period'],
                start_date=datetime.now().date()
            )
            db.session.add(budget)

        print(f"  - Added {len(sample_budgets)} sample budgets")

        # Add sample maintenance items
        sample_maintenance = [
            {'title': 'HVAC Filter Replacement', 'priority': 'low', 'status': 'pending', 'cost': 2500},
            {'title': 'Annual Roof Inspection', 'priority': 'medium', 'status': 'pending', 'cost': 15000},
            {'title': 'Gutter Cleaning', 'priority': 'medium', 'status': 'completed', 'cost': 12500},
        ]

        for maint_data in sample_maintenance:
            maintenance = MaintenanceItem(
                property_id=property.id,
                title=maint_data['title'],
                priority=maint_data['priority'],
                status=maint_data['status'],
                estimated_cost=maint_data['cost'],
                due_date=(datetime.now() + timedelta(days=30)).date()
            )
            db.session.add(maintenance)

        print(f"  - Added {len(sample_maintenance)} sample maintenance items")

        # Add sample appliances
        sample_appliances = [
            {'name': 'Refrigerator', 'brand': 'Samsung', 'model': 'RF28R7351SG', 'warranty_exp': 365},
            {'name': 'Washing Machine', 'brand': 'LG', 'model': 'WM3900HWA', 'warranty_exp': 180},
            {'name': 'HVAC System', 'brand': 'Carrier', 'model': 'Infinity 24', 'warranty_exp': 730},
        ]

        for app_data in sample_appliances:
            appliance = Appliance(
                property_id=property.id,
                name=app_data['name'],
                brand=app_data['brand'],
                model_number=app_data['model'],
                purchase_date=(datetime.now() - timedelta(days=90)).date(),
                warranty_expiration=(datetime.now() + timedelta(days=app_data['warranty_exp'])).date()
            )
            db.session.add(appliance)

        print(f"  - Added {len(sample_appliances)} sample appliances")

        created_users.append(user)

    # Commit all changes
    db.session.commit()
    print(f"\n✅ Successfully seeded {len(created_users)} demo accounts!")
    print("\nDemo Account Credentials:")
    print("-" * 60)
    for user_data in demo_users:
        print(f"Email: {user_data['email']}")
        print(f"Password: {user_data['password']}")
        print(f"Name: {user_data['first_name']} {user_data['last_name']}")
        print("-" * 60)
    print("\n⚠️  Note: These accounts are for demo purposes only.")
    print("They will be reset periodically in demo mode.\n")


if __name__ == '__main__':
    # Use demo config
    app = create_app(DemoConfig)

    with app.app_context():
        try:
            # Create tables if they don't exist
            db.create_all()

            # Seed demo accounts
            seed_demo_accounts()

            print("Demo seeding completed successfully!")
            sys.exit(0)

        except Exception as e:
            print(f"Error seeding demo accounts: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
