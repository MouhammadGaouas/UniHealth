#!/bin/bash

BASE_URL="http://localhost:3000"
COOKIE_JAR="test_cookies.txt"
EMAIL="test_patient_$(date +%s)@example.com"
PASSWORD="password123"

echo "Step 1: Registering a new patient ($EMAIL)..."
REG_RESP=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test Patient\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$REG_RESP" | grep -q "user"; then
    echo "   [PASS] Registration successful."
else
    echo "   [FAIL] Registration failed: $REG_RESP"
    exit 1
fi

echo "Step 2: Logging in..."
LOGIN_RESP=$(curl -s -c $COOKIE_JAR -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESP" | grep -q "Login successful"; then
    echo "   [PASS] Login successful."
else
    echo "   [FAIL] Login failed: $LOGIN_RESP"
    exit 1
fi

echo "Step 3: Checking Dashboard Page (/dashboard)..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b $COOKIE_JAR "$BASE_URL/dashboard")
if [ "$DASHBOARD_STATUS" == "200" ]; then
    echo "   [PASS] Dashboard page returns 200 OK."
elif [ "$DASHBOARD_STATUS" == "307" ] || [ "$DASHBOARD_STATUS" == "302" ]; then
    LOCATION=$(curl -s -I -b $COOKIE_JAR "$BASE_URL/dashboard" | grep -i "location:" | awk '{print $2}' | tr -d '\r')
    echo "   [REPRODUCED] Dashboard page redirects to: $LOCATION (Status: $DASHBOARD_STATUS)"
else
    echo "   [FAIL] Dashboard page returns unexpected status: $DASHBOARD_STATUS"
fi

echo "Step 4: Debugging Dashboard Cookies..."
curl -v -b $COOKIE_JAR "$BASE_URL/dashboard" 2>&1 | grep -i "cookie"

# Cleanup
# rm $COOKIE_JAR
echo "Test complete."
