# Template #1 — Locked scope (2026-09-19)

Locked from My Afents decisions (Betty → Merry/CoS).

## Product
Paid-by-default TypeScript API starter for developers adding pay-per-call metering to an existing API.

## Decisions (locked)
1. **Language:** TypeScript
2. **Starter shape:** paid-by-default API with usage metering, client CLI, docker-compose, and 10-minute deploy docs
3. **First job-to-be-done:** a developer adding pay-per-call to an existing API
4. **License / visibility:** MIT, public GitHub
5. **Dashboard MVP:** usage + API keys + customers (no billing portal polish in v1)

## In scope (v1)
- Express (or Fastify) HTTP API with API-key auth
- Usage metering middleware (per-call, per-key, per-customer)
- Paid-by-default: keys start requiring a paid plan / credit; free unlimited is not the default path
- Client CLI for auth, call, and usage peek
- `docker-compose` for local API + Postgres (metering store)
- Docs: get running in ~10 minutes
- Dashboard MVP pages/API: usage summary, key CRUD, customer list
- MIT `LICENSE`, public repo README

## Out of scope (v1)
- Full Stripe Checkout / Customer Portal UI (stub webhook hooks only)
- Multi-region, SSO, teams RBAC beyond owner/customer
- Mobile apps, GraphQL, gRPC
- Non-TypeScript ports

## GitHub push target
Needs confirmation. Connected Grok Bot GitHub login is `roeiyakobi-afk` (0 public repos; no org membership visible from this connector). Do **not** create/publish until Roei/Joy confirm account or org. If none is usable, flag for Roei access.

## Next build step
Scaffold lives in this folder. Merry (coding agent) implements against this locked scope once push target is confirmed.
