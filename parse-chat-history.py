#!/usr/bin/env python3
"""
Unified Chat History Parser
Merges Grok + Claude conversations into knowledge/chat-history/
"""
import json, os, re
from datetime import datetime

# Categories and their keywords for auto-classification
CATEGORIES = {
    'beerpair': ['beerpair', 'beer pair', 'beer and food', 'food pairing', 'beer sommelier', 'beer recommendation'],
    'ocean-one': ['ocean one', 'marine construction', 'sea wall', 'dock', 'boat lift'],
    'rodaco': ['rodaco', 'selfgrowth', 'self-help app', 'lovable', 'supabase project'],
    'technical': ['claude code', 'terminal', 'docker', 'git', 'ssh', 'api', 'coding', 'debug', 'error',
                  'zshrc', 'npm', 'python', 'typescript', 'javascript', 'react', 'raspberry pi',
                  'server', 'deploy', 'cursor', 'replit', 'github', 'permissions', 'install'],
    'research': ['ai model', 'llm', 'grok', 'research', 'compare', 'analysis'],
    'personal': [],  # catch-all
    'media-posts': ['tweet', 'post', 'x post', 'social media post'],
    'tasks': ['schedule', 'reminder', 'todo', 'task list'],
}

def classify_conversation(name, first_msg_text):
    """Classify a conversation into a category based on title and first message."""
    text = f"{name} {first_msg_text}".lower()
    for cat, keywords in CATEGORIES.items():
        if cat == 'personal':
            continue
        for kw in keywords:
            if kw in text:
                return cat
    return 'personal'

def parse_claude_conversations(filepath):
    """Parse Claude data dump conversations.json"""
    with open(filepath) as f:
        convos = json.load(f)
    
    results = []
    for c in convos:
        msgs = c.get('chat_messages', [])
        if not msgs:
            continue
        
        name = c.get('name', 'Untitled')
        uuid = c.get('uuid', '')
        created = msgs[0]['created_at'][:10] if msgs else '?'
        
        # Extract human/assistant messages
        human_msgs = []
        assistant_msgs = []
        for m in msgs:
            for content in m.get('content', []):
                text = content.get('text', '')
                if not text:
                    continue
                if m['sender'] == 'human':
                    human_msgs.append(text)
                elif m['sender'] == 'assistant':
                    assistant_msgs.append(text)
        
        first_human = human_msgs[0] if human_msgs else ''
        category = classify_conversation(name or '', first_human)
        
        # Build key points from the conversation
        key_points = []
        for h in human_msgs[:5]:  # first 5 human messages as key points
            clean = h.strip()[:200]
            if clean:
                key_points.append(clean)
        
        results.append({
            'date': created,
            'title': name or 'Untitled',
            'category': category,
            'msg_count': len(msgs),
            'key_points': key_points,
            'source': 'Claude',
        })
    
    return results

def add_source_tags_to_grok(grok_dir):
    """Read existing grok history files and return parsed entries with source tags."""
    results = []
    for fname in os.listdir(grok_dir):
        if not fname.endswith('.md') or fname == 'INDEX.md':
            continue
        category = fname.replace('.md', '')
        filepath = os.path.join(grok_dir, fname)
        with open(filepath) as f:
            content = f.read()
        
        # Parse existing entries - format: ## DATE — TITLE\n**Key points:**\n- ...\n*N messages*
        entries = re.split(r'\n---\n', content)
        for entry in entries:
            match = re.search(r'## (\d{4}-\d{2}-\d{2}) — (.+)', entry)
            if not match:
                continue
            date = match.group(1)
            title = match.group(2).strip()
            
            # Extract key points
            key_points = re.findall(r'^- (.+)$', entry, re.MULTILINE)
            
            # Extract message count
            msg_match = re.search(r'\*(\d+) messages?\*', entry)
            msg_count = int(msg_match.group(1)) if msg_match else 0
            
            results.append({
                'date': date,
                'title': title,
                'category': category,
                'msg_count': msg_count,
                'key_points': key_points,
                'source': 'Grok',
            })
    
    return results

def write_category_file(category, entries, output_dir):
    """Write a category markdown file with source-tagged entries."""
    # Sort by date
    entries.sort(key=lambda e: e['date'])
    
    cat_title = {
        'beerpair': 'BeerPair Conversations',
        'ocean-one': 'Ocean One Marine Conversations',
        'rodaco': 'Rodaco Business Conversations',
        'technical': 'Coding & Technical Conversations',
        'research': 'Research & AI Conversations',
        'personal': 'Personal Conversations',
        'media-posts': 'Media & Social Posts',
        'tasks': 'Scheduled Tasks & Reminders',
    }.get(category, category.title() + ' Conversations')
    
    lines = [f"# {cat_title}\n"]
    lines.append(f"**{len(entries)} conversations**\n")
    lines.append("---\n")
    
    for e in entries:
        lines.append(f"## {e['date']} — {e['title']}\n")
        lines.append(f"**Source:** {e['source']} | **Messages:** {e['msg_count']}\n")
        if e['key_points']:
            lines.append("**Key points:**")
            for kp in e['key_points']:
                lines.append(f"- {kp}")
        lines.append(f"\n*{e['msg_count']} messages*\n")
        lines.append("---\n")
    
    filepath = os.path.join(output_dir, f"{category}.md")
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))
    
    return len(entries)

def write_index(all_entries, output_dir):
    """Write the INDEX.md file."""
    all_entries.sort(key=lambda e: e['date'])
    
    # Count by category and source
    cat_counts = {}
    source_counts = {'Grok': 0, 'Claude': 0}
    for e in all_entries:
        cat_counts[e['category']] = cat_counts.get(e['category'], 0) + 1
        source_counts[e['source']] = source_counts.get(e['source'], 0) + 1
    
    dates = [e['date'] for e in all_entries if e['date'] != '?']
    min_date = min(dates) if dates else '?'
    max_date = max(dates) if dates else '?'
    
    lines = ["# Unified Chat History Index\n"]
    lines.append(f"**Total:** {len(all_entries)} conversations | **Period:** {min_date} to {max_date}\n")
    lines.append("## Sources\n")
    for src, cnt in sorted(source_counts.items()):
        lines.append(f"- **{src}:** {cnt}")
    lines.append("\n## Category Summary\n")
    for cat, cnt in sorted(cat_counts.items(), key=lambda x: -x[1]):
        lines.append(f"- **{cat.replace('-', ' ').title()}:** {cnt}")
    
    lines.append("\n## All Conversations\n")
    lines.append("| Date | Title | Category | Source | Msgs |")
    lines.append("|------|-------|----------|--------|------|")
    for e in all_entries:
        lines.append(f"| {e['date']} | {e['title']} | {e['category'].title()} | {e['source']} | {e['msg_count']} |")
    
    filepath = os.path.join(output_dir, "INDEX.md")
    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

def main():
    workspace = '/home/node/workspace'
    grok_dir = os.path.join(workspace, 'knowledge/grok-history')
    output_dir = os.path.join(workspace, 'knowledge/chat-history')
    claude_file = os.path.join(workspace, 'claude-conversations.json')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Parse sources
    print("Parsing Grok history...")
    grok_entries = add_source_tags_to_grok(grok_dir)
    print(f"  Found {len(grok_entries)} Grok conversations")
    
    print("Parsing Claude conversations...")
    claude_entries = parse_claude_conversations(claude_file)
    print(f"  Found {len(claude_entries)} Claude conversations")
    
    # Merge
    all_entries = grok_entries + claude_entries
    print(f"\nTotal: {len(all_entries)} conversations")
    
    # Group by category and write files
    by_category = {}
    for e in all_entries:
        by_category.setdefault(e['category'], []).append(e)
    
    for cat, entries in by_category.items():
        count = write_category_file(cat, entries, output_dir)
        print(f"  {cat}: {count} conversations")
    
    # Write index
    write_index(all_entries, output_dir)
    print(f"\nDone! Output: {output_dir}/")

if __name__ == '__main__':
    main()
