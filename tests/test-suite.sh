#!/bin/bash
# ═══════════════════════════════════════════════════════════
# 🧪 CHEFAI TEST SUITE
# ═══════════════════════════════════════════════════════════

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0

echo "══════════════════════════════════════════════════════════"
echo "🧪 CHEFAI TEST SUITE — $(date '+%Y-%m-%d %H:%M')"
echo "══════════════════════════════════════════════════════════"

# ═══════════════════════════════════════════════════════════
# TEST: Homepage loads
# ═══════════════════════════════════════════════════════════
echo -e "\n1️⃣ Homepage..."
if curl -s "$BASE_URL" | grep -q "ChefAI"; then
  echo "   ✅ PASS — Homepage loads"
  ((PASS++))
else
  echo "   ❌ FAIL — Homepage not loading"
  ((FAIL++))
fi

# ═══════════════════════════════════════════════════════════
# TEST: About page
# ═══════════════════════════════════════════════════════════
echo -e "\n2️⃣ About page..."
if curl -s "$BASE_URL/about" | grep -q "AI Sous-Chef"; then
  echo "   ✅ PASS — About page renders"
  ((PASS++))
else
  echo "   ❌ FAIL — About page not found"
  ((FAIL++))
fi

# ═══════════════════════════════════════════════════════════
# TEST: Price Hunter page
# ═══════════════════════════════════════════════════════════
echo -e "\n3️⃣ Price Hunter page..."
if curl -s "$BASE_URL/price-hunter" | grep -q "Compare Grocery Prices"; then
  echo "   ✅ PASS — Price Hunter page renders"
  ((PASS++))
else
  echo "   ❌ FAIL — Price Hunter page not found"
  ((FAIL++))
fi

# ═══════════════════════════════════════════════════════════
# TEST: Price API - valid request
# ═══════════════════════════════════════════════════════════
echo -e "\n4️⃣ Price API (valid request)..."
RESULT=$(curl -s -X POST "$BASE_URL/api/prices" \
  -H "Content-Type: application/json" \
  -d '{"ingredient":"chicken","location":"Montreal"}')

if echo "$RESULT" | grep -q '"success":true' && echo "$RESULT" | grep -q '"bestDeal"'; then
  echo "   ✅ PASS — API returns valid response"
  ((PASS++))
else
  echo "   ❌ FAIL — API error"
  ((FAIL++))
fi

# ═══════════════════════════════════════════════════════════
# TEST: Price API - empty request
# ═══════════════════════════════════════════════════════════
echo -e "\n5️⃣ Price API (empty request)..."
RESULT=$(curl -s -X POST "$BASE_URL/api/prices" \
  -H "Content-Type: application/json" \
  -d '{}')

if echo "$RESULT" | grep -q '"success":false'; then
  echo "   ✅ PASS — API rejects empty request"
  ((PASS++))
else
  echo "   ❌ FAIL — API should reject empty request"
  ((FAIL++))
fi

# ═══════════════════════════════════════════════════════════
# TEST: Price API - French ingredient
# ═══════════════════════════════════════════════════════════
echo -e "\n6️⃣ Price API (French ingredient)..."
RESULT=$(curl -s -X POST "$BASE_URL/api/prices" \
  -H "Content-Type: application/json" \
  -d '{"ingredient":"poulet","location":"Québec"}')

if echo "$RESULT" | grep -q '"success":true'; then
  COUNT=$(echo "$RESULT" | grep -o '"store"' | wc -l)
  echo "   ✅ PASS — API handles French ($COUNT stores)"
  ((PASS++))
else
  echo "   ❌ FAIL — API French support error"
  ((FAIL++))
fi

# ═══════════════════════════════════════════════════════════
# TEST: Favorites page
# ═══════════════════════════════════════════════════════════
echo -e "\n7️⃣ Favorites page..."
if curl -s "$BASE_URL/favorites" | grep -q "Saved Recipes"; then
  echo "   ✅ PASS — Favorites page renders"
  ((PASS++))
else
  echo "   ❌ FAIL — Favorites page not found"
  ((FAIL++))
fi

# ═══════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════
echo -e "\n══════════════════════════════════════════════════════════"
echo "📊 TEST RESULTS"
echo "══════════════════════════════════════════════════════════"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo "📈 Success Rate: $(( (PASS * 100) / (PASS + FAIL) ))%"
echo "══════════════════════════════════════════════════════════"

if [ $FAIL -eq 0 ]; then
  echo "🎉 ALL TESTS PASSED!"
  exit 0
else
  echo "⚠️ Some tests failed"
  exit 1
fi
