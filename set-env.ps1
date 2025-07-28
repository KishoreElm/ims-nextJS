# Set environment variables for the IMS project
$env:DATABASE_URL="postgresql://postgres:1234567890@localhost:5432/ims_db"
$env:NEXTAUTH_URL="http://localhost:3000"
$env:NEXTAUTH_SECRET="your-secret-key-here"
$env:JWT_SECRET="your-jwt-secret-here"

Write-Host "Environment variables set successfully!" -ForegroundColor Green
Write-Host "DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Yellow
Write-Host "NEXTAUTH_URL: $env:NEXTAUTH_URL" -ForegroundColor Yellow
Write-Host "You can now run: npm run dev" -ForegroundColor Green 