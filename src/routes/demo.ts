import { Router } from "express";

export const demoRouter = Router();

/** Stand-in for "your existing API" — replace with real handlers. */
demoRouter.get("/echo", (req, res) => {
  res.json({
    ok: true,
    message: "Replace this route with your existing API handlers.",
    query: req.query,
  });
});
