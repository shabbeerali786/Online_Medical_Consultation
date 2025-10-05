#!/bin/bash

# Frontend Deployment Script
echo "🚀 Deploying Frontend..."

# Navigate to frontend directory
cd frontend

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "⚠️  Warning: .env.production file not found!"
    echo "Using default configuration"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build for production
echo "🔨 Building for production..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful! Files are in dist/ directory"
    echo "📁 You can now deploy the dist/ folder to your hosting service"
else
    echo "❌ Build failed!"
    exit 1
fi
