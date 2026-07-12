# AlphaInfo Drift Monitor — Grafana Panel Plugin

**Catch model drift before it becomes an incident.**

Models and features degrade quietly: the accuracy metric still looks
"within bounds", the latency histogram creeps, and the team finds out from
a downstream incident. In Grafana's 2026 Observability Survey, "surface
the anomaly before it becomes downtime" polled at 92% approval — this
panel does exactly that for the model metrics already on your dashboard.
It sends the series to the [alphainfo](https://alphainfo.io) structural
analysis API and asks: **did the structure of this metric change?**

Point it at any numeric model or data signal:

- prediction score / confidence distributions over time,
- inference latency percentiles,
- feature statistics (means, null rates, cardinalities per interval),
- throughput or input-volume counters that proxy data drift.

What you get:

- **Verdict badge** — `STABLE` / `TRANSITION` / `UNSTABLE` with the
  structural score and semantic alert level. Transitions are your
  **drift events**.
- **Regime overlay** — colored frame naming the current band.
- **Deep mode (optional)** — splits the window into 2–10 segments and
  shows **where** the drift started.
- **Quota footer** — live `remaining / limit`, per-run cost always visible.

## Quick start

1. Add an **AlphaInfo Drift Monitor** panel to your model dashboard.
2. Get a free API key at
   [alphainfo.io/register](https://alphainfo.io/register) — 50 analyses per
   month, no credit card.
3. Paste it under **Panel options → Authentication**.
4. Click **Analyze now**.

The default domain calibration is `AI / ML` (bounded metrics in [0, 1] or
[0, 100]). By default the panel analyzes only when clicked. For continuous
drift monitoring, enable **Quota → Re-analyze on dashboard refresh** and
size the plan:

| Usage pattern | Analyses/month | Suggested plan |
| --- | --- | --- |
| On-demand checks after deploys | tens | Free ($0) |
| 1 model metric, hourly refresh | ~720 | Starter ($49) |
| 1 metric, 5-min refresh | ~8,600 | Growth ($199) |
| 5 metrics, 5-min refresh | ~43,000 | Professional ($499) |

## How it reads

By default the verdict answers: **did the recent part of the metric drift
structurally vs how the visible window started?** The first half of the
window rides along as the reference (same 1-analysis cost). Scores above
0.70 = **stable**, below 0.35 = **unstable** (structurally different), in
between = **transition**. Give each side 400+ samples for confident
classification. Drift detected ≠ model broken — the panel shows that the
metric's structure changed and how severely; whether to retrain, roll
back, or investigate the pipeline is your call, made earlier.

## Options that matter

| Option | Default | Why |
| --- | --- | --- |
| Domain | AI / ML | Calibrated for bounded model metrics; switch to Generic/Auto for unbounded signals like latency. |
| Run on demand only | **on** | Analysis costs quota; you decide when to spend it (e.g., after each deploy). |
| Re-analyze on refresh | **off** | Turning it on is the moment to size your plan (table above). |
| Deep mode | off | +1 analysis per window per run; localizes when the drift started. |
| Max samples sent to API | 9,500 | Free-tier-safe; raise to your plan's cap. |

## What leaves your Grafana (data & privacy)

Each analysis sends exactly this to the alphainfo API, over HTTPS,
authenticated by your `X-API-Key` header:

- the **numeric sample values** of the analyzed metric (and, in the default
  window-start mode, the reference portion of the same series),
- the **sampling rate** (a number derived from the time spacing),
- the chosen **domain** and boolean analysis flags.

It does **not** send model names, feature names, metric names, label sets,
queries, dashboard metadata, absolute timestamps, or anything else
identifying — the field name shown in the footer never leaves your browser.
Analysis results are retained per your plan for audit replay (Free 7 days ·
Starter 30 · Growth 60 · Professional 90 · Enterprise 365 + on-prem
option). See [alphainfo.io/privacy](https://alphainfo.io/privacy) and
[alphainfo.io/terms](https://alphainfo.io/terms).

## Production considerations

**API key storage.** Grafana panel plugins store options in the dashboard
JSON — including the API key. Anyone with dashboard *Viewer* access can
read it. Fine for internal ML dashboards; for multi-tenant deployments
wait for the companion datasource plugin (roadmap), which keeps the key
encrypted server-side.

**CORS.** The panel calls the alphainfo API from the browser. The managed
API allows any Grafana origin; self-hosted API deployments must whitelist
the Grafana origin and expose the `X-RateLimit-*` headers.

**Alerting.** Grafana alert rules fire off data-source queries, not panel
internals — to alert on drift scores, run the analysis in your ML pipeline
(one POST per evaluation window) and write the score back as a series; a
datasource plugin is on the roadmap.

## Troubleshooting

- **"Network error: Failed to fetch"** — CORS preflight failed; whitelist
  the Grafana origin on self-hosted API deployments.
- **"Signal has N samples, but your plan allows up to M"** — lower *Max
  samples sent to API* to your plan's cap.
- **"Plan limit reached"** — monthly allowance or rate cap exhausted; the
  panel shows the `Retry-After` hint and the upgrade path.
- **Unsigned plugin on self-hosted Grafana** —
  `GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS=alphainfo-driftmonitor-panel`

## Development

```bash
npm install
npm run dev      # webpack watch into ./dist
npm run server   # docker compose: Grafana + this plugin at :3002
npm run test:ci  # jest
npm run build    # production build
```

Part of the AlphaInfo panel suite (Regime Detection · Signal Monitor for
Security Operations · Drift Monitor). The three plugins share the same
`src/core/` module, synced verbatim from the Regime Detection package —
fix once, fix everywhere (`scripts/sync-core.sh`).

## References

- [alphainfo API guide](https://alphainfo.io/v1/guide)
- [Pricing](https://alphainfo.io/pricing)
- [`plugin.json` reference](https://grafana.com/developers/plugin-tools/reference/plugin-json)
