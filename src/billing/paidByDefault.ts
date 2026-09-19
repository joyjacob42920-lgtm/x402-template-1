import type { Request, Response, NextFunction } from "express";

/**
 * Paid-by-default gate: unpaid / missing plan is rejected.
 * Free unlimited is intentionally not the default path.
 */
export async function requirePaidCustomer(req: Request, res: Response, next: NextFunction) {
  const paidByDefault = (process.env.PAID_BY_DEFAULT || "true").toLowerCase() !== "false";
  if (!paidByDefault) {
    next();
    return;
  }
  if (!req.principal || req.principal.plan !== "paid") {
    res.status(402).json({
      error: "payment_required",
      message: "This starter is paid-by-default. Attach a paid customer before calling the API.",
    });
    return;
  }
  next();
}
