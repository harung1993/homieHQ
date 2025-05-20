#!/bin/bash
set -e

# Define image name
IMAGE_NAME="harung43/homiehq:nginx"

# Build the Docker image
echo "Building custom Nginx image: $IMAGE_NAME"
docker build -t $IMAGE_NAME .

# Optionally push to Docker Hub
if [ "$1" == "--push" ]; then
    echo "Pushing image to Docker Hub"
    docker push $IMAGE_NAME
    echo "Image pushed successfully"
fi

echo "Build completed successfully"