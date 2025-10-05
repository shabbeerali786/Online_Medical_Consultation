#!/bin/bash

# Backend Deployment Script
echo "🚀 Deploying Backend..."

# Navigate to backend directory
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with required variables"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run tests (if available)
# npm test

# Start the server
echo "✅ Starting backend server..."
npm start
