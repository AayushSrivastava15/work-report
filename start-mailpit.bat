@echo off
echo Starting Mailpit Local Mail Server...
echo SMTP Server listening on: localhost:1025
echo Web Mailbox UI available at: http://localhost:8025
echo.
"%~dp0tools\mailpit.exe"
