#!/bin/bash
# Production Deployment Script for Koperasi UMB
# Run this script on your VPS to deploy the application

set -e  # Exit on error

echo "🚀 Starting Production Deployment for Koperasi UMB..."
echo ""

# Configuration
APP_DIR="/opt/koperasi-umb"
BACKUP_DIR="/opt/koperasi-umb/backups"
DOMAIN="koperasi.umb.ac.id"
EMAIL="admin@umb.ac.id"  # Change this to your email

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Helper functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root or with sudo"
    exit 1
fi

# Step 1: Check prerequisites
echo "📋 Checking prerequisites..."
command -v docker >/dev/null 2>&1 || { print_error "Docker is not installed. Please install Docker first."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || command -v docker compose >/dev/null 2>&1 || { print_error "Docker Compose is not installed."; exit 1; }
command -v git >/dev/null 2>&1 || { print_error "Git is not installed. Please install Git first."; exit 1; }
print_success "All prerequisites met"
echo ""

# Step 2: Create application directory
echo "📁 Setting up application directory..."
mkdir -p $APP_DIR
mkdir -p $BACKUP_DIR
cd $APP_DIR
print_success "Application directory created: $APP_DIR"
echo ""

# Step 3: Clone or pull repository
echo "📥 Getting application code..."
if [ -d ".git" ]; then
    print_warning "Repository already exists, pulling latest changes..."
    git pull origin main
else
    print_warning "Cloning repository..."
    git clone https://github.com/BroAegg/web-koperasi-umb.git .
fi
print_success "Application code ready"
echo ""

# Step 4: Setup environment file
echo "⚙️ Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    print_warning "Creating .env.production from template..."
    cp .env.production.example .env.production
    
    # Generate random passwords
    MYSQL_ROOT_PWD=$(openssl rand -base64 32)
    MYSQL_PWD=$(openssl rand -base64 32)
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Update .env.production with generated values
    sed -i "s/your-super-secure-root-password-here-change-this/$MYSQL_ROOT_PWD/" .env.production
    sed -i "s/your-secure-db-password-here-change-this/$MYSQL_PWD/g" .env.production
    sed -i "s/your-nextauth-secret-generate-with-openssl-rand-base64-32/$NEXTAUTH_SECRET/" .env.production
    sed -i "s|koperasi.umb.ac.id|$DOMAIN|g" .env.production
    
    print_success "Environment file created with secure passwords"
    print_warning "Please review and update .env.production with your domain and settings"
    echo ""
    echo "Press Enter to continue after reviewing .env.production..."
    read
else
    print_success "Environment file already exists"
fi
echo ""

# Step 5: Update Nginx configuration with domain
echo "🌐 Updating Nginx configuration..."
sed -i "s/koperasi.umb.ac.id/$DOMAIN/g" nginx/conf.d/koperasi.conf
print_success "Nginx configuration updated"
echo ""

# Step 6: Obtain SSL certificate
echo "🔒 Setting up SSL certificate..."
if [ ! -d "certbot/conf/live/$DOMAIN" ]; then
    print_warning "Obtaining SSL certificate from Let's Encrypt..."
    
    # Create temporary Nginx config for SSL challenge
    docker-compose -f docker-compose.production.yml up -d nginx
    
    # Request certificate
    docker-compose -f docker-compose.production.yml run --rm certbot certonly \
        --webroot \
        --webroot-path=/var/www/certbot \
        --email $EMAIL \
        --agree-tos \
        --no-eff-email \
        -d $DOMAIN \
        -d www.$DOMAIN
    
    print_success "SSL certificate obtained"
else
    print_success "SSL certificate already exists"
fi
echo ""

# Step 7: Build and start containers
echo "🐳 Building and starting Docker containers..."
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
print_success "Containers started"
echo ""

# Step 8: Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10
print_success "Database is ready"
echo ""

# Step 9: Run database migrations
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.production.yml exec -T app npx prisma migrate deploy
docker-compose -f docker-compose.production.yml exec -T app npx prisma generate
print_success "Database migrations completed"
echo ""

# Step 10: Seed initial users
echo "👥 Seeding initial users..."
docker-compose -f docker-compose.production.yml exec -T app npx tsx prisma/seed-auth.ts
print_success "Initial users created"
echo ""

# Step 11: Setup automated backups
echo "💾 Setting up automated backups..."
cat > /etc/cron.daily/koperasi-backup << 'EOF'
#!/bin/bash
# Daily backup script for Koperasi UMB database

BACKUP_DIR="/opt/koperasi-umb/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="koperasi_umb_${DATE}.sql"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Backup database
docker exec koperasi-mysql-prod mysqldump -u root -p$MYSQL_ROOT_PASSWORD koperasi_umb_production > $BACKUP_DIR/$BACKUP_FILE

# Compress backup
gzip $BACKUP_DIR/$BACKUP_FILE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
EOF

chmod +x /etc/cron.daily/koperasi-backup
print_success "Automated daily backups configured"
echo ""

# Step 12: Display deployment information
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "✅ DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "📊 Deployment Information:"
echo "   • Application URL: https://$DOMAIN"
echo "   • Application Directory: $APP_DIR"
echo "   • Backup Directory: $BACKUP_DIR"
echo "   • Docker Containers: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep koperasi)"
echo ""
echo "🔐 Default Login Credentials:"
echo "   • Super Admin:"
echo "     - Email: super@umb.ac.id"
echo "     - Password: Super123!@#"
echo ""
echo "   • Admin/Kasir:"
echo "     - Email: admin@umb.ac.id"
echo "     - Password: Admin123!@#"
echo ""
echo "   • Developer:"
echo "     - URL: https://$DOMAIN/dev/login"
echo "     - Email: dev@umb.ac.id"
echo "     - Password: Dev123!@#"
echo ""
echo "⚠️ IMPORTANT: Change all default passwords immediately!"
echo ""
echo "📋 Next Steps:"
echo "   1. Visit https://$DOMAIN and verify the application works"
echo "   2. Login and change all default passwords"
echo "   3. Test all features thoroughly"
echo "   4. Setup monitoring (UptimeRobot recommended)"
echo "   5. Configure automated backups email notifications"
echo ""
echo "🔧 Useful Commands:"
echo "   • View logs: docker-compose -f docker-compose.production.yml logs -f"
echo "   • Restart: docker-compose -f docker-compose.production.yml restart"
echo "   • Stop: docker-compose -f docker-compose.production.yml down"
echo "   • Start: docker-compose -f docker-compose.production.yml up -d"
echo ""
echo "📚 Documentation: See PRODUCTION_DEPLOYMENT_GUIDE.md for more details"
echo ""
echo "════════════════════════════════════════════════════════════════"
