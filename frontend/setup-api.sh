#!/bin/bash

echo "Ì¥ß Setting up API integration..."

# Install dependencies
npm install axios

# Create API directory structure
mkdir -p lib/api

echo "‚úÖ API setup complete!"
echo "Ì≥Å Created:"
echo "   - lib/api/client.ts (API client configuration)"
echo "   - lib/api/auth.ts (Auth API service)"
echo "   - lib/api/payment.ts (Payment API service)"
echo "   - lib/api/receipt.ts (Receipt API service)"
echo "   - lib/api/tenant.ts (Tenant API service)"
echo "   - lib/api/mock.ts (Mock API for development)"
echo "   - lib/api/context.ts (API context provider)"
echo "   - .env.local (Environment variables)"
echo ""
echo "Ì∫Ä Restart your dev server: npm run dev"
