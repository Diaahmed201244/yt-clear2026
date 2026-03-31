#!/bin/bash
# start-drd.sh - Dr.D One-Click Launcher
# Run: bash start-drd.sh

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔══════════════════════════════════════════╗"
echo "║         🔷 Dr.D Launcher                 ║"
echo "║    One-click start server + tunnel       ║"
echo "╚══════════════════════════════════════════╝"
echo -e "${NC}"

# Ask user for mode
echo -e "${YELLOW}Select mode:${NC}"
echo "1) Custom domain (drd-connect.online) - needs nameservers configured"
echo "2) Quick test (temporary URL) - works immediately"
read -p "Enter choice [1-2]: " MODE_CHOICE

# Check if running from correct directory
if [ ! -f "server.js" ]; then
    echo -e "${RED}❌ Error: server.js not found!${NC}"
    echo "Please run this script from your project directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo "Install from: https://nodejs.org"
    exit 1
fi

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo -e "${RED}❌ cloudflared not found!${NC}"
    echo "Install: brew install cloudflared"
    exit 1
fi

# Check for certificate
echo -e "${BLUE}🔍 Searching for Cloudflare certificate...${NC}"
CERT_PATHS=(
    "$HOME/.cloudflared/cert.pem"
    "$HOME/.cloudflare-warp/cert.pem"
    "$HOME/cloudflare-warp/cert.pem"
    "/etc/cloudflared/cert.pem"
    "/usr/local/etc/cloudflared/cert.pem"
    "$HOME/Downloads/cert.pem"
)

CERT_FOUND=""
for path in "${CERT_PATHS[@]}"; do
    if [ -f "$path" ]; then
        CERT_FOUND="$path"
        break
    fi
done

# Also search using find
if [ -z "$CERT_FOUND" ]; then
    FOUND_CERT=$(find "$HOME" -name "cert.pem" 2>/dev/null | head -1)
    if [ -n "$FOUND_CERT" ]; then
        CERT_FOUND="$FOUND_CERT"
    fi
fi

if [ -z "$CERT_FOUND" ]; then
    echo -e "${RED}❌ Certificate not found!${NC}"
    echo ""
    echo "Please run this command to login and get certificate:"
    echo -e "${YELLOW}  cloudflared tunnel login${NC}"
    echo ""
    echo "Then move the cert.pem to ~/.cloudflared/:"
    echo -e "${YELLOW}  mv ~/Downloads/cert.pem ~/.cloudflared/${NC}"
    echo ""
    exit 1
fi

# Export certificate path
export TUNNEL_ORIGIN_CERT="$CERT_FOUND"
echo -e "${GREEN}✅ Found certificate: $CERT_FOUND${NC}"

# Check if tunnel exists, if not create it
TUNNEL_NAME="drd-server"
TUNNEL_CONFIG="$HOME/.cloudflared/config.yml"

if [ ! -f "$TUNNEL_CONFIG" ]; then
    echo -e "${YELLOW}⚠️  Tunnel config not found. Creating...${NC}"
    
    # Check if tunnel exists
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    
    if [ -z "$TUNNEL_ID" ]; then
        echo -e "${BLUE}🔧 Creating new tunnel: $TUNNEL_NAME${NC}"
        cloudflared tunnel create "$TUNNEL_NAME"
        TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
        
        echo -e "${BLUE}🌐 Routing domain: drd-connect.online${NC}"
        cloudflared tunnel route dns "$TUNNEL_NAME" drd-connect.online
    fi
    
    # Create config file
    echo -e "${BLUE}📝 Creating config file...${NC}"
    cat > "$TUNNEL_CONFIG" << EOF
tunnel: $TUNNEL_ID
credentials-file: $HOME/.cloudflared/$TUNNEL_ID.json

ingress:
  - hostname: drd-connect.online
    service: http://localhost:3001
  - service: http_status:404
EOF
    
    echo -e "${GREEN}✅ Tunnel config created!${NC}"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install
fi

# Function to cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
    kill $NODE_PID 2>/dev/null
    kill $TUNNEL_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start Node.js server
echo -e "${BLUE}🚀 Starting Dr.D Server...${NC}"
node server.js &
NODE_PID=$!

# Wait for server to start
sleep 3

# Check if server started
if ! kill -0 $NODE_PID 2>/dev/null; then
    echo -e "${RED}❌ Server failed to start!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Server running on http://localhost:3001${NC}"

# Start Cloudflare Tunnel based on mode
if [ "$MODE_CHOICE" = "2" ]; then
    # Quick test mode - temporary URL
    echo -e "${BLUE}🌐 Starting Cloudflare Tunnel (Quick Test Mode)...${NC}"
    cloudflared tunnel --url http://localhost:3001 &
    TUNNEL_PID=$!
    
    # Wait for tunnel
    sleep 8
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Dr.D is LIVE!                        ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  🌐 Check terminal for URL above         ║${NC}"
    echo -e "${GREEN}║     (https://xxx.trycloudflare.com)      ║${NC}"
    echo -e "${GREEN}║  🔒 SSL: Enabled (FREE)                  ║${NC}"
    echo -e "${GREEN}║  📱 PWA: Ready to install                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
else
    # Custom domain mode
    echo -e "${BLUE}🌐 Starting Cloudflare Tunnel (Custom Domain)...${NC}"
    cloudflared tunnel run "$TUNNEL_NAME" &
    TUNNEL_PID=$!
    
    # Wait for tunnel
    sleep 5
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✅ Dr.D is LIVE!                        ║${NC}"
    echo -e "${GREEN}╠══════════════════════════════════════════╣${NC}"
    echo -e "${GREEN}║  🌐 https://drd-connect.online           ║${NC}"
    echo -e "${GREEN}║  🔒 SSL: Enabled (FREE)                  ║${NC}"
    echo -e "${GREEN}║  📱 PWA: Ready to install                ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
fi

# Keep script running
wait
