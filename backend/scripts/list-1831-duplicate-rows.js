const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const Customer = require("../models/Customer");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const COMPANY_ID = "RESSICHEM";

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function extractManagerEmail(line) {
  const compact = String(line || "")
    .replace(/\s*@\s*/g, "@")
    .replace(/\s*\.\s*/g, ".")
    .replace(/g\s*m\s*a\s*i\s*l/gi, "gmail")
    .replace(/gmail\.c(?:\s+|$)/gi, "gmail.com ")
    .replace(/@digital\.co(?:\s+|$)/gi, "@digital.com ")
    .replace(/@gm(?:\s+|$)/gi, "@gmail.com ")
    .replace(/\s+/g, " ");

  const emails = compact.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
  if (!emails.length) return "";
  return String(emails[emails.length - 1]).toLowerCase();
}

function extractPhone(line) {
  const m =
    line.match(/\b0\d{2,4}-\d{6,8}\b/) ||
    line.match(/\b03\d{9}\b/) ||
    line.match(/\b0\d{10}\b/);
  return m ? m[0] : "";
}

function stripLeadingIndex(line) {
  return line.replace(/^\s*\d+\s+/, "").trim();
}

function buildApproxNameFromLine(line) {
  const withoutIndex = stripLeadingIndex(line);
  const email = extractManagerEmail(withoutIndex);
  const phone = extractPhone(withoutIndex);

  let tmp = withoutIndex;
  if (email) tmp = tmp.replace(email, " ");
  if (phone) tmp = tmp.replace(phone, " ");

  tmp = tmp.replace(
    /\b(SINDH|PUNJAB|KPK|BALOCHISTAN|CAPITAL TERRITORY|AFG|UAE|EXPORT)\b/gi,
    " "
  );

  const pwdMarkerIdx = tmp.search(/\S+@123\b/i);
  if (pwdMarkerIdx > 0) tmp = tmp.slice(0, pwdMarkerIdx);

  return normalizeName(tmp);
}

function parseRows(reportText) {
  const lines = reportText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Fix PDF/export artifacts where row index is split
  const normalizedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const next = lines[i + 1];
    const next2 = lines[i + 2];
    if (
      /^\d{1,3}$/.test(cur) &&
      /^\d$/.test(next || "") &&
      next2 &&
      !/^\d+$/.test(next2)
    ) {
      normalizedLines.push(`${cur}${next} ${next2}`);
      i += 2;
      continue;
    }
    normalizedLines.push(cur);
  }

  // Merge wrapped lines into logical records
  const mergedRows = [];
  let current = "";
  for (const line of normalizedLines) {
    if (
      /^page\s+\d+/i.test(line) ||
      /^customers data/i.test(line) ||
      /^total records:/i.test(line) ||
      /^#\s*name/i.test(line)
    ) {
      continue;
    }
    if (/^\d+\s+/.test(line)) {
      if (current) mergedRows.push(current);
      current = line;
    } else if (current) {
      current += " " + line;
    }
  }
  if (current) mergedRows.push(current);

  const rows = [];
  for (const line of mergedRows) {
    const managerEmail = extractManagerEmail(line);
    if (!managerEmail) continue; // only rows that contain a manager email
    const phone = normalizePhone(extractPhone(line));
    rows.push({
      raw: line,
      managerEmail,
      phone,
      approxName: buildApproxNameFromLine(line),
    });
  }
  return rows;
}

function escRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function shorten(s, max = 90) {
  const str = String(s || "");
  return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}

async function main() {
  const reportPath = process.argv[2] || "reports/customers-report.txt";
  if (!MONGODB_URI) throw new Error("Missing CONNECTION_STRING / MONGODB_URI in .env");

  await mongoose.connect(MONGODB_URI);

  const text = fs.readFileSync(path.join(__dirname, "..", reportPath), "utf8");
  const rows = parseRows(text);
  console.log(`Parsed report rows (manager-bearing): ${rows.length}`);

  const customers = await Customer.find({ company_id: COMPANY_ID }).lean();
  const customerByPhone = new Map();
  const customerByName = new Map();

  for (const c of customers) {
    const p = normalizePhone(c.phone);
    if (p && !customerByPhone.has(p)) customerByPhone.set(p, c);
    const n = normalizeName(c.companyName || c.contactName);
    if (n && !customerByName.has(n)) customerByName.set(n, c);
  }

  // Track mapping occurrences per customer
  const occurrencesByCustomerId = new Map(); // id -> { firstRowIndex, firstPhone, list: [...] }

  let mappedRows = 0;
  let unresolved = 0;

  rows.forEach((row, idx) => {
    const rowIndex1Based = idx + 1;
    let customer = null;
    if (row.phone) customer = customerByPhone.get(row.phone) || null;
    if (!customer && row.approxName) customer = customerByName.get(row.approxName) || null;

    if (!customer) {
      unresolved++;
      return;
    }

    mappedRows++;
    const customerId = String(customer._id);
    if (!occurrencesByCustomerId.has(customerId)) {
      occurrencesByCustomerId.set(customerId, {
        firstRowIndex: rowIndex1Based,
        firstPhone: row.phone || "",
        customer,
        list: [{ rowIndex1Based, row }],
      });
    } else {
      occurrencesByCustomerId.get(customerId).list.push({ rowIndex1Based, row });
    }
  });

  const uniqueMappedCustomers = occurrencesByCustomerId.size;
  const duplicatesRows = mappedRows - uniqueMappedCustomers;

  console.log(`Mapped rows: ${mappedRows}, unresolved: ${unresolved}`);
  console.log(`Unique mapped customers: ${uniqueMappedCustomers}`);
  console.log(`Duplicate rows (mapped but not unique): ${duplicatesRows}`);

  // Print duplicates (all occurrences after the first for each customer)
  let printed = 0;
  const outputLines = [];
  for (const [, occ] of occurrencesByCustomerId) {
    if (occ.list.length <= 1) continue;
    const dupBase = occ.firstRowIndex;
    const customerName = occ.customer.companyName || occ.customer.contactName || "(unknown)";

    for (let i = 1; i < occ.list.length; i++) {
      const dup = occ.list[i];
      printed++;
      const phone = dup.row.phone || "";
      const managerEmail = dup.row.managerEmail || "";
      const approx = dup.row.approxName || "";
      outputLines.push(
        `DupRow#${dup.rowIndex1Based} (dup of Row#${dupBase}) -> Customer="${shorten(customerName, 70)}" | phone=${phone} | managerEmail=${managerEmail} | approxName=${shorten(approx, 60)}`
      );
    }
  }

  // Write full list to a file (so it never truncates in terminal)
  const outPath = path.join(__dirname, "..", "reports", "1831-duplicate-rows.txt");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const header = [
    "1831 duplicate mapped rows list",
    `Company: ${COMPANY_ID}`,
    `Parsed report rows (manager-bearing): ${rows.length}`,
    `Mapped rows: ${mappedRows}`,
    `Unresolved rows: ${unresolved}`,
    `Unique mapped customers: ${uniqueMappedCustomers}`,
    `Duplicate rows (mapped but not unique): ${duplicatesRows}`,
    `Total printed duplicate rows: ${printed}`,
    "",
  ].join("\n");
  fs.writeFileSync(outPath, header + outputLines.join("\n"), "utf8");

  console.log(`Duplicate rows: ${duplicatesRows}, written to: ${outPath}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

