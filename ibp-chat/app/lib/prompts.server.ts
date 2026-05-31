import { readFileSync } from "node:fs";
import { join } from "node:path";

type Waterfall = {
  a_ly: number;
  budget: number;
  ibp_prev: number;
  ibp_current: number;
  vs_budget: number;
  vs_prev: number;
  vs_budget_pct: number;
  vs_prev_pct: number;
  zone_ibp: Record<string, number>;
  zone_budget: Record<string, number>;
  zone_prev: Record<string, number>;
  zone_diffs: Record<string, number>;
};

type Meta = {
  region: string;
  current_cycle: string;
  previous_cycle: string;
  budget: string;
  actuals_ly: string;
  row_count: number;
  zone_count: number;
  country_count: number;
  brand_count: number;
};

type Summary = { meta: Meta; waterfall: Waterfall; zones: Record<string, unknown[]> };

const summary: Summary = JSON.parse(
  readFileSync(join(process.cwd(), "public", "ibp-data-summary.json"), "utf8"),
);

const fmt = (n: number) => n.toFixed(1);

export function buildDataContext(): string {
  const { meta, waterfall: w } = summary;

  const metaTable = [
    "| Field | Value |",
    "|---|---|",
    `| Region | ${meta.region} |`,
    `| Current cycle | ${meta.current_cycle} |`,
    `| Previous cycle | ${meta.previous_cycle} |`,
    `| Budget | ${meta.budget} |`,
    `| Actuals LY | ${meta.actuals_ly} |`,
    `| Rows | ${meta.row_count} |`,
    `| Zones / Countries / Brands | ${meta.zone_count} / ${meta.country_count} / ${meta.brand_count} |`,
  ].join("\n");

  const netSalesTable = [
    "| Measure | EUR M |",
    "|---|---:|",
    `| Actuals LY (${meta.actuals_ly}) | ${fmt(w.a_ly)} |`,
    `| Budget (${meta.budget}) | ${fmt(w.budget)} |`,
    `| IBP previous (${meta.previous_cycle}) | ${fmt(w.ibp_prev)} |`,
    `| IBP current (${meta.current_cycle}) | ${fmt(w.ibp_current)} |`,
    `| vs Budget | ${fmt(w.vs_budget)} (${fmt(w.vs_budget_pct)}%) |`,
    `| vs Previous IBP | ${fmt(w.vs_prev)} (${fmt(w.vs_prev_pct)}%) |`,
  ].join("\n");

  const zoneRows = Object.keys(w.zone_ibp)
    .map((z) => {
      const ibp = w.zone_ibp[z] ?? 0;
      const prev = w.zone_prev[z] ?? 0;
      const bud = w.zone_budget[z] ?? 0;
      const dPrev = w.zone_diffs[z] ?? 0;
      const dBud = ibp - bud;
      return `| ${z} | ${fmt(ibp)} | ${fmt(prev)} | ${fmt(bud)} | ${fmt(dPrev)} | ${fmt(dBud)} |`;
    })
    .join("\n");

  const zoneTable = [
    "| Zone | IBP cur | IBP prev | Budget | vs Prev | vs Budget |",
    "|---|---:|---:|---:|---:|---:|",
    zoneRows,
  ].join("\n");

  return [
    "### Meta",
    metaTable,
    "",
    "### Net Sales overview (EUR M)",
    netSalesTable,
    "",
    "### Zone breakdown (EUR M)",
    zoneTable,
  ].join("\n");
}

export const SYSTEM_PROMPT = [
  "You are an IBP demand-review analyst for Opella AMEA.",
  "Answer only from the data in the CONTEXT block below. If the answer is not in the CONTEXT, say so plainly and ask for the file or cut you need — do not invent numbers, countries, brands, or cycles.",
  "All monetary values are EUR millions, formatted to one decimal (e.g. 12.3).",
  "Structure every substantive answer in three short sections, in this order:",
  "1. **What changed** — the concrete numeric delta (cycle vs cycle, or vs budget) with units.",
  "2. **Why** — the most likely driver, grounded in the CONTEXT (zones, countries, mix). Hedge when the data is thin.",
  "3. **What to validate** — two or three specific checks a planner should run before the Demand Review.",
  "Be concise. Prefer tables for more than three numbers. Never quote the CONTEXT block verbatim.",
].join("\n");
