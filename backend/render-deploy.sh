#!/bin/bash

echo "Ì∫Ä Starting Render deployment process..."

# Generate Prisma Client
echo "Ì¥ß Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "Ì∑ÑÔ∏è Running database migrations..."
npx prisma migrate deploy

# Seed the database
echo "Ìº± Seeding database..."
npm run seed

echo "‚úÖ Deployment complete!"
echo ""
echo "Ì≥ä Backend URL: https://montez-a-system-backend.onrender.com"
echo "Ìºê Frontend URL: https://montez-a.onrender.com"
echo "Ì¥ó API Docs: https://montez-a-system-backend.onrender.com/api-docs"
echo ""
echo "Ì±§ Demo Credentials:"
echo "   Admin: admin@monteza.com / admin123"
echo "   Tenant: john.kamau@monteza.com / password123"
