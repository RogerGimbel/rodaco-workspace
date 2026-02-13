# Duplicati Backup Configuration — Pi Media Stack

## Access
URL: `https://duplicati.rogergimbel.dev`

## Step-by-Step Setup

### 1. First Launch
- Open the URL, set a password if prompted (recommended)

### 2. Create Backup Job → "Add backup"

**General:**
- Name: `Media Stack Config`
- Encryption: AES-256 (set a passphrase — save it somewhere safe)

**Destination:**
- Storage Type: `Local folder or drive`
- Folder path: `/backups/duplicati/`
  *(this maps to `/mnt/media/backups/duplicati/` on the host)*

**Source Data — Add these paths:**
```
/source/sonarr/
/source/radarr/
/source/lidarr/
/source/prowlarr/
/source/jellyfin/
/source/bazarr/
/source/qbittorrent/
/source/sabnzbd/
/source/caddy/
/source/dnsmasq/
/source/uptime-kuma/
/source/gluetun/
/source/jellyseerr/
/source/portainer/
/source/homepage/
/source/homarr/
```

> **Container mount mapping:**
> - `/source` → `/mnt/media/config` (CONFIG_ROOT)
> - `/backups` → `/mnt/media/backups` (BACKUP_ROOT)
>
> **⚠️ docker-compose.yml and .env are NOT mounted into the Duplicati container.**
> Back these up manually or add a volume mount. Quick manual backup:
> ```bash
> cp /mnt/media/docker-compose.yml /mnt/media/backups/docker-compose.yml.bak
> cp /mnt/media/.env /mnt/media/backups/.env.bak
> ```
> Or add this to the Duplicati volumes in docker-compose.yml:
> ```yaml
> - /mnt/media/docker-compose.yml:/source-root/docker-compose.yml:ro
> - /mnt/media/.env:/source-root/.env:ro
> - /mnt/media/docs:/source-root/docs:ro
> - /mnt/media/scripts:/source-root/scripts:ro
> ```
> Then include `/source-root/` in the backup sources.

**Exclude filters — add these:**
```
*.log
*.log.*
*/Cache/*
*/cache/*
*/logs/*
*/Logs/*
```

**Also exclude these large regenerable dirs:**
```
/source/tdarr/
/source/recyclarr/
/source/netdata/
```

### 3. Schedule
- Frequency: **Daily**
- Time: **4:00 AM**

### 4. Retention
- Keep: **7 daily, 4 weekly**
- Delete older backups automatically

### 5. Save & Run
- Save the job
- Click "Run now" to verify the first backup works
- Check `/mnt/media/backups/duplicati/` has files afterward

## Verification

SSH to Pi and confirm:
```bash
ls -lh /mnt/media/backups/duplicati/
du -sh /mnt/media/backups/duplicati/
```

Expected first backup: ~800 MB–1 GB.

## Recovery

To restore from Duplicati:
1. Open Duplicati web UI
2. Click the backup job → Restore
3. Pick the snapshot date
4. Select files/folders to restore
5. Choose restore location (original or alternate path)

## What's Protected

| Category | Contents |
|----------|----------|
| Stack definition | docker-compose.yml, .env |
| *arr databases | Sonarr, Radarr, Lidarr, Prowlarr (library metadata, custom profiles, history) |
| Streaming | Jellyfin (users, watch history, settings) |
| Download clients | qBittorrent, SABnzbd configs |
| Networking | Caddy (reverse proxy, TLS), dnsmasq (split DNS) |
| Monitoring | Uptime Kuma (monitors, alert history) |
| Misc | Bazarr, Gluetun, Jellyseerr, Portainer, Homepage, Homarr |
| Docs | Stack documentation, custom scripts |
