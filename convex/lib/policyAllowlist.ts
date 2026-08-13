import { PolicyTopic } from "./policyMeta";

export interface PolicyAllowlistEntry {
  /** GOV.UK path, e.g. `/income-tax-rates`. */
  path: string;
  taxYear: string;
  topic: PolicyTopic;
}

/**
 * UK tax year starting 6 April, labelled `YYYY-YY` (e.g. 2026-27).
 */
export function currentUkTaxYear(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);
  const startYear = month > 4 || (month === 4 && day >= 6) ? year : year - 1;
  return formatTaxYear(startYear);
}

export function previousUkTaxYear(taxYear: string): string {
  return formatTaxYear(Number(taxYear.slice(0, 4)) - 1);
}

function formatTaxYear(startYear: number): string {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

function employerRatesPath(taxYear: string): string {
  const start = taxYear.slice(0, 4);
  const end = `20${taxYear.slice(5)}`;
  return `/guidance/rates-and-thresholds-for-employers-${start}-to-${end}`;
}

/**
 * Official GOV.UK pages for rates and Self Assessment. Rolling pages are
 * tagged with the current tax year; employer threshold guides are year-specific.
 */
export function policyAllowlist(now = new Date()): PolicyAllowlistEntry[] {
  const taxYear = currentUkTaxYear(now);
  const previous = previousUkTaxYear(taxYear);

  return [
    { path: "/income-tax-rates", taxYear, topic: "income-tax" },
    {
      path: "/government/publications/rates-and-allowances-income-tax/income-tax-rates-and-allowances-current-and-past",
      taxYear,
      topic: "income-tax",
    },
    {
      path: "/national-insurance-rates-letters",
      taxYear,
      topic: "national-insurance",
    },
    { path: "/vat-rates", taxYear, topic: "vat" },
    { path: "/tax-on-dividends", taxYear, topic: "dividends" },
    {
      path: "/apply-tax-free-interest-on-savings",
      taxYear,
      topic: "savings",
    },
    { path: "/capital-gains-tax", taxYear, topic: "capital-gains" },
    {
      path: "/self-assessment-tax-returns",
      taxYear,
      topic: "self-assessment",
    },
    {
      path: employerRatesPath(taxYear),
      taxYear,
      topic: "income-tax",
    },
    {
      path: employerRatesPath(previous),
      taxYear: previous,
      topic: "income-tax",
    },
  ];
}
