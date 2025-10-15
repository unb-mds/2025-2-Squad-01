# Deploy script for GitHub Pages
Write-Host "Building Next.js app for production..." -ForegroundColor Green

# Set production environment
$env:NODE_ENV = "production"

# Build the app
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful! Files ready for deployment" -ForegroundColor Green
    Write-Host "Output directory: ./out/" -ForegroundColor Yellow
    
    # Optional: Copy to site directory for manual testing
    if ($args[0] -eq "-copy") {
        Write-Host "Copying files to ../site/..." -ForegroundColor Cyan
        if (Test-Path "../site") {
            Remove-Item "../site/*" -Recurse -Force -Exclude "data"
        }
        Copy-Item -Path "out/*" -Destination "../site/" -Recurse -Force
        Write-Host "Files copied to ../site/" -ForegroundColor Green
    }
} else {
    Write-Host "Build failed!" -ForegroundColor Red
}