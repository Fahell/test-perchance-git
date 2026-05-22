#!/bin/bash
# setup.sh - Environment setup for test-perchance-git
# Run this script once after cloning the repository

set -e

echo "🔧 Setting up development environment..."

# Configure Git to use local hooks
echo "📎 Configuring Git hooks..."
git config core.hooksPath .githooks
echo "✅ Git hooks configured (core.hooksPath = .githooks)"

# Make hooks executable
if [ -d ".githooks" ]; then
    chmod +x .githooks/* 2>/dev/null || true
    echo "✅ Git hooks made executable"
fi

# Check if remote is configured
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
if [ -z "$REMOTE_URL" ]; then
    echo "⚠️  No remote 'origin' configured."
    echo "   Run: git remote add origin https://github.com/Fahell/test-perchance-git.git"
else
    echo "✅ Remote configured: $REMOTE_URL"
fi

# Check for required tools
echo ""
echo "🔍 Checking required tools..."

command -v git >/dev/null 2>&1 && echo "  ✅ git $(git --version | awk '{print $3}')" || echo "  ❌ git not found"
command -v node >/dev/null 2>&1 && echo "  ✅ node $(node --version)" || echo "  ⚠️  node not found (optional - for local dev server)"
command -v curl >/dev/null 2>&1 && echo "  ✅ curl available" || echo "  ⚠️  curl not found"

echo ""
echo "🎉 Setup complete! You can now use the automation scripts:"
echo "   ./scripts/release.sh <version> <description>  - Create a new release"
echo "   ./scripts/sync.sh                              - Sync with GitHub"
echo "   ./scripts/dev-server.sh                        - Start local dev server"
