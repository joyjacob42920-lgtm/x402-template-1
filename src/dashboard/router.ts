import { Router } from "express";

/**
 * Dashboard MVP API (usage + keys + customers).
 * Auth via ADMIN_TOKEN for scaffold; replace with session auth later.
 */
export const dashboardRouter = Router();

function requireAdmin(req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  const token = req.header("x-admin-token");
  if (!token || token !== process.env.ADMIN_TOKEN) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }
  next();
}

dashboardRouter.use(requireAdmin);

dashboardRouter.get("/usage", (_req, res) => {
  res.json({ totals: { calls: 0, customers: 0 }, series: [] });
});

dashboardRouter.get("/keys", (_req, res) => {
  res.json({ keys: [] });
});

dashboardRouter.post("/keys", (req, res) => {
  // Never return real key material in scaffold responses. In a real implementation,
  // you would return the key secret ONCE, and only to authorized admins.
  res.status(201).json({
    key: {
      id: "key_new",
      customerId: req.body?.customerId || null,
      secret: "***redacted***",
    },
  });
});

dashboardRouter.get("/customers", (_req, res) => {
  res.json({ customers: [] });
});

dashboardRouter.post("/customers", (req, res) => {
  res.status(201).json({ customer: { id: "cust_new", name: req.body?.name || "Untitled", plan: "paid" } });
});
