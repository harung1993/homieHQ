#!/bin/bash

# Replace environment variables in JavaScript files
echo "Creating runtime environment configuration..."
echo "window.REACT_APP_API_URL = \"${REACT_APP_API_URL}\";" > /usr/share/nginx/html/config.js
echo "Environment configuration complete!"