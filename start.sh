#!/bin/bash

echo "🔍 Checking for processes on ports 3031 and 3032..."

# Kill process on port 3031 (Frontend)
PORT_3031=$(lsof -ti:3031)
if [ ! -z "$PORT_3031" ]; then
  echo "🔪 Killing process on port 3031..."
  kill -9 $PORT_3031
  echo "✅ Port 3031 freed"
else
  echo "✅ Port 3031 is free"
fi

# Kill process on port 3032 (Backend)
PORT_3032=$(lsof -ti:3032)
if [ ! -z "$PORT_3032" ]; then
  echo "🔪 Killing process on port 3032..."
  kill -9 $PORT_3032
  echo "✅ Port 3032 freed"
else
  echo "✅ Port 3032 is free"
fi

echo ""
echo "🐳 Ensuring Docker containers are running..."
docker compose up -d

echo ""
echo "🚀 Starting development servers..."
concurrently "npm run dev:frontend" "npm run dev:backend"
