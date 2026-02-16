#!/bin/bash
# monthly-review.sh — Generate "What I've learned about Roger" summary
# Analyzes questions.json answers + knowledge graph to produce a monthly report
# Usage: bash bin/monthly-review.sh

set -euo pipefail

QUESTIONS_FILE="knowledge/people/roger-gimbel/questions.json"
SUMMARY_FILE="knowledge/people/roger-gimbel/summary.md"
REVIEW_DIR="knowledge/people/roger-gimbel/reviews"
DATE=$(date +%Y-%m)

mkdir -p "$REVIEW_DIR"

REVIEW_FILE="$REVIEW_DIR/review-${DATE}.md"

# Extract stats via node
STATS=$(node -e "
const q = JSON.parse(require('fs').readFileSync('$QUESTIONS_FILE','utf8'));
const cats = {};
q.questions.forEach(q2 => {
  if (!cats[q2.category]) cats[q2.category] = {total:0, asked:0, answered:0, unanswered_asked:0};
  cats[q2.category].total++;
  if (q2.asked) cats[q2.category].asked++;
  if (q2.answered) cats[q2.category].answered++;
  if (q2.asked && !q2.answered) cats[q2.category].unanswered_asked++;
});

const answered = q.questions.filter(x=>x.answered);
const totalAnswered = answered.length;
const totalAsked = q.totalAsked || 0;
const totalQuestions = q.questions.length;
const responseRate = totalAsked > 0 ? Math.round((totalAnswered/totalAsked)*100) : 0;

// Find gap categories (lowest answer rate)
const catEntries = Object.entries(cats).map(([k,v]) => ({
  name: k, ...v, pct: v.total > 0 ? Math.round((v.answered/v.total)*100) : 0
})).sort((a,b) => a.pct - b.pct);

console.log(JSON.stringify({
  totalQuestions, totalAsked, totalAnswered, responseRate,
  categories: catEntries,
  answers: answered.map(a => ({category: a.category, text: a.text, answer: a.answer, date: a.answered}))
}));
")

# Generate review markdown
node -e "
const s = JSON.parse(process.argv[1]);
const lines = [];
lines.push('# Monthly Review: What I Know About Roger');
lines.push('*Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)*');
lines.push('');
lines.push('## Overview');
lines.push('- **Questions asked:** ' + s.totalAsked + '/' + s.totalQuestions);
lines.push('- **Questions answered:** ' + s.totalAnswered);
lines.push('- **Response rate:** ' + s.responseRate + '%');
lines.push('');
lines.push('## What I\\'ve Learned');
lines.push('');
s.answers.forEach(a => {
  lines.push('### ' + a.category.replace(/_/g,' ').replace(/\b\w/g, c => c.toUpperCase()));
  lines.push('**Q:** ' + a.text);
  lines.push('**A:** ' + a.answer);
  lines.push('');
});
lines.push('## Category Coverage');
lines.push('');
lines.push('| Category | Answered | Total | Coverage |');
lines.push('|----------|----------|-------|----------|');
s.categories.forEach(c => {
  const bar = c.pct === 0 ? '🔴' : c.pct < 30 ? '🟡' : '🟢';
  lines.push('| ' + c.name.replace(/_/g,' ') + ' | ' + c.answered + ' | ' + c.total + ' | ' + bar + ' ' + c.pct + '% |');
});
lines.push('');
lines.push('## Gap Analysis');
lines.push('');
const gaps = s.categories.filter(c => c.pct < 20);
if (gaps.length > 0) {
  lines.push('**Priority categories for next month** (lowest coverage):');
  gaps.forEach(g => lines.push('- **' + g.name.replace(/_/g,' ') + '** — ' + g.answered + '/' + g.total + ' answered'));
} else {
  lines.push('Good coverage across all categories!');
}
lines.push('');
lines.push('## Recommendations');
lines.push('');
lines.push('- Weight future questions toward gap categories');
lines.push('- Total question pool remaining: ' + (s.totalQuestions - s.totalAnswered) + ' unanswered');
lines.push('- Consider adding follow-up questions for brief answers');

console.log(lines.join('\n'));
" "$STATS" > "$REVIEW_FILE"

echo "Review generated: $REVIEW_FILE"
cat "$REVIEW_FILE"
