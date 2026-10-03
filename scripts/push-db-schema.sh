#!/bin/bash
# Push Prisma schema to Neon database on Vercel

# Set the environment variable from Vercel (you'll need to replace *** with the actual password)
export DATABASE_URL="postgresql://neondb_owner:***@ep-young-lake-b813zvpt-pooler.c-14.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

echo "🔄 Pushing Prisma schema to Neon database..."
npx prisma db push --force

if [ $? -eq 0 ]; then
    echo "✅ Database schema pushed successfully!"
    echo "📝 You can now seed the database with:"
    echo "   npx prisma db seed"
else
    echo "❌ Failed to push database schema."
    exit 1
fi
