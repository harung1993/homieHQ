#!/bin/bash

# PropertyPal Docker Quick Start Script
# This script helps you quickly start PropertyPal in different modes

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   PropertyPal Docker Quick Start${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Error: Docker Compose is not installed${NC}"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Prompt for mode
echo -e "${YELLOW}Select mode:${NC}"
echo "1) Development (with hot-reload, email verification disabled)"
echo "2) Demo (10-minute sessions, 4 demo accounts)"
echo "3) Production (full security, email verification enabled)"
echo ""
read -p "Enter choice [1-3]: " mode_choice

case $mode_choice in
    1)
        MODE="dev"
        echo -e "\n${GREEN}Starting in DEVELOPMENT mode...${NC}"
        ;;
    2)
        MODE="demo"
        echo -e "\n${GREEN}Starting in DEMO mode...${NC}"
        ;;
    3)
        MODE="prod"
        echo -e "\n${GREEN}Starting in PRODUCTION mode...${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

# Copy environment file
if [ ! -f ".env" ]; then
    echo -e "${BLUE}Creating .env file from .env.${MODE}...${NC}"
    cp ".env.${MODE}" .env
else
    echo -e "${YELLOW}Warning: .env file already exists${NC}"
    read -p "Do you want to overwrite it with .env.${MODE}? (y/N): " overwrite
    if [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
        cp ".env.${MODE}" .env
        echo -e "${GREEN}Overwritten .env with .env.${MODE}${NC}"
    else
        echo -e "${YELLOW}Using existing .env file${NC}"
    fi
fi

# Warning for production mode
if [ "$MODE" = "prod" ]; then
    echo -e "\n${RED}⚠️  IMPORTANT: Production Mode${NC}"
    echo -e "${YELLOW}Before starting, make sure you've updated .env with:${NC}"
    echo "  - Strong POSTGRES_PASSWORD"
    echo "  - Strong SECRET_KEY"
    echo "  - Strong JWT_SECRET_KEY"
    echo "  - Valid MAIL_USERNAME and MAIL_PASSWORD"
    echo ""
    read -p "Have you updated these values? (y/N): " updated
    if [ "$updated" != "y" ] && [ "$updated" != "Y" ]; then
        echo -e "${YELLOW}Please update .env file before continuing${NC}"
        exit 0
    fi
fi

# Stop any running containers
echo -e "\n${BLUE}Stopping any running containers...${NC}"
docker-compose down 2>/dev/null || true

# Build and start services
echo -e "\n${BLUE}Building and starting services...${NC}"
docker-compose up -d --build

# Wait for services to be healthy
echo -e "\n${BLUE}Waiting for services to be ready...${NC}"
sleep 5

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo -e "\n${GREEN}✓ Services started successfully!${NC}"

    # Seed demo accounts if in demo mode
    if [ "$MODE" = "demo" ]; then
        echo -e "\n${BLUE}Seeding demo accounts...${NC}"
        docker-compose exec -T backend python seed_demo_accounts.py || echo -e "${YELLOW}Warning: Could not seed demo accounts. You may need to run this manually later.${NC}"
    fi

    # Show access information
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}   PropertyPal is now running!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "\n${BLUE}Access the application:${NC}"
    echo -e "  Frontend:  ${GREEN}http://localhost:3000${NC}"
    echo -e "  Backend:   ${GREEN}http://localhost:5008${NC}"
    echo -e "  Nginx:     ${GREEN}http://localhost${NC}"

    if [ "$MODE" = "demo" ]; then
        echo -e "\n${BLUE}Demo Accounts:${NC}"
        echo "  demo1@propertypal.com / Demo123!"
        echo "  demo2@propertypal.com / Demo123!"
        echo "  demo3@propertypal.com / Demo123!"
        echo "  demo4@propertypal.com / Demo123!"
        echo -e "\n${YELLOW}Note: Sessions expire after 10 minutes in demo mode${NC}"
    fi

    echo -e "\n${BLUE}Useful commands:${NC}"
    echo "  View logs:        docker-compose logs -f"
    echo "  Stop services:    docker-compose down"
    echo "  Restart:          docker-compose restart"
    echo "  Shell access:     docker-compose exec backend bash"

    echo -e "\n${YELLOW}Press Ctrl+C to view logs (or wait to return)${NC}"
    sleep 3
    docker-compose logs -f

else
    echo -e "\n${RED}✗ Error: Services failed to start${NC}"
    echo -e "${YELLOW}Check logs with: docker-compose logs${NC}"
    exit 1
fi
