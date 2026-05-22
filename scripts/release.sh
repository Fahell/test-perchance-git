#!/bin/bash
# release.sh - Automated release script
# Usage: ./scripts/release.sh <version> <description>
# Example: ./scripts/release.sh 1.2.6 "feat: Added new module"

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}❌ Error: Missing arguments${NC}"
    echo "Usage: ./scripts/release.sh <version> <description>"
    echo "Example: ./scripts/release.sh 1.2.6 \"feat: Added new module\""
    exit 1
fi

VERSION=$1
DESCRIPTION=$2
TAG="v${VERSION}"

echo -e "${BLUE}🚀 Starting release ${TAG}${NC}"
echo "   Description: ${DESCRIPTION}"
echo ""

# Validate version format (semver)
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo -e "${RED}❌ Invalid version format. Use: X.Y.Z (e.g., 1.2.6)${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected.${NC}"
    read -p "   Stage and commit all changes? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git add .
        git commit -m "$DESCRIPTION"
        echo -e "${GREEN}✅ Changes committed${NC}"
    else
        echo -e "${RED}❌ Aborting. Please commit changes first.${NC}"
        exit 1
    fi
fi

# Check if tag already exists
if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo -e "${RED}❌ Tag ${TAG} already exists!${NC}"
    echo "   Use a different version or delete the existing tag."
    exit 1
fi

# Update version in for-perchance.html
HTML_FILE="for-perchance.html"
if [ -f "$HTML_FILE" ]; then
    echo -e "${YELLOW}📝 Updating version in ${HTML_FILE}...${NC}"
    
    # Extract current version
    CURRENT_VER=$(grep -oP 'v[0-9]+\.[0-9]+\.[0-9]+' "$HTML_FILE" | head -1 | tr -d 'v')
    
    if [ -n "$CURRENT_VER" ]; then
        # Replace all occurrences of the old version
        sed -i "s/v${CURRENT_VER}/v${VERSION}/g" "$HTML_FILE"
        echo -e "${GREEN}   Updated: v${CURRENT_VER} → v${VERSION}${NC}"
        
        # Stage the change
        git add "$HTML_FILE"
        git commit -m "chore: bump version to ${VERSION}" --allow-empty
    fi
fi

# Update version in README.md title
README_FILE="README.md"
if [ -f "$README_FILE" ]; then
    CURRENT_README_VER=$(grep -oP 'v[0-9]+\.[0-9]+\.[0-9]+' "$README_FILE" | head -1 | tr -d 'v')
    if [ -n "$CURRENT_README_VER" ]; then
        sed -i "s/v${CURRENT_README_VER}/v${VERSION}/g" "$README_FILE"
        git add "$README_FILE"
        git commit -m "docs: update README version to ${VERSION}" --allow-empty
    fi
fi

# Create annotated tag
echo -e "${YELLOW}🏷️  Creating tag ${TAG}...${NC}"
git tag -a "$TAG" -m "${TAG} - ${DESCRIPTION}"
echo -e "${GREEN}✅ Tag created${NC}"

# Push to GitHub
echo -e "${YELLOW}📤 Pushing to GitHub...${NC}"
git push origin main
git push origin "$TAG"
echo -e "${GREEN}✅ Pushed successfully${NC}"

# Summary
echo ""
echo -e "${GREEN}🎉 Release ${TAG} complete!${NC}"
echo ""
echo "   CDN URL (available in ~1 minute):"
echo "   https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@${TAG}/src/main.js"
echo ""
echo "   To purge CDN cache immediately:"
echo "   https://purge.jsdelivr.net/gh/Fahell/test-perchance-git@${TAG}/src/main.js"
