#!/bin/bash
# dev-server.sh - Local development server
# Serves files over HTTP for local testing with test-local.html

set -e

PORT=${1:-8080}

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🖥️  Starting local development server...${NC}"
echo ""

# Try different server options
if command -v python3 >/dev/null 2>&1; then
    echo -e "${GREEN}Using Python 3 HTTP server${NC}"
    echo -e "   URL: ${YELLOW}http://localhost:${PORT}/test-local.html${NC}"
    echo -e "   Press Ctrl+C to stop"
    echo ""
    python3 -m http.server "$PORT"
elif command -v python >/dev/null 2>&1; then
    echo -e "${GREEN}Using Python HTTP server${NC}"
    echo -e "   URL: ${YELLOW}http://localhost:${PORT}/test-local.html${NC}"
    echo -e "   Press Ctrl+C to stop"
    echo ""
    python -m http.server "$PORT"
elif command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}Using Node.js npx serve${NC}"
    echo -e "   URL: ${YELLOW}http://localhost:${PORT}/test-local.html${NC}"
    echo -e "   Press Ctrl+C to stop"
    echo ""
    npx serve -l "$PORT" -s .
else
    echo -e "${YELLOW}⚠️  No HTTP server found.${NC}"
    echo "   Install Python 3 or Node.js to use the dev server."
    echo ""
    echo "   Alternatively, open test-local.html directly in your browser:"
    echo "   $(pwd)/test-local.html"
    exit 1
fi
