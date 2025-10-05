# Docker Deployment Script (PowerShell)
Write-Host "🐳 Deploying with Docker..." -ForegroundColor Green

# Check if Docker is installed
if (-Not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker is not installed!" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-Not (Test-Path .env)) {
    Write-Host "❌ Error: .env file not found in root directory!" -ForegroundColor Red
    Write-Host "Please create .env file with:" -ForegroundColor Yellow
    Write-Host "  MONGODB_URI=your_mongodb_uri" -ForegroundColor Yellow
    Write-Host "  MONGODB_DB_NAME=online_medical" -ForegroundColor Yellow
    Write-Host "  FRONTEND_URL=http://localhost" -ForegroundColor Yellow
    exit 1
}

# Build and start containers
Write-Host "🔨 Building Docker images..." -ForegroundColor Cyan
docker-compose build

Write-Host "🚀 Starting containers..." -ForegroundColor Cyan
docker-compose up -d

# Check status
Write-Host "✅ Checking container status..." -ForegroundColor Green
docker-compose ps

Write-Host ""
Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Frontend: http://localhost" -ForegroundColor Cyan
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
Write-Host "To stop: docker-compose down" -ForegroundColor Yellow
