#!/bin/bash
# THE NATIONAL DAY INCIDENT: deploy the broken v2.1 (billing dependency times out).
# Watch the Grafana dashboard — activation latency will spike and success rate will fall.
echo ">> Deploying v2.1-broken (this is the incident)..."
curl -s http://localhost:3000/admin/deploy/v2.1-broken
echo ">> Now switch to your Grafana tab and watch what happens."
