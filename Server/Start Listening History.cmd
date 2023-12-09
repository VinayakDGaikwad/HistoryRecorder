
@echo off
:loop
echo Running the command...
cd C:\Users\vdg\OneDrive\Documents\GitHub\MyChromeExtention\HistoryRecorder\server\
node index.js
if errorlevel 1 (
    echo The command failed. Retrying...
) else (
    echo The command completed successfully.
)
timeout /t 5 > nul  REM Adjust the timeout value (in seconds) as needed
goto loop
