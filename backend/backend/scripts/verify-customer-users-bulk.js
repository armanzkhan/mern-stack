/**
 * Verify bulk customer list exists in DB.
 * Reads BULK_DATA from seed-customer-users-bulk.js and checks Customer records.
 *
 * Run:
 *   cd Ressichem/backend/backend
 *   node scripts/verify-customer-users-bulk.js
 */
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Customer = require("../models/Customer");
const User = require("../models/User");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const COMPANY_ID = "RESSICHEM";

const KNOWN_STATES = /^(SINDH|PUNJAB|KPK|BALOCHISTAN|CAPITAL TERRITORY|AFG|UAE|EXPORT)$/i;
const MOBILE_RE = /^0?\d{2,4}-\d{6,8}$/; // 03XX-XXXXXXX or 021-XXXXXXX

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

/** Parse a line that may be separated by 2+ spaces or single spaces (Name Password Address Mobile State). */
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
  // Single-space separated: state = last if known, mobile = 03XX-XXXXXXX, password = token with @
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

function extractBulkDataFromSeed() {
  const seedPath = path.join(__dirname, "seed-customer-users-bulk.js");
  const seedText = fs.readFileSync(seedPath, "utf8");
  const match = seedText.match(/const\s+BULK_DATA\s*=\s*`([\s\S]*?)`;/);
  if (!match) {
    throw new Error("Could not find BULK_DATA in seed-customer-users-bulk.js");
  }
  return match[1];
}

function slugToEmail(slug, existingEmails) {
  const base =
    slug
      .replace(/[^a-z0-9]/gi, ".")
      .replace(/\.+/g, ".")
      .replace(/^\.|\.$/g, "")
      .toLowerCase()
      .slice(0, 40) || "customer";
  let email = `${base}@ressichem.local`;
  let n = 0;
  while (existingEmails.has(email)) {
    n++;
    email = `${base}.${n}@ressichem.local`;
  }
  existingEmails.add(email);
  return email;
}

async function run() {
  if (!MONGODB_URI) {
    console.error("❌ CONNECTION_STRING or MONGODB_URI not set.");
    process.exit(1);
  }

  const bulkText = extractBulkDataFromSeed();
  const rows = parseBulkData(bulkText);
  console.log(`📋 Parsed ${rows.length} rows from seed data`);

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const customers = await Customer.find({ company_id: COMPANY_ID })
    .select("companyName contactName phone email user_id")
    .lean();

  const userIds = customers
    .map((c) => c.user_id)
    .filter(Boolean);
  const users = await User.find({ _id: { $in: userIds } })
    .select("email password")
    .lean();
  const userMap = new Map(users.map((u) => [String(u._id), u]));

  const phoneMap = new Map();
  const nameMap = new Map();

  for (const customer of customers) {
    const phoneKey = normalizePhone(customer.phone);
    if (phoneKey) {
      const list = phoneMap.get(phoneKey) || [];
      list.push(customer);
      phoneMap.set(phoneKey, list);
    }

    const companyNameKey = normalizeText(customer.companyName);
    if (companyNameKey) {
      const list = nameMap.get(companyNameKey) || [];
      list.push(customer);
      nameMap.set(companyNameKey, list);
    }

    const contactNameKey = normalizeText(customer.contactName);
    if (contactNameKey) {
      const list = nameMap.get(contactNameKey) || [];
      list.push(customer);
      nameMap.set(contactNameKey, list);
    }
  }

  const usedEmails = new Set();
  const results = [];
  let matchedByPhone = 0;
  let matchedByName = 0;
  let missing = 0;
  let missingUserLink = 0;
  let emailMatch = 0;
  let emailMismatch = 0;
  let phoneMatch = 0;
  let phoneMismatch = 0;
  let passwordMatch = 0;
  let passwordMismatch = 0;
  let passwordNotChecked = 0;

  for (const row of rows) {
    const phoneKey = normalizePhone(row.mobile);
    const nameKey = normalizeText(row.name);
    const expectedEmail = slugToEmail(row.password.replace(/@\d+$/, ""), usedEmails);

    let matches = [];
    let matchedBy = "";
    if (phoneKey && phoneMap.has(phoneKey)) {
      matches = phoneMap.get(phoneKey) || [];
      matchedBy = "phone";
      matchedByPhone++;
    } else if (nameKey && nameMap.has(nameKey)) {
      matches = nameMap.get(nameKey) || [];
      matchedBy = "name";
      matchedByName++;
    } else {
      missing++;
    }

    if (matches.length > 0 && matches.every((c) => !c.user_id)) {
      missingUserLink++;
    }

    let hasEmailMatch = false;
    let hasPhoneMatch = false;
    let hasPasswordMatch = false;
    let checkedPassword = false;

    if (matches.length > 0) {
      // Prefer exact phone match, otherwise first match
      const preferredMatch =
        (phoneKey &&
          matches.find((m) => normalizePhone(m.phone) === phoneKey)) ||
        matches[0];

      const matchEmail = String(preferredMatch.email || "").toLowerCase();
      if (matchEmail === expectedEmail.toLowerCase()) {
        hasEmailMatch = true;
      }
      if (phoneKey && normalizePhone(preferredMatch.phone) === phoneKey) {
        hasPhoneMatch = true;
      }
      if (preferredMatch.user_id) {
        const user = userMap.get(String(preferredMatch.user_id));
        if (user && user.password) {
          checkedPassword = true;
          const ok = await bcrypt.compare(row.password, user.password);
          if (ok) {
            hasPasswordMatch = true;
          }
        }
      }
    }

    if (matches.length > 0) {
      if (hasEmailMatch) {
        emailMatch++;
      } else {
        emailMismatch++;
      }
      if (hasPhoneMatch) {
        phoneMatch++;
      } else if (phoneKey) {
        phoneMismatch++;
      }
      if (checkedPassword) {
        if (hasPasswordMatch) {
          passwordMatch++;
        } else {
          passwordMismatch++;
        }
      } else {
        passwordNotChecked++;
      }
    }

    results.push({
      name: row.name,
      mobile: row.mobile || "",
      state: row.state || "",
      expectedEmail,
      matched: matches.length > 0,
      matchedBy,
      matchedCount: matches.length,
      hasUserLink: matches.some((c) => !!c.user_id),
      emailMatchesExpected: hasEmailMatch,
      phoneMatchesExpected: hasPhoneMatch,
      passwordMatchesExpected: checkedPassword ? hasPasswordMatch : null,
      matches: matches.map((c) => ({
        id: c._id,
        companyName: c.companyName,
        contactName: c.contactName,
        phone: c.phone,
        email: c.email,
        user_id: c.user_id || null,
      })),
    });
  }

  const report = {
    totalRows: rows.length,
    totalCustomersInDb: customers.length,
    matchedByPhone,
    matchedByName,
    missing,
    missingUserLink,
    emailMatch,
    emailMismatch,
    phoneMatch,
    phoneMismatch,
    passwordMatch,
    passwordMismatch,
    passwordNotChecked,
    generatedAt: new Date().toISOString(),
    results,
  };

  const reportDir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, "customer-bulk-verification.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log("\n📊 SUMMARY");
  console.log("==========");
  console.log(`Total rows in list:         ${rows.length}`);
  console.log(`Customers in DB:            ${customers.length}`);
  console.log(`Matched by phone:           ${matchedByPhone}`);
  console.log(`Matched by name:            ${matchedByName}`);
  console.log(`Missing customers:          ${missing}`);
  console.log(`Missing user links:         ${missingUserLink}`);
  console.log(`Email matches expected:     ${emailMatch}`);
  console.log(`Email mismatches:           ${emailMismatch}`);
  console.log(`Phone matches expected:     ${phoneMatch}`);
  console.log(`Phone mismatches:           ${phoneMismatch}`);
  console.log(`Password matches:           ${passwordMatch}`);
  console.log(`Password mismatches:        ${passwordMismatch}`);
  console.log(`Password not checked:       ${passwordNotChecked}`);
  console.log(`Report written to:          ${reportPath}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
