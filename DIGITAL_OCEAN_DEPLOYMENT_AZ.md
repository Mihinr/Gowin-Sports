# 🚀 Complete A-Z Guide: Deploying Gowin Sports to Digital Ocean

This is a comprehensive, beginner-friendly guide to deploy your application on a Digital Ocean $4 droplet using Docker.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create and Access Your Droplet](#step-1-create-and-access-your-droplet)
3. [Step 2: Connect to Your Droplet from Windows](#step-2-connect-to-your-droplet-from-windows)
4. [Step 3: Initial Server Setup](#step-3-initial-server-setup)
5. [Step 4: Install Docker and Docker Compose](#step-4-install-docker-and-docker-compose)
6. [Step 5: Upload Your Project Files](#step-5-upload-your-project-files)
7. [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
8. [Step 7: Build and Deploy Your Application](#step-7-build-and-deploy-your-application)
9. [Step 8: Configure Firewall](#step-8-configure-firewall)
10. [Step 9: Access Your Application](#step-9-access-your-application)
11. [Step 10: (Optional) Setup Domain and SSL](#step-10-optional-setup-domain-and-ssl)
12. [Maintenance and Troubleshooting](#maintenance-and-troubleshooting)

---

## Prerequisites

- ✅ Digital Ocean account (you already have this)
- ✅ $4 droplet created (or ready to create)
- ✅ Windows computer with PowerShell
- ✅ Your project files ready on your local machine

---

## Step 1: Create and Access Your Droplet

### 1.1 Create Droplet (if not done already)

1. Log in to [Digital Ocean](https://cloud.digitalocean.com/)
2. Click **"Create"** → **"Droplets"**
3. Choose:
   - **Image**: Ubuntu 22.04 (LTS) x64
   - **Plan**: Basic - Regular Intel with SSD - $4/month (512MB RAM) or $6/month (1GB RAM - **recommended**)
   - **Authentication**: Choose **SSH keys** (recommended) or **Password**
   - **Region**: Choose closest to your users
   - **Hostname**: Give it a name (e.g., `gowin-sports-server`)
4. Click **"Create Droplet"**
5. Wait 1-2 minutes for droplet to be created

### 1.2 Get Your Droplet Information

After creation, you'll see:

- **IP Address**: e.g., `157.230.123.45` (save this!)
- **Root Password**: If you chose password authentication (check your email)

---

## Step 2: Connect to Your Droplet from Windows

### Option A: Using PowerShell (Built-in SSH - Windows 10/11)

1. **Open PowerShell** (Press `Win + X`, then select "Windows PowerShell" or "Terminal")

2. **Connect to your droplet**:

   ```powershell
   ssh root@YOUR_DROPLET_IP
   ```

   Replace `YOUR_DROPLET_IP` with your actual IP (e.g., `ssh root@157.230.123.45`)

3. **First-time connection**: Type `yes` when asked about authenticity

4. **Enter password**: If using password authentication, enter the root password (you won't see characters as you type - this is normal)

5. **Success!** You should see something like:
   ```
   root@gowin-sports-server:~#
   ```

### Option B: Using PuTTY (Alternative)

1. **Download PuTTY**: [https://www.putty.org/](https://www.putty.org/)
2. **Install and open PuTTY**
3. **Enter connection details**:
   - **Host Name**: `root@YOUR_DROPLET_IP`
   - **Port**: `22`
   - **Connection Type**: SSH
4. Click **"Open"**
5. Enter password when prompted

### Option C: Using Windows Terminal (Recommended)

1. **Install Windows Terminal** from Microsoft Store (if not installed)
2. Open Windows Terminal
3. Click the dropdown arrow → **"Command Prompt"** or **"PowerShell"**
4. Run: `ssh root@YOUR_DROPLET_IP`
5. Enter password

**💡 Tip**: If you get "Connection refused" or "Connection timed out", check:

- Your droplet is running (check Digital Ocean dashboard)
- You're using the correct IP address
- Your firewall isn't blocking SSH (port 22)

---

## Step 3: Initial Server Setup

Once connected, run these commands one by one:

### 3.1 Update System Packages

```bash
apt update && apt upgrade -y
```

This may take 2-5 minutes. Wait for it to complete.

### 3.2 Install Essential Tools

```bash
apt install -y curl wget git nano ufw
```

### 3.3 (Optional) Create a Non-Root User (Recommended for Security)

```bash
# Create a new user
adduser gowin

# Add user to sudo group
usermod -aG sudo gowin

# Add user to docker group (we'll install Docker next)
usermod -aG docker gowin

# Switch to new user
su - gowin
```

**Note**: If you create a new user, use `sudo` before commands that need root access.

---

## Step 4: Install Docker and Docker Compose

### 4.1 Install Docker

```bash
# Download and run Docker installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

### 4.2 Install Docker Compose Plugin

```bash
apt install docker-compose-plugin -y
```

### 4.3 Verify Installation

```bash
docker --version
docker compose version
```

You should see version numbers. If you see "command not found", try:

```bash
# Add current user to docker group (if not done already)
sudo usermod -aG docker $USER
newgrp docker

# Verify again
docker --version
```

### 4.4 Test Docker

```bash
docker run hello-world
```

If you see "Hello from Docker!", Docker is working correctly! ✅

---

## Step 5: Upload Your Project Files

You have several options to get your project files on the server:

### Option A: Using Git (Recommended if your code is in a repository)

```bash
# Install git (if not already installed)
apt install git -y

# Clone your repository
cd ~
git clone YOUR_REPOSITORY_URL
cd Gowin-Sports
```

**Note**: Replace `YOUR_REPOSITORY_URL` with your actual Git repository URL.

### Option B: Using SCP from Windows PowerShell

1. **On your Windows computer**, open PowerShell in your project directory:

   ```powershell
   cd D:\Projects\Projects\Gowin-Sports
   ```

2. **Upload files** (replace with your actual IP):

   ```powershell
   scp -r . root@YOUR_DROPLET_IP:/root/Gowin-Sports
   ```

3. **On the server**, navigate to the project:
   ```bash
   cd /root/Gowin-Sports
   ```

### Option C: Using WinSCP (GUI Tool - Easiest for Beginners)

1. **Download WinSCP**: [https://winscp.net/](https://winscp.net/)
2. **Install and open WinSCP**
3. **Connect**:
   - **Host name**: `YOUR_DROPLET_IP`
   - **User name**: `root`
   - **Password**: Your root password
   - **Protocol**: SFTP
4. **Click "Login"**
5. **Drag and drop** your `Gowin-Sports` folder from your computer to the server
6. **Wait for upload** to complete (may take a few minutes)

### Option D: Using VS Code Remote SSH Extension

1. **Install Remote-SSH extension** in VS Code
2. **Press `F1`** → Type "Remote-SSH: Connect to Host"
3. **Enter**: `root@YOUR_DROPLET_IP`
4. **Open folder** on the server and copy files

**After uploading, verify files are there:**

```bash
cd ~/Gowin-Sports  # or /root/Gowin-Sports if using root
ls -la
```

You should see: `docker-compose.yml`, `env.example`, `backend/`, `frontend/`, etc.

---

## Step 6: Configure Environment Variables

### 6.1 Create .env File

```bash
cd ~/Gowin-Sports  # Navigate to project directory
cp env.example .env
```

### 6.2 Edit .env File

```bash
nano .env
```

### 6.3 Generate Secure Passwords

**In a new terminal/PowerShell window**, generate secure passwords:

```bash
# Generate random passwords (run these on your server)
openssl rand -base64 32
```

Run this command **3 times** to get 3 different passwords. Save them somewhere safe!

### 6.4 Update .env File

Edit the `.env` file with these values:

```env
# Database Configuration
DB_ROOT_PASSWORD=PASTE_FIRST_GENERATED_PASSWORD_HERE
DB_USER=gowin_user
DB_PASSWORD=PASTE_SECOND_GENERATED_PASSWORD_HERE
DB_NAME=badminton_store

# Backend Configuration
NODE_ENV=production
PORT=5000
SESSION_SECRET=PASTE_THIRD_GENERATED_PASSWORD_HERE

# Frontend Configuration
# For now, use your droplet IP. We'll update this later if you add a domain.
FRONTEND_URL=http://YOUR_DROPLET_IP
```

**Example**:

```env
DB_ROOT_PASSWORD=Kj8#mN2$pQ9@vL5&wX3!rT7*yU4%zA6
DB_USER=gowin_user
DB_PASSWORD=M9@nP3$qR7!tY5&vX2*wZ8%uA4#bC6
DB_NAME=badminton_store

NODE_ENV=production
PORT=5000
SESSION_SECRET=H5$jK9@mP3!nQ7&rT2*wY6%zU8#vA4

FRONTEND_URL=http://157.230.123.45
```

**To save in nano**:

- Press `Ctrl + O` (to write/save)
- Press `Enter` (to confirm filename)
- Press `Ctrl + X` (to exit)

---

## Step 7: Build and Deploy Your Application

### 7.1 Build and Start All Services

```bash
cd ~/Gowin-Sports
docker compose up -d --build
```

**This will take 5-10 minutes** the first time as it:

- Downloads base images (MySQL, Node.js, Nginx)
- Builds your frontend and backend
- Sets up the database

**Watch for errors!** If you see red error messages, note them down.

### 7.2 Check Service Status

```bash
docker compose ps
```

You should see all 3 services running:

- `gowin-mysql` - should be "Up" and "healthy"
- `gowin-backend` - should be "Up" and "healthy"
- `gowin-frontend` - should be "Up" and "healthy"

### 7.3 View Logs (if needed)

```bash
# View all logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

Press `Ctrl + C` to exit log view.

### 7.4 Fix MySQL User Permissions (IMPORTANT!)

Before creating an admin user, you need to grant the MySQL user permission to connect from Docker containers:

**Recommended Method: Interactive Mode**

```bash
# Connect to MySQL interactively (this will prompt for password)
docker compose exec mysql mysql -u root -p
```

When prompted, enter your `DB_ROOT_PASSWORD` from your `.env` file. Then run these SQL commands (replace `gowin_user` and your actual `DB_PASSWORD` with values from `.env`):

```sql
-- For MySQL 8.0, use this syntax:
CREATE USER IF NOT EXISTS 'gowin_user'@'%' IDENTIFIED BY 'YOUR_DB_PASSWORD_FROM_ENV';
GRANT ALL PRIVILEGES ON badminton_store.* TO 'gowin_user'@'%';
FLUSH PRIVILEGES;

-- Verify the user was created (optional)
SELECT user, host FROM mysql.user WHERE user = 'gowin_user';

-- Exit MySQL
EXIT;
```

**Alternative: If you get "Access denied" errors**

If the password has special characters or you're having trouble, try:

1. **Check your .env file** to verify the exact password:

   ```bash
   cat .env | grep DB_ROOT_PASSWORD
   ```

2. **Use the password with proper escaping** or create a SQL file:

   ```bash
   # Create SQL file
   echo "GRANT ALL PRIVILEGES ON badminton_store.* TO 'gowin_user'@'%'; FLUSH PRIVILEGES;" > /tmp/fix_permissions.sql

   # Copy to container and execute
   docker cp /tmp/fix_permissions.sql gowin-mysql:/tmp/
   docker compose exec mysql sh -c "mysql -u root -p\$(printenv MYSQL_ROOT_PASSWORD) < /tmp/fix_permissions.sql"
   ```

### 7.5 Create Admin User

After fixing MySQL permissions, create your admin account:

```bash
# Access backend container
docker compose exec backend sh

# Run admin creation script with your credentials
node createadmin.js Gowinsports Gowin14@sports gowinsports89@gmail.com

# Exit when done
exit
```

**Note**: Replace the username, password, and email with your desired values.

---

## Step 8: Configure Firewall

### 8.1 Allow Required Ports

```bash
# Allow HTTP (port 80)
ufw allow 80/tcp

# Allow HTTPS (port 443) - for future SSL setup
ufw allow 443/tcp

# Allow SSH (port 22) - IMPORTANT! Don't block this!
ufw allow 22/tcp
```

### 8.2 Enable Firewall

```bash
ufw enable
```

Type `y` when prompted.

### 8.3 Check Firewall Status

```bash
ufw status
```

You should see:

```
Status: active

To                         Action      From
--                         ------      ----
80/tcp                     ALLOW       Anywhere
443/tcp                    ALLOW       Anywhere
22/tcp                     ALLOW       Anywhere
```

---

## Step 9: Access Your Application

### 9.1 Test Locally on Server

```bash
# Test backend API
curl http://localhost/api/health

# Test frontend
curl http://localhost
```

### 9.2 Access from Your Browser

Open your web browser and go to:

```
http://YOUR_DROPLET_IP
```

**Example**: `http://157.230.123.45`

You should see your Gowin Sports website! 🎉

### 9.3 Test API Endpoint

```
http://YOUR_DROPLET_IP/api/health
```

This should return a JSON response like:

```json
{ "status": "ok", "message": "API is running" }
```

---

## Step 10: (Optional) Setup Domain and SSL

If you have a domain name, follow these steps:

### 10.1 Point Domain to Your Droplet

1. **Go to your domain registrar** (GoDaddy, Namecheap, etc.)
2. **Add an A record**:
   - **Type**: A
   - **Host**: `@` (or leave blank)
   - **Value**: `YOUR_DROPLET_IP`
   - **TTL**: 3600 (or default)
3. **Add another A record for www**:
   - **Type**: A
   - **Host**: `www`
   - **Value**: `YOUR_DROPLET_IP`
   - **TTL**: 3600
4. **Wait 5-30 minutes** for DNS to propagate

### 10.2 Install Nginx (as Reverse Proxy)

```bash
apt install nginx -y
```

### 10.3 Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/gowin-sports
```

Add this configuration (replace `yourdomain.com` with your actual domain):

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

Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

### 10.4 Enable Site

```bash
# Create symbolic link
ln -s /etc/nginx/sites-available/gowin-sports /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Restart Nginx
systemctl restart nginx
```

### 10.5 Install Certbot for SSL

```bash
apt install certbot python3-certbot-nginx -y
```

### 10.6 Get SSL Certificate

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Follow the prompts:

- Enter your email
- Agree to terms
- Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### 10.7 Update .env File

```bash
nano ~/Gowin-Sports/.env
```

Change:

```env
FRONTEND_URL=https://www.yourdomain.com
```

Save and exit.

### 10.8 Rebuild Frontend

```bash
cd ~/Gowin-Sports
docker compose up -d --build frontend
```

### 10.9 Test Your Domain

Visit: `https://www.yourdomain.com`

You should see your site with a secure HTTPS connection! 🔒

---

## Maintenance and Troubleshooting

### Common Commands

```bash
# View all logs
docker compose logs -f

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Start all services
docker compose up -d

# Rebuild after code changes
docker compose up -d --build

# Check service status
docker compose ps

# Check resource usage
docker stats
```

### Troubleshooting

#### Services Won't Start

```bash
# Check logs for errors
docker compose logs

# Check if ports are in use
netstat -tulpn | grep -E ':(80|5000|3306)'

# Check disk space
df -h
```

#### Database Connection Issues

**Error: "Host '172.18.0.X' is not allowed to connect to this MySQL server"**

This happens when the MySQL user doesn't have permission to connect from Docker containers. Fix it:

**Method 1: Interactive Mode (Recommended - Easiest)**

```bash
# Connect to MySQL interactively
docker compose exec mysql mysql -u root -p

# When prompted, enter your DB_ROOT_PASSWORD from .env file
# Then run these SQL commands:
GRANT ALL PRIVILEGES ON badminton_store.* TO 'gowin_user'@'%' IDENTIFIED BY 'Ae7UYGOsgoH89R9tucyfsLcKCoU7gSZp4r90t4DzZyA=';
FLUSH PRIVILEGES;
EXIT;
```

**Method 2: Using Environment Variable from Container**

```bash
# Create a temporary SQL file
cat > /tmp/grant_permissions.sql << 'EOF'
GRANT ALL PRIVILEGES ON badminton_store.* TO 'gowin_user'@'%';
FLUSH PRIVILEGES;
EOF

# Execute the SQL file (password will be read from container environment)
docker compose exec -T mysql mysql -u root -p"$MYSQL_ROOT_PASSWORD" < /tmp/grant_permissions.sql

# Or copy file into container and execute
docker cp /tmp/grant_permissions.sql gowin-mysql:/tmp/
docker compose exec mysql mysql -u root -p"$(docker compose exec -T mysql printenv MYSQL_ROOT_PASSWORD)" < /tmp/grant_permissions.sql
```

**Method 3: Direct Command with Password from .env**

```bash
# First, check your .env file for the exact password
cat .env | grep DB_ROOT_PASSWORD

# Then use it (replace with actual password, escape special characters if needed)
# If password has special characters, use single quotes or escape them
docker compose exec mysql mysql -u root -p'YOUR_ACTUAL_PASSWORD_HERE' -e "GRANT ALL PRIVILEGES ON badminton_store.* TO 'gowin_user'@'%'; FLUSH PRIVILEGES;"
```

**Method 4: Using MySQL 8.0 Syntax (if above doesn't work)**

For MySQL 8.0, the syntax is slightly different:

```bash
docker compose exec mysql mysql -u root -p
# Enter password when prompted, then:
CREATE USER IF NOT EXISTS 'gowin_user'@'%' IDENTIFIED BY 'Ae7UYGOsgoH89R9tucyfsLcKCoU7gSZp4r90t4DzZyA=';
GRANT ALL PRIVILEGES ON badminton_store.* TO 'gowin_user'@'%';
FLUSH PRIVILEGES;
EXIT;
```

**Other Database Issues:**

```bash
# Check MySQL is running
docker compose exec mysql mysqladmin ping -h localhost -u root -p

# View MySQL logs
docker compose logs mysql

# Check database exists
docker compose exec mysql mysql -u root -p -e "SHOW DATABASES;"
```

#### Frontend Not Loading

```bash
# Check frontend logs
docker compose logs frontend

# Rebuild frontend
docker compose up -d --build frontend

# Check if port 80 is accessible
curl http://localhost
```

#### Out of Memory (Common on $4 droplet)

```bash
# Check memory usage
free -h

# Check Docker resource usage
docker stats

# If running out of memory:
# 1. Consider upgrading to $6 droplet (1GB RAM)
# 2. Or optimize by removing unused containers/images
docker system prune -a
```

#### Can't Connect via SSH

- Check droplet is running in Digital Ocean dashboard
- Verify IP address is correct
- Check if you're behind a firewall that blocks port 22
- Try resetting root password in Digital Ocean dashboard

### Backup Database

```bash
# Create backup
docker compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} badminton_store > backup_$(date +%Y%m%d).sql

# Download backup to your computer (from Windows PowerShell)
scp root@YOUR_DROPLET_IP:/root/Gowin-Sports/backup_*.sql .
```

### Restore Database

```bash
# Upload backup file to server first, then:
docker compose exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD} badminton_store < backup_file.sql
```

### Update Application

```bash
# Pull latest code (if using Git)
cd ~/Gowin-Sports
git pull

# Rebuild and restart
docker compose up -d --build
```

---

## Security Checklist

- [ ] Changed all default passwords in `.env`
- [ ] Used strong, random passwords (32+ characters)
- [ ] Enabled firewall (`ufw enable`)
- [ ] Only opened necessary ports (80, 443, 22)
- [ ] Set up SSL/HTTPS (if using domain)
- [ ] Created non-root user (optional but recommended)
- [ ] Regularly update system: `apt update && apt upgrade -y`
- [ ] Regular database backups
- [ ] Monitor logs regularly

---

## Quick Reference

### Your Droplet IP

```
YOUR_DROPLET_IP
```

### Project Location

```
~/Gowin-Sports
```

### Important Files

- `.env` - Environment variables
- `docker-compose.yml` - Docker configuration
- `backend/` - Backend code
- `frontend/` - Frontend code

### Access URLs

- **Frontend**: `http://YOUR_DROPLET_IP` or `https://yourdomain.com`
- **API**: `http://YOUR_DROPLET_IP/api` or `https://yourdomain.com/api`
- **Health Check**: `http://YOUR_DROPLET_IP/api/health`

---

## Need Help?

1. **Check logs**: `docker compose logs`
2. **Verify services**: `docker compose ps`
3. **Check firewall**: `ufw status`
4. **Test connectivity**: `curl http://localhost/api/health`
5. **Review this guide** for common solutions

---

## 🎉 Congratulations!

Your Gowin Sports application is now live on Digital Ocean!

**Next Steps**:

- Monitor your application regularly
- Set up automated backups
- Consider setting up monitoring/alerting
- Keep your system updated

**Happy Hosting! 🚀**
