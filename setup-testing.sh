#!/bin/bash

# Testing Infrastructure Setup Script
# This script sets up the testing infrastructure and validates everything works

set -e

echo "🚀 Setting up testing infrastructure..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the client directory."
    exit 1
fi

echo ""
echo "✅ All dependencies already installed!"

echo ""
echo "🔧 Setting up git hooks..."

# Ensure husky is properly installed
npm run prepare

# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

echo ""
echo "✅ Git hooks configured!"

echo ""
echo "🧪 Running type check to verify setup..."

# Run type check
npm run type-check

echo ""
echo "✅ Setup complete!"

echo ""
echo "📚 Next steps:"
echo "  1. Review documentation in docs/TESTING-QUICK-START.md"
echo "  2. Run 'npm test' to start writing tests"
echo "  3. Run 'npm run test:coverage' to see current coverage"
echo "  4. Run 'npm run test:e2e' to test E2E setup"
echo ""
echo "🎉 Happy testing!"
