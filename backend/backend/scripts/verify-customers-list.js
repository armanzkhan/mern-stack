/**
 * Verify that customers in the system match the reference list 100%.
 * Compares: (1) parsed reference list count (2) Customer collection for RESSICHEM.
 *
 * Run from backend/backend:
 *   node scripts/verify-customers-list.js
 *
 * Optionally pass a file path to use that file as the list instead of seed BULK_DATA:
 *   node scripts/verify-customers-list.js path/to/list.txt
 */
const path = require("path");
const fs = require("fs");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const mongoose = require("mongoose");
const Customer = require("../models/Customer");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const KNOWN_STATES = /^(SINDH|PUNJAB|KPK|BALOCHISTAN|CAPITAL TERRITORY)$/i;
const MOBILE_RE = /^0?\d{2,4}-\d{6,8}$/;

function parseLine(line) {
  const parts = line.split(/\s{2,}/);
  if (parts.length >= 5) {
    let state = "";
    let mobile = "";
    const stateVal = parts[parts.length - 1];
    if (KNOWN_STATES.test(stateVal)) {
      state = stateVal.toUpperCase();
      parts.pop();
    }
    if (parts.length >= 1 && MOBILE_RE.test(parts[parts.length - 1])) {
      mobile = parts.pop();
    }
    const name = parts[0].trim();
    const password = parts[1].trim();
    const address = parts.slice(2).join(" ").trim();
    return { name, password, address, mobile, state };
  }
  const tokens = line.split(/\s+/);
  if (tokens.length < 3) return null;
  let state = "";
  let mobile = "";
  if (KNOWN_STATES.test(tokens[tokens.length - 1])) {
    state = tokens.pop().toUpperCase();
  }
  if (tokens.length >= 1 && MOBILE_RE.test(tokens[tokens.length - 1])) {
    mobile = tokens.pop();
  }
  const pwdIdx = tokens.findIndex((t) => t.includes("@"));
  if (pwdIdx < 0) return null;
  const name = tokens.slice(0, pwdIdx).join(" ").trim();
  const password = tokens[pwdIdx];
  const address = tokens.slice(pwdIdx + 1).join(" ").trim();
  return { name, password, address, mobile, state };
}

function parseBulkData(text) {
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    const row = parseLine(line);
    if (row && row.name && row.password) rows.push(row);
  }
  return rows;
}

function normalize(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function getBulkDataFromSeed() {
  const seedPath = path.join(__dirname, "seed-customer-users-bulk.js");
  const content = fs.readFileSync(seedPath, "utf8");
  const match = content.match(/const BULK_DATA = `([\s\S]*?)`;/);
  return match ? match[1] : "";
}

async function run() {
  const listPath = process.argv[2];
  const BULK_DATA = listPath && fs.existsSync(listPath)
    ? fs.readFileSync(listPath, "utf8")
    : getBulkDataFromSeed();

  const listRows = parseBulkData(BULK_DATA);
  const countInList = listRows.length;

  if (!MONGODB_URI) {
    console.error("❌ CONNECTION_STRING or MONGODB_URI not set.");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);
  const customers = await Customer.find({ company_id: /^RESSICHEM$/i }).lean();
  const countInSystem = customers.length;

  const listNamesNormalized = new Set(listRows.map((r) => normalize(r.name)));
  const dbByCompany = new Map();
  const dbByContact = new Map();
  for (const c of customers) {
    const nCompany = normalize(c.companyName);
    const nContact = normalize(c.contactName);
    if (nCompany) dbByCompany.set(nCompany, c);
    if (nContact) dbByContact.set(nContact, c);
  }

  let matched = 0;
  const missingFromSystem = [];
  const matchedListNames = new Set();

  for (const row of listRows) {
    const n = normalize(row.name);
    const found = dbByCompany.get(n) || dbByContact.get(n);
    if (found) {
      matched++;
      matchedListNames.add(n);
    } else {
      missingFromSystem.push(row.name);
    }
  }

  const extraInSystem = customers.filter(
    (c) =>
      !matchedListNames.has(normalize(c.companyName)) &&
      !matchedListNames.has(normalize(c.contactName))
  );
  const extraNames = extraInSystem.map((c) => c.companyName || c.contactName);

  const matchPct = countInList ? ((matched / countInList) * 100).toFixed(2) : "0";
  const is100 = matched === countInList && matched === countInSystem && missingFromSystem.length === 0 && extraNames.length === 0;

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("  CUSTOMER LIST vs SYSTEM VERIFICATION (company_id: RESSICHEM)");
  console.log("═══════════════════════════════════════════════════════════\n");
  console.log("  Count in your list:     " + countInList);
  console.log("  Count in system (DB):    " + countInSystem);
  console.log("  Matched (list → DB):    " + matched);
  console.log("  Match %:                " + matchPct + "%");
  console.log("  100% match:             " + (is100 ? "YES" : "NO"));
  console.log("");

  if (missingFromSystem.length > 0) {
    console.log("  Missing from system (" + missingFromSystem.length + "):");
    missingFromSystem.slice(0, 20).forEach((name) => console.log("    - " + name));
    if (missingFromSystem.length > 20) {
      console.log("    ... and " + (missingFromSystem.length - 20) + " more.");
    }
    console.log("");
  }

  if (extraNames.length > 0) {
    console.log("  In system but not in list (" + extraNames.length + "):");
    extraNames.slice(0, 20).forEach((name) => console.log("    - " + name));
    if (extraNames.length > 20) {
      console.log("    ... and " + (extraNames.length - 20) + " more.");
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════════════════════════\n");

  await mongoose.disconnect();
  process.exit(is100 ? 0 : 1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
