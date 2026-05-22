#!/bin/bash
# check-cdn.sh - Verify if a version is available on jsDelivr CDN
# Usage: ./scripts/check-cdn.sh [version]
# Example: ./scripts/check-cdn.sh 1.2.6

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

VERSION=${1:-$(git describe --tags --abbrev=0 2>/dev/null | tr -d 'v')}

if [ -z "$VERSION" ]; then
    echo -e "${RED}❌ No version specified and no Git tags found.${NC}"
    echo "Usage: ./scripts/check-cdn.sh <version>"
    exit 1
fi

URL="https://cdn.jsdelivr.net/gh/Fahell/test-perchance-git@v${VERSION}/src/main.js"

echo -e "${BLUE}🔍 Checking CDN availability for v${VERSION}...${NC}"
echo "   URL: ${URL}"
echo ""

HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null)

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ v${VERSION} is available on jsDelivr CDN!${NC}"
elif [ "$HTTP_STATUS" = "404" ]; then
    echo -e "${RED}❌ v${VERSION} is NOT available yet.${NC}"
    echo ""
    echo "   Possible causes:"
    echo "   1. Tag v${VERSION} was just created (CDN takes ~1-5 minutes)"
    echo "   2. Tag v${VERSION} does not exist on GitHub"
    echo ""
    echo "   To force CDN to pick up the tag:"
    echo "   https://purge.jsdelivr.net/gh/Fahell/test-perchance-git@v${VERSION}/src/main.js"
else
    echo -e "${YELLOW}⚠️  Unexpected HTTP status: ${HTTP_STATUS}${NC}"
fi
