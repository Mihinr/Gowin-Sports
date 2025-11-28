# 🚀 Digital Ocean Deployment Guide

This guide will help you deploy your Gowin Sports application to a Digital Ocean droplet using Docker.

## Prerequisites

- A Digital Ocean account
- A droplet with Ubuntu 22.04 LTS (minimum 2GB RAM recommended)
- SSH access to your droplet
- Domain name (optional but recommended)

## Step 1: Initial Server Setup

### 1.1 Connect to your droplet
```bash
ssh root@your_droplet_ip
```

### 1.2 Update system packages
```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker and Docker Compose
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### 1.4 (Optional) Create a non-root user
```bash
# Create user
adduser gowin
usermod -aG docker gowin
usermod -aG sudo gowin

# Switch to new user
su - gowin
```

## Step 2: Deploy Application

### 2.1 Clone or upload your project
```bash
# Option 1: If using Git
git clone your-repo-url
cd Gowin-Sports

# Option 2: Upload via SCP (from your local machine)
# scp -r . gowin@your_droplet_ip:/home/gowin/Gowin-Sports
```

### 2.2 Configure environment variables
```bash
# Copy example env file
cp env.example .env

# Edit with your secure values
nano .env
```

**Important:** Update these values in `.env`:
- `DB_ROOT_PASSWORD`: Strong password for MySQL root
- `DB_PASSWORD`: Strong password for database user
- `SESSION_SECRET`: Random secret key (minimum 32 characters)
- `FRONTEND_URL`: Your domain URL (e.g., `https://www.yourdomain.com`)

### 2.3 Generate secure passwords
```bash
# Generate random passwords
openssl rand -base64 32  # For DB_ROOT_PASSWORD
openssl rand -base64 32  # For DB_PASSWORD
openssl rand -base64 32  # For SESSION_SECRET
```

## Step 3: Build and Start Services

### 3.1 Build and start all services
```bash
docker compose up -d --build
```

### 3.2 Check service status
```bash
docker compose ps
```

### 3.3 View logs (if needed)
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

## Step 4: Initialize Database

### 4.1 Wait for MySQL to be ready
```bash
# Check MySQL health
docker compose exec mysql mysqladmin ping -h localhost -u root -p
```

### 4.2 (Optional) Create admin user
```bash
# Access backend container
docker compose exec backend sh

# Run admin creation script
node createadmin.js

# Exit container
exit
```

## Step 5: Configure Firewall

### 5.1 Allow necessary ports
```bash
# Allow HTTP (80)
ufw allow 80/tcp

# Allow HTTPS (443) - if using SSL
ufw allow 443/tcp

# Allow SSH (22)
ufw allow 22/tcp

# Enable firewall
ufw enable

# Check status
ufw status
```

## Step 6: (Optional) Setup SSL with Let's Encrypt

### 6.1 Install Certbot
```bash
apt install certbot python3-certbot-nginx -y
```

### 6.2 Install Nginx (for reverse proxy)
```bash
apt install nginx -y
```

### 6.3 Create Nginx configuration
```bash
nano /etc/nginx/sites-available/gowin-sports
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 6.4 Enable site and get SSL certificate
```bash
# Enable site
ln -s /etc/nginx/sites-available/gowin-sports /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Step 7: Update Frontend URL

After setting up SSL, update your `.env` file:
```bash
nano .env
```

Change:
```
FRONTEND_URL=https://www.yourdomain.com
```

Then rebuild frontend:
```bash
docker compose up -d --build frontend
```

## Step 8: Verify Deployment

### 8.1 Check all services are running
```bash
docker compose ps
```

### 8.2 Test endpoints
```bash
# Health check
curl http://localhost/api/health

# Frontend
curl http://localhost
```

### 8.3 Access your application
- Frontend: `http://your_droplet_ip` or `https://yourdomain.com`
- API: `http://your_droplet_ip/api` or `https://yourdomain.com/api`

## Maintenance Commands

### View logs
```bash
docker compose logs -f
```

### Restart services
```bash
docker compose restart
```

### Stop services
```bash
docker compose down
```

### Start services
```bash
docker compose up -d
```

### Rebuild after code changes
```bash
docker compose up -d --build
```

### Backup database
```bash
docker compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} badminton_store > backup_$(date +%Y%m%d).sql
```

### Restore database
```bash
docker compose exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD} badminton_store < backup_file.sql
```

## Troubleshooting

### Services won't start
```bash
# Check logs
docker compose logs

# Check if ports are in use
netstat -tulpn | grep -E ':(80|5000|3306)'
```

### Database connection issues
```bash
# Check MySQL is running
docker compose exec mysql mysqladmin ping -h localhost -u root -p

# Check database exists
docker compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

### Frontend not loading
```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose up -d --build frontend
```

### Out of memory
```bash
# Check memory usage
free -h
docker stats

# Consider upgrading droplet or optimizing images
```

## Security Best Practices

1. **Change all default passwords** in `.env`
2. **Use strong passwords** (minimum 32 characters for secrets)
3. **Keep system updated**: `apt update && apt upgrade -y`
4. **Use firewall**: `ufw enable`
5. **Enable SSL/HTTPS** for production
6. **Regular backups** of database
7. **Monitor logs** regularly
8. **Restrict SSH access** (use key-based authentication)

## Performance Optimization

1. **Enable Docker build cache** (already configured)
2. **Use production builds** (already configured)
3. **Monitor resource usage**: `docker stats`
4. **Consider using a CDN** for static assets
5. **Enable database query caching**

## Support

If you encounter issues:
1. Check service logs: `docker compose logs`
2. Verify environment variables: `cat .env`
3. Check service health: `docker compose ps`
4. Review this guide for common solutions

---

**Happy Deploying! 🎉**

