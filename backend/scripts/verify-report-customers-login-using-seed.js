/**
 * Verify customers from `customers-report.txt` can "log in" using the
 * *canonical* plaintext passwords from `seed-customer-users-bulk.js` (BULK_DATA),
 * then ensure they have an assigned manager with non-empty assignedCategories.
 *
 * This avoids false negatives caused by report-text parsing errors.
 *
 * Usage:
 *   node backend/scripts/verify-report-customers-login-using-seed.js ./backend/reports/customers-report.txt
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const User = require("../models/User");
const Manager = require("../models/Manager");
const Customer = require("../models/Customer");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const COMPANY_ID = "RESSICHEM";

function normalizePhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function extractPhoneRaw(line) {
  const m =
    line.match(/\b0\d{2,4}-\d{6,8}\b/) || // 0333-5305004
    line.match(/\b03\d{9}\b/) || // 03335305004
    line.match(/\b0\d{10}\b/); // 03005505004
  return m ? m[0] : "";
}

function stripLeadingIndex(line) {
  return String(line || "").replace(/^\s*\d+\s+/, "").trim();
}

function extractManagerEmail(line) {
  const compact = String(line || "")
    .replace(/\s*@\s*/g, "@")
    .replace(/\s*\.\s*/g, ".")
    .replace(/g\s*m\s*a\s*i\s*l/gi, "gmail")
    .replace(/gmail\.c(?:\s+|$)/gi, "gmail.com ")
    .replace(/@gm(?:\s+|$)/gi, "@gmail.com ")
    .replace(/@digital\.co(?:\s+|$)/gi, "@digital.com ")
    .replace(/\s+/g, " ");

  const emails = compact.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || [];
  if (!emails.length) return "";
  return String(emails[emails.length - 1]).toLowerCase();
}

function buildApproxNameFromLine(line) {
  // Used for disambiguation only.
  const withoutIndex = stripLeadingIndex(line);
  const email = extractManagerEmail(withoutIndex);
  const phone = extractPhoneRaw(withoutIndex);

  let tmp = withoutIndex;
  if (email) tmp = tmp.replace(email, " ");
  if (phone) tmp = tmp.replace(phone, " ");

  // Remove common state tokens at end
  tmp = tmp.replace(
    /\b(SINDH|PUNJAB|KPK|BALOCHISTAN|CAPITAL TERRITORY|AFG|UAE|EXPORT|SINGAPORE)\b/gi,
    " "
  );

  return normalizeText(tmp);
}

function parseRows(reportText) {
  const lines = String(reportText || "")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // Fix PDF/export artifacts where row index is split:
  // e.g. "100" on one line and "1" on next line => "1001 <data...>"
  const normalizedLines = [];
  for (let i = 0; i < lines.length; i++) {
    const cur = lines[i];
    const next = lines[i + 1];
    const next2 = lines[i + 2];

    if (/^\d{1,3}$/.test(cur) && /^\d$/.test(next || "") && next2 && !/^\d+$/.test(next2)) {
      normalizedLines.push(`${cur}${next} ${next2}`);
      i += 2;
      continue;
    }
    normalizedLines.push(cur);
  }

  // Merge wrapped lines so one logical record is parsed together.
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

  return mergedRows.map((line) => {
    const phoneRaw = extractPhoneRaw(line);
    return {
      raw: line,
      phoneRaw,
      phoneDigits: normalizePhoneDigits(phoneRaw),
      approxName: buildApproxNameFromLine(line),
      managerEmail: extractManagerEmail(line),
    };
  });
}

function extractBulkDataFromSeed() {
  const seedPath = path.join(__dirname, "seed-customer-users-bulk.js");
  const seedText = fs.readFileSync(seedPath, "utf8");
  const match = seedText.match(/const\s+BULK_DATA\s*=\s*`([\s\S]*?)`;/);
  if (!match) throw new Error("Could not find BULK_DATA in seed-customer-users-bulk.js");
  return match[1];
}

// Same parse approach as verify-customer-users-bulk.js
const KNOWN_STATES = /^(SINDH|PUNJAB|KPK|BALOCHISTAN|CAPITAL TERRITORY|AFG|UAE|EXPORT)$/i;
const MOBILE_RE = /^0?\d{2,4}-\d{6,8}$/;

function parseSeedLine(line) {
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

  // Single-space separated
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
  const lines = String(text || "")
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const rows = [];
  for (const line of lines) {
    const row = parseSeedLine(line);
    if (row && row.name && row.password) rows.push(row);
  }
  return rows;
}

function buildPhoneCandidates(loginIdRaw) {
  // Mirror authController.js *including dashed variants*.
  const loginId = loginIdRaw.includes("@") ? loginIdRaw.toLowerCase() : loginIdRaw;
  const digitsOnly = loginIdRaw.replace(/\D/g, "");
  const phoneCandidates = [loginId];

  const add = (v) => {
    if (v && typeof v === "string") phoneCandidates.push(v);
  };
  const addDashedVariants = (digits) => {
    if (!digits || typeof digits !== "string") return;
    if (/^0\d{10}$/.test(digits)) add(`${digits.slice(0, 4)}-${digits.slice(4)}`);
    if (/^\d{10}$/.test(digits)) add(`${digits.slice(0, 3)}-${digits.slice(3)}`);
  };

  if (digitsOnly) {
    add(digitsOnly);
    addDashedVariants(digitsOnly);

    if (digitsOnly.startsWith("0") && digitsOnly.length > 1) {
      const withoutLeading0 = digitsOnly.slice(1);
      add(withoutLeading0);
      addDashedVariants(withoutLeading0);
    }

    if (digitsOnly.length >= 10 && !digitsOnly.startsWith("92")) {
      const to92 = "92" + (digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly);
      add(to92);
    }

    if (digitsOnly.startsWith("92")) {
      const to0 = "0" + digitsOnly.slice(2);
      add(to0);
      addDashedVariants(to0);
    }
  }

  return { loginId, phoneCandidatesUnique: Array.from(new Set(phoneCandidates)) };
}

async function main() {
  if (!MONGODB_URI) throw new Error("Missing CONNECTION_STRING / MONGODB_URI in .env");

  const reportPath = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(__dirname, "..", "reports", "customers-report.txt");
  if (!fs.existsSync(reportPath)) throw new Error(`Report file not found: ${reportPath}`);

  const reportText = fs.readFileSync(reportPath, "utf8");
  const rows = parseRows(reportText);
  console.log(`Parsed ${rows.length} rows from ${path.basename(reportPath)}`);

  // Build seed map: phoneDigits -> seed rows with expected plaintext password.
  const bulkText = extractBulkDataFromSeed();
  const seedRows = parseBulkData(bulkText);
  const seedByPhone = new Map(); // phoneDigits -> [{nameKey,password}]
  for (const r of seedRows) {
    const phoneDigits = normalizePhoneDigits(r.mobile);
    if (!phoneDigits) continue;
    const nameKey = normalizeText(r.name);
    const list = seedByPhone.get(phoneDigits) || [];
    list.push({ nameKey, password: r.password });
    seedByPhone.set(phoneDigits, list);
  }

  await mongoose.connect(MONGODB_URI);

  const managerCache = new Map();
  const getManagerCategoriesCount = async (managerId) => {
    const key = String(managerId);
    if (managerCache.has(key)) return managerCache.get(key);
    const mgr = await Manager.findById(managerId).select("assignedCategories isActive").lean();
    const count = Array.isArray(mgr?.assignedCategories) ? mgr.assignedCategories.length : 0;
    const snap = { exists: !!mgr, isActive: !!mgr?.isActive, count };
    managerCache.set(key, snap);
    return snap;
  };

  let parseIssues = 0;
  let seedNotFound = 0;
  let userNotFound = 0;
  let invalidCredentials = 0;
  let assignedManagerMissing = 0;
  let assignedManagerCategoriesMissing = 0;
  let success = 0;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const identifier = row.phoneRaw || row.phoneDigits;
    if (!identifier || !row.phoneDigits) {
      parseIssues++;
      continue;
    }

    const { phoneCandidatesUnique, loginId } = buildPhoneCandidates(identifier);

    // Resolve expected password from seed data.
    const seedCandidates = seedByPhone.get(row.phoneDigits) || [];
    if (!seedCandidates.length) {
      seedNotFound++;
      continue;
    }

    // Disambiguate by name if possible (only when multiple seed rows share same phone).
    const approxKey = normalizeText(row.approxName);
    let expectedPassword = null;
    if (seedCandidates.length === 1) {
      expectedPassword = seedCandidates[0].password;
    } else {
      // Soft matching: approxKey should appear within one candidate nameKey.
      const scored = seedCandidates.map((c) => ({
        c,
        score:
          (c.nameKey && approxKey && c.nameKey.includes(approxKey) ? 100 : 0) +
          (approxKey && c.nameKey && approxKey.includes(c.nameKey) ? 100 : 0) +
          (approxKey && c.nameKey && (c.nameKey.includes(approxKey.split(" ")[0]) || approxKey.split(" ")[0] && approxKey.split(" ")[0].length >= 3) ? 30 : 0),
      }));
      scored.sort((a, b) => b.score - a.score);
      expectedPassword = scored[0]?.c?.password || seedCandidates[0]?.password;
    }

    if (!expectedPassword) {
      seedNotFound++;
      continue;
    }

    const phoneQuery = {
      $or: [{ phone: { $in: phoneCandidatesUnique } }, { email: loginId }],
    };

    const candidates = await User.find(phoneQuery).lean();
    if (!candidates.length) {
      userNotFound++;
      continue;
    }

    let matched = null;
    for (const u of candidates) {
      if (await bcrypt.compare(expectedPassword, u.password)) {
        matched = u;
        break;
      }
    }

    if (!matched) {
      invalidCredentials++;
      continue;
    }

    // Customer.user_id is a Mongo ObjectId referencing User._id.
    const customerResolved = await Customer.findOne({
      company_id: COMPANY_ID,
      user_id: matched._id,
    })
      .select("assignedManager assignedManagers")
      .lean();

    const assignedManagerId =
      customerResolved?.assignedManager?.manager_id ||
      (Array.isArray(customerResolved?.assignedManagers)
        ? customerResolved.assignedManagers.find((am) => am?.isActive !== false)?.manager_id
        : null);

    if (!assignedManagerId) {
      assignedManagerMissing++;
      continue;
    }

    const mgrSnap = await getManagerCategoriesCount(assignedManagerId);
    if (mgrSnap.count <= 0) {
      assignedManagerCategoriesMissing++;
      continue;
    }

    success++;

    if ((i + 1) % 100 === 0) {
      console.log(
        `Progress: ${i + 1}/${rows.length} | success=${success} invalidCred=${invalidCredentials} userNotFound=${userNotFound} parseIssues=${parseIssues} seedNotFound=${seedNotFound}`
      );
    }
  }

  console.log("\n========== SEED-BASED LOGIN VERIFICATION SUMMARY ==========");
  console.log(
    JSON.stringify(
      {
        totalRows: rows.length,
        success,
        parseIssues,
        seedNotFound,
        userNotFound,
        invalidCredentials,
        assignedManagerMissing,
        assignedManagerCategoriesMissing,
        failuresCount:
          parseIssues +
          seedNotFound +
          userNotFound +
          invalidCredentials +
          assignedManagerMissing +
          assignedManagerCategoriesMissing,
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Failed:", err);
  process.exit(1);
});

