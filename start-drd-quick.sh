#!/bin/bash
# start-drd-quick.sh - Dr.D Quick Tunnel (No Certificate Required)
# Run: bash start-drd-quick.sh

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║     🔷 Dr.D Quick Tunnel Launcher        ║"
echo "║    (No certificate required)             ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Check prerequisites
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    exit 1
fi

if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared not found!${NC}"
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
    kill $TUNNEL_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Node.js server
echo -e "${BLUE}🚀 Starting Dr.D Server on port 3001...${NC}"
node server.js &
NODE_PID=$!

sleep 3

# Start Quick Tunnel (NO CERTIFICATE NEEDED!)
echo -e "${BLUE}🌐 Starting Quick Tunnel...${NC}"
echo -e "${YELLOW}⏳ Waiting for tunnel URL...${NC}"

# Run tunnel and capture output
cloudflared tunnel --url http://localhost:3001 --no-autoupdate 2>&1 | tee /tmp/tunnel.log &
TUNNEL_PID=$!

# Wait for URL to appear
sleep 8

# Extract URL from log
TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' /tmp/tunnel.log | head -1)

if [ -n "$TUNNEL_URL" ]; then
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Dr.D is LIVE!                        ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  🌐 $TUNNEL_URL${NC}"
    echo -e "${GREEN}║  🔒 SSL: Enabled (FREE)                  ║${NC}"
    echo -e "${GREEN}║  ⏰ Valid: 30 minutes                    ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
else
    echo -e "${YELLOW}⚠️  Tunnel starting... check /tmp/tunnel.log${NC}"
    tail -f /tmp/tunnel.log
fi

wait