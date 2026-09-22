import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { rawToXno, xnoToRaw, verifySettledBlock } from "./verify.js";

describe("raw <-> XNO conversion", () => {
  it("converts 1 XNO to raw and back", () => {
    const raw = xnoToRaw("1");
    assert.equal(raw, 10n ** 30n);
    assert.equal(rawToXno(raw), "1.000000");
  });

  it("converts 0.000001 XNO", () => {
    const raw = xnoToRaw("0.000001");
    assert.equal(raw, 10n ** 24n);
    assert.equal(rawToXno(raw), "0.000001");
  });

  it("handles string input for rawToXno", () => {
    assert.equal(rawToXno("1000000000000000000000000"), "0.000001");
  });
});

describe("verifySettledBlock — validation only (no rpc)", () => {
  it("rejects invalid account (fail-closed)", async () => {
    const r = await verifySettledBlock("not-an-address", "AA", 0n);
    assert.equal(r.ok, false);
    assert.ok(r.reason.includes("invalid receive account"));
  });

  it("rejects invalid block hash", async () => {
    const r = await verifySettledBlock(
      "nano_1f46rmbp1sajaqtq3qoyspt16ty87ob44n3hkqz3bsain1js63js1ehc7jxx",
      "not-a-hex-hash",
      0n,
    );
    assert.equal(r.ok, false);
    assert.ok(r.reason.includes("invalid block hash"));
  });

  it("rejects unreachable rpc gracefully (fail-closed)", async () => {
    const r = await verifySettledBlock(
      "nano_1f46rmbp1sajaqtq3qoyspt16ty87ob44n3hkqz3bsain1js63js1ehc7jxx",
      "A".repeat(64),
      0n,
      "http://localhost:1",
    );
    assert.equal(r.ok, false);
    assert.ok(r.reason.startsWith("rpc unreachable"));
  });
});
