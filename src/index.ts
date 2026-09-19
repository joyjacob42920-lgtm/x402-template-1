import express from "express";
import { requireApiKey } from "./auth/apiKey.js";
import { meterUsage } from "./metering/middleware.js";
import { requirePaidCustomer } from "./billing/paidByDefault.js";
import { healthRouter } from "./routes/health.js";
import { demoRouter } from "./routes/demo.js";
import { dashboardRouter } from "./dashboard/router.js";

const app = express();
app.use(express.json());

app.use(healthRouter);
app.use("/v1/dashboard", dashboardRouter);

// Example metered route — wrap your existing handlers the same way.
app.use(
  "/v1",
  requireApiKey,
  requirePaidCustomer,
  meterUsage,
  demoRouter,
);

const port = Number(process.env.PORT || 8080);
app.listen(port, () => {
  console.log(`paid-api-starter listening on :${port}`);
});
