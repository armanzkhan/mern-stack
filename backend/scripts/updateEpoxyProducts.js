// backend/scripts/updateEpoxyProducts.js
// Updates name, SKU, and price for "Epoxy Floorings & Coatings" from the approved price list.
// Run: node backend/scripts/updateEpoxyProducts.js
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const MAIN = "Epoxy Floorings & Coatings";
/** Override with env if your DB uses a different tenant id. */
const COMPANY_ID = process.env.COMPANY_ID || process.env.PRODUCT_BULK_COMPANY_ID || "RESSICHEM";

/** Previous catalog keys as stored in MongoDB: `${name} - ${sku} KG` (many DBs use KG, not LTR). */
const LEGACY_FULL_NAMES = [
  "Ressi EPO Crack Fill - 2.16 KG",
  "Ressi EPO Crack Fill - 21.6 KG",
  "Ressi EPO Crack Fill LV - 2.18 KG",
  "Ressi EPO Crack Fill LV - 21.8 KG",
  "Ressi EPO Crack Fill WR - 2.18 KG",
  "Ressi EPO Crack Fill WR - 21.8 KG",
  "Ressi EPO Crack Fill CR - 2.15 KG",
  "Ressi EPO Crack Fill CR - 21.5 KG",
  "Ressi EPO Primer - 1.6 KG",
  "Ressi EPO Primer - 16 KG",
  "Ressi EPO Primer - 48 KG",
  "Ressi EPO Primer LV - 1.8 KG",
  "Ressi EPO Primer LV - 18 KG",
  "Ressi EPO Primer LV - 54 KG",
  "Ressi EPO Primer WR - 1.8 KG",
  "Ressi EPO Primer WR - 18 KG",
  "Ressi EPO Primer WR - 54 KG",
  "Ressi EPO Primer CR - 1.5 KG",
  "Ressi EPO Primer CR - 15 KG",
  "Ressi EPO Primer CR - 45 KG",
  "Ressi EPO Primer WCR - 1.8 KG",
  "Ressi EPO Primer WCR - 18 KG",
  "Ressi EPO Primer WCR - 54 KG",
  "Ressi EPO Iron Primer - 1.16 KG",
  "Ressi EPO Iron Primer - 11.6 KG",
  "Ressi EPO Iron Primer - 23.2 KG",
  "Ressi EPO Chem Prime 402 - 1.5 KG",
  "Ressi EPO Chem Prime 402 - 15 KG",
  "Ressi EPO Chem Prime 402 - 45 KG",
  "Ressi EPO Mid Coat S - GP - 2.96 KG",
  "Ressi EPO Mid Coat S - GP - 14.8 KG",
  "Ressi EPO Mid Coat S - GP - 29.6 KG",
  "Ressi EPO Mid Coat S - GP - 59.2 KG",
  "Ressi EPO Mid Coat F - GP - 2.96 KG",
  "Ressi EPO Mid Coat F - GP - 14.8 KG",
  "Ressi EPO Mid Coat F - GP - 29.6 KG",
  "Ressi EPO Mid Coat F - GP - 59.2 KG",
  "Ressi EPO Mid Coat S - CR - 2.8 KG",
  "Ressi EPO Mid Coat S - CR - 14 KG",
  "Ressi EPO Mid Coat S - CR - 28 KG",
  "Ressi EPO Mid Coat S - CR - 56 KG",
  "Ressi EPO Mid Coat F - CR - 2.8 KG",
  "Ressi EPO Mid Coat F - CR - 14 KG",
  "Ressi EPO Mid Coat F - CR - 28 KG",
  "Ressi EPO Mid Coat F - CR - 56 KG",
  "Ressi EPO Tough Might - 1.4 KG",
  "Ressi EPO Tough Might - 14 KG",
  "Ressi EPO Tough Might - 28 KG",
  "Ressi EPO Tough Might Econo - 1.6 KG",
  "Ressi EPO Tough Might Econo - 16 KG",
  "Ressi EPO Tough Might Econo - 32 KG",
  "Ressi EPO Gloss Might - 1.4 KG",
  "Ressi EPO Gloss Might - 14 KG",
  "Ressi EPO Gloss Might - 28 KG",
  // --- Aesthetica x3: new SKUs; no legacy row (insert if missing) ---
  null,
  null,
  null,
  "Ressi EPO Chem Might - 1.5 KG",
  "Ressi EPO Chem Might - 15 KG",
  "Ressi EPO Chem Might - 30 KG",
  "Ressi EPO Clear Coat-Floor - 1.5 KG",
  "Ressi EPO Clear Coat-Floor - 15 KG",
  "Ressi EPO Clear Coat-Floor - 30 KG",
  "Ressi EPO Clear Coat-Walls - 1.5 KG",
  "Ressi EPO Clear Coat-Walls - 15 KG",
  "Ressi EPO Clear Coat-Walls - 30 KG",
  "Ressi EPO Anti-static - 1.5 KG",
  "Ressi EPO Anti-static - 15 KG",
  "Ressi EPO Anti-static - 30 KG",
  "Ressi EPO FLOOR PLUS Econo - 3.2 KG",
  "Ressi EPO FLOOR PLUS Econo - 16 KG",
  "Ressi EPO FLOOR PLUS Econo - 32 KG",
  "Ressi EPO FLOOR PLUS Econo - 64 KG",
  "Ressi EPO FLOOR PLUS - 2.8 KG",
  "Ressi EPO FLOOR PLUS - 28 KG",
  "Ressi EPO FLOOR PLUS - 56 KG",
  "Ressi EPO Gloss Plus - 2.7 KG",
  "Ressi EPO Gloss Plus - 13.5 KG",
  "Ressi EPO Gloss Plus - 27 KG",
  "Ressi EPO Gloss Plus - 54 KG",
  "Ressi EPO Chem Plus - 2.7 KG",
  "Ressi EPO Chem Plus - 13.5 KG",
  "Ressi EPO Chem Plus - 27 KG",
  "Ressi EPO Chem Plus - 54 KG",
  "Ressi EPO Roll Coat-Floor - 1.4 KG",
  "Ressi EPO Roll Coat-Floor - 14 KG",
  "Ressi EPO Roll Coat-Floor - 28 KG",
  "Ressi EPO Roll Coat Plus - 1.16 KG",
  "Ressi EPO Roll Coat Plus - 11.6 KG",
  "Ressi EPO Roll Coat Plus - 23.2 KG",
  "Ressi EPO Iron Coat - 1.16 KG",
  "Ressi EPO Iron Coat - 11.6 KG",
  "Ressi EPO Iron Coat - 23.2 KG",
  "Ressi EPO Iron Coat CR - 1.16 KG",
  "Ressi EPO Iron Coat CR - 11.6 KG",
  "Ressi EPO Iron Coat CR - 23.2 KG",
  "Ressi EPO Chem Coat 406 - 1.5 KG",
  "Ressi EPO Chem Coat 406 - 15 KG",
  "Ressi EPO Chem Coat 406 - 30 KG",
  // Chem HR 90 — not in previous seed; create if missing
  null,
  null,
  null,
];

/** New display names, SKU strings, PKR price (null = leave existing price / TBD), subCategory. Order aligns with LEGACY_FULL_NAMES. */
const EPOXY_UPDATES = [
  { name: "RESSI EPO CRACK FILL 2.16 KG", sku: "2.16", price: 914, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO CRACK FILL 21.6 KG", sku: "21.6", price: 8466, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO CRACK FILL LV 2.18 KG", sku: "2.18", price: 618, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO CRACK FILL LV 21.8 KG", sku: "21.8", price: 4616, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO CRACK FILL WR 2.18 KG", sku: "2.18", price: 766, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO CRACK FILL WR 21.8 KG", sku: "21.8", price: 6154, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO CRACK FILL CR 2.15 KG", sku: "2.15", price: 914, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO CRACK FILL CR 21.5 KG", sku: "21.5", price: 7579, subCategory: "Epoxy Crack Fillers" },
  { name: "RESSI EPO PRIMER 1.6 KG", sku: "1.6", price: 4233, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER 16 KG", sku: "16", price: 39278, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER 48 KG", sku: "48", price: 115697, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER LV 1.8 KG", sku: "1.8", price: 4018, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER LV 18 KG", sku: "18", price: 37195, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER LV 54 KG", sku: "54", price: 110476, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER WR 1.8 KG", sku: "1.8", price: 6349, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER WR 18 KG", sku: "18", price: 60953, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER WR 54 KG", sku: "54", price: 175238, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER CR 1.5 KG", sku: "1.5", price: 6914, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER CR 15 KG", sku: "15", price: 63492, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER CR 45 KG", sku: "45", price: 180600, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER WCR 1.8 KG", sku: "1.8", price: 8889, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER WCR 18 KG", sku: "18", price: 82540, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO PRIMER WCR 54 KG", sku: "54", price: 228572, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO IRON PRIMER 1.16 KG", sku: "1.16", price: 2661, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO IRON PRIMER 11.6 KG", sku: "11.6", price: 24550, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO IRON PRIMER 23.2 KG", sku: "23.2", price: 46561, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO CHEM PRIME 402 1.5 KG", sku: "1.5", price: 5644, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO CHEM PRIME 402 15 KG", sku: "15", price: 55027, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO CHEM PRIME 402 45 KG", sku: "45", price: 105820, subCategory: "Epoxy Primers" },
  { name: "RESSI EPO MID COAT S - GP 2.96 KG", sku: "2.96", price: 2673, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT S - GP 14.8 KG", sku: "14.8", price: 12728, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT S - GP 29.6 KG", sku: "29.6", price: 24661, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT S - GP 59.2 KG", sku: "59.2", price: 46935, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - GP 2.96 KG", sku: "2.96", price: 3759, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - GP 14.8 KG", sku: "14.8", price: 15015, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - GP 29.6 KG", sku: "29.6", price: 27644, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - GP 59.2 KG", sku: "59.2", price: 50912, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT S - CR 2.8 KG", sku: "2.8", price: 3556, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT S - CR 14 KG", sku: "14", price: 16743, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT S - CR 28 KG", sku: "28", price: 31605, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT S - CR 56 KG", sku: "56", price: 59071, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - CR 2.8 KG", sku: "2.8", price: 3763, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - CR 14 KG", sku: "14", price: 17778, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - CR 28 KG", sku: "28", price: 33486, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO MID COAT F - CR 56 KG", sku: "56", price: 63210, subCategory: "Epoxy Mid Coats" },
  { name: "RESSI EPO TOUGH MIGHT 1.4 KG", sku: "1.4", price: 3978, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO TOUGH MIGHT 14 KG", sku: "14", price: 38095, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO TOUGH MIGHT 28 KG", sku: "28", price: 74665, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO TOUGH MIGHT ECONO 1.6 KG", sku: "1.6", price: 3453, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO TOUGH MIGHT ECONO 16 KG", sku: "16", price: 31941, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO TOUGH MIGHT ECONO 32 KG", sku: "32", price: 60953, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO GLOSS MIGHT 1.4 KG", sku: "1.4", price: 3789, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO GLOSS MIGHT 14 KG", sku: "14", price: 35851, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO GLOSS MIGHT 28 KG", sku: "28", price: 69532, subCategory: "Two Component Epoxy Top Coats" },
  { name: "Ressi EPO Aesthetica 1.4 KG", sku: "1.4", price: 6490, subCategory: "Two Component Epoxy Top Coats" },
  { name: "Ressi EPO Aesthetica 14 KG", sku: "14", price: 63210, subCategory: "Two Component Epoxy Top Coats" },
  { name: "Ressi EPO Aesthetica 28 KG", sku: "28", price: 122469, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CHEM MIGHT 1.5 KG", sku: "1.5", price: 5294, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CHEM MIGHT 15 KG", sku: "15", price: 50794, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CHEM MIGHT 30 KG", sku: "30", price: 97355, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CLEAR COAT 1.5 KG", sku: "1.5", price: 5294, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CLEAR COAT 15 KG", sku: "15", price: 50794, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CLEAR COAT 30 KG", sku: "30", price: 97355, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CLEAR COAT-WALLS 1.5 KG", sku: "1.5", price: 4441, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CLEAR COAT-WALLS 15 KG", sku: "15", price: 42328, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO CLEAR COAT-WALLS 30 KG", sku: "30", price: 76191, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO ANTI-STATIC 1.5 KG", sku: "1.5", price: 6067, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO ANTI-STATIC 15 KG", sku: "15", price: 57143, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO ANTI-STATIC 30 KG", sku: "30", price: 110053, subCategory: "Two Component Epoxy Top Coats" },
  { name: "RESSI EPO FLOOR PLUS ECONO 3.2 KG", sku: "3.2", price: 3346, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO FLOOR PLUS ECONO 16 KG", sku: "16", price: 16253, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO FLOOR PLUS ECONO 32 KG", sku: "32", price: 31833, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO FLOOR PLUS ECONO 64 KG", sku: "64", price: 61409, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO FLOOR PLUS 2.8 KG", sku: "2.8", price: 3756, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO FLOOR PLUS 28 KG", sku: "28", price: 35556, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO FLOOR PLUS 56 KG", sku: "56", price: 65971, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO GLOSS PLUS 2.7 KG", sku: "2.7", price: 4374, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO GLOSS PLUS 13.5 KG", sku: "13.5", price: 20949, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO GLOSS PLUS 27 KG", sku: "27", price: 40003, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO GLOSS PLUS 54 KG", sku: "54", price: 76191, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO CHEM PLUS 2.7 KG", sku: "2.7", price: 5530, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO CHEM PLUS 13.5 KG", sku: "13.5", price: 26667, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO CHEM PLUS 27 KG", sku: "27", price: 51425, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "RESSI EPO CHEM PLUS 54 KG", sku: "54", price: 99048, subCategory: "Three Component Heavy Duty Epoxy Floorings" },
  { name: "Ressi EPO Roll Coat 1.33", sku: "1.33", price: 3756, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Roll Coat 13.30", sku: "13.30", price: 35656, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Roll Coat 26.60", sku: "26.60", price: 68500, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Roll Coat Plus 1.33", sku: "1.33", price: 4320, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Roll Coat Plus 13.30", sku: "13.30", price: 41287, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Roll Coat Plus 26.60", sku: "26.60", price: 79800, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO IRON COAT 1.16 KG", sku: "1.16", price: 2654, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO IRON COAT 11.6 KG", sku: "11.6", price: 24833, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO IRON COAT 23.2 KG", sku: "23.2", price: 47972, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO IRON COAT CR 1.16 KG", sku: "1.16", price: 2963, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO IRON COAT CR 11.6 KG", sku: "11.6", price: 28642, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO IRON COAT CR 23.2 KG", sku: "23.2", price: 55651, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO CHEM COAT 406 1.5 KG", sku: "1.5", price: 5503, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO CHEM COAT 406 15 KG", sku: "15", price: 55309, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "RESSI EPO CHEM COAT 406 30 KG", sku: "30", price: 105820, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Chem HR 90 1.25", sku: "1.25", price: 4233, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Chem HR 90 12.5", sku: "12.5", price: 39681, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
  { name: "Ressi EPO Chem HR 90 37.5", sku: "37.5", price: 113762, subCategory: "Thin Coat Brush, Roller and Spray Applied" },
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeWs(s) {
  return String(s || "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Match names even if Mongo has extra spaces or different dash spacing. */
function flexAnchoredNameRegex(name) {
  const parts = normalizeWs(name)
    .split(" ")
    .filter(Boolean)
    .map(escapeRegex);
  if (parts.length === 0) return /^$/i;
  return new RegExp(`^\\s*${parts.join("\\s+")}\\s*$`, "i");
}

function skuMongoVariants(sku) {
  const str = String(sku).trim();
  const out = new Set([str]);
  const n = parseFloat(str.replace(/,/g, ""));
  if (!Number.isNaN(n)) {
    out.add(n);
    if (Number.isInteger(n)) out.add(String(n));
  }
  return [...out];
}

/** DBs may end legacy names with `KG` or `LTR`; match both. */
function legacyNameSearchVariants(legacyFullName) {
  if (!legacyFullName) return [];
  const s = normalizeWs(legacyFullName);
  const v = new Set([s]);
  v.add(s.replace(/\bKG\s*$/i, "LTR"));
  v.add(s.replace(/\bLTR\s*$/i, "KG"));
  return [...v];
}

function pushLegacyNameClauses(nameOr, legacyFullName) {
  if (!legacyFullName) return;
  for (const leg of legacyNameSearchVariants(legacyFullName)) {
    nameOr.push({ name: flexAnchoredNameRegex(leg) });
    if (leg.includes("Clear Coat-Floor")) {
      nameOr.push({
        name: flexAnchoredNameRegex(leg.replace("Clear Coat-Floor", "Clear Coat - Floor")),
      });
    }
  }
}

/** List uses "Roll Coat 1.33"; DB may still say "Roll Coat (White) 1.33". */
function rollCoatOptionalWhiteVariant(displayName) {
  const n = normalizeWs(displayName);
  if (n.includes("(White)")) return null;
  const m = n.match(/^(Ressi EPO Roll Coat)(?: (Plus))? ([\d.]+)$/i);
  if (!m) return null;
  const [, base, plus, num] = m;
  return `${base}${plus ? ` ${plus}` : ""} (White) ${num}`;
}

function pushDisplayNameClauses(nameOr, rowName) {
  if (!rowName) return;
  nameOr.push({ name: flexAnchoredNameRegex(rowName) });
  const rollAlt = rollCoatOptionalWhiteVariant(rowName);
  if (rollAlt) nameOr.push({ name: flexAnchoredNameRegex(rollAlt) });
}

/**
 * Find all product documents for this price-list row (handles duplicates & slight name drift).
 */
async function findDocumentsForRow(row, legacyFullName) {
  const base = {
    company_id: COMPANY_ID,
    "category.mainCategory": MAIN,
  };

  const nameOr = [];
  pushDisplayNameClauses(nameOr, row.name);
  pushLegacyNameClauses(nameOr, legacyFullName);

  if (nameOr.length > 0) {
    const found = await Product.find({ ...base, $or: nameOr });
    if (found.length > 0) return found;
  }

  const skuVals = skuMongoVariants(row.sku);

  // subCategory + SKU + new-list name
  const rollWhite = rollCoatOptionalWhiteVariant(row.name);
  const nameClause =
    rollWhite != null
      ? {
          $or: [
            { name: flexAnchoredNameRegex(row.name) },
            { name: flexAnchoredNameRegex(rollWhite) },
          ],
        }
      : { name: flexAnchoredNameRegex(row.name) };

  const foundSku = await Product.find({
    ...base,
    "category.subCategory": row.subCategory,
    sku: { $in: skuVals },
    ...nameClause,
  });
  if (foundSku.length > 0) return foundSku;

  // subCategory + SKU + any legacy name variant (fixes missing subCategory on some old rows)
  const legacyOr = [];
  pushLegacyNameClauses(legacyOr, legacyFullName);
  if (legacyOr.length > 0) {
    const foundLegacySku = await Product.find({
      ...base,
      "category.subCategory": row.subCategory,
      sku: { $in: skuVals },
      $or: legacyOr,
    });
    if (foundLegacySku.length > 0) return foundLegacySku;
  }

  // Same main category + SKU + legacy name, even if subCategory is missing/wrong in DB
  if (legacyFullName) {
    const legClauses = [];
    pushLegacyNameClauses(legClauses, legacyFullName);
    if (legClauses.length > 0) {
      const looseCat = await Product.find({
        ...base,
        sku: { $in: skuVals },
        $or: legClauses,
      });
      if (looseCat.length > 0) return looseCat;
    }
  }

  // Last resort: same subCategory + SKU + distinctive substring (still risky for duplicate SKUs)
  const tail = normalizeWs(row.name).replace(/^(RESSI|Ressi|RESSICHEM)\s+/i, "");
  if (tail.length >= 8) {
    const loose = await Product.find({
      ...base,
      "category.subCategory": row.subCategory,
      sku: { $in: skuVals },
      name: new RegExp(escapeRegex(tail.slice(0, 48)), "i"),
    });
    if (loose.length >= 1) return loose;
  }

  return [];
}

async function updateEpoxyProducts() {
  if (LEGACY_FULL_NAMES.length !== EPOXY_UPDATES.length) {
    throw new Error(
      `LEGACY_FULL_NAMES (${LEGACY_FULL_NAMES.length}) must match EPOXY_UPDATES (${EPOXY_UPDATES.length})`
    );
  }

  try {
    await connect();
    console.log("📦 Updating Epoxy Floorings & Coatings (name, SKU, price)…");
    console.log(`   company_id=${COMPANY_ID}\n`);

    let updated = 0;
    let created = 0;
    let skipped = 0;

    for (let i = 0; i < EPOXY_UPDATES.length; i++) {
      const row = EPOXY_UPDATES[i];
      const legacyFullName = LEGACY_FULL_NAMES[i];
      const category = { mainCategory: MAIN, subCategory: row.subCategory };

      const payload = {
        name: row.name,
        description: row.name,
        sku: String(row.sku),
        unit: "KG",
        category,
        company_id: COMPANY_ID,
        isActive: true,
      };
      if (row.price != null && !Number.isNaN(Number(row.price))) {
        payload.price = Number(row.price);
      }

      const docs = await findDocumentsForRow(row, legacyFullName);

      if (docs.length > 0) {
        for (const doc of docs) {
          const prev = Number(doc.price || 0);
          const next = payload.price;
          const patch = { ...payload };
          if (next != null && Number.isFinite(next) && prev !== next) {
            patch.lastPriceChange = {
              previousPrice: prev,
              newPrice: next,
              changedByName: "Epoxy price list (bulk)",
              changedByEmail: "system@ressichem.com",
              changedAt: new Date(),
            };
          }
          await Product.updateOne({ _id: doc._id }, { $set: patch });
        }
        updated += docs.length;
        console.log(`   ✓ ${row.name.slice(0, 52)}… (${docs.length} doc(s))`);
      } else if (!legacyFullName) {
        await Product.create({
          ...payload,
          stock: 0,
          minStock: 0,
          price: payload.price ?? 0,
        });
        created++;
        console.log(`   + ${row.name.slice(0, 55)}… (created)`);
      } else {
        console.warn(`   ⚠ No DB match — check name/company_id. Legacy: ${legacyFullName}`);
        skipped++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`   Documents updated: ${updated}`);
    console.log(`   Created: ${created}`);
    console.log(`   Skipped (no match): ${skipped}`);
    console.log("\n🎉 Done.");
  } catch (error) {
    console.error("❌ Update failed:", error);
    process.exit(1);
  } finally {
    await disconnect();
  }
}

/**
 * Read-only: compare MongoDB prices to EPOXY_UPDATES (same matching rules as update).
 * Run: node backend/scripts/updateEpoxyProducts.js --verify
 */
async function verifyEpoxyPrices() {
  if (LEGACY_FULL_NAMES.length !== EPOXY_UPDATES.length) {
    throw new Error("LEGACY_FULL_NAMES length must match EPOXY_UPDATES");
  }

  try {
    await connect();
    console.log(`\n🔎 VERIFY Epoxy prices vs approved list (company_id=${COMPANY_ID})\n`);

    const okRows = [];
    const missing = [];
    const mismatches = [];
    const noExpectedPrice = [];

    for (let i = 0; i < EPOXY_UPDATES.length; i++) {
      const row = EPOXY_UPDATES[i];
      const legacyFullName = LEGACY_FULL_NAMES[i];
      const docs = await findDocumentsForRow(row, legacyFullName);

      if (docs.length === 0) {
        missing.push({
          listName: row.name,
          sku: row.sku,
          expectedPrice: row.price,
        });
        continue;
      }

      const expected = row.price;
      if (expected == null) {
        for (const doc of docs) {
          noExpectedPrice.push({
            name: doc.name,
            sku: doc.sku,
            actualPrice: Number(doc.price),
          });
        }
        continue;
      }

      const want = Number(expected);
      for (const doc of docs) {
        const got = Number(doc.price);
        if (got !== want) {
          mismatches.push({
            name: doc.name,
            _id: String(doc._id),
            sku: doc.sku,
            expectedPKR: want,
            actualPKR: got,
          });
        } else {
          okRows.push(`${doc.name} → PKR ${got.toLocaleString("en-PK")}`);
        }
      }
    }

    console.log(`   Exact price match: ${okRows.length} row(s) (counting duplicate product docs separately)`);
    console.log(`   Missing in DB (no matching document): ${missing.length}`);
    console.log(`   Wrong price: ${mismatches.length}`);
    console.log(`   List price was “-” / TBD (not checked): ${noExpectedPrice.length}\n`);

    if (missing.length > 0) {
      console.log("--- MISSING (no document matched) ---");
      missing.forEach((m) => {
        console.log(
          `   • ${m.listName} | SKU ${m.sku} | expected PKR ${m.expectedPrice ?? "n/a"}`
        );
      });
      console.log("");
    }

    if (mismatches.length > 0) {
      console.log("--- PRICE MISMATCH ---");
      mismatches.forEach((m) => {
        console.log(
          `   • ${m.name}\n     expected PKR ${m.expectedPKR.toLocaleString("en-PK")} | actual PKR ${m.actualPKR.toLocaleString("en-PK")} | _id ${m._id}`
        );
      });
      console.log("");
    }

    if (
      missing.length === 0 &&
      mismatches.length === 0 &&
      okRows.length > 0
    ) {
      console.log("✅ All listed prices with a target value match the database.\n");
    } else if (missing.length === 0 && mismatches.length === 0 && okRows.length === 0) {
      console.log("⚠️ No rows verified (empty OK set). Check company_id / DB connection.\n");
    } else {
      console.log("❌ Verification failed: fix missing rows or run update script, then re-verify.\n");
    }

    const summary = {
      ok: missing.length === 0 && mismatches.length === 0,
      missing,
      mismatches,
      matchedCount: okRows.length,
    };
    return summary;
  } catch (error) {
    console.error("❌ Verify failed:", error);
    throw error;
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  const verify = process.argv.includes("--verify");
  const run = verify ? verifyEpoxyPrices : updateEpoxyProducts;
  run()
    .then((result) => {
      if (
        verify &&
        result &&
        (result.missing?.length > 0 || result.mismatches?.length > 0)
      ) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = {
  updateEpoxyProducts,
  verifyEpoxyPrices,
  findDocumentsForRow,
  EPOXY_UPDATES,
  LEGACY_FULL_NAMES,
};
