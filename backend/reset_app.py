#!/usr/bin/env python3
"""
Reset script for PropertyPal application.
This script can reset the database and/or clear upload folders.
"""

import os
import argparse
import shutil
from pathlib import Path
import sys
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the current directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def reset_database(force=False):
    """Drop and recreate all database tables"""
    if not force:
        confirm = input("Are you sure you want to reset the database? This will delete ALL data! (y/n): ")
        if confirm.lower() != 'y':
            print("Database reset cancelled.")
            return False
    
    print("Resetting database...")
    
    # Import here to ensure environment is properly set up first
    from app import create_app, db
    from config import DevelopmentConfig
    
    # Set up the Flask app with the database configuration
    app = create_app(DevelopmentConfig)
    
    with app.app_context():
        # Print the database URI being used (with password obscured)
        db_uri = app.config.get('SQLALCHEMY_DATABASE_URI', 'Unknown')
        if 'sqlite' in db_uri:
            print(f"Using SQLite database: {db_uri}")
        else:
            # Mask the password in connection string for security
            parts = db_uri.split('@')
            if len(parts) > 1:
                credentials = parts[0].split(':')
                if len(credentials) > 2:
                    masked_uri = f"{credentials[0]}:****@{parts[1]}"
                    print(f"Using database: {masked_uri}")
                else:
                    print(f"Using database (credentials masked)")
            else:
                print(f"Using database (connection string format not recognized)")
        
        # Confirm one last time if it's not SQLite
        if 'sqlite' not in db_uri and not force:
            confirm = input("This doesn't appear to be SQLite. Are you ABSOLUTELY sure? (y/n): ")
            if confirm.lower() != 'y':
                print("Database reset cancelled.")
                return False
        
        # Drop and recreate all tables
        db.drop_all()
        db.create_all()
        print("Database reset complete!")
    return True

def clear_uploads(force=False):
    """Clear all uploaded files from the upload folder"""
    # Import here to use the app config
    from app import create_app
    from config import DevelopmentConfig
    
    app = create_app(DevelopmentConfig)
    
    # Get the upload folder from app config
    upload_folder = app.config.get('UPLOAD_FOLDER')
    
    # If not specified in config, use the default location
    if not upload_folder:
        upload_folder = os.path.join(app.root_path, 'uploads')
    
    if not os.path.exists(upload_folder):
        print(f"Upload folder does not exist: {upload_folder}")
        # Create it
        os.makedirs(upload_folder, exist_ok=True)
        print(f"Created upload folder: {upload_folder}")
        return True
    
    if not force:
        confirm = input(f"Are you sure you want to clear all uploads in {upload_folder}? (y/n): ")
        if confirm.lower() != 'y':
            print("Upload folder clear cancelled.")
            return False
    
    print(f"Clearing upload folder: {upload_folder}")
    
    # Remove all files but keep the directory structure
    for root, dirs, files in os.walk(upload_folder):
        for file in files:
            file_path = os.path.join(root, file)
            try:
                os.unlink(file_path)
                print(f"Deleted file: {file_path}")
            except Exception as e:
                print(f"Error deleting {file_path}: {e}")
    
    # Recreate the required subdirectories
    os.makedirs(os.path.join(upload_folder, 'documents', 'files'), exist_ok=True)
    os.makedirs(os.path.join(upload_folder, 'documents', 'photos'), exist_ok=True)
    
    print("Upload folder cleared successfully!")
    return True

def main():
    """Main function to parse arguments and run reset operations"""
    parser = argparse.ArgumentParser(description='Reset PropertyPal database and uploads')
    parser.add_argument('--db', action='store_true', help='Reset the database')
    parser.add_argument('--uploads', action='store_true', help='Clear upload folders')
    parser.add_argument('--all', action='store_true', help='Reset both database and uploads')
    parser.add_argument('--force', action='store_true', help='Skip confirmation prompts')
    
    args = parser.parse_args()
    
    # If no arguments provided, show help
    if not (args.db or args.uploads or args.all):
        parser.print_help()
        return
    
    # Determine what to reset
    reset_db = args.db or args.all
    reset_uploads = args.uploads or args.all
    
    # Perform the resets
    if reset_db:
        reset_database(args.force)
    
    if reset_uploads:
        clear_uploads(args.force)
    
    print("Reset operations completed!")

if __name__ == "__main__":
    main()