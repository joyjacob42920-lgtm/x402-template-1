import type { Request, Response, NextFunction } from "express";

export type ApiPrincipal = {
  keyId: string;
  customerId: string;
  plan: "paid" | "unpaid";
};

declare global {
  namespace Express {
    interface Request {
      principal?: ApiPrincipal;
    }
  }
}

/** Resolve `Authorization: Bearer <api_key>` into a principal. Stub for scaffold. */
export async function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const header = req.header("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) {
    res.status(401).json({ error: "missing_api_key" });
    return;
  }
  // TODO: look up key in Postgres. Scaffold uses a deterministic stub.
  req.principal = {
    keyId: `key_${token.slice(0, 8) || "dev"}`,
    customerId: "cust_dev",
    plan: "paid",
  };
  next();
}
