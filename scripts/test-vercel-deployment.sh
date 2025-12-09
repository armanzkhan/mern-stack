#!/bin/bash

# Test script for Vercel deployment
# Usage: ./test-vercel-deployment.sh

BACKEND_URL="https://mern-stack-dtgy.vercel.app"
FRONTEND_URL="https://ressichem-frontend.vercel.app"

echo "🧪 Testing Vercel Deployment"
echo "================================"
echo ""

echo "1️⃣ Testing Backend Health..."
BACKEND_HEALTH=$(curl -s "$BACKEND_URL/api/health")
if echo "$BACKEND_HEALTH" | grep -q "ok"; then
    echo "✅ Backend is healthy"
    echo "   Response: $BACKEND_HEALTH"
else
    echo "❌ Backend health check failed"
    echo "   Response: $BACKEND_HEALTH"
fi
echo ""

echo "2️⃣ Testing Frontend Connection..."
FRONTEND_CONNECTION=$(curl -s "$FRONTEND_URL/api/test-connection")
if echo "$FRONTEND_CONNECTION" | grep -q "success"; then
    echo "✅ Frontend can connect to backend"
    echo "   Response: $FRONTEND_CONNECTION"
else
    echo "⚠️ Frontend connection test: $FRONTEND_CONNECTION"
fi
echo ""

echo "3️⃣ Testing Backend API Routes..."
echo "   Testing /api/auth/login (should return error without credentials, but route exists)..."
AUTH_TEST=$(curl -s -X POST "$BACKEND_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{}')
if echo "$AUTH_TEST" | grep -q "email\|password\|error"; then
    echo "✅ Auth route exists and responds"
else
    echo "⚠️ Auth route test: $AUTH_TEST"
fi
echo ""

echo "✅ Testing complete!"
echo ""
echo "📋 URLs:"
echo "   Backend: $BACKEND_URL"
echo "   Frontend: $FRONTEND_URL"
echo ""
echo "🔍 Manual Tests:"
echo "   1. Visit: $FRONTEND_URL"
echo "   2. Try logging in"
echo "   3. Check browser console (F12)"
echo "   4. Test manager dashboard: $FRONTEND_URL/manager-dashboard"

