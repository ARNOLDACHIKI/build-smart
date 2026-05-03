#!/bin/bash

# Test Chat API Endpoints
BASE_URL="http://localhost:3000"

echo "========================================="
echo "Testing Build Buddy Chat API Endpoints"
echo "========================================="

# Health check
echo ""
echo "1. Testing Health Endpoint..."
curl -s "$BASE_URL/health" | jq '.' || echo "FAILED"

# Database health
echo ""
echo "2. Testing Database Health..."
curl -s "$BASE_URL/api/health/db" | jq '.' || echo "FAILED"

# Login to get a token (using a seeded account)
echo ""
echo "3. Testing Login to get JWT token..."
TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@buildbuddy.local",
    "password": "TestPassword123!"
  }')

TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token // empty')
USER_ID=$(echo "$TOKEN_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$TOKEN" ]; then
  echo "Login failed. Trying alternative account..."
  TOKEN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "testprofessional@test.local",
      "password": "TestPassword123!"
    }')
  TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token // empty')
  USER_ID=$(echo "$TOKEN_RESPONSE" | jq -r '.user.id // empty')
fi

if [ -n "$TOKEN" ]; then
  echo "✓ Login successful"
  echo "  Token: ${TOKEN:0:20}..."
  echo "  User ID: $USER_ID"
  
  # Test GET chat messages (should return empty array)
  echo ""
  echo "4. Testing GET /api/chat/messages..."
  curl -s "$BASE_URL/api/chat/messages?projectId=test-project" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || echo "FAILED"
  
  # Test presence endpoint
  echo ""
  echo "5. Testing GET /api/presence/:userId..."
  curl -s "$BASE_URL/api/presence/$USER_ID" \
    -H "Authorization: Bearer $TOKEN" | jq '.' || echo "FAILED"
else
  echo "✗ Login failed - cannot test protected endpoints"
  echo "Response: $TOKEN_RESPONSE"
fi

echo ""
echo "========================================="
echo "Chat API Tests Complete"
echo "========================================="
