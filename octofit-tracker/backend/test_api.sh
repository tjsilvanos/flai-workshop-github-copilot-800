#!/bin/bash

# Test script for OctoFit Tracker API endpoints
# This script tests all API endpoints using curl

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}OctoFit Tracker API Test Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Determine the base URL
if [ -n "$CODESPACE_NAME" ]; then
    BASE_URL="https://${CODESPACE_NAME}-8000.app.github.dev"
    echo -e "${GREEN}Using Codespace URL: ${BASE_URL}${NC}"
else
    BASE_URL="http://localhost:8000"
    echo -e "${GREEN}Using localhost URL: ${BASE_URL}${NC}"
fi
echo ""

# Function to test an endpoint
test_endpoint() {
    local endpoint=$1
    local description=$2
    
    echo -e "${BLUE}Testing: ${description}${NC}"
    echo -e "Endpoint: ${BASE_URL}${endpoint}"
    
    response=$(curl -s -w "\n%{http_code}" "${BASE_URL}${endpoint}")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ]; then
        echo -e "${GREEN}✓ Status: ${http_code}${NC}"
        echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Status: ${http_code}${NC}"
        echo "$body"
    fi
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Test all endpoints
echo -e "${BLUE}Testing API Endpoints...${NC}"
echo ""

test_endpoint "/api/" "API Root"
test_endpoint "/api/users/" "Users List"
test_endpoint "/api/teams/" "Teams List"
test_endpoint "/api/activities/" "Activities List"
test_endpoint "/api/leaderboard/" "Leaderboard"
test_endpoint "/api/workouts/" "Workouts List"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Testing Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
