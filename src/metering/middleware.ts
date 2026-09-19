import type { Request, Response, NextFunction } from "express";

/** Record one billable call after a successful response. Stub writes to stdout. */
export async function meterUsage(req: Request, res: Response, next: NextFunction) {
  const started = Date.now();
  res.on("finish", () => {
    if (!req.principal) return;
    if (res.statusCode >= 500) return;
    const event = {
      keyId: req.principal.keyId,
      customerId: req.principal.customerId,
      path: req.path,
      method: req.method,
      status: res.statusCode,
      ms: Date.now() - started,
    };
    // TODO: INSERT into usage_events
    console.log(JSON.stringify({ type: "usage", ...event }));
  });
  next();
}
