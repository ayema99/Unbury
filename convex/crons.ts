import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.weekly(
  "refresh UK tax policy",
  { dayOfWeek: "sunday", hourUTC: 4, minuteUTC: 0 },
  internal.policyIngest.ingestAllowlist,
  {}
);

export default crons;
