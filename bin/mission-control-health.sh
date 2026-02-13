#!/bin/bash
# Mission Control Auto-Healer

PORT=3333
LOG="/tmp/mission-control.log"
PID_FILE="/tmp/mission-control.pid"

if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/ | grep -q "200"; then
  echo "Mission Control healthy (200)"
  exit 0
fi

echo "$(date): Mission Control DOWN - restarting..." >> ${LOG}

# Kill existing process if stuck
pkill -f "mission-control" 2>/dev/null || true
sleep 2

# Start fresh
cd /home/node/workspace/mission-control && bash start.sh >> ${LOG} 2>&1 &

sleep 3

if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT}/ | grep -q "200"; then
  echo "$(date): Mission Control restarted successfully" >> ${LOG}
  exit 0
else
  echo "$(date): Mission Control restart FAILED" >> ${LOG}
  exit 1
fi
