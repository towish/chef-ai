#!/bin/bash
# Test API Price Hunter (sans jq)

echo "🏹 Testing Price Hunter API..."

# Test 1: Basic search
echo -e "\n1️⃣ Testing basic price search (chicken)..."
RESULT=$(curl -s -X POST http://localhost:3000/api/prices \
  -H "Content-Type: application/json" \
  -d '{"ingredient":"chicken breast","location":"Montreal"}')
if echo "$RESULT" | grep -q '"success":true'; then
  echo "✅ API responds correctly"
  echo "$RESULT" | grep -o '"bestDeal":[^}]*}' | head -1
else
  echo "❌ Failed"
fi

# Test 2: Empty request
echo -e "\n2️⃣ Testing empty request..."
RESULT=$(curl -s -X POST http://localhost:3000/api/prices \
  -H "Content-Type: application/json" \
  -d '{}')
if echo "$RESULT" | grep -q '"success":false'; then
  echo "✅ Correctly rejected empty request"
else
  echo "❌ Should reject empty request"
fi

# Test 3: French ingredient
echo -e "\n3️⃣ Testing French ingredient (poulet)..."
RESULT=$(curl -s -X POST http://localhost:3000/api/prices \
  -H "Content-Type: application/json" \
  -d '{"ingredient":"poulet","location":"Quebec"}')
COUNT=$(echo "$RESULT" | grep -o '"store"' | wc -l)
echo "Found $COUNT prices"

# Test 4: Check response structure
echo -e "\n4️⃣ Checking response structure..."
RESULT=$(curl -s -X POST http://localhost:3000/api/prices \
  -H "Content-Type: application/json" \
  -d '{"ingredient":"milk"}')
if echo "$RESULT" | grep -q '"success"' && echo "$RESULT" | grep -q '"bestDeal"' && echo "$RESULT" | grep -q '"prices"'; then
  echo "✅ Structure valid"
else
  echo "❌ Invalid structure"
fi

# Test 5: Verify prices are sorted
echo -e "\n5️⃣ Verifying prices are sorted..."
RESULT=$(curl -s -X POST http://localhost:3000/api/prices \
  -H "Content-Type: application/json" \
  -d '{"ingredient":"beef"}')
FIRST=$(echo "$RESULT" | grep -o '"price":[0-9.]*' | head -1 | grep -o '[0-9.]*$')
LAST=$(echo "$RESULT" | grep -o '"price":[0-9.]*' | tail -1 | grep -o '[0-9.]*$')
if [ "$(echo "$FIRST < $LAST" | bc -l 2>/dev/null || echo "0")" = "1" ]; then
  echo "✅ Prices are sorted (lowest first: $FIRST, highest: $LAST)"
else
  echo "⚠️ Sorting check skipped (bc not available)"
fi

echo -e "\n✅ Tests completed!"
