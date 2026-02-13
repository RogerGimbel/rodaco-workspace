#!/usr/bin/env bash
set -euo pipefail

QUESTIONS_FILE="/home/node/workspace/knowledge/people/roger-gimbel/questions.json"

if [ $# -lt 2 ]; then
  echo "Usage: record-answer.sh <question_id> <answer_text>"
  exit 1
fi

QID="$1"
shift
ANSWER="$*"

node -e '
const fs = require("fs");
const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
const qid = parseInt(process.argv[2]);
const answer = process.argv[3];

const q = data.questions.find(q => q.id === qid);
if (!q) {
  console.log(JSON.stringify({ error: "Question not found", id: qid }));
  process.exit(1);
}

q.answered = new Date().toISOString();
q.answer = answer;

fs.writeFileSync(process.argv[1], JSON.stringify(data, null, 2));
console.log(JSON.stringify({ success: true, id: qid, category: q.category, text: q.text }));
' "$QUESTIONS_FILE" "$QID" "$ANSWER"
