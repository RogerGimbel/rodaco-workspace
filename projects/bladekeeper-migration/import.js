#!/usr/bin/env node
/**
 * BladeKeeper Migration: Replit → Supabase (Lovable version)
 * 
 * Maps Replit knife data to Lovable's blades + blade_extended_attributes tables
 * Uploads photos from base64 to Supabase Storage
 */

const fs = require('fs');
const https = require('https');

const SB_URL = 'https://zocftrkoaokqvklugztj.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvY2Z0cmtvYW9rcXZrbHVnenRqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjcyNjIwNiwiZXhwIjoyMDYyMzAyMjA2fQ.zv6NA4kzvT0IulDO8OPFuTYelSQxXwtzYF4kI0ZwT4M';
const USER_ID = 'd86e224a-f86e-4e63-ba12-48a1a055894d'; // accfighter@gmail.com

async function sbFetch(path, options = {}) {
  const url = `${SB_URL}${path}`;
  const headers = {
    'Authorization': `Bearer ${SB_KEY}`,
    'apikey': SB_KEY,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  
  const resp = await fetch(url, { ...options, headers });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Supabase ${resp.status}: ${text}`);
  }
  return resp;
}

// Map Replit blade type/style to Lovable's blade_type enum
function mapBladeType(style) {
  if (!style) return 'Fixed Blade Knife';
  const s = style.toLowerCase();
  if (s.includes('fold') || s.includes('lock')) return 'Folding Knife';
  if (s.includes('axe') || s.includes('hatchet')) return 'Hatchet';
  if (s.includes('sword') || s.includes('bolo') || s.includes('machete')) return 'Sword';
  if (s.includes('multi')) return 'Multi-Tool';
  if (s.includes('chef') || s.includes('kitchen') || s.includes('butcher') || s.includes('galley')) return "Chef's Knife";
  if (s.includes('utility')) return 'Utility Knife';
  return 'Fixed Blade Knife';
}

// Parse blade length string to number (e.g., "5\"" -> 5, "5-3/4\"" -> 5.75)
function parseLength(str) {
  if (!str) return null;
  const clean = str.replace(/[\"\']/g, '').trim();
  // Handle fractions like "5-3/4" or "9-1/2"
  const match = clean.match(/^(\d+)(?:-(\d+)\/(\d+))?/);
  if (match) {
    let val = parseInt(match[1]);
    if (match[2] && match[3]) {
      val += parseInt(match[2]) / parseInt(match[3]);
    }
    return val;
  }
  const num = parseFloat(clean);
  return isNaN(num) ? null : num;
}

async function importKnife(knife, index) {
  console.log(`\n[${index + 1}/31] Importing: ${knife.manufacturer} - ${knife.model}`);

  // 1. Insert into blades table
  const bladeData = {
    user_id: USER_ID,
    name: `${knife.manufacturer} ${knife.model}`.trim(),
    manufacturer: knife.manufacturer || null,
    model: knife.model || null,
    type: mapBladeType(knife.style),
    blade_steel: knife.steel || null,
    blade_length: parseLength(knife.bladeLength),
    total_length: parseLength(knife.overallLength),
    handle_material: knife.handle || null,
    serial_number: knife.serialNumber || null,
    notes: knife.notes || null,
    acquired_date: knife.dateAcquired || null,
    acquired_price: knife.pricePaid ? parseFloat(knife.pricePaid.replace(/[$,]/g, '')) || null : null,
    condition: 'Good',
    visibility: 'private'
  };

  const bladeResp = await sbFetch('/rest/v1/blades', {
    method: 'POST',
    headers: { 'Prefer': 'return=representation' },
    body: JSON.stringify(bladeData)
  });
  const [blade] = await bladeResp.json();
  console.log(`  ✅ Blade created: ${blade.id}`);

  // 2. Insert extended attributes
  const extData = {
    blade_id: blade.id,
    user_id: USER_ID,
    tang_type: knife.tang || null,
    grind_type: knife.grind || null,
    blade_profile: knife.bladeStyle || null,
    guard_style: knife.guard || null,
    pommel_type: knife.pommel || null,
    sheath_type: knife.sheath || null,
    origin: knife.placeMade || null,
    edge_type: knife.edgeGeometry || null,
    historical_notes: knife.dateMade ? `Manufactured: ${knife.dateMade}` : null
  };

  try {
    await sbFetch('/rest/v1/blade_extended_attributes', {
      method: 'POST',
      body: JSON.stringify(extData)
    });
    console.log(`  ✅ Extended attributes saved`);
  } catch (e) {
    console.log(`  ⚠️ Extended attributes failed: ${e.message}`);
  }

  // 3. Upload photos to Storage
  if (knife.photos && knife.photos.length > 0) {
    for (let i = 0; i < knife.photos.length; i++) {
      const photo = knife.photos[i];
      if (!photo.blob) continue;

      try {
        // Decode base64
        const base64Data = photo.blob.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const filename = `${Date.now()}_${i}.jpg`;
        const storagePath = `user-uploads/${blade.id}/${filename}`;

        // Upload to storage
        const uploadResp = await fetch(`${SB_URL}/storage/v1/object/blade-images/${storagePath}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SB_KEY}`,
            'apikey': SB_KEY,
            'Content-Type': 'image/jpeg',
            'x-upsert': 'true'
          },
          body: buffer
        });

        if (!uploadResp.ok) {
          const err = await uploadResp.text();
          console.log(`  ⚠️ Photo upload failed: ${err}`);
          continue;
        }

        // Create blade_images record
        await sbFetch('/rest/v1/blade_images', {
          method: 'POST',
          body: JSON.stringify({
            blade_id: blade.id,
            storage_path: storagePath,
            is_primary: i === 0,
            content_type: 'image/jpeg',
            original_filename: photo.name || `photo_${i + 1}.jpg`,
            size_bytes: buffer.length
          })
        });
        console.log(`  ✅ Photo ${i + 1} uploaded (${(buffer.length / 1024).toFixed(0)}KB)`);
      } catch (e) {
        console.log(`  ⚠️ Photo ${i + 1} failed: ${e.message}`);
      }
    }
  }

  return blade.id;
}

async function main() {
  console.log('=== BladeKeeper Migration: Replit → Supabase ===\n');

  const raw = fs.readFileSync('/home/node/workspace/projects/bladekeeper-migration/knives-full-backup.json', 'utf8');
  const data = JSON.parse(raw);
  console.log(`Found ${data.knives.length} knives to import\n`);
  console.log(`Target user: ${USER_ID} (accfighter@gmail.com)`);
  console.log(`Target project: zocftrkoaokqvklugztj\n`);

  const imported = [];
  for (let i = 0; i < data.knives.length; i++) {
    try {
      const id = await importKnife(data.knives[i], i);
      imported.push(id);
    } catch (e) {
      console.log(`  ❌ FAILED: ${e.message}`);
    }
  }

  console.log(`\n=== Migration Complete ===`);
  console.log(`Successfully imported: ${imported.length}/${data.knives.length}`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
