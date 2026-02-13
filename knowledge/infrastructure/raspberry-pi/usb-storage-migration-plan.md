# Pi USB Storage Migration Plan

**Created:** 2026-02-13
**Status:** PLANNED
**Goal:** Move Docker to SanDisk 256GB (USB 2), keep media on 2TB SSD (USB 3)

## Hardware

| Device | Model | Port | Role |
|--------|-------|------|------|
| SD Card | (existing) | SD slot | OS boot only |
| SanDisk 256GB | EBCD | USB 3.0 | Docker root (`/var/lib/docker`) |
| 2TB SSD | (existing) | USB 3.0 | Media (`/mnt/media`) |

**Note:** The SanDisk is currently formatted for iPhone/Mac (likely APFS or exFAT). Must be reformatted to ext4.

---

## Pre-Migration

### Step 0: Backup critical configs

SSH into the Pi as `rogergimbel@100.83.169.87`:

```bash
# Create a backup of all Docker compose and config files
cd /mnt/media
tar czf /tmp/docker-configs-backup-$(date +%Y%m%d).tar.gz \
  docker-compose.yml .env \
  $(find . -name "*.yml" -o -name "*.yaml" -o -name "*.conf" | head -50)

# Backup current Docker daemon config if it exists
sudo cp /etc/docker/daemon.json /tmp/daemon.json.bak 2>/dev/null || echo "No existing daemon.json"

# Note current container list
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Image}}" > /tmp/container-list.txt
cat /tmp/container-list.txt
```

### Step 1: Identify the SanDisk after plugging it in

```bash
# Plug the SanDisk into the USB 2 port, then:
lsblk
# Look for a ~256GB device (probably /dev/sdb or /dev/sdc)
# Note: the 2TB SSD is probably /dev/sda

# Confirm which is which
lsblk -o NAME,SIZE,MODEL,TRAN
# TRAN column shows "usb" — SIZE will distinguish them (256G vs 1.8T)

# Check current filesystem on the SanDisk
sudo fdisk -l /dev/sdX   # replace X with the correct letter
# Expect: APFS, exFAT, or HFS+ partition(s)
```

---

## Migration

### Step 2: Reformat the SanDisk to ext4

```bash
# ⚠️ TRIPLE CHECK the device letter — do NOT format the SSD!
# Confirm: this should be ~256GB, NOT ~2TB
lsblk /dev/sdX

# Wipe existing partition table and create single Linux partition
sudo fdisk /dev/sdX
# Commands inside fdisk:
#   g        (create new GPT partition table)
#   n        (new partition — accept all defaults for full disk)
#   w        (write and exit)

# Format as ext4 with a clear label
sudo mkfs.ext4 -L DOCKER /dev/sdX1

# Verify
lsblk -f /dev/sdX
# Should show: ext4, LABEL=DOCKER
```

### Step 3: Create mount point and test mount

```bash
sudo mkdir -p /mnt/docker

# Test mount
sudo mount /dev/sdX1 /mnt/docker
df -h /mnt/docker
# Should show ~238GB available

# Set ownership
sudo chown root:root /mnt/docker
```

### Step 4: Stop all containers

```bash
cd /mnt/media  # or wherever docker-compose.yml lives
docker compose down

# Verify everything is stopped
docker ps
# Should be empty

# Stop Docker daemon
sudo systemctl stop docker
sudo systemctl stop docker.socket
```

### Step 5: Migrate Docker data to SanDisk

```bash
# Copy existing Docker data to the SanDisk
sudo rsync -aHAXS --info=progress2 /var/lib/docker/ /mnt/docker/

# Verify copy
sudo du -sh /var/lib/docker
sudo du -sh /mnt/docker
# Sizes should match (approximately)
```

### Step 6: Configure Docker to use new location

```bash
# Create or edit daemon.json
sudo tee /etc/docker/daemon.json << 'EOF'
{
  "data-root": "/mnt/docker",
  "storage-driver": "overlay2",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
```

### Step 7: Set up permanent mount in fstab

```bash
# Get the UUID (more reliable than /dev/sdX which can change)
sudo blkid /dev/sdX1
# Note the UUID="xxxx-xxxx-xxxx..."

# Add to fstab
echo 'UUID=PASTE-UUID-HERE  /mnt/docker  ext4  defaults,noatime,nofail  0  2' | sudo tee -a /etc/fstab

# ⚠️ "nofail" is critical — if the drive dies, the Pi still boots
# ⚠️ "noatime" reduces unnecessary writes (flash drive longevity)

# Test fstab without rebooting
sudo umount /mnt/docker
sudo mount -a
df -h /mnt/docker
# Should remount successfully
```

### Step 8: Start Docker and bring up containers

```bash
# Start Docker with new data-root
sudo systemctl start docker

# Verify Docker sees the new location
docker info | grep "Docker Root Dir"
# Should show: /mnt/docker

# Bring up all containers
cd /mnt/media
docker compose up -d

# Verify everything is running
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## Post-Migration

### Step 9: Fix temp directories

Make sure heavy-write temp dirs point to the SSD, not the flash drive:

```bash
# Check these in docker-compose.yml or container configs:
# - Tdarr temp/transcode dir → /mnt/media/tdarr_temp/
# - SABnzbd incomplete dir → /mnt/media/sabnzbd/incomplete/
# - qBittorrent temp dir → /mnt/media/qbittorrent/temp/

# Create temp dirs on SSD if needed
mkdir -p /mnt/media/tdarr_temp
mkdir -p /mnt/media/sabnzbd/incomplete
mkdir -p /mnt/media/qbittorrent/temp
```

### Step 10: Verify everything works

```bash
# Check all containers healthy
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check Gluetun VPN
docker exec gluetun wget -qO- ifconfig.me

# Test Jellyfin
curl -s http://localhost:8096/health

# Check disk usage
df -h
# SD card (/): should be light
# /mnt/docker: Docker stuff
# /mnt/media: Media files

# Monitor for issues
docker stats --no-stream
```

### Step 11: Clean up old Docker data from SD card

```bash
# Only after confirming everything works for 24+ hours!
sudo rm -rf /var/lib/docker.bak  # if you renamed it
# Or if you left it in place:
# sudo rm -rf /var/lib/docker/*  # free up SD card space
```

---

## Rollback Plan

If anything goes wrong:

```bash
# Stop Docker
sudo systemctl stop docker

# Remove daemon.json (reverts to default /var/lib/docker)
sudo rm /etc/docker/daemon.json

# Remove fstab entry
sudo nano /etc/fstab  # remove the DOCKER line

# Start Docker (uses original data on SD card)
sudo systemctl start docker

# Bring up containers
cd /mnt/media && docker compose up -d
```

---

## Final Layout

```
SD Card (boot):
  /boot, /etc, /usr, /home — OS only, minimal writes

SanDisk 256GB (USB 2, /mnt/docker):
  Docker images, container layers, volumes (configs/DBs)
  Mount: noatime,nofail

2TB SSD (USB 3, /mnt/media):
  docker-compose.yml, .env
  Media libraries (movies, tv, music)
  Download dirs (complete + incomplete)
  Transcode temp dirs
  Backups
```

---

## Risk Notes

- **Flash drive failure:** nofail in fstab means Pi still boots. Re-plug or replace drive, re-pull images.
- **USB 3 speed:** Both drives on USB 3 now. SanDisk flash will be the bottleneck (~400 MB/s), not the port.
- **SanDisk lifespan:** With noatime + mostly-read Docker workloads, expect 3-5+ years.
