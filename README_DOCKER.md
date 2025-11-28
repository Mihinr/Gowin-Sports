# 🐳 Docker Setup for Gowin Sports

This application is fully containerized and ready for deployment on Digital Ocean or any Docker-compatible hosting platform.

## Quick Start

### 1. Setup Environment
```bash
# Copy environment template
cp env.example .env

# Edit with your values
nano .env
```

### 2. Start Services
```bash
# Using the startup script (Linux/Mac)
./start.sh

# Or manually
docker compose up -d --build
```

### 3. Access Application
- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Health Check**: http://localhost/api/health

## Architecture

The application consists of 3 Docker containers:

1. **MySQL** (Port 3306)
   - Database service
   - Persistent data storage
   - Auto-initializes with schema

2. **Backend** (Port 5000)
   - Node.js/Express API
   - Serves API endpoints
   - Handles file uploads
   - Connects to MySQL

3. **Frontend** (Port 80)
   - React/Vite application
   - Served via Nginx
   - Proxies API requests to backend

## Environment Variables

Key variables in `.env`:

- `DB_ROOT_PASSWORD`: MySQL root password
- `DB_USER`: Database user name
- `DB_PASSWORD`: Database user password
- `DB_NAME`: Database name
- `SESSION_SECRET`: Secret key for sessions (min 32 chars)
- `FRONTEND_URL`: Your domain URL (e.g., `https://www.yourdomain.com`)

## Common Commands

```bash
# Start services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f

# Rebuild after changes
docker compose up -d --build

# Check service status
docker compose ps

# Access MySQL
docker compose exec mysql mysql -u root -p

# Access backend container
docker compose exec backend sh

# Backup database
docker compose exec mysql mysqldump -u root -p${DB_ROOT_PASSWORD} badminton_store > backup.sql
```

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Digital Ocean deployment instructions.

## Troubleshooting

### Services won't start
```bash
# Check logs
docker compose logs

# Check if ports are available
netstat -tulpn | grep -E ':(80|5000|3306)'
```

### Database connection issues
```bash
# Check MySQL health
docker compose exec mysql mysqladmin ping -h localhost -u root -p

# View MySQL logs
docker compose logs mysql
```

### Frontend not loading
```bash
# Rebuild frontend
docker compose up -d --build frontend

# Check frontend logs
docker compose logs frontend
```

## File Structure

```
.
├── docker-compose.yml      # Orchestration file
├── env.example             # Environment template
├── start.sh                # Startup script
├── stop.sh                 # Stop script
├── backend/
│   ├── Dockerfile          # Backend container
│   └── ...
├── frontend/
│   ├── Dockerfile          # Frontend container
│   ├── nginx.conf          # Nginx configuration
│   └── ...
└── DEPLOYMENT.md           # Deployment guide
```

## Security Notes

- Always change default passwords in production
- Use strong, random passwords (32+ characters for secrets)
- Enable HTTPS/SSL in production
- Keep Docker and system packages updated
- Regularly backup your database

## Support

For deployment help, see [DEPLOYMENT.md](./DEPLOYMENT.md)

