#!/bin/bash

# Gowin Sports - Docker Startup Script
# This script helps you start the application easily

set -e

echo "🚀 Gowin Sports - Starting Application..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Creating .env from env.example..."
    cp env.example .env
    echo "✅ Please edit .env file with your configuration before continuing"
    echo "   Run: nano .env"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo "📖 Please install Docker first. See DEPLOYMENT.md for instructions."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo "📖 Please install Docker Compose first. See DEPLOYMENT.md for instructions."
    exit 1
fi

# Build and start services
echo "🔨 Building and starting services..."
docker compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check service status
echo "📊 Service Status:"
docker compose ps

echo ""
echo "✅ Application started successfully!"
echo ""
echo "🌐 Frontend: http://localhost"
echo "🔌 API: http://localhost/api"
echo "💚 Health Check: http://localhost/api/health"
echo ""
echo "📋 Useful commands:"
echo "   View logs: docker compose logs -f"
echo "   Stop: docker compose down"
echo "   Restart: docker compose restart"
echo ""

