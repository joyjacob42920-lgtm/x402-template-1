import type { Request, Response, NextFunction } from "express";

/**
 * Receive-only Nano (XNO) settlement rail.
 *
 * Encouraged-by-default but additive: the existing `plan === "paid"` gate stays the
 * quick path. When `NANO_MODE=enabled` (and a `NANO_RECEIVE_ACCOUNT` is set), a key
 * that is not `paid` may still be served once it has actually settled a Nano payment.
 * The server never holds a private key: settlement is verified by reading the settled
 * block from the Nano network over a public keyless RPC.
 */

/** Raw attos <-> XNO conversion helpers (1 XNO = 1e30 raw). */
export function rawToXno(raw: string | number | bigint): string {
  const b = BigInt(raw);
  return (Number(b) / 1e30).toFixed(6);
}

export function xnoToRaw(xno: string | number): bigint {
  const s = String(xno);
  // Split integer and fraction to avoid floating-point rounding above 2^53.
  const [intPart = "0", fracPart = ""] = s.split(".");
  const frac = fracPart.padEnd(30, "0").slice(0, 30);
  return BigInt(intPart || "0") * 10n ** 30n + BigInt(frac || "0");
}

/** Opaque result of a single nano settlement check. */
export type NanoProof =
  | { ok: true; confirmed: boolean; amount_xno: string }
  | { ok: false; reason: string };

/**
 * Verify that `blockHash` settled on the Nano network and forwarded at least
 * `minAttos` to `receiveAccount`. Keyless: uses the public RPC node and never
 * signs or spends. Fail-closed: any error, network hiccup or missing block is a
 * rejection, never a pass.
 */
export async function verifySettledBlock(
  receiveAccount: string,
  blockHash: string,
  minAttos: bigint,
  rpcUrl = "https://public.nodes.rai.be/proxyx",
): Promise<NanoProof> {
  // Validate the account first so a malformed caller cannot waste an RPC roundtrip.
  if (!/^nano_[13][13456789abcdefghijkmnopqrstuwxyz]{59}$/.test(receiveAccount)) {
    return { ok: false, reason: "invalid receive account" };
  }
  if (!/^[0-9A-F]{64}$/.test(blockHash)) {
    return { ok: false, reason: "invalid block hash" };
  }
  try {
    const res = await fetch(rpcUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action: "block_info",
        json_block: "true",
        hash: blockHash,
        pending: "true",
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false, reason: `rpc http ${res.status}` };
    const j = (await res.json()) as {
      error?: string;
      amount?: string;
      confirmed?: string;
      account?: string;
    };
    if (j.error) return { ok: false, reason: `rpc error: ${j.error}` };
    if (j.confirmed !== "true") return { ok: false, reason: "block not confirmed" };
    if (j.account && j.account !== receiveAccount) {
      return { ok: false, reason: "block account mismatch" };
    }
    const attos = BigInt(j.amount ?? "0");
    if (attos < minAttos) return { ok: false, reason: "amount below expected" };
    return { ok: true, confirmed: true, amount_xno: rawToXno(attos) };
  } catch (err) {
    return { ok: false, reason: `rpc unreachable: ${(err as Error).message}` };
  }
}

/**
 * Express gate. Route mount: call AFTER requireApiKey. A `paid` principal passes
 * through untouched. An unpaid one must present `x-payment-hash` (+ optional
 * `x-payment-account`) that verifies as a settled Nano deposit to the configured
 * receive account; otherwise it gets a 402 with the exact amount and pay-to address.
 */
export async function requireNanoSettlement(req: Request, res: Response, next: NextFunction) {
  if ((process.env.NANO_MODE || "disabled").toLowerCase() !== "enabled") {
    next();
    return;
  }
  const receiveAccount = process.env.NANO_RECEIVE_ACCOUNT || "";
  if (!receiveAccount) {
    next(new Error("NANO_MODE=enabled requires NANO_RECEIVE_ACCOUNT"));
    return;
  }
  if (req.principal?.plan === "paid") {
    next();
    return;
  }
  const blockHash = req.header("x-payment-hash")?.trim() || "";
  const claimedAccount = req.header("x-payment-account")?.trim() || receiveAccount;
  const minAttos = xnoToRaw(process.env.NANO_MIN_XNO || "0.000000000001");
  const proof = await verifySettledBlock(claimedAccount, blockHash, minAttos);
  if (!proof.ok) {
    res.status(402).json({
      error: "payment_required",
      message: "This starter accepts self-custodied Nano (XNO). Settle a payment and retry.",
      pay_to: receiveAccount,
      amount_xno: process.env.NANO_MIN_XNO || "0.000000000001",
      verify_error: proof.reason,
    });
    return;
  }
  // Real settled block: treat as a paid caller for this request.
  res.locals.principal = (req.principal && { ...req.principal, plan: "paid" }) || {
    keyId: "nano",
    customerId: "nano_paid",
    plan: "paid",
  };
  req.principal = res.locals.principal;
  next();
}
