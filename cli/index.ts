#!/usr/bin/env node
/**
 * Client CLI: auth peek, call, usage.
 * Usage:
 *   npm run cli -- whoami
 *   npm run cli -- call /v1/echo
 *   npm run cli -- usage
 */
const [cmd, ...rest] = process.argv.slice(2);
const base = process.env.API_BASE || "http://localhost:8080";
const key = process.env.API_KEY || "";

async function main() {
  if (!cmd || cmd === "help") {
    console.log("paid-api CLI: whoami | call <path> | usage");
    return;
  }
  if (cmd === "whoami") {
    console.log(JSON.stringify({ apiBase: base, hasKey: Boolean(key) }, null, 2));
    return;
  }
  if (cmd === "call") {
    const path = rest[0] || "/v1/echo";
    const res = await fetch(`${base}${path}`, {
      headers: key ? { authorization: `Bearer ${key}` } : {},
    });
    console.log(res.status, await res.text());
    return;
  }
  if (cmd === "usage") {
    const res = await fetch(`${base}/v1/dashboard/usage`, {
      headers: { "x-admin-token": process.env.ADMIN_TOKEN || "" },
    });
    console.log(res.status, await res.text());
    return;
  }
  console.error(`unknown command: ${cmd}`);
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
