#!/bin/bash

# Quick Setup Script for Equipment Checkout System
# This script automates the initial setup process

set -e

echo "🚀 Equipment Checkout System - Quick Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed or not in PATH"
    echo "   Please install PostgreSQL 14+ first"
    exit 1
fi

# Create database
DB_NAME="equipment_checkout"
echo "📦 Creating database: $DB_NAME"
if psql -lqt | cut -d \| -f 1 | grep -qw $DB_NAME; then
    echo "   Database already exists, skipping creation"
else
    sudo -u postgres createdb $DB_NAME || {
        echo "   Could not create database. You may need to run:"
        echo "   sudo -u postgres createdb $DB_NAME"
        exit 1
    }
fi

# Generate NextAuth secret
echo "🔐 Generating NextAuth secret..."
SECRET=$(openssl rand -base64 32)

# Create .env file
echo "📝 Creating .env file..."
cat > .env << EOF
# Database
DATABASE_URL="postgresql://localhost:5432/$DB_NAME?connect_timeout=30"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$SECRET

# Application
NODE_ENV=development
EOF

echo "✅ .env file created"
echo ""

# Run migrations
echo "🔄 Running database migrations..."
npm run db:migrate -- --name initial-setup

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📝 You can now start the development server:"
echo "   npm run dev"
echo ""
echo "🔑 Demo login credentials:"
echo "   Admin:    admin@catawba.edu / Password123!"
echo "   Staff:    staff@catawba.edu / Password123!"
echo "   Student:  student1@catawba.edu / Password123!"
echo ""
echo "🌐 Open http://localhost:3000 in your browser"
echo ""
