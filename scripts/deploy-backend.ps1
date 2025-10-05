# Backend Deployment Script (PowerShell)
Write-Host "🚀 Deploying Backend..." -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Check if .env exists
if (-Not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with required variables" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Start the server
Write-Host "✅ Starting backend server..." -ForegroundColor Green
npm start
