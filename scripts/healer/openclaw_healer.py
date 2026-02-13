#!/usr/bin/env python3
"""
OpenClaw Self-Healer Service

Monitors OpenClaw container health and applies automatic fixes.
Note: Container uses legacy name "moltbot-gateway" to preserve volume data.
- Restarts unhealthy containers
- Kills zombie processes
- Sends Telegram alerts on issues and fixes

Run as: python3 openclaw_healer.py
"""

import subprocess
import time
import json
import os
import logging
from datetime import datetime, timedelta
from pathlib import Path

# Configuration
CONTAINER_NAME = "moltbot-gateway"
CHECK_INTERVAL = 30  # seconds
RESTART_COOLDOWN = 300  # 5 minutes between restarts
SESSION_MAX_SIZE_MB = 2  # Archive session files larger than this
QMD_MAX_RUNTIME_SECONDS = 300  # Kill QMD processes running longer than 5 minutes
LOG_FILE = Path.home() / "docker" / "openclaw" / "healer" / "healer.log"
DOCKER_COMPOSE_DIR = Path.home() / "docker" / "openclaw"
SESSIONS_PATH = "/home/node/.openclaw/agents/main/sessions"
DOCKER = "/usr/local/bin/docker"

# Telegram config (optional - set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID env vars)
TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID", "")

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Track last actions
last_restart = datetime.min
last_alert = {}


def run_cmd(cmd, timeout=30):
    """Run a shell command and return output."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, timeout=timeout
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return -1, "", "Command timed out"
    except Exception as e:
        return -1, "", str(e)


def send_telegram(message):
    """Send a Telegram notification."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        logger.info(f"[Telegram disabled] {message}")
        return

    try:
        import urllib.request
        import urllib.parse

        url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        data = urllib.parse.urlencode({
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML"
        }).encode()

        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req, timeout=10)
        logger.info(f"Telegram sent: {message[:50]}...")
    except Exception as e:
        logger.error(f"Failed to send Telegram: {e}")


def get_container_status():
    """Get container health status."""
    code, out, err = run_cmd(
        f'{DOCKER} inspect --format "{{{{.State.Status}}}}|{{{{.State.Health.Status}}}}" {CONTAINER_NAME}'
    )
    if code != 0:
        return "not_found", "unknown"

    parts = out.split("|")
    status = parts[0] if parts else "unknown"
    health = parts[1] if len(parts) > 1 else "unknown"
    return status, health


def check_zombie_processes():
    """Check for zombie openclaw processes."""
    code, out, err = run_cmd(
        f'{DOCKER} exec {CONTAINER_NAME} ps aux 2>/dev/null | grep -c "openclaw.*defunct" || echo 0'
    )
    try:
        return int(out) if code == 0 else 0
    except ValueError:
        return 0


def check_cpu_usage():
    """Check container CPU usage percentage."""
    code, out, err = run_cmd(
        f'{DOCKER} stats {CONTAINER_NAME} --no-stream --format "{{{{.CPUPerc}}}}" 2>/dev/null'
    )
    if code == 0 and out:
        try:
            return float(out.replace("%", ""))
        except ValueError:
            pass
    return 0.0


def check_stuck_qmd_processes():
    """Check for and kill QMD processes running too long."""
    # Get QMD/bun processes with their runtime
    # ps format: PID, ELAPSED (runtime), COMMAND
    code, out, err = run_cmd(
        f'{DOCKER} exec {CONTAINER_NAME} ps -eo pid,etimes,cmd 2>/dev/null | grep -E "(qmd|bun.*qmd)" | grep -v grep'
    )
    if code != 0 or not out:
        return 0

    killed = 0
    for line in out.strip().split('\n'):
        if not line.strip():
            continue
        parts = line.split()
        if len(parts) < 3:
            continue

        try:
            pid = int(parts[0])
            elapsed_seconds = int(parts[1])
        except ValueError:
            continue

        if elapsed_seconds > QMD_MAX_RUNTIME_SECONDS:
            cmd_preview = ' '.join(parts[2:])[:50]
            logger.warning(f"Killing stuck QMD process PID {pid} (running {elapsed_seconds}s): {cmd_preview}...")

            kill_code, _, _ = run_cmd(f'{DOCKER} exec {CONTAINER_NAME} kill {pid}')
            if kill_code == 0:
                killed += 1
                send_telegram(
                    f"🔪 <b>OpenClaw Healer</b>\n"
                    f"Killed stuck QMD process (ran {elapsed_seconds // 60}m {elapsed_seconds % 60}s)"
                )

    return killed


def check_session_files():
    """Check for bloated session files and archive them."""
    max_bytes = SESSION_MAX_SIZE_MB * 1024 * 1024

    # Find large session files
    code, out, err = run_cmd(
        f'{DOCKER} exec {CONTAINER_NAME} find {SESSIONS_PATH} -name "*.jsonl" -type f 2>/dev/null'
    )
    if code != 0 or not out:
        return False

    archived_any = False
    for filepath in out.strip().split('\n'):
        if not filepath or filepath.endswith('.archived'):
            continue

        # Get file size
        code, size_out, _ = run_cmd(
            f'{DOCKER} exec {CONTAINER_NAME} stat -c %s "{filepath}" 2>/dev/null'
        )
        if code != 0:
            continue

        try:
            size = int(size_out)
        except ValueError:
            continue

        if size > max_bytes:
            filename = filepath.split('/')[-1]
            size_mb = size / (1024 * 1024)
            logger.warning(f"Session file too large: {filename} ({size_mb:.1f}MB)")

            # Archive the file
            code, _, _ = run_cmd(
                f'{DOCKER} exec {CONTAINER_NAME} mv "{filepath}" "{filepath}.archived"'
            )
            if code == 0:
                logger.info(f"Archived {filename}")
                send_telegram(f"📁 <b>OpenClaw Healer</b>\nArchived bloated session file: {filename} ({size_mb:.1f}MB)")
                archived_any = True

    return archived_any


def restart_container():
    """Restart the container."""
    global last_restart

    if datetime.now() - last_restart < timedelta(seconds=RESTART_COOLDOWN):
        logger.info("Restart skipped - cooldown active")
        return False

    logger.warning(f"Restarting {CONTAINER_NAME}...")
    send_telegram(f"🔄 <b>OpenClaw Healer</b>\nRestarting {CONTAINER_NAME}...")

    code, out, err = run_cmd(f"/usr/local/bin/docker restart {CONTAINER_NAME}", timeout=120)
    last_restart = datetime.now()

    if code == 0:
        logger.info("Container restarted successfully")
        send_telegram(f"✅ <b>OpenClaw Healer</b>\n{CONTAINER_NAME} restarted successfully")
        return True
    else:
        logger.error(f"Restart failed: {err}")
        send_telegram(f"❌ <b>OpenClaw Healer</b>\nRestart failed: {err[:100]}")
        return False


def recreate_container():
    """Recreate the container using docker compose."""
    global last_restart

    if datetime.now() - last_restart < timedelta(seconds=RESTART_COOLDOWN):
        logger.info("Recreate skipped - cooldown active")
        return False

    logger.warning(f"Recreating {CONTAINER_NAME}...")
    send_telegram(f"🔧 <b>OpenClaw Healer</b>\nRecreating {CONTAINER_NAME}...")

    os.chdir(DOCKER_COMPOSE_DIR)
    code, out, err = run_cmd(
        f"/usr/local/bin/docker compose up -d --force-recreate {CONTAINER_NAME.replace('moltbot-', '')}",
        timeout=180
    )
    last_restart = datetime.now()

    if code == 0:
        logger.info("Container recreated successfully")
        send_telegram(f"✅ <b>OpenClaw Healer</b>\n{CONTAINER_NAME} recreated successfully")
        return True
    else:
        logger.error(f"Recreate failed: {err}")
        send_telegram(f"❌ <b>OpenClaw Healer</b>\nRecreate failed: {err[:100]}")
        return False


def health_check():
    """Perform health check and take action if needed."""
    status, health = get_container_status()

    logger.debug(f"Status: {status}, Health: {health}")

    # Container not running
    if status == "not_found":
        logger.error("Container not found!")
        send_telegram(f"🚨 <b>OpenClaw Healer</b>\n{CONTAINER_NAME} not found!")
        return recreate_container()

    if status != "running":
        logger.warning(f"Container status: {status}")
        return restart_container()

    # Check health
    if health == "unhealthy":
        logger.warning("Container unhealthy!")
        return restart_container()

    # Check for zombies
    zombies = check_zombie_processes()
    if zombies > 3:
        logger.warning(f"Found {zombies} zombie processes")
        send_telegram(f"⚠️ <b>OpenClaw Healer</b>\n{zombies} zombie processes detected, restarting...")
        return restart_container()

    # Check for stuck QMD processes (memory search can hang)
    stuck_qmd = check_stuck_qmd_processes()
    if stuck_qmd > 0:
        logger.info(f"Killed {stuck_qmd} stuck QMD process(es)")

    # Check CPU (only alert, don't restart)
    # NOTE: Telegram alerts disabled - CPU spikes are normal during QMD indexing
    cpu = check_cpu_usage()
    if cpu > 90:
        alert_key = "high_cpu"
        if alert_key not in last_alert or datetime.now() - last_alert[alert_key] > timedelta(minutes=15):
            logger.warning(f"High CPU usage: {cpu}%")
            # send_telegram(f"⚠️ <b>OpenClaw Healer</b>\nHigh CPU: {cpu}%")  # Disabled 2026-02-04
            last_alert[alert_key] = datetime.now()

    # Check for bloated session files
    if check_session_files():
        # Restart after archiving to clear in-memory state
        return restart_container()

    return False


def main():
    """Main monitoring loop."""
    logger.info("=" * 50)
    logger.info("OpenClaw Healer starting...")
    logger.info(f"Monitoring: {CONTAINER_NAME}")
    logger.info(f"Check interval: {CHECK_INTERVAL}s")
    logger.info(f"Restart cooldown: {RESTART_COOLDOWN}s")
    logger.info(f"Telegram: {'enabled' if TELEGRAM_BOT_TOKEN else 'disabled'}")
    logger.info("=" * 50)

    send_telegram("🟢 <b>OpenClaw Healer</b>\nStarted monitoring")

    while True:
        try:
            health_check()
        except Exception as e:
            logger.error(f"Health check error: {e}")

        time.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    main()
