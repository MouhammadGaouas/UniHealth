#!/bin/bash

BASE_URL="http://localhost:3000"

echo "Step 1: Fetching Doctors (Expect 200 OK)..."
DOCTORS_JSON=$(curl -s "$BASE_URL/api/doctors")

if echo "$DOCTORS_JSON" | grep -q "doctors"; then
    echo "   [PASS] Fetched doctors successfully."
    # Extract first doctor ID
    DOCTOR_ID=$(echo "$DOCTORS_JSON" | grep -oP '"id":"\K[^"]+' | head -n 1)
    echo "   [INFO] Testing with Doctor ID: $DOCTOR_ID"
else
    echo "   [FAIL] Failed to fetch doctors: $DOCTORS_JSON"
    exit 1
fi

if [ -z "$DOCTOR_ID" ]; then
    echo "   [WARN] No doctors found to test availability."
    exit 0
fi

TODAY=$(date +%Y-%m-%d)
echo "Step 2: Checking Availability for $TODAY..."
AVAILABILITY_JSON=$(curl -s "$BASE_URL/api/doctors/availability?doctorId=$DOCTOR_ID&date=$TODAY")

if echo "$AVAILABILITY_JSON" | grep -q "bookedSlots"; then
    echo "   [PASS] Availability API returned bookedSlots."
    echo "   [INFO] Response: $AVAILABILITY_JSON"
else
    echo "   [FAIL] Availability API failed: $AVAILABILITY_JSON"
    exit 1
fi

echo "Test complete."
