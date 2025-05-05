#!/bin/sh

# Show environment variable for debugging
echo "REACT_APP_API_URL is set to: ${REACT_APP_API_URL}"

# Replace the placeholder with the actual API URL from the environment variable
find /app/build -type f -name "*.js" -exec sed -i "s|__API_URL_PLACEHOLDER__|${REACT_APP_API_URL}|g" {} \;

# Create a global configuration script to inject the API URL into the window object
mkdir -p /app/build/static/js
echo "window.REACT_APP_API_URL = '${REACT_APP_API_URL}';" > /app/build/static/js/config.js

# Start the app
echo "Starting frontend application..."
exec serve -s build -l 3000