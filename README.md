# x402-template-1

Also known as **paid-api-starter** (Template #1).

**Template #1** — TypeScript, paid-by-default API starter for developers who want to add pay-per-call metering to an existing API.

## What you get
- API-key auth + **paid-by-default** gate (402 unless the customer is on a paid plan)
- Usage metering middleware (per call / key / customer)
- Client CLI (`whoami`, `call`, `usage`)
- `docker-compose` (API + Postgres)
- Dashboard MVP APIs: **usage**, **keys**, **customers**
- ~10-minute deploy notes in `docs/deploy-10-min.md`
- MIT license

## Quick start
```bash
cp .env.example .env
docker compose up --build
curl -s localhost:8080/healthz
```

Create a customer and key (admin token from `.env`):
```bash
curl -s -X POST localhost:8080/v1/dashboard/customers \
  -H "x-admin-token: $ADMIN_TOKEN" -H 'content-type: application/json' \
  -d '{"name":"Acme"}'

curl -s -X POST localhost:8080/v1/dashboard/keys \
  -H "x-admin-token: $ADMIN_TOKEN" -H 'content-type: application/json' \
  -d '{"customerId":"cust_new"}'
```

Call a metered route:
```bash
API_KEY=<your_api_key_here> npm run cli -- call /v1/echo
```

## Fit your existing API
Keep your handlers. Wrap them with:
1. `requireApiKey`
2. `requirePaidCustomer`
3. `meterUsage`

See `src/index.ts` for the mount pattern.

## Scope
See `SCOPE.md` for locked decisions and out-of-scope items.

## Status
Scaffold only. Persistence and real key lookup are TODO stubs. Public MIT under Joy’s GitHub account.

## Nano (XNO) settlement rail (receive-only)

This fork adds an optional, self-custodied Nano settlement rail to the paid-by-default
gate. Enable it with env vars — the existing plan-flag path is untouched when off:

```
NANO_MODE=enabled
NANO_RECEIVE_ACCOUNT=nano_...   # the payout account you receive on
NANO_MIN_XNO=0.000000000001     # minimum settlement per call
```

When enabled, a request whose key is not `paid` must present a settled Nano block
(`x-payment-hash` header) that the server verifies over a public keyless RPC
(`src/nano/verify.ts`) before it serves the call. The server never holds a private key;
settlement is the verification. Fail-closed: an unconfirmed, mismatched or missing block
is a 402.

- `npm run build` — compiles.
- `npm test` — network-free tests: raw<->XNO exact conversion + fail-closed validation.
