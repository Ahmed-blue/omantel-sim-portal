#!/bin/bash
# THE RESCUE: roll back to the known-good v2.0. Billing recovers.
# Watch the Grafana dashboard — latency drops back to normal, success rate recovers.
echo ">> Rolling back to v2.0-nationalday..."
curl -s http://localhost:3000/admin/deploy/v2.0
echo ">> Switch to Grafana and watch the graphs heal."
