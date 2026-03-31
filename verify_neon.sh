#!/bin/bash

# -------------------------------
# Script: Full Auth + Neon Check
# -------------------------------

COOKIE_JAR="./.trae-cookie.txt"
EMAIL="test@example.com"
USERNAME="test"
PASSWORD="TestPassword123!"
BASE_URL="http://localhost:3001"

echo "🚀 Starting full auth + Neon verification flow..."

# 1️⃣ Signup (ignore error if user exists)
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"username\":\"$USERNAME\",\"password\":\"$PASSWORD\"}" \
  -c $COOKIE_JAR)

echo "✅ Signup response: $SIGNUP_RESPONSE"

# 2️⃣ Login
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -c $COOKIE_JAR)

echo "✅ Login response: $LOGIN_RESPONSE"

# 3️⃣ Auth Check
AUTH_ME=$(curl -s -X GET "$BASE_URL/api/auth/me" \
  -b $COOKIE_JAR)

echo "✅ Auth/me response: $AUTH_ME"

# 4️⃣ Get Balances
BALANCES=$(curl -s -X GET "$BASE_URL/api/balances" \
  -b $COOKIE_JAR)

echo "✅ Balances response: $BALANCES"

# 5️⃣ Get Neon Codes
NEON_CODES=$(curl -s -X GET "$BASE_URL/api/neon/codes" \
  -b $COOKIE_JAR)

echo "✅ Neon Codes response: $NEON_CODES"

# 6️⃣ Final JSON output
if command -v jq >/dev/null 2>&1; then
  FINAL_JSON=$(jq -n \
    --argjson auth "$AUTH_ME" \
    --argjson balances "$BALANCES" \
    --argjson neon_codes "$NEON_CODES" \
    '{
      auth: $auth,
      balances: $balances,
      neon_codes: $neon_codes
    }')

  echo
  echo "🎯 Full Result:"
  echo "$FINAL_JSON"
else
  echo
  echo "⚠️ jq غير مثبت؛ عرض النتائج الخام:" 
  echo "{"
  echo "  \"auth\": $AUTH_ME,"
  echo "  \"balances\": $BALANCES,"
  echo "  \"neon_codes\": $NEON_CODES"
  echo "}"
fi
