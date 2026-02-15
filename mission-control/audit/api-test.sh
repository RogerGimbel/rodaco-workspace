#!/bin/bash
# Mission Control v3 API Audit
# Testing all documented endpoints

BASE_URL="http://100.124.209.59:3333"
OUTPUT_DIR="/home/node/workspace/mission-control/audit"
mkdir -p "$OUTPUT_DIR/responses"

echo "=== MISSION CONTROL V3 API AUDIT ===" > "$OUTPUT_DIR/api-test-results.txt"
echo "Timestamp: $(date)" >> "$OUTPUT_DIR/api-test-results.txt"
echo "" >> "$OUTPUT_DIR/api-test-results.txt"

# Function to test endpoint
test_endpoint() {
    local endpoint=$1
    local name=$2
    
    echo "Testing: $endpoint" | tee -a "$OUTPUT_DIR/api-test-results.txt"
    
    http_code=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint" -o "$OUTPUT_DIR/responses/${name}.json" 2>&1 | tail -1)
    
    if [ "$http_code" = "200" ]; then
        size=$(wc -c < "$OUTPUT_DIR/responses/${name}.json")
        echo "  ✓ Status: 200, Size: $size bytes" | tee -a "$OUTPUT_DIR/api-test-results.txt"
    else
        echo "  ✗ Status: $http_code" | tee -a "$OUTPUT_DIR/api-test-results.txt"
        head -5 "$OUTPUT_DIR/responses/${name}.json" | tee -a "$OUTPUT_DIR/api-test-results.txt"
    fi
    echo "" >> "$OUTPUT_DIR/api-test-results.txt"
}

# HOME endpoints
echo "### HOME PAGE ###" | tee -a "$OUTPUT_DIR/api-test-results.txt"
test_endpoint "/api/v3/health" "health"
test_endpoint "/api/v3/system-overview" "system-overview"
test_endpoint "/api/v3/cron-status" "cron-status"
test_endpoint "/api/v3/device/macbook" "device-macbook"
test_endpoint "/api/v3/device/pi" "device-pi"
test_endpoint "/api/v3/usage" "usage"

# OPS endpoints
echo "### OPS PAGE ###" | tee -a "$OUTPUT_DIR/api-test-results.txt"
test_endpoint "/api/v3/active-tasks" "active-tasks"
test_endpoint "/api/v3/goals" "goals"
test_endpoint "/api/v3/overnight-log" "overnight-log"
test_endpoint "/api/v3/suggested-tasks" "suggested-tasks"
test_endpoint "/api/v3/activity" "activity"

# AGENT endpoints
echo "### AGENT PAGE ###" | tee -a "$OUTPUT_DIR/api-test-results.txt"
test_endpoint "/api/v3/agent" "agent"
test_endpoint "/api/v3/agent/models" "agent-models"
test_endpoint "/api/v3/agent/sessions" "agent-sessions"
test_endpoint "/api/v3/agent/cron-jobs" "agent-cron-jobs"
test_endpoint "/api/v3/usage/providers" "usage-providers"

# PROJECTS endpoints
echo "### PROJECTS PAGE ###" | tee -a "$OUTPUT_DIR/api-test-results.txt"
test_endpoint "/api/v3/projects/beerpair" "projects-beerpair"
test_endpoint "/api/v3/projects/ocean-one" "projects-ocean-one"

# KNOWLEDGE endpoints
echo "### KNOWLEDGE PAGE ###" | tee -a "$OUTPUT_DIR/api-test-results.txt"
test_endpoint "/api/v3/knowledge/graph" "knowledge-graph"
test_endpoint "/api/v3/knowledge/search?q=beerpair" "knowledge-search"
test_endpoint "/api/v3/knowledge/tree" "knowledge-tree"
test_endpoint "/api/v3/knowledge/timeline" "knowledge-timeline"

# RESEARCH endpoints
echo "### RESEARCH PAGE ###" | tee -a "$OUTPUT_DIR/api-test-results.txt"
test_endpoint "/api/v3/research/openclaw" "research-openclaw"
test_endpoint "/api/v3/research/competitive" "research-competitive"
test_endpoint "/api/v3/research/marketing" "research-marketing"

echo "=== TEST COMPLETE ===" | tee -a "$OUTPUT_DIR/api-test-results.txt"
echo "Results saved to: $OUTPUT_DIR/api-test-results.txt"
echo "Responses saved to: $OUTPUT_DIR/responses/"
