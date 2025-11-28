#!/bin/bash

# Gowin Sports - Docker Stop Script

set -e

echo "🛑 Stopping Gowin Sports Application..."

docker compose down

echo "✅ Application stopped successfully!"

