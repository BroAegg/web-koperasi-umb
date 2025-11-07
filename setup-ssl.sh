#!/bin/bash
# SSL Certificate Setup Script for Koperasi UMB
# Run this script BEFORE deploying the application

set -e

# Configuration
DOMAIN="koperasi.umb.ac.id"
EMAIL="admin@umb.ac.id"  # Change this to your email
WEBROOT="/var/www/certbot"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

echo "🔒 SSL Certificate Setup for Koperasi UMB"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Check prerequisites
echo "📋 Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { print_error "Docker is not installed"; exit 1; }
print_success "Docker is installed"
echo ""

# Create directories
echo "📁 Creating required directories..."
mkdir -p ./certbot/conf
mkdir -p ./certbot/www
print_success "Directories created"
echo ""

# Start temporary Nginx for SSL challenge
echo "🌐 Starting temporary Nginx for SSL challenge..."
cat > ./nginx-temp.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
EOF

docker run -d --name nginx-temp \
    -p 80:80 \
    -v $(pwd)/nginx-temp.conf:/etc/nginx/nginx.conf:ro \
    -v $(pwd)/certbot/www:/var/www/certbot \
    nginx:alpine

print_success "Temporary Nginx started"
echo ""

# Wait for Nginx to be ready
sleep 3

# Obtain certificate
echo "📜 Obtaining SSL certificate from Let's Encrypt..."
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""

docker run -it --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN

# Stop temporary Nginx
echo ""
echo "🛑 Stopping temporary Nginx..."
docker stop nginx-temp
docker rm nginx-temp
rm nginx-temp.conf
print_success "Temporary Nginx removed"
echo ""

# Verify certificate
if [ -f "./certbot/conf/live/$DOMAIN/fullchain.pem" ]; then
    print_success "SSL certificate obtained successfully!"
    echo ""
    echo "📄 Certificate files:"
    echo "   • Fullchain: ./certbot/conf/live/$DOMAIN/fullchain.pem"
    echo "   • Private Key: ./certbot/conf/live/$DOMAIN/privkey.pem"
    echo ""
    echo "✅ Certificate is valid for:"
    openssl x509 -in ./certbot/conf/live/$DOMAIN/fullchain.pem -noout -dates
    echo ""
    echo "📅 Certificate will auto-renew via cron job"
    echo ""
    echo "🚀 You can now run: ./deploy-production.sh"
else
    print_error "Failed to obtain SSL certificate"
    echo ""
    echo "Common issues:"
    echo "  • Domain DNS not pointing to this server"
    echo "  • Port 80 blocked by firewall"
    echo "  • Domain already has rate-limited certificate requests"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Verify DNS: dig $DOMAIN"
    echo "  2. Check firewall: sudo ufw status"
    echo "  3. Check Let's Encrypt status: https://letsencrypt.status.io/"
    exit 1
fi
