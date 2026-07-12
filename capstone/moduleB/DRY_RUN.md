# Module B — Observability Stack · Dry-Run Guide

This is the **real** hands-on observability lab: SIM portal + Prometheus + Grafana,
with a live dashboard, an injectable National Day incident, and a rollback that heals it.

Everything runs in the browser on Killercoda. No local install.

---

## What's in this folder

```
moduleB/
├── app/                     the Omantel SIM portal (Day-2 server.js + Prometheus metrics)
│   ├── server.js
│   ├── package.json
│   └── Dockerfile
├── prometheus/prometheus.yml   scrapes the portal every 5s
├── grafana/                  auto-provisioned datasource + pre-built dashboard
│   ├── provisioning/...
│   └── dashboards/omantel.json
├── docker-compose.yml        one command brings up all 3 services
├── scripts/
│   ├── load.sh               generates activation traffic (graphs move)
│   ├── inject-fault.sh       THE INCIDENT (deploy broken v2.1)
│   └── rollback.sh           THE RESCUE (roll back to v2.0)
└── dashboard_preview.png     what the finished dashboard looks like
```

---

## Dry-run steps (do this 2× before the 13th)

**Fastest path — via your GitHub repo:**

1. Push this `moduleB/` folder to a public GitHub repo (you can reuse `omantel-sim-portal` in a `capstone/` subfolder, or make a new repo).
2. Open **https://killercoda.com/playgrounds/scenario/ubuntu** and sign in with GitHub. Click **START**.
3. In the terminal:
   ```bash
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git
   cd YOUR-REPO/moduleB          # adjust path to where moduleB lives
   docker compose up -d --build
   ```
   First run pulls Grafana + Prometheus images and builds the portal — **this is the step to time on venue-like WiFi.** Expect 1–3 min.
4. Confirm all three are up:
   ```bash
   docker compose ps          # portal, prometheus, grafana all "Up"
   ```
5. **Open Grafana:** click the **Traffic / Ports** menu (right side of Killercoda) → add port **3001** → open the URL. You should land straight in Grafana (no login) on the **"Omantel SIM Activation — Live Health"** dashboard. *(If the dashboard is empty, wait ~30s for the first scrapes.)*
6. **Start traffic** in a second terminal tab:
   ```bash
   bash scripts/load.sh
   ```
   Within ~30s the latency panel should sit near **~60ms** and success rate near **99%**.
7. **Inject the incident** (third tab, or stop watching load for a second):
   ```bash
   bash scripts/inject-fault.sh
   ```
   Switch to Grafana → within ~30s **latency climbs to ~8s**, request-rate panel floods **red**, success rate drops toward ~40%. This is the National Day incident.
8. **Rescue it:**
   ```bash
   bash scripts/rollback.sh
   ```
   Switch to Grafana → **latency drops back to ~60ms**, red disappears, success recovers to ~99%. You've healed it live.

---

## What to check / decide during the dry-run

- **Image-pull time on WiFi** (step 3). If it's painfully slow with 15 people, we pre-pull in the Killercoda scenario's background script (I'll build that wrapper next) so it's ready before trainees reach the step.
- **Port 3001 exposure** works on your network and each trainee can open their own Grafana.
- **Is anonymous Grafana landing on the dashboard** cleanly (no login wall)?
- Timing: from `docker compose up` to "watching healthy graphs" — how many minutes? That sets the lab budget.

If any of this is flaky on the venue network, the fallback is the terminal latency monitor (instant, one container) — we lose the Grafana polish but keep the incident + rollback lesson intact.

---

## Note on the rollback (trainer honesty)

For classroom reliability, `inject-fault.sh` / `rollback.sh` flip the portal's billing
behaviour instantly via an admin endpoint, and relabel the version (v2.1-broken ↔ v2.0).
Conceptually this **is** a version rollback — in real life you'd redeploy the previous
container image, which does the same thing but takes longer. Say that plainly to the room;
the lesson (watch it break, diagnose, roll back, watch it heal) is identical and honest.
