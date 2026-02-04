#!/bin/bash

BASE_URL="http://localhost:3000"
COOKIE_JAR="admin_cookies.txt"
EMAIL="admin@unihealth.com"
PASSWORD="password123"

# Start the dev server in the background if not running (assuming it is running for this context, otherwise curl will fail)
# But for this test, we assume the server is running on port 3000.

echo "Step 1: Logging in as Admin..."
LOGIN_RESP=$(curl -s -c $COOKIE_JAR -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

if echo "$LOGIN_RESP" | grep -q "Login successful" || echo "$LOGIN_RESP" | grep -q "token"; then
    echo "   [PASS] Login successful."
else
    echo "   [FAIL] Login failed: $LOGIN_RESP"
    exit 1
fi

echo "Step 2: Checking Admin Dashboard (/dashboard/admin)..."
DASHBOARD_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -b $COOKIE_JAR "$BASE_URL/dashboard/admin")

if [ "$DASHBOARD_STATUS" == "200" ]; then
    echo "   [PASS] Admin Dashboard returns 200 OK."
elif [ "$DASHBOARD_STATUS" == "307" ] || [ "$DASHBOARD_STATUS" == "302" ]; then
    LOCATION=$(curl -s -I -b $COOKIE_JAR "$BASE_URL/dashboard/admin" | grep -i "location:" | awk '{print $2}' | tr -d '\r')
    echo "   [FAIL] Redirected to: $LOCATION (Status: $DASHBOARD_STATUS)"
else
    echo "   [FAIL] Unexpected status: $DASHBOARD_STATUS"
fi

# Cleanup
rm $COOKIE_JAR
echo "Verification complete."
