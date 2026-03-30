/**
 * Assign existing customers to managers using a "Customers Data Report" text export.
 *
 * Expected report format (from your pasted sheet):
 * # Name Password Address Mobile State Managers|Sale Person
 * 1 COMPANY ... 0300-0000000 SINDH manager@email.com
 *
 * Usage:
 *   node scripts/assign-customer-managers-from-report.js "C:\\path\\customers-report.txt"
 *
 * Optional:
 *   node scripts/assign-customer-managers-from-report.js "C:\\path\\customers-report.txt" --company RESSICHEM --dry-run
 */
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const Customer = require("../models/Customer");
const Manager = require("../models/Manager");
const User = require("../models/User");

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;

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
  // Normalize common copy/paste splits from PDF/text exports.
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
  // The manager email is usually at the end of the row.
  const candidate = String(emails[emails.length - 1]).toLowerCase();
  return candidate;
}

function extractPhone(line) {
  // Prefer common Pakistani formats: 03xx-xxxxxxx / 03xxxxxxxxx / 0xxx-xxxxxxx
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

  // Remove obvious state tokens at end
  tmp = tmp.replace(
    /\b(SINDH|PUNJAB|KPK|BALOCHISTAN|CAPITAL TERRITORY|AFG|UAE|EXPORT)\b/gi,
    " "
  );

  // Best effort: keep left side before password marker "@123" if present
  const pwdMarkerIdx = tmp.search(/\S+@123\b/i);
  if (pwdMarkerIdx > 0) {
    tmp = tmp.slice(0, pwdMarkerIdx);
  }

  return normalizeName(tmp);
}

function parseRows(reportText) {
  const lines = reportText
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

async function buildManagerLookup(companyId) {
  const managers = await Manager.find({ company_id: companyId, isActive: true }).lean();
  const managerUserIds = managers.map((m) => m.user_id).filter(Boolean);
  const managerUsers = await User.find({
    company_id: companyId,
    user_id: { $in: managerUserIds },
  })
    .select("_id user_id email")
    .lean();

  const userByUserId = new Map(managerUsers.map((u) => [u.user_id, u]));
  const lookup = new Map();

  for (const manager of managers) {
    const u = userByUserId.get(manager.user_id);
    if (!u || !u.email) continue;
    lookup.set(String(u.email).toLowerCase(), { manager, user: u });
  }
  return lookup;
}

async function assign(reportPath, companyId, dryRun) {
  if (!MONGODB_URI) {
    throw new Error("Missing CONNECTION_STRING / MONGODB_URI in .env");
  }
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Report file not found: ${reportPath}`);
  }

  const text = fs.readFileSync(reportPath, "utf8");
  const rows = parseRows(text);
  if (!rows.length) {
    throw new Error("No data rows parsed from report file.");
  }

  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");
  console.log(`Parsed rows: ${rows.length}`);

  const managerLookup = await buildManagerLookup(companyId);
  if (!managerLookup.size) {
    throw new Error(`No active managers found in company ${companyId}`);
  }

  const customers = await Customer.find({ company_id: companyId }).lean();
  // Important: phone numbers are NOT unique in your dataset.
  // So we must keep an array of customers per phone and disambiguate using name when needed.
  const customerByPhone = new Map(); // phone -> Customer[]
  const customerByName = new Map(); // normalizedName -> Customer (first match)

  for (const c of customers) {
    const p = normalizePhone(c.phone);
    if (p) {
      const arr = customerByPhone.get(p) || [];
      arr.push(c);
      customerByPhone.set(p, arr);
    }
    const n = normalizeName(c.companyName || c.contactName);
    if (n && !customerByName.has(n)) customerByName.set(n, c);
  }

  function getCustomerMatchScore(customer, approxName, rawLine) {
    const a = approxName ? normalizeName(approxName) : "";
    const raw = rawLine ? normalizeName(rawLine) : "";

    const cCompany = normalizeName(customer.companyName || "");
    const cContact = normalizeName(customer.contactName || "");
    const cAny = cCompany || cContact;

    // Best signal: is the candidate's stored name actually present in the raw report row?
    if (raw && cAny && raw.includes(cAny)) return 100;

    if (!a) return 0;
    if (cCompany === a || cContact === a) return 100;
    if (cCompany && cCompany.includes(a)) return 80;
    if (cContact && cContact.includes(a)) return 80;
    if (a && (a.includes(cCompany) || a.includes(cContact))) return 70;
    return 0;
  }

  let matched = 0;
  let updated = 0;
  let unresolvedManager = 0;
  let unresolvedCustomer = 0;
  let ambiguousPhoneMatch = 0;
  const unresolved = [];
  const customerOps = [];
  const userOps = [];

  for (const row of rows) {
    const managerEntry = managerLookup.get(row.managerEmail);
    if (!managerEntry) {
      unresolvedManager++;
      unresolved.push({
        type: "manager_not_found",
        managerEmail: row.managerEmail,
        row: row.raw,
      });
      continue;
    }

    let customer = null;

    // 1) Prefer exact-match disambiguation when multiple customers share the same phone.
    if (row.phone) {
      const candidates = customerByPhone.get(row.phone) || [];
      if (candidates.length === 1) {
        customer = candidates[0];
      } else if (candidates.length > 1) {
        // Try to match using the candidate's stored name found inside the raw report row.
        const scored = candidates
          .map((c) => ({ c, score: getCustomerMatchScore(c, row.approxName, row.raw) }))
          .sort((a, b) => b.score - a.score);

        if (scored[0]?.score >= 70) {
          customer = scored[0].c;
        } else {
          ambiguousPhoneMatch++;
        }
      }
    }

    // 2) Fallback to name lookup if phone didn't resolve (or wasn't present).
    if (!customer && row.approxName) customer = customerByName.get(row.approxName) || null;

    if (!customer) {
      unresolvedCustomer++;
      unresolved.push({
        type: "customer_not_found",
        managerEmail: row.managerEmail,
        phone: row.phone,
        approxName: row.approxName,
        row: row.raw,
      });
      continue;
    }

    matched++;
    const managerId = managerEntry.manager._id;
    const assignedBy = managerEntry.user._id;
    const assignedAt = new Date();

    if (!dryRun) {
      customerOps.push({
        updateOne: {
          filter: { _id: customer._id },
          update: {
            $set: {
              assignedManager: {
                manager_id: managerId,
                assignedBy,
                assignedAt,
                isActive: true,
                notes: "Assigned from Customers Data Report import",
              },
              assignedManagers: [
                {
                  manager_id: managerId,
                  assignedBy,
                  assignedAt,
                  isActive: true,
                  notes: "Assigned from Customers Data Report import",
                },
              ],
            },
          },
        },
      });

      userOps.push({
        updateOne: {
          filter: {
            company_id: companyId,
            "customerProfile.customer_id": customer._id,
          },
          update: {
            $set: {
              "customerProfile.assignedManager": {
                manager_id: managerId,
                assignedBy,
                assignedAt,
                isActive: true,
              },
            },
          },
        },
      });
    }
  }

  if (!dryRun && customerOps.length) {
    const chunkSize = 500;
    for (let i = 0; i < customerOps.length; i += chunkSize) {
      const customerChunk = customerOps.slice(i, i + chunkSize);
      const userChunk = userOps.slice(i, i + chunkSize);
      await Customer.bulkWrite(customerChunk, { ordered: false });
      if (userChunk.length) {
        await User.bulkWrite(userChunk, { ordered: false });
      }
      updated += customerChunk.length;
      console.log(`Processed ${updated}/${customerOps.length} matched assignments...`);
    }
  }

  console.log("\n==== Assignment Summary ====");
  console.log(`Company: ${companyId}`);
  console.log(`Rows parsed: ${rows.length}`);
  console.log(`Rows matched: ${matched}`);
  console.log(`Customers updated: ${dryRun ? 0 : updated}`);
  console.log(`Managers not found: ${unresolvedManager}`);
  console.log(`Customers not found: ${unresolvedCustomer}`);
  console.log(`Ambiguous phone matches: ${ambiguousPhoneMatch}`);
  console.log(`Mode: ${dryRun ? "DRY RUN" : "WRITE"}`);

  if (unresolved.length) {
    const report = {
      generatedAt: new Date().toISOString(),
      companyId,
      dryRun,
      totals: {
        rows: rows.length,
        matched,
        updated: dryRun ? 0 : updated,
        unresolvedManager,
        unresolvedCustomer,
      },
      unresolved,
    };

    const outPath = path.join(__dirname, "..", "reports", "customer-manager-assignment-unresolved.json");
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`Unresolved report written: ${outPath}`);
  }

  await mongoose.disconnect();
  console.log("Disconnected");
}

async function main() {
  const reportPath = process.argv[2];
  if (!reportPath) {
    console.error("Usage: node scripts/assign-customer-managers-from-report.js <report-file-path> [--company RESSICHEM] [--dry-run]");
    process.exit(1);
  }

  const companyArgIdx = process.argv.indexOf("--company");
  const companyId =
    companyArgIdx > -1 && process.argv[companyArgIdx + 1]
      ? process.argv[companyArgIdx + 1]
      : "RESSICHEM";
  const dryRun = process.argv.includes("--dry-run");

  await assign(reportPath, companyId, dryRun);
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

