import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const REPORTS_DIR = path.join(process.cwd(), "..", "backend", "reports");
const DUPLICATE_ROWS_REPORT = path.join(REPORTS_DIR, "1831-duplicate-rows.txt");
const UNRESOLVED_REPORT = path.join(REPORTS_DIR, "customer-manager-assignment-unresolved.json");
const CUSTOMERS_REPORT = path.join(REPORTS_DIR, "customers-report.txt");

const parseMetric = (content: string, label: string): number => {
  const regex = new RegExp(`${label}:\\s*(\\d+)`, "i");
  const match = content.match(regex);
  return match ? Number(match[1]) : 0;
};

const normalizePhone = (value: unknown): string =>
  String(value ?? "").replace(/\D/g, "");

const extractPhonesFromContent = (content: string): string[] => {
  const phoneRegex = /\b0\d{2,4}-\d{6,8}\b|\b03\d{9}\b|\b0\d{10}\b/g;
  const phones = new Set<string>();

  for (const line of content.split(/\r?\n/)) {
    const matches = line.match(phoneRegex);
    if (!matches) continue;
    for (const match of matches) {
      const normalized = normalizePhone(match);
      if (normalized) phones.add(normalized);
    }
  }

  return Array.from(phones);
};

export async function GET() {
  try {
    const [duplicateRowsContent, unresolvedRaw, customersReportContent] = await Promise.all([
      fs.readFile(DUPLICATE_ROWS_REPORT, "utf8"),
      fs.readFile(UNRESOLVED_REPORT, "utf8"),
      fs.readFile(CUSTOMERS_REPORT, "utf8"),
    ]);

    const unresolvedJson = JSON.parse(unresolvedRaw);
    const parsedRows = parseMetric(duplicateRowsContent, "Parsed report rows \\(manager-bearing\\)");
    const matchedRows = parseMetric(duplicateRowsContent, "Mapped rows");
    const uniqueMappedCustomers = parseMetric(duplicateRowsContent, "Unique mapped customers");
    const duplicateMappedRows = parseMetric(duplicateRowsContent, "Duplicate rows \\(mapped but not unique\\)");
    const unresolvedRows =
      Number(unresolvedJson?.totals?.unresolvedCustomer || 0) +
      Number(unresolvedJson?.totals?.unresolvedManager || 0);
    const reportPhones = extractPhonesFromContent(customersReportContent);
    const unresolvedPhones = Array.from(
      new Set(
        (Array.isArray(unresolvedJson?.unresolved) ? unresolvedJson.unresolved : [])
          .map((item: any) => normalizePhone(item?.phone))
          .filter(Boolean)
      )
    );

    return NextResponse.json({
      parsedRows,
      matchedRows,
      uniqueMappedCustomers,
      duplicateMappedRows,
      unresolvedRows,
      reportPhones,
      unresolvedPhones,
      generatedAt: unresolvedJson?.generatedAt || null,
    });
  } catch (error: any) {
    console.error("Error reading customer assignment stats:", error);
    return NextResponse.json(
      {
        parsedRows: 0,
        matchedRows: 0,
        uniqueMappedCustomers: 0,
        duplicateMappedRows: 0,
        unresolvedRows: 0,
        reportPhones: [],
        unresolvedPhones: [],
        generatedAt: null,
        error: "Unable to load assignment report stats",
      },
      { status: 200 }
    );
  }
}
