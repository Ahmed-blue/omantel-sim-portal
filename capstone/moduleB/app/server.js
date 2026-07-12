// ─────────────────────────────────────────────────────────────
// Omantel SIM Activation Portal — Capstone build (Module B)
// Extends the Day 2 Docker portal (server.js) with real metrics.
// Exposes Prometheus metrics at /metrics so Grafana can chart it.
// ─────────────────────────────────────────────────────────────
const http = require('http');
const client = require('prom-client');

const register = new client.Registry();
client.collectDefaultMetrics({ register });

// --- Custom metrics for SIM activation ---
const activationDuration = new client.Histogram({
  name: 'sim_activation_duration_seconds',
  help: 'Time taken to process a SIM activation request',
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 4, 6, 8, 10, 12],
  registers: [register],
});
const activationTotal = new client.Counter({
  name: 'sim_activation_total',
  help: 'Total SIM activation attempts, labelled by result',
  labelNames: ['result'],
  registers: [register],
});

// --- Runtime state (toggled by the incident scripts) ---
let MODE = 'healthy';                               // healthy | broken
let APP_VERSION = process.env.APP_VERSION || '2.0-nationalday';

// Healthy: billing responds in 40–80ms. Broken: billing dependency
// times out at ~7.5–8.5s and ~60% of activations fail (National Day incident).
function activationLatencyMs() {
  return MODE === 'broken'
    ? 7500 + Math.random() * 1000
    : 40 + Math.random() * 40;
}

function portalPage() {
  const healthy = MODE === 'healthy';
  return `<!doctype html><html><head><title>Omantel SIM Portal</title></head>
  <body style="font-family:Arial;padding:40px;background:#f0f8ff;">
    <h1 style="color:#0D7377;">Omantel SIM Activation Portal</h1>
    <p>Status: <strong style="color:${healthy ? 'green' : 'crimson'};">${healthy ? 'ACTIVE' : 'DEGRADED'}</strong></p>
    <p>Version: <strong>${APP_VERSION}</strong></p>
    <p>Billing dependency: <strong style="color:${healthy ? 'green' : 'crimson'};">${healthy ? 'OK' : 'TIMING OUT'}</strong></p>
    <hr/><p style="color:#555;">Metrics exposed at <code>/metrics</code> · Activation endpoint <code>/activate</code></p>
  </body></html>`;
}

const server = http.createServer(async (req, res) => {
  // Prometheus scrape endpoint
  if (req.url === '/metrics') {
    res.setHeader('Content-Type', register.contentType);
    return res.end(await register.metrics());
  }
  // Incident controls (used by inject-fault.sh / rollback.sh)
  if (req.url === '/admin/deploy/v2.1-broken') {
    MODE = 'broken'; APP_VERSION = '2.1-broken';
    return res.end('Deployed v2.1-broken — billing dependency now timing out.\n');
  }
  if (req.url === '/admin/deploy/v2.0') {
    MODE = 'healthy'; APP_VERSION = '2.0-nationalday';
    return res.end('Rolled back to v2.0-nationalday — billing dependency restored.\n');
  }
  // Simulated SIM activation (this is what the load generator hits)
  if (req.url === '/activate') {
    const ms = activationLatencyMs();
    return setTimeout(() => {
      activationDuration.observe(ms / 1000);
      const failed = MODE === 'broken' && Math.random() < 0.6;
      activationTotal.inc({ result: failed ? 'failure' : 'success' });
      res.writeHead(failed ? 503 : 200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: failed ? 'FAILED' : 'ACTIVATED',
        latency_ms: Math.round(ms),
        version: APP_VERSION,
      }));
    }, ms);
  }
  // Portal status page
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(portalPage());
});

server.listen(3000, () => {
  console.log(`Omantel SIM Portal listening on :3000  (version ${APP_VERSION})`);
});
