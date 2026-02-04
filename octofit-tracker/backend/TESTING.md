# OctoFit Tracker Backend Testing Guide

## Starting the Django Server

### Option 1: Using VS Code Launch Configuration (Recommended)
1. Open the **Run and Debug** panel in VS Code (Ctrl+Shift+D or Cmd+Shift+D)
2. Select "Launch Django Backend" from the dropdown
3. Click the green play button or press F5
4. The server will start on port 8000

### Option 2: Using Terminal
```bash
cd /workspaces/flai-workshop-github-copilot-800/octofit-tracker/backend
source venv/bin/activate
python manage.py runserver 0.0.0.0:8000
```

## Testing API Endpoints

### Using the Test Script (Recommended)
```bash
cd /workspaces/flai-workshop-github-copilot-800/octofit-tracker/backend
./test_api.sh
```

### Manual Testing with curl

#### API Root
```bash
# Localhost
curl http://localhost:8000/api/

# Codespace URL
curl https://${CODESPACE_NAME}-8000.app.github.dev/api/
```

#### Users Endpoint
```bash
# Localhost
curl http://localhost:8000/api/users/

# Codespace URL
curl https://${CODESPACE_NAME}-8000.app.github.dev/api/users/
```

#### Teams Endpoint
```bash
# Localhost
curl http://localhost:8000/api/teams/

# Codespace URL
curl https://${CODESPACE_NAME}-8000.app.github.dev/api/teams/
```

#### Activities Endpoint
```bash
# Localhost
curl http://localhost:8000/api/activities/

# Codespace URL
curl https://${CODESPACE_NAME}-8000.app.github.dev/api/activities/
```

#### Leaderboard Endpoint
```bash
# Localhost
curl http://localhost:8000/api/leaderboard/

# Codespace URL
curl https://${CODESPACE_NAME}-8000.app.github.dev/api/leaderboard/
```

#### Workouts Endpoint
```bash
# Localhost
curl http://localhost:8000/api/workouts/

# Codespace URL
curl https://${CODESPACE_NAME}-8000.app.github.dev/api/workouts/
```

## Configuration Details

### ALLOWED_HOSTS (settings.py)
The Django backend is configured to accept requests from:
- `localhost`
- `127.0.0.1`
- `${CODESPACE_NAME}-8000.app.github.dev` (when running in Codespaces)

### CSRF_TRUSTED_ORIGINS (settings.py)
CSRF protection is configured for:
- `https://${CODESPACE_NAME}-8000.app.github.dev` (when running in Codespaces)

### API URL Configuration (urls.py)
The API automatically detects the environment and returns appropriate URLs:
- Local: `http://localhost:8000`
- Codespace: `https://${CODESPACE_NAME}-8000.app.github.dev`

## Codespace Environment
Your current Codespace name: `glorious-space-spork-pjr7rvx9q67p364pp`
Your API base URL: `https://glorious-space-spork-pjr7rvx9q67p364pp-8000.app.github.dev`

## Port Configuration
- Backend (Django): Port 8000 (public)
- Frontend (React): Port 3000 (public)
- MongoDB: Port 27017 (private)
