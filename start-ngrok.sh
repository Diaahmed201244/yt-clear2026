#!/bin/bash
# start-ngrok.sh - Dr.D Ngrok Tunnel Launcher
# Run: bash start-ngrok.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║     🔷 Dr.D Ngrok Tunnel Launcher        ║"
echo "║    (HTTPS PWA Testing)                   ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    exit 1
fi

NGROK_PATH="/usr/local/bin/ngrok"
if [ ! -f "$NGROK_PATH" ]; then
    echo -e "${RED}❌ Ngrok not found at $NGROK_PATH${NC}"
    echo "Install: brew install ngrok"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Function to cleanup
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
    kill $NODE_PID 2>/dev/null
    kill $NGROK_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Kill any existing processes on port 3001
echo -e "${BLUE}🧹 Cleaning up existing processes on port 3001...${NC}"
lsof -ti:3001 | xargs kill -9 2>/dev/null || true
sleep 2

# Start Node.js server on port 3001
echo -e "${BLUE}🚀 Starting Dr.D Server on port 3001...${NC}"
PORT=3001 node server.js &
NODE_PID=$!

sleep 3

# Start Ngrok tunnel
echo -e "${BLUE}🌐 Starting Ngrok tunnel on port 3001...${NC}"
echo -e "${YELLOW}⏳ Waiting for HTTPS URL...${NC}"

# Run Ngrok and capture output
$NGROK_PATH http 3001 --log=stdout 2>&1 | tee /tmp/ngrok.log &
NGROK_PID=$!

# Wait for URL to appear
sleep 8

# Extract URL from log
NGROK_URL=$(grep -o 'https://[a-z0-9-]*\.ngrok-free\.app' /tmp/ngrok.log | head -1)

if [ -n "$NGROK_URL" ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Dr.D is LIVE!                        ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  🌐 $NGROK_URL${NC}"
    echo -e "${GREEN}║  🔒 SSL: Enabled (FREE)                  ║${NC}"
    echo -e "${GREEN}║  📱 PWA: Ready to install                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
else
    echo -e "${YELLOW}⚠️  Ngrok starting... check /tmp/ngrok.log${NC}"
    tail -f /tmp/ngrok.log
fi

wait