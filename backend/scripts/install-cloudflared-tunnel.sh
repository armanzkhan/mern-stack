#!/bin/bash
# Run this on your server (e.g. root@ressichem-crm) to install cloudflared and get an HTTPS URL for the backend.
# Usage: sudo bash install-cloudflared-tunnel.sh

set -e

# Install cloudflared (choose one method)

# --- Method 1: Direct binary (works on most Linux x86_64) ---
install_binary() {
  echo "Installing cloudflared from GitHub release..."
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)  BIN="cloudflared-linux-amd64" ;;
    aarch64|arm64) BIN="cloudflared-linux-arm64" ;;
    armv7l|arm)   BIN="cloudflared-linux-arm" ;;
    *) echo "Unsupported arch: $ARCH"; exit 1 ;;
  esac
  cd /tmp
  wget -q "https://github.com/cloudflare/cloudflared/releases/latest/download/${BIN}" -O cloudflared
  chmod +x cloudflared
  sudo mv cloudflared /usr/local/bin/
  echo "Installed cloudflared to /usr/local/bin/cloudflared"
}

# --- Method 2: apt (Debian/Ubuntu) ---
install_apt() {
  echo "Installing cloudflared via apt..."
  sudo mkdir -p /usr/share/keyrings
  curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg > /dev/null
  echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared any main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
  sudo apt-get update -qq && sudo apt-get install -y cloudflared
  echo "Installed cloudflared via apt"
}

# Try apt first if available, else binary
if command -v apt-get &>/dev/null; then
  install_apt 2>/dev/null || install_binary
else
  install_binary
fi

echo ""
echo "=============================================="
echo "Start the tunnel (backend must be on port 5000):"
echo "  cloudflared tunnel --url http://localhost:5000"
echo ""
echo "Copy the HTTPS URL it prints (e.g. https://xxx.trycloudflare.com)"
echo "Then in Vercel set: NEXT_PUBLIC_BACKEND_URL = that URL"
echo "=============================================="
