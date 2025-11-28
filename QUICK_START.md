# ⚡ Quick Start Guide

Get your Gowin Sports application running in 3 steps!

## Step 1: Configure Environment
```bash
cp env.example .env
nano .env  # Edit with your values
```

**Minimum required changes:**
- `DB_ROOT_PASSWORD` - Strong password for MySQL root
- `DB_PASSWORD` - Strong password for database user  
- `SESSION_SECRET` - Random secret (32+ characters)

## Step 2: Start Services
```bash
# Linux/Mac
./start.sh

# Or manually
docker compose up -d --build
```

## Step 3: Access Your App
- **Frontend**: http://localhost
- **API**: http://localhost/api
- **Health**: http://localhost/api/health

## That's It! 🎉

Your application is now running with:
- ✅ MySQL Database
- ✅ Node.js Backend API
- ✅ React Frontend (Nginx)

## Next Steps

### For Local Development
- Frontend runs on port 80
- Backend API on port 5000
- MySQL on port 3306

### For Production (Digital Ocean)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete setup instructions.

## Common Commands

```bash
# View logs
docker compose logs -f

# Stop services
docker compose down

# Restart services
docker compose restart

# Rebuild after code changes
docker compose up -d --build

# Backup database
./backup.sh
```

## Need Help?

- **Docker Setup**: See [README_DOCKER.md](./README_DOCKER.md)
- **Deployment**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Troubleshooting**: Check logs with `docker compose logs`

---

**Happy Coding! 🚀**

