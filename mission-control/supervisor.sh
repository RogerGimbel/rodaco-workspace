#!/bin/bash
# Mission Control Supervisor — auto-restarts server.js on crash
# Designed for OpenClaw sandbox (read-only home, no systemd/pm2)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=3333
LOG="/tmp/mission-control.log"
PIDFILE="/tmp/mission-control-supervisor.pid"
MAX_RESTARTS=10
RESTART_WINDOW=300  # seconds — reset counter after this
RESTART_DELAY=2     # seconds between restarts

# Prevent duplicate supervisors
if [ -f "$PIDFILE" ]; then
  OLD_PID=$(cat "$PIDFILE")
  if kill -0 "$OLD_PID" 2>/dev/null; then
    # Verify it's actually our supervisor (not a recycled PID)
    if grep -q "supervisor.sh" /proc/"$OLD_PID"/cmdline 2>/dev/null; then
      echo "Supervisor already running (PID $OLD_PID)"
      exit 0
    fi
  fi
fi

echo $$ > "$PIDFILE"

cleanup() {
  rm -f "$PIDFILE"
  # Kill the server if we're exiting
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null
  exit 0
}
trap cleanup EXIT TERM INT

restart_count=0
window_start=$(date +%s)

cd "$SCRIPT_DIR"

while true; do
  now=$(date +%s)
  
  # Reset counter if we've been stable for RESTART_WINDOW seconds
  elapsed=$((now - window_start))
  if [ "$elapsed" -ge "$RESTART_WINDOW" ]; then
    restart_count=0
    window_start=$now
  fi

  # Circuit breaker
  if [ "$restart_count" -ge "$MAX_RESTARTS" ]; then
    echo "[$(date -Iseconds)] CIRCUIT BREAKER: $MAX_RESTARTS restarts in ${RESTART_WINDOW}s. Stopping." >> "$LOG"
    break
  fi

  echo "[$(date -Iseconds)] Starting Mission Control (restart #$restart_count)" >> "$LOG"
  node src/server.js >> "$LOG" 2>&1 &
  SERVER_PID=$!

  # Wait for the process to exit
  wait "$SERVER_PID"
  EXIT_CODE=$?
  SERVER_PID=""

  echo "[$(date -Iseconds)] Mission Control exited with code $EXIT_CODE" >> "$LOG"
  restart_count=$((restart_count + 1))
  sleep "$RESTART_DELAY"
done

rm -f "$PIDFILE"
