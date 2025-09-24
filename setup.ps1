# This script sets up the directory structure for the MERN House Price Prediction project in PowerShell.

Write-Host "Creating project structure..."

# Create main directories and subdirectories
New-Item -ItemType Directory -Path "backend/models" -Force | Out-Null
New-Item -ItemType Directory -Path "frontend/src" -Force | Out-Null

# Create backend files
New-Item -ItemType File -Path "backend/server.js" | Out-Null
New-Item -ItemType File -Path "backend/predict.py" | Out-Null

# Create a basic package.json for the backend using a here-string
@"
{
  "name": "backend",
  "version": "1.0.0",
  "description": "Backend server for house price prediction",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC"
}
"@ | Set-Content -Path "backend/package.json"

# Create placeholder frontend files
New-Item -ItemType File -Path "frontend/src/App.js" | Out-Null
New-Item -ItemType File -Path "frontend/src/App.css" | Out-Null

# Create a .gitignore file
@"
# Node
node_modules/
npm-debug.log
package-lock.json

# Python
__pycache__/
*.pyc
.venv/
.env

# VS Code
.vscode/
"@ | Set-Content -Path ".gitignore"

Write-Host "✅ Project structure created successfully!"
Write-Host ""
Write-Host "--- Next Steps ---"
Write-Host "1. Run 'cd backend; npm install express cors' to install backend dependencies."
Write-Host "2. Run 'npx create-react-app frontend --use-npm' to set up the React app properly."
Write-Host "   (Note: This will overwrite the placeholder frontend files, which is intended.)"
Write-Host "3. Run 'cd frontend; npm install axios' to add axios to your React app."