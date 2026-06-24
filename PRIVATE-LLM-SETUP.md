# 🍞 Private / Closed-Loop LLM Setup for EaseMail AI Features

**Goal:** run every AI feature in EaseMail (email summaries, AI replies, priority
scoring, calendar NL parsing, dictation, voice profile) against a **self-hosted
LLM the firm controls** — no email content leaves your infrastructure.

The app is now provider-agnostic. `lib/ai/client.ts` builds the AI client from
env vars and defaults to Anthropic if none are set, so flipping to a private
model is a configuration change, not a code change.

---

## How the app connects (what you set)

Set these in Vercel (or your host) — all optional; unset = current Anthropic behavior:

| Env var | Meaning | Example |
|---|---|---|
| `AI_BASE_URL` | Base URL of your Anthropic-compatible endpoint | `https://llm.yourfirm.internal/v1` |
| `AI_API_KEY` | Key your gateway expects (falls back to `ANTHROPIC_API_KEY`) | `sk-firm-...` |
| `AI_MODEL` | Model id for the high-volume features | `llama-3.3-70b-instruct` |
| `AI_SUMMARY_MODEL` | Model for the on-demand email summary (can be larger) | `qwen2.5-72b-instruct` |

**Compatibility:** the SDK is the Anthropic SDK, so the endpoint must speak the
**Anthropic Messages API** shape (`/v1/messages`). Two clean ways to get that
from open models:
- **Anthropic-compatible gateway** in front of vLLM/Ollama (e.g. LiteLLM proxy
  with the `anthropic` route, or a thin adapter). This is the recommended path —
  point `AI_BASE_URL` at the gateway.
- If you prefer an **OpenAI-compatible** server (vLLM/Ollama both expose
  `/v1/chat/completions`), put LiteLLM in front to translate Anthropic↔OpenAI;
  the app keeps using the Anthropic SDK unchanged.

---

## Hosting options (pick one)

### Option A — On-prem server in the firm's office/colo (max control)
- **Best for:** strict closed-loop; data never leaves the building.
- **Stack:** Ubuntu + NVIDIA drivers + **vLLM** (throughput) or **Ollama**
  (simplest) + **LiteLLM** proxy for the Anthropic-compatible endpoint.
- **Networking:** keep the LLM on the LAN/VPN; expose only the LiteLLM endpoint
  to the app over TLS with an API key.

### Option B — Private cloud GPU (managed hardware, your tenancy)
- **Best for:** no on-prem hardware ops; still single-tenant/isolated.
- **Providers:** a dedicated GPU VM (AWS `g5`/`g6`, Azure `NC`, GCP `g2`, or a
  GPU host like Lambda/RunPod) running the same vLLM+LiteLLM stack in **your**
  VPC. Data stays in your cloud account.
- **Note:** this is "private" (your tenancy) but not "on-prem." For a law firm,
  confirm the BAA/DPA and that the VM has no shared inference.

### Option C — Ollama on a single workstation (pilot / small firm)
- **Best for:** trying it before buying a server; light usage.
- `ollama serve` + LiteLLM; a Mac Studio (M-series, 64–192GB unified memory) or
  a single RTX 4090/A6000 box runs a quantized 70B at usable speed for a handful
  of users.

---

## Model picks for legal use (open weights)

| Model | Size | Why | Min VRAM (quantized) |
|---|---|---|---|
| **Llama 3.3 70B Instruct** | 70B | Strong general reasoning, summarization | ~40GB (4-bit) / ~140GB (fp16) |
| **Qwen2.5 72B Instruct** | 72B | Excellent long-context summarization | ~40GB (4-bit) |
| **Llama 3.1 8B Instruct** | 8B | Fast/cheap for priority scoring, dictation cleanup | ~6GB (4-bit) |
| **Mistral Small 3** | 24B | Good balance for replies | ~14GB (4-bit) |

**Recommendation:** run a **70B-class** model for `AI_SUMMARY_MODEL` (quality
matters on the email the user is reading) and an **8B** for `AI_MODEL` (priority
scoring, dictation — high volume, latency-sensitive). LiteLLM can route both.

---

## Hardware sizing (rule of thumb)

- **A single RTX A6000 (48GB) or 2×RTX 4090 (48GB total):** runs one 70B at 4-bit
  for ~5–15 concurrent users. Good starting point for a small/mid firm.
- **1×H100 (80GB) or 2×A6000:** comfortable headroom for a 70B at higher
  concurrency, or a 70B + an 8B side-by-side.
- **Mac Studio M-series (128GB+):** viable for a pilot or <10 users; lower
  throughput than NVIDIA but fully private and quiet.
- Plan ~1.2–2 GB VRAM per 1B params at 4-bit; double for fp16.

---

## Stand-up steps (vLLM + LiteLLM, the recommended path)

1. **Provision** the GPU host (on-prem or your VPC).
2. **Serve the model** with vLLM (OpenAI-compatible API on `:8000`):
   `vllm serve meta-llama/Llama-3.3-70B-Instruct --quantization awq --port 8000`
3. **Put LiteLLM in front** to expose the **Anthropic** Messages API and route
   `AI_MODEL`/`AI_SUMMARY_MODEL` to your served models; require an API key.
4. **TLS + firewall:** terminate TLS at LiteLLM (or a reverse proxy); allow only
   the app's egress IP. Keep vLLM bound to localhost.
5. **Point the app:** set `AI_BASE_URL` (LiteLLM URL), `AI_API_KEY`, `AI_MODEL`,
   `AI_SUMMARY_MODEL` in Vercel → redeploy. No code change.
6. **Verify:** open an email → the AI summary panel should populate from your
   model; check the gateway logs to confirm the call hit your endpoint, not
   Anthropic.

---

## Security & compliance (law-firm checklist)

- **Closed loop:** with `AI_BASE_URL` set to your internal endpoint, email bodies
  go only to your model. Confirm the gateway does **no** upstream logging of
  prompts to any third party.
- **Egress control:** the app (Vercel) calls your endpoint over TLS with a key;
  the model host has no inbound internet exposure beyond that.
- **Data retention:** disable prompt/response logging on the gateway, or log
  metadata only. The app already avoids storing raw bodies in AI caches beyond
  the summary text.
- **Tenant isolation:** the model is single-tenant (yours). No shared inference.
- **Respect sensitivity labels:** optionally gate AI on attorney-client-flagged
  mail (the app has sensitivity labels; a follow-up can skip AI for those).
- **Key rotation:** treat `AI_API_KEY` like any secret — rotate on staff change.

---

## Cost sketch (order of magnitude)

- **On-prem 1×A6000 box:** ~$5–8k hardware once + power; no per-token cost.
- **Cloud GPU VM (A6000/H100):** ~$1–4/GPU-hour; a 70B on one A6000 ≈ $700–1.2k/mo
  if always-on (cheaper if you autoscale to business hours).
- **vs. hosted API:** trades per-token cost for fixed infra; private hosting wins
  on confidentiality and at steady volume, hosted wins on zero-ops + burst.

---

## Fallback / hybrid

You can keep Anthropic as a **fallback** by leaving `ANTHROPIC_API_KEY` set and
only overriding `AI_BASE_URL` when the private endpoint is healthy. For strict
closed-loop, do **not** set `ANTHROPIC_API_KEY` in prod once the private model is
live — then there is no path to an external provider.
