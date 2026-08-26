# Starts the local Mailpit SMTP & Web server
Write-Host "Starting Mailpit Local Mail Server..." -ForegroundColor Cyan
Write-Host "SMTP Server listening on: localhost:1025" -ForegroundColor Green
Write-Host "Web Mailbox UI available at: http://localhost:8025" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop Mailpit." -ForegroundColor Yellow

& "$PSScriptRoot\tools\mailpit.exe"
