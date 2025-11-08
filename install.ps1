# Quick Installation Script for OneFlow

Write-Host "OneFlow - Quick Setup Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check PostgreSQL
Write-Host ""
Write-Host "Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $pgVersion = psql --version
    Write-Host "PostgreSQL found: $pgVersion" -ForegroundColor Green
}
catch {
    Write-Host "PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    exit 1
}

# Install Backend Dependencies
Write-Host ""
Write-Host "Installing Backend Dependencies..." -ForegroundColor Yellow
Set-Location backend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "Backend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "Backend installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Install Frontend Dependencies
Write-Host ""
Write-Host "Installing Frontend Dependencies..." -ForegroundColor Yellow
Set-Location ..\frontend
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "Frontend dependencies installed" -ForegroundColor Green
}
else {
    Write-Host "Frontend installation failed" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Create PostgreSQL database:" -ForegroundColor White
Write-Host "   psql -U postgres -c ""CREATE DATABASE oneflow_db;""" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update backend\.env with your PostgreSQL password" -ForegroundColor White
Write-Host ""
Write-Host "3. Start Backend (in one terminal):" -ForegroundColor White
Write-Host "   cd backend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Start Frontend (in another terminal):" -ForegroundColor White
Write-Host "   cd frontend; npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Open http://localhost:3000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "Happy coding!" -ForegroundColor Cyan
