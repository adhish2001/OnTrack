# Docker Deployment Guide for OnTrack

## 🐳 Quick Start with Docker

### Prerequisites
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (usually comes with Docker Desktop)

### Option 1: Using Docker Compose (Recommended)

```bash
# Navigate to project directory
cd ontrack

# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

The app will be available at `http://localhost:5000`

### Option 2: Using Docker directly

```bash
# Build the image
docker build -t ontrack .

# Run the container
docker run -d \
  --name ontrack-app \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  ontrack

# View logs
docker logs -f ontrack-app

# Stop the container
docker stop ontrack-app
docker rm ontrack-app
```

## 📦 What the Docker Setup Does

- **Installs Python 3.11** and all dependencies
- **Exposes port 5000** for web access
- **Mounts `./data` directory** as a volume (your database persists!)
- **Auto-restarts** if the container crashes

## 🔄 Updating the App

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose down
docker-compose up -d --build
```

## 💾 Data Persistence

Your database is stored in the `./data` directory on your host machine, which is mounted as a volume. This means:

✅ Data persists even if you remove the container
✅ You can backup by copying the `data/` folder
✅ Easy to migrate - just copy `data/` to a new machine

## 🌐 Hosting Options

### Option 1: Run on Your Local Network

Just run Docker on any computer and access via `http://COMPUTER-IP:5000` from any device on your network.

### Option 2: Deploy to a VPS (DigitalOcean, Linode, etc.)

```bash
# SSH into your VPS
ssh user@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Clone your repo
git clone https://github.com/yourusername/ontrack.git
cd ontrack

# Run with docker-compose
docker-compose up -d

# Optional: Set up nginx reverse proxy for HTTPS
```

### Option 3: Raspberry Pi

```bash
# SSH into Pi
ssh pi@raspberrypi.local

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker pi

# Clone and run
git clone https://github.com/yourusername/ontrack.git
cd ontrack
docker-compose up -d
```

Access at `http://raspberrypi.local:5000` or `http://PI-IP:5000`

## ⚠️ Important: Vercel Deployment Note

**Vercel is NOT recommended for OnTrack** because:

❌ Vercel is serverless - no persistent filesystem for SQLite
❌ Vercel is designed for static/JAMstack sites, not Flask apps
❌ You'd need to use external database (PostgreSQL/MySQL)

### Alternative Hosting for Flask Apps:

1. **Railway.app** - Supports Flask + SQLite/PostgreSQL
   - Free tier available
   - Auto-deploys from GitHub
   - Built-in PostgreSQL option

2. **Render.com** - Good for Flask apps
   - Free tier with persistent disk
   - Auto-deploys from GitHub

3. **Fly.io** - Docker-based deployment
   - Free tier available
   - Perfect for our Docker setup

4. **Your own VPS** - Full control
   - DigitalOcean ($5/month)
   - Linode ($5/month)
   - AWS EC2 free tier

## 🚀 Deploying to Railway.app (Recommended Cloud Option)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Add PostgreSQL (optional, for production)
railway add postgresql

# Get URL
railway open
```

Railway automatically detects the Dockerfile and deploys!

## 🚀 Deploying to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy

# Open app
fly open
```

## 🔐 Environment Variables for Production

For production deployments, create a `.env` file:

```bash
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///data/ontrack.db
```

Update `docker-compose.yml` to use it:

```yaml
services:
  ontrack:
    build: .
    env_file:
      - .env
    # ... rest of config
```

## 📊 Monitoring

```bash
# View logs
docker-compose logs -f

# Check container status
docker-compose ps

# Resource usage
docker stats ontrack-app
```

## 🛠️ Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Database permission errors
```bash
# Fix permissions
chmod 755 data/
chmod 644 data/ontrack.db
```

### Port 5000 already in use
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "8080:5000"  # Use port 8080 instead
```

## 🎯 Best Practice for Production

1. **Use environment variables** for sensitive config
2. **Set up nginx** as reverse proxy for HTTPS
3. **Regular backups** of `data/` directory
4. **Monitor logs** for errors
5. **Update regularly**: `git pull && docker-compose up -d --build`

Enjoy your containerized OnTrack! 🐳
