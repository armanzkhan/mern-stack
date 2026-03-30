/**
 * Verify that all customers can successfully "log in" (phone + password)
 * and that each matched user has an assigned manager with categories.
 *
 * This is DB-only (no HTTP) and uses the same phone-candidate rules and
 * `bcrypt.compare` logic as `backend/controllers/authController.js`.
 *
 * Usage:
 *   node backend/scripts/verify-all-customers-login-bulk.js
 *   node backend/scripts/verify-all-customers-login-bulk.js ./reports/customers-report.txt
 */
const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Manager = require("../models/Manager");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const COMPANY_ID = "RESSICHEM";

function normalizePhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function normalizeName(value) {
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

function extractPasswordValue(line) {
  // Passwords look like: something@123, but report exports can split it like:
  // - something@1 23
  // - something@12 3
  const m = String(line || "").match(/([^\s@]+)@\s*(?:1\s*23|12\s*3)\b/i);
  if (!m) return "";
  return `${m[1]}@123`;
}

function extractManagerEmail(line) {
  // Same normalization approach as manager assignment script.
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

function stripLeadingIndex(line) {
  return String(line || "").replace(/^\s*\d+\s+/, "").trim();
}

function buildApproxNameFromLine(line) {
  // Used only for debugging/error output.
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

  // Best effort: keep left side before password marker "@123" if present
  const pwdMarkerIdx = tmp.search(/\S+@123\b/i);
  if (pwdMarkerIdx > 0) tmp = tmp.slice(0, pwdMarkerIdx);

  return normalizeName(tmp);
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
    // Skip headers/page labels early
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
    const phoneRaw = extractPhoneRaw(line);
    const passwordValue = extractPasswordValue(line);

    // We still keep rows even if some parts are missing, so we can report parse issues.
    rows.push({
      raw: line,
      phoneRaw,
      phoneDigits: normalizePhoneDigits(phoneRaw),
      passwordValue,
      approxName: buildApproxNameFromLine(line),
      managerEmail: extractManagerEmail(line),
    });
  }

  return rows;
}

function buildPhoneCandidates(loginIdRaw) {
  // Must mirror authController.js
  const loginId = loginIdRaw.includes("@") ? loginIdRaw.toLowerCase() : loginIdRaw;
  const digitsOnly = loginId.replace(/\D/g, "");
  const phoneCandidates = [loginId];
  if (digitsOnly) {
    phoneCandidates.push(digitsOnly);
    if (digitsOnly.startsWith("0") && digitsOnly.length > 1) phoneCandidates.push(digitsOnly.slice(1));
    if (digitsOnly.length >= 10 && !digitsOnly.startsWith("92"))
      phoneCandidates.push("92" + (digitsOnly.startsWith("0") ? digitsOnly.slice(1) : digitsOnly));
    if (digitsOnly.startsWith("92")) phoneCandidates.push("0" + digitsOnly.slice(2));
  }
  return { loginId, phoneCandidates };
}

async function getManagerSnapshot(managerId, cache) {
  const key = String(managerId);
  if (cache.has(key)) return cache.get(key);
  const mgr = await Manager.findById(managerId).select("isActive assignedCategories").lean();
  const snap = {
    exists: !!mgr,
    isActive: !!mgr?.isActive,
    assignedCategoriesCount: Array.isArray(mgr?.assignedCategories) ? mgr.assignedCategories.length : 0,
  };
  cache.set(key, snap);
  return snap;
}

async function main() {
  if (!MONGODB_URI) throw new Error("Missing CONNECTION_STRING / MONGODB_URI in .env");

  const reportPath = process.argv[2] ? path.resolve(process.argv[2]) : path.join(__dirname, "..", "reports", "customers-report.txt");
  if (!fs.existsSync(reportPath)) throw new Error(`Report file not found: ${reportPath}`);

  const reportText = fs.readFileSync(reportPath, "utf8");
  const rows = parseRows(reportText);

  console.log(`Parsed ${rows.length} rows from ${path.basename(reportPath)}`);

  await mongoose.connect(MONGODB_URI);

  const managerCache = new Map();

  let parseIssues = 0;
  let userNotFound = 0;
  let invalidCredentials = 0;
  let assignedManagerMissing = 0;
  let assignedManagerCategoriesMissing = 0;
  let success = 0;

  const failures = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const identifier = row.phoneRaw || row.phoneDigits;
    const passwordValue = row.passwordValue;
    const approxName = row.approxName;

    if (!identifier || !passwordValue) {
      parseIssues++;
      failures.push({
        type: "parse_missing_identifier_or_password",
        index: i + 1,
        approxName,
        phoneRaw: row.phoneRaw,
        passwordValue: row.passwordValue,
      });
      continue;
    }

    const { loginId, phoneCandidates } = buildPhoneCandidates(identifier);

    // Same query shape as authController.
    const phoneQuery = {
      $or: [{ phone: { $in: phoneCandidates } }, { email: loginId }],
    };

    const candidates = await User.find(phoneQuery).lean();
    const candidateCount = candidates.length;

    if (!candidates.length) {
      userNotFound++;
      failures.push({
        type: "user_not_found",
        index: i + 1,
        approxName,
        identifier,
        phoneCandidates,
        candidateCount,
      });
      continue;
    }

    let matched = null;
    for (const u of candidates) {
      // eslint-disable-next-line no-await-in-loop
      if (await bcrypt.compare(passwordValue, u.password)) {
        matched = u;
        break;
      }
    }

    if (!matched) {
      invalidCredentials++;
      failures.push({
        type: "invalid_credentials",
        index: i + 1,
        approxName,
        identifier,
        candidateCount,
      });
      continue;
    }

    // Load fully (still cheap compared to another bcrypt loop).
    const matchedUser = await User.findById(matched._id)
      .select("isCustomer customerProfile")
      .lean();

    const assignedManager = matchedUser?.customerProfile?.assignedManager;
    const managerId = assignedManager?.manager_id;

    if (!matchedUser?.isCustomer || !managerId) {
      assignedManagerMissing++;
      failures.push({
        type: "assigned_manager_missing",
        index: i + 1,
        approxName,
        identifier,
        userId: String(matchedUser?._id || matched._id),
        phoneCandidates,
      });
      continue;
    }

    const mgrSnap = await getManagerSnapshot(managerId, managerCache);
    if (!mgrSnap.exists || !mgrSnap.isActive) {
      assignedManagerCategoriesMissing++;
      failures.push({
        type: "assigned_manager_inactive_or_missing",
        index: i + 1,
        approxName,
        identifier,
        managerId: String(managerId),
      });
      continue;
    }

    if (mgrSnap.assignedCategoriesCount <= 0) {
      assignedManagerCategoriesMissing++;
      failures.push({
        type: "assigned_manager_categories_empty",
        index: i + 1,
        approxName,
        identifier,
        managerId: String(managerId),
        assignedCategoriesCount: mgrSnap.assignedCategoriesCount,
      });
      continue;
    }

    success++;

    if ((i + 1) % 100 === 0) {
      console.log(
        `Progress: ${i + 1}/${rows.length} | success=${success} invalidCred=${invalidCredentials} userNotFound=${userNotFound} parseIssues=${parseIssues}`
      );
    }
  }

  await mongoose.disconnect();

  const reportDir = path.join(__dirname, "..", "reports");
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });
  const outPath = path.join(reportDir, "customer-login-bulk-verification.json");

  const summary = {
    totalRows: rows.length,
    success,
    parseIssues,
    userNotFound,
    invalidCredentials,
    assignedManagerMissing,
    assignedManagerCategoriesMissing,
    failuresCount: failures.length,
    generatedAt: new Date().toISOString(),
    reportPath,
  };

  fs.writeFileSync(outPath, JSON.stringify({ summary, failures }, null, 2));

  console.log("\n========== LOGIN VERIFICATION SUMMARY ==========");
  console.log(summary);
  console.log(`Failures written to: ${outPath}`);
}

main().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});

