/**
 * Fix customer phone numbers using bulk list.
 *
 * Run:
 *   cd Ressichem/backend/backend
 *   node scripts/fix-customer-phones-bulk.js
 */
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const mongoose = require("mongoose");
const Customer = require("../models/Customer");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const COMPANY_ID = "RESSICHEM";

const KNOWN_STATES = /^(SINDH|PUNJAB|KPK|BALOCHISTAN|CAPITAL TERRITORY|AFG|UAE|EXPORT)$/i;

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizePhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function pickPhoneToken(tokens) {
  for (let i = tokens.length - 1; i >= 0; i--) {
    const digits = normalizePhone(tokens[i]);
    if (digits.length >= 10 && digits.length <= 13) {
      return tokens[i];
    }
  }
  return "";
}

/** Parse a line: Name Password Address Mobile State (space-separated or 2+ spaces). */
function parseLine(line) {
  const parts = line.split(/\s{2,}/);
  if (parts.length >= 3) {
    let state = "";
    const stateVal = parts[parts.length - 1];
    if (KNOWN_STATES.test(stateVal)) {
      state = stateVal.toUpperCase();
      parts.pop();
    }
    const name = parts[0].trim();
    const password = parts[1] ? parts[1].trim() : "";
    const tail = parts.slice(2).join(" ").trim();
    const tokens = tail.split(/\s+/);
    const phoneToken = pickPhoneToken(tokens);
    const mobile = phoneToken || "";
    return { name, password, address: tail, mobile, state };
  }

  const tokens = line.split(/\s+/);
  if (tokens.length < 3) return null;
  let state = "";
  if (KNOWN_STATES.test(tokens[tokens.length - 1])) {
    state = tokens.pop().toUpperCase();
  }
  const pwdIdx = tokens.findIndex((t) => t.includes("@"));
  if (pwdIdx < 0) return null;
  const name = tokens.slice(0, pwdIdx).join(" ").trim();
  const password = tokens[pwdIdx];
  const addressTokens = tokens.slice(pwdIdx + 1);
  const phoneToken = pickPhoneToken(addressTokens);
  return { name, password, address: addressTokens.join(" ").trim(), mobile: phoneToken || "", state };
}

function parseBulkData(text) {
  const lines = text.trim().split("\n").map((l) => l.trim()).filter(Boolean);
  const rows = [];
  for (const line of lines) {
    const row = parseLine(line);
    if (row && row.name) rows.push(row);
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
    .select("_id companyName contactName phone")
    .lean();

  const nameMap = new Map();
  for (const customer of customers) {
    const companyKey = normalizeText(customer.companyName);
    if (companyKey) nameMap.set(companyKey, customer);
    const contactKey = normalizeText(customer.contactName);
    if (contactKey) nameMap.set(contactKey, customer);
  }

  const ops = [];
  let matched = 0;
  let updated = 0;
  let unchanged = 0;
  let missing = 0;
  let noPhoneInList = 0;

  for (const row of rows) {
    const nameKey = normalizeText(row.name);
    const customer = nameKey ? nameMap.get(nameKey) : null;
    if (!customer) {
      missing++;
      continue;
    }

    matched++;
    if (!row.mobile) {
      noPhoneInList++;
      continue;
    }

    const currentDigits = normalizePhone(customer.phone);
    const listDigits = normalizePhone(row.mobile);

    if (currentDigits === listDigits) {
      unchanged++;
      continue;
    }

    ops.push({
      updateOne: {
        filter: { _id: customer._id },
        update: { $set: { phone: row.mobile } },
      },
    });
    updated++;
  }

  if (ops.length > 0) {
    const result = await Customer.bulkWrite(ops);
    console.log(`✅ Updated ${result.modifiedCount} customers`);
  }

  console.log("\n📊 SUMMARY");
  console.log("==========");
  console.log(`Total rows in list:         ${rows.length}`);
  console.log(`Matched by name:            ${matched}`);
  console.log(`Updated phones:             ${updated}`);
  console.log(`Unchanged (already exact):  ${unchanged}`);
  console.log(`Missing customers:          ${missing}`);
  console.log(`No phone in list:           ${noPhoneInList}`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Fix failed:", err);
  process.exit(1);
});
