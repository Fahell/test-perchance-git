#!/bin/bash
# sync.sh - Synchronize local repository with GitHub
# Pulls latest changes and pushes local commits

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 Syncing with GitHub...${NC}"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
    git status --short
    echo ""
    read -p "   Commit these changes before syncing? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "   Commit message: " COMMIT_MSG
        git add .
        git commit -m "${COMMIT_MSG:-sync: update changes}"
    else
        echo -e "${RED}❌ Aborting. Commit or stash changes first.${NC}"
        exit 1
    fi
fi

# Fetch and pull
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull --rebase origin main

# Push
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main

# Fetch all tags
echo -e "${YELLOW}🏷️  Fetching tags...${NC}"
git fetch --tags

echo ""
echo -e "${GREEN}✅ Sync complete!${NC}"
echo ""

# Show current status
echo -e "${BLUE}📊 Status:${NC}"
echo "   Branch: $(git branch --show-current)"
echo "   Last commit: $(git log -1 --format='%h %s')"
echo "   Latest tag: $(git describe --tags --abbrev=0 2>/dev/null || echo 'none')"
