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
    const phone = extractPhone(line);
    if (!managerEmail) continue;

    rows.push({
      raw: line,
      managerEmail,
      phone: normalizePhone(phone),
      approxName: buildApproxNameFromLine(line),
    });
  }
  return rows;
}

function escRegex(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const reportPath = process.argv[2] || "reports/customers-report.txt";
  if (!MONGODB_URI) throw new Error("Missing CONNECTION_STRING / MONGODB_URI in .env");

  await mongoose.connect(MONGODB_URI);

  const text = fs.readFileSync(path.join(__dirname, "..", reportPath), "utf8");
  const rows = parseRows(text);

  const customers = await Customer.find({ company_id: COMPANY_ID }).lean();
  const customerByPhone = new Map();
  const customerByName = new Map();
  for (const c of customers) {
    const p = normalizePhone(c.phone);
    if (p) customerByPhone.set(p, c);
    const n = normalizeName(c.companyName || c.contactName);
    if (n && !customerByName.has(n)) customerByName.set(n, c);
  }

  const matchedIds = new Set();
  let matched = 0;
  let unresolvedCustomer = 0;

  for (const row of rows) {
    let customer = null;
    if (row.phone) customer = customerByPhone.get(row.phone) || null;
    if (!customer && row.approxName) customer = customerByName.get(row.approxName) || null;

    if (!customer) {
      unresolvedCustomer++;
      continue;
    }

    matched++;
    matchedIds.add(String(customer._id));
  }

  // These are the 6 explicitly fixed by fix script, in case they weren't matched by report parsing.
  const TARGETS = [
    "AMAN ULLAH SB ( AFG )",
    "JUNAID AHMED CO MANSOOR PAINTS & TILES",
    "SALEEM RAZA CO AHMED IRON STORE & CEMENT DEPO",
    "SHAKARGANJ FOOD PRODUCTS LIMITED",
    "VEL COMMODITIES SINGAPORE PTE LTD",
    "WAQAS MAMDANI ( DIGITAL )",
  ];

  const targetIds = [];
  for (const customerName of TARGETS) {
    const customer = await Customer.findOne({
      company_id: COMPANY_ID,
      $or: [
        { companyName: { $regex: `^${escRegex(customerName)}$`, $options: "i" } },
        { contactName: { $regex: `^${escRegex(customerName)}$`, $options: "i" } },
      ],
    }).lean();
    if (customer) targetIds.push(String(customer._id));
  }

  const allIds = new Set([...matchedIds, ...targetIds]);
  const allCount = allIds.size;

  const fullyAssigned = await Customer.countDocuments({
    company_id: COMPANY_ID,
    _id: { $in: [...allIds] },
    "assignedManager.manager_id": { $exists: true, $ne: null },
    assignedManagers: {
      $elemMatch: {
        manager_id: { $exists: true, $ne: null },
        isActive: true,
      },
    },
  });

  const assignedAny = await Customer.countDocuments({
    company_id: COMPANY_ID,
    _id: { $in: [...allIds] },
    "assignedManager.manager_id": { $exists: true, $ne: null },
  });

  console.log("1831 report assignment check");
  console.log(JSON.stringify({
    reportRowsParsed: rows.length,
    matchedFromReportParsing: matched,
    unresolvedCustomerFromParsing: unresolvedCustomer,
    fixedTargetFoundInDB: targetIds.length,
    uniqueCustomersForReport: allCount,
    assignedAny,
    fullyAssigned,
  }, null, 2));

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

