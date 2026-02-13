#!/usr/bin/env bash
set -euo pipefail

QUESTIONS_FILE="/home/node/workspace/knowledge/people/roger-gimbel/questions.json"

if [ ! -f "$QUESTIONS_FILE" ]; then
  echo '{"error": "questions.json not found"}' 
  exit 1
fi

# Use node (available in container) for JSON manipulation
node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));

// Filter unasked questions
const unasked = data.questions.filter(q => q.asked === null);
if (unasked.length === 0) {
  console.log(JSON.stringify({ error: "All questions have been asked!" }));
  process.exit(0);
}

// Count asked per category
const catCounts = {};
for (const q of data.questions) {
  if (!catCounts[q.category]) catCounts[q.category] = { asked: 0, total: 0 };
  catCounts[q.category].total++;
  if (q.asked) catCounts[q.category].asked++;
}

// Find min asked ratio
let minRatio = Infinity;
for (const cat of Object.keys(catCounts)) {
  const ratio = catCounts[cat].asked / catCounts[cat].total;
  if (ratio < minRatio) minRatio = ratio;
}

// Get categories at or near min ratio (within 0.05)
const gapCats = Object.keys(catCounts).filter(cat => {
  const ratio = catCounts[cat].asked / catCounts[cat].total;
  return ratio <= minRatio + 0.05;
});

// Filter unasked to gap categories
let pool = unasked.filter(q => gapCats.includes(q.category));
if (pool.length === 0) pool = unasked;

// Random pick
const pick = pool[Math.floor(Math.random() * pool.length)];

// Mark as asked
pick.asked = new Date().toISOString();
data.totalAsked = data.questions.filter(q => q.asked !== null).length;

fs.writeFileSync(process.argv[1], JSON.stringify(data, null, 2));

console.log(JSON.stringify({ id: pick.id, category: pick.category, text: pick.text }));
' "$QUESTIONS_FILE"
