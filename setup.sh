#!/bin/bash

# Accounting System - Features Deployment Guide

echo "=================================="
echo "Accounting System Setup Script"
echo "=================================="

# Step 1: Install dependencies
echo ""
echo "Step 1: Installing dependencies..."
echo "---"

cd server
npm install
cd ../client
npm install
cd ..

echo "✓ Dependencies installed"

# Step 2: Setup environment
echo ""
echo "Step 2: Setting up environment variables..."
echo "---"

if [ ! -f server/.env ]; then
    echo "Creating server/.env file..."
    cat > server/.env << EOF
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=accounting_system
JWT_SECRET=your_jwt_secret_key
PORT=5000
EOF
    echo "⚠ Please update server/.env with your database credentials"
else
    echo "✓ server/.env already exists"
fi

# Step 3: Run database migrations
echo ""
echo "Step 3: Running database migrations..."
echo "---"

cd server
echo "Running SaaS migration..."
node scratch/saas_migration.js

echo ""
echo "Running features migration..."
node scratch/add_missing_features_migration.js

cd ..

echo ""
echo "✓ Migrations completed"

# Step 4: Start servers
echo ""
echo "Step 4: Starting applications..."
echo "---"
echo ""
echo "Starting backend server (http://localhost:5000)..."
cd server
npm run dev &
SERVER_PID=$!
cd ..

echo ""
echo "Starting frontend application (http://localhost:3000)..."
cd client
npm start
cd ..

echo ""
echo "=================================="
echo "✓ Setup Complete!"
echo "=================================="
echo ""
echo "Backend running on: http://localhost:5000"
echo "Frontend running on: http://localhost:3000"
echo ""
echo "Default login:"
echo "Email: admin@example.com"
echo "Password: (check your database)"
echo ""
echo "New Features Available:"
echo "  - Tax Configuration: /tax-configuration"
echo "  - Cost Centers: /cost-centers"
echo "  - Budget Management: /budgets"
echo "  - Fixed Assets: /fixed-assets"
echo "  - Bank Reconciliation: /bank-reconciliation"
echo "  - Audit Trail: /audit-trail"
echo ""
echo "Press Ctrl+C to stop servers"
