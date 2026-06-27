# To run this script, execute the following command in PowerShell:
# powershell -ExecutionPolicy Bypass -File .\run.ps1
# Or if your script execution policy is already set:
# .\run.ps1

# run.ps1 - Flawless launcher script for CURA.AI development environment

# Set console title
$host.UI.RawUI.WindowTitle = "CURA.AI - Developer Launcher"

# Clear host
Clear-Host

Write-Host @"
============================================================
             CURA.AI DEV ENVIRONMENT LAUNCHER               
============================================================
"@ -ForegroundColor Cyan

$backendPort = 3000
$frontendPort = 5173

# Helper function to kill processes on a port
function Clear-Port ($port) {
    Write-Host "[i] Scanning for active processes on port $port..." -ForegroundColor Gray
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections.OwningProcess | Where-Object { $_ -gt 4 } | Select-Object -Unique
        foreach ($p in $pids) {
            try {

                $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
                if ($proc) {
                    Write-Host "[!] Found process '$($proc.Name)' (PID: $p) on port $port. Terminating..." -ForegroundColor Yellow
                    Stop-Process -Id $p -Force
                    Write-Host "[+] Process $p terminated." -ForegroundColor Green
                }
            } catch {
                Write-Host "[!] Failed to stop PID $p. Attempting taskkill..." -ForegroundColor Red
                taskkill /F /PID $p 2>$null
            }
        }
    } else {
        Write-Host "[+] Port $port is already clear." -ForegroundColor Green
    }
}

# 1. Clean up ports initially
Write-Host "`nStep 1: Cleaning up existing ports..." -ForegroundColor Cyan
Clear-Port $backendPort
Clear-Port $frontendPort

# 2. Start servers
Write-Host "`nStep 2: Starting Backend Server (Node)..." -ForegroundColor Cyan
$backendProc = $null
$frontendProc = $null

try {
    # Start Backend
    $backendProc = Start-Process node -ArgumentList "server.js" -NoNewWindow -PassThru
    Write-Host "[+] Backend server started (PID: $($backendProc.Id))." -ForegroundColor Green
    
    # Wait for backend to bind to port 3000
    Start-Sleep -Seconds 2 
    
    Write-Host "`nStep 3: Starting Frontend Dev Server (Vite)..." -ForegroundColor Cyan
    # Start Frontend via cmd to support npm.cmd natively on Windows
    $frontendProc = Start-Process cmd -ArgumentList "/c npm run dev" -WorkingDirectory "frontend" -NoNewWindow -PassThru
    Write-Host "[+] Frontend server started (PID: $($frontendProc.Id))." -ForegroundColor Green
    
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host "  CURA.AI IS NOW RUNNING LIVE!" -ForegroundColor Green
    Write-Host "  - Local App URL:  http://localhost:5173" -ForegroundColor Yellow
    Write-Host "  - Backend API:    http://localhost:3000" -ForegroundColor Yellow
    Write-Host "  - Press Ctrl+C in this window to stop all services" -ForegroundColor Cyan
    Write-Host "============================================================`n" -ForegroundColor Cyan

    # Monitor loop
    while ($true) {
        if ($backendProc.HasExited) {
            Write-Host "`n[!] Warning: Backend server has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        if ($frontendProc.HasExited) {
            Write-Host "`n[!] Warning: Frontend server has stopped unexpectedly!" -ForegroundColor Red
            break
        }
        Start-Sleep -Seconds 1
    }
}
catch {
    Write-Host "[!] Error encountered while running servers: $_" -ForegroundColor Red
}
finally {
    # Graceful teardown
    Write-Host "`n============================================================" -ForegroundColor Cyan
    Write-Host "  TEARDOWN: Halting servers & releasing ports..." -ForegroundColor Yellow
    
    # Stop backend
    if ($backendProc -and -not $backendProc.HasExited) {
        Write-Host "Stopping backend process (PID: $($backendProc.Id))..." -ForegroundColor Gray
        Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Stop frontend
    if ($frontendProc -and -not $frontendProc.HasExited) {
        Write-Host "Stopping frontend process wrapper (PID: $($frontendProc.Id))..." -ForegroundColor Gray
        Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue
    }
    
    # Force kill anything remaining on ports 3000 and 5173 to ensure clean release
    Write-Host "Performing deep port sweep to prevent zombie processes..." -ForegroundColor Gray
    Clear-Port $backendPort
    Clear-Port $frontendPort
    
    Write-Host "  Teardown complete. All ports cleanly released." -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
}
