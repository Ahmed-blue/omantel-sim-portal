#!/bin/bash
# Generates a steady stream of SIM activation traffic so the dashboard moves.
# Leave this running in its own terminal tab during the exercise.
echo "Generating activation traffic against the portal... (Ctrl+C to stop)"
while true; do
  curl -s -o /dev/null http://localhost:3000/activate
  sleep 0.3
done
