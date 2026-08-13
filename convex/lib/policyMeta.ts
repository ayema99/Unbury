import { Infer, v } from "convex/values";

/** Origin of a policy page. Only official UK sources. */
export const policySourceKind = v.union(
  v.literal("gov.uk"),
  v.literal("legislation.gov.uk"),
  v.literal("hmrc-manual")
);

/** Primary topic used to filter retrieval for a tax document. */
export const policyTopic = v.union(
  v.literal("income-tax"),
  v.literal("national-insurance"),
  v.literal("capital-gains"),
  v.literal("vat"),
  v.literal("isa"),
  v.literal("pensions"),
  v.literal("self-assessment"),
  v.literal("dividends"),
  v.literal("savings"),
  v.literal("corporation-tax"),
  v.literal("other")
);

export const policyStatus = v.union(
  v.literal("pending"),
  v.literal("processing"),
  v.literal("ready"),
  v.literal("failed")
);

/** UK tax year label, e.g. "2025-26" (6 April–5 April). */
export const policyTaxYear = v.string();

export type PolicySourceKind = Infer<typeof policySourceKind>;
export type PolicyTopic = Infer<typeof policyTopic>;
export type PolicyStatus = Infer<typeof policyStatus>;
