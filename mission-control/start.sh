#!/bin/bash
# Mission Control starter — launches supervisor if not already running
PORT=3333
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Check if already running
if curl -s "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
  echo "Mission Control already running on port $PORT"
  exit 0
fi

# Kill any orphaned server processes
pkill -f "node.*mission-control/server.js" 2>/dev/null

# Start via supervisor (auto-restarts on crash)
echo "Starting Mission Control supervisor..."
nohup bash "$SCRIPT_DIR/supervisor.sh" > /dev/null 2>&1 &

# Wait and verify
sleep 3
if curl -s "http://localhost:$PORT/api/health" > /dev/null 2>&1; then
  echo "Mission Control started (supervised)"
else
  echo "Failed to start Mission Control — check /tmp/mission-control.log"
  exit 1
fi
