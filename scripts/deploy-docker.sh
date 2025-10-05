#!/bin/bash

# Docker Deployment Script
echo "🐳 Deploying with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found in root directory!"
    echo "Please create .env file with:"
    echo "  MONGODB_URI=your_mongodb_uri"
    echo "  MONGODB_DB_NAME=online_medical"
    echo "  FRONTEND_URL=http://localhost"
    exit 1
fi

# Build and start containers
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

# Check status
echo "✅ Checking container status..."
docker-compose ps

echo ""
echo "✅ Deployment complete!"
echo "Frontend: http://localhost"
echo "Backend: http://localhost:5000"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
