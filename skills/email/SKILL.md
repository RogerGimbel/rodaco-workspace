---
name: email
description: Send and receive emails. Use this for ALL email operations.
metadata: {"clawdbot":{"emoji":"📧","requires":{"bins":["email"]}}}
---

# email

Send and receive emails from rodaco@agentmail.to.

## Send email
```bash
bash /home/node/workspace/bin/email send "to@example.com" "Subject" "Body text"
```

## Check inbox
```bash
bash /home/node/workspace/bin/email list 10
```

## Read message
```bash
bash /home/node/workspace/bin/email read <message_id>
```

**IMPORTANT:** Always use these bash commands. Do not use any API calls.
