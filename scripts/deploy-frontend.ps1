# Frontend Deployment Script (PowerShell)
Write-Host "🚀 Deploying Frontend..." -ForegroundColor Green

# Navigate to frontend directory
Set-Location frontend

# Check if .env.production exists
if (-Not (Test-Path .env.production)) {
    Write-Host "⚠️  Warning: .env.production file not found!" -ForegroundColor Yellow
    Write-Host "Using default configuration" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Build for production
Write-Host "🔨 Building for production..." -ForegroundColor Cyan
npm run build

# Check if build was successful
if (Test-Path "dist") {
    Write-Host "✅ Build successful! Files are in dist/ directory" -ForegroundColor Green
    Write-Host "📁 You can now deploy the dist/ folder to your hosting service" -ForegroundColor Cyan
} else {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}
