# BOOT.md — Gateway Startup Tasks

Run these silently on every gateway boot. Do NOT message Roger unless something fails.

## 1. Start Mission Control
```bash
bash /home/node/workspace/mission-control/start.sh
```
Verify with: `curl -s http://localhost:3333/api/health`
If it fails after start.sh, check `/tmp/mission-control.log` (last 20 lines) and alert Roger on Telegram (chat ID 1425151324).

## 2. Done
Reply NO_REPLY if everything started fine.
