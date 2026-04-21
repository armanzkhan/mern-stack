// backend/scripts/updateConcreteAdmixturesPrices.js
// Updates Concrete Admixtures prices from approved list.
// Run update: node backend/scripts/updateConcreteAdmixturesPrices.js
// Run verify: node backend/scripts/updateConcreteAdmixturesPrices.js --verify
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const MAIN_CATEGORY = "Concrete Admixtures";
const COMPANY_ID = process.env.COMPANY_ID || process.env.PRODUCT_BULK_COMPANY_ID || "RESSICHEM";

const PRICE_LIST_TEXT = `
MAX FLO P 1 LTR LTR 1 750
MAX FLO P 5 LTR LTR 5 2,813
MAX FLO P 10 LTR LTR 10 5,000
MAX FLO P 15 LTR LTR 15 6,563
MAX FLO P 25 LTR LTR 25 9,375
MAX FLO P 200 LTR LTR 200 70,000
MAX FLO P 800 1 LTR LTR 1 813
MAX FLO P 800 5 LTR LTR 5 2,813
MAX FLO P 800 10 LTR LTR 10 5,000
MAX FLO P 800 15 LTR LTR 15 6,750
MAX FLO P 800 25 LTR LTR 25 10,781
MAX FLO P 800 200 LTR LTR 200 81,250
MAX FLO P 801 1 LTR LTR 1 850
MAX FLO P 801 5 LTR LTR 5 3,000
MAX FLO P 801 10 LTR LTR 10 5,750
MAX FLO P 801 15 LTR LTR 15 7,688
MAX FLO P 801 25 LTR LTR 25 12,500
MAX FLO P 801 200 LTR LTR 200 91,250
MAX FLO SP 802 1 LTR LTR 1 875
MAX FLO SP 802 5 LTR LTR 5 3,125
MAX FLO SP 802 10 LTR LTR 10 6,000
MAX FLO SP 802 15 LTR LTR 15 8,063
MAX FLO SP 802 25 LTR LTR 25 12,813
MAX FLO SP 802 200 LTR LTR 200 97,500
MAX FLO SP 803 1 LTR LTR 1 938
MAX FLO SP 803 5 LTR LTR 5 3,438
MAX FLO SP 803 10 LTR LTR 10 6,250
MAX FLO SP 803 15 LTR LTR 15 8,531
MAX FLO SP 803 25 LTR LTR 25 13,906
MAX FLO SP 803 200 LTR LTR 200 105,000
MAX FLO SP 804 1 LTR LTR 1 938
MAX FLO SP 804 5 LTR LTR 5 3,500
MAX FLO SP 804 10 LTR LTR 10 6,500
MAX FLO SP 804 15 LTR LTR 15 9,281
MAX FLO SP 804 25 LTR LTR 25 15,156
MAX FLO SP 804 200 LTR LTR 200 117,500
MAX FLO SP 805 1 LTR LTR 1 1,000
MAX FLO SP 805 5 LTR LTR 5 3,750
MAX FLO SP 805 10 LTR LTR 10 7,250
MAX FLO SP 805 15 LTR LTR 15 9,656
MAX FLO SP 805 25 LTR LTR 25 15,781
MAX FLO SP 805 200 LTR LTR 200 121,250
MAX FLO SP 900 1 LTR LTR 1 1,113
MAX FLO SP 900 5 LTR LTR 5 4,063
MAX FLO SP 900 10 LTR LTR 10 7,500
MAX FLO SP 900 15 LTR LTR 15 10,594
MAX FLO SP 900 25 LTR LTR 25 17,344
MAX FLO SP 900 200 LTR LTR 200 131,250
PRODCUT KG/LTR SKU APP PRICE
MAX FLO SP 901 1 LTR LTR 1 1,113
MAX FLO SP 901 5 LTR LTR 5 4,063
MAX FLO SP 901 10 LTR LTR 10 7,500
MAX FLO SP 901 15 LTR LTR 15 10,688
MAX FLO SP 901 25 LTR LTR 25 17,344
MAX FLO SP 901 200 LTR LTR 200 128,750
MAX FLO SP 902 1 LTR LTR 1 1,125
MAX FLO SP 902 5 LTR LTR 5 4,375
MAX FLO SP 902 10 LTR LTR 10 8,500
MAX FLO SP 902 15 LTR LTR 15 12,188
MAX FLO SP 902 25 LTR LTR 25 20,000
MAX FLO SP 902 200 LTR LTR 200 152,500
MAX FLO SP 903 1 LTR LTR 1
MAX FLO SP 903 5 LTR LTR 5
MAX FLO SP 903 10 LTR LTR 10
MAX FLO SP 903 15 LTR LTR 15
MAX FLO SP 903 25 LTR LTR 25
MAX FLO SP 903 200 LTR LTR 200
MAX FLO 4000 1 LTR LTR 1
MAX FLO 4000 5 LTR LTR 5
MAX FLO 4000 10 LTR LTR 10
MAX FLO 4000 15 LTR LTR 15
MAX FLO 4000 25 LTR LTR 25
MAX FLO 4000 200 LTR LTR 200
MAX FLO 5000 1 LTR LTR 1
MAX FLO 5000 5 LTR LTR 5
MAX FLO 5000 10 LTR LTR 10
MAX FLO 5000 15 LTR LTR 15
MAX FLO 5000 25 LTR LTR 25
MAX FLO 5000 200 LTR LTR 200
MAX FLO 6000 1 LTR LTR 1
MAX FLO 6000 5 LTR LTR 5
MAX FLO 6000 10 LTR LTR 10
MAX FLO 6000 15 LTR LTR 15
MAX FLO 6000 25 LTR LTR 25
MAX FLO 6000 200 LTR LTR 200
MAX FLO VE 1 LTR LTR 1 1,575
MAX FLO VE 5 LTR LTR 5 7,188
MAX FLO VE 10 LTR LTR 10 13,750
MAX FLO VE 15 LTR LTR 15 19,688
MAX FLO VE 25 LTR LTR 25 31,250
MAX FLO VE 200 LTR LTR 200 233,750
MAX FLO R 1 LTR LTR 1 1,000
MAX FLO R 5 LTR LTR 5 4,375
MAX FLO R 10 LTR LTR 10 7,500
MAX FLO R 15 LTR LTR 15 10,313
MAX FLO R 25 LTR LTR 25 16,094
MAX FLO R 200 LTR LTR 200 118,750
MAX FLO AIR INTRA 1 LTR LTR 1 2,375
MAX FLO AIR INTRA 5 LTR LTR 5 11,156
MAX FLO AIR INTRA 10 LTR LTR 10 21,625
MAX FLO AIR INTRA 15 LTR LTR 15 31,500
MAX FLO AIR INTRA 25 LTR LTR 25 50,938
MAX FLO AIR INTRA 200 LTR LTR 200 393,750
MAX FLO INTEGRA 1-POWDER 2 KG KG 2 900
MAX FLO INTEGRA 1-POWDER 20 KG KG 20 8,125
MAX FLO INTEGRA 2-POWDER 2 KG KG 2 1,200
MAX FLO INTEGRA 2-POWDER 20 KG KG 20 11,500
MAX FLO INTEGRA 3-POWDER 2 KG KG 2 1,575
MAX FLO INTEGRA 3-POWDER 20 KG KG 20 15,250
MAX FLO INTEGRA 4-POWDER 2 KG KG 2 2,500
MAX FLO INTEGRA 4 -POWDER 20 KG KG 20 24,125
MAX FLO CI 1 LTR LTR 1 750
MAX FLO CI 5 LTR LTR 5 3,188
MAX FLO CI 10 LTR LTR 10 5,750
MAX FLO CI 15 LTR LTR 15 7,875
MAX FLO CI 25 LTR LTR 25 12,188
MAX FLO CI 200 LTR LTR 200 90,000
MAX FLO PB 1 LTR LTR 1 1,188
MAX FLO PB 5 LTR LTR 5 4,688
MAX FLO PB 10 LTR LTR 10 8,750
MAX FLO PB 15 LTR LTR 15 13,781
MAX FLO PB 25 LTR LTR 25 22,344
MAX FLO PB 200 LTR LTR 200 173,750
MAX FLO MP 1 LTR LTR 1 975
MAX FLO MP 5 LTR LTR 5 3,750
MAX FLO MP 10 LTR LTR 10 6,750
MAX FLO MP 15 LTR LTR 15 9,469
MAX FLO MP 25 LTR LTR 25 15,469
MAX FLO MP 200 LTR LTR 200 118,750
MAX FLO SAL 1 LTR LTR 1 1,025
MAX FLO SAL 5 LTR LTR 5 4,063
MAX FLO SAL 10 LTR LTR 10 7,750
MAX FLO SAL 15 LTR LTR 15 11,063
MAX FLO SAL 25 LTR LTR 25 18,125
MAX FLO SAL 200 LTR LTR 200 137,500
MAX FLO SAP (POWDER) 2 KG KG 2 3,413
MAX FLO SAP (POWDER) 20 KG KG 20 32,875
MAX FLO P 800 (POWDER) 2 KG KG 2 550
MAX FLO P 800 (POWDER) 20 KG KG 20 4,375
MAX FLO SP 900 (POWDER) 2 KG KG 2 950
MAX FLO SP 900 (POWDER) 20 KG KG 20 8,625
MAX FLO SP 802 (POWDER) 2 KG KG 2 650
MAX FLO SP 802 (POWDER) 20 KG KG 20 5,875
`;

function normalizeSku(value) {
  const s = String(value || "").replace(/,/g, "").trim();
  const n = Number(s);
  if (!Number.isNaN(n)) return String(n);
  return s;
}

function canonicalBaseName(s) {
  return String(s || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
}

function stripNameSuffix(name) {
  return String(name || "")
    .replace(/\s*-\s*[0-9]+(?:\.[0-9]+)?\s*(KG|LTR)\s*$/i, "")
    .trim();
}

function parsePriceList() {
  const lines = PRICE_LIST_TEXT.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsed = [];
  const skipped = [];

  const rx = /^(.+?)\s+([0-9]+(?:\.[0-9]+)?)\s+(KG|LTR)\s+(KG|LTR)\s+([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/i;

  for (const line of lines) {
    if (/^PRODCUT\b/i.test(line) || /^PRODUCT\b/i.test(line)) continue;
    const m = line.match(rx);
    if (!m) {
      skipped.push(line);
      continue;
    }
    const [, baseNameRaw, displaySize, displayUnit, unit, sku, priceRaw] = m;
    parsed.push({
      line,
      baseNameRaw: baseNameRaw.replace(/\s+/g, " ").trim(),
      baseKey: canonicalBaseName(baseNameRaw),
      displaySize: normalizeSku(displaySize),
      displayUnit: String(displayUnit).toUpperCase(),
      unit: String(unit).toUpperCase(),
      sku: normalizeSku(sku),
      price: priceRaw ? Number(String(priceRaw).replace(/,/g, "")) : null,
    });
  }

  return { parsed, skipped };
}

function makeKey(baseKey, sku, unit) {
  return `${baseKey}::${normalizeSku(sku)}::${String(unit || "").toUpperCase()}`;
}

async function loadConcreteProducts() {
  return Product.find({
    "category.mainCategory": MAIN_CATEGORY,
    company_id: COMPANY_ID,
    isActive: true,
  });
}

function buildDbIndex(products) {
  const index = new Map();

  for (const p of products) {
    const unit = String(p.unit || "").toUpperCase().trim();
    const sku = normalizeSku(p.sku);
    const baseCandidates = [
      canonicalBaseName(p.description || ""),
      canonicalBaseName(stripNameSuffix(p.name || "")),
    ].filter(Boolean);

    for (const baseKey of baseCandidates) {
      const key = makeKey(baseKey, sku, unit);
      const list = index.get(key) || [];
      list.push(p);
      index.set(key, list);
    }
  }

  return index;
}

function addPriceChangeSnapshot(prevPrice, nextPrice) {
  return {
    previousPrice: Number(prevPrice || 0),
    newPrice: Number(nextPrice),
    changedByName: "Concrete Admixtures price list (bulk)",
    changedByEmail: "system@ressichem.com",
    changedAt: new Date(),
  };
}

async function updateConcreteAdmixturesPrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);
    skipped.forEach((l) => console.warn(`   - ${l}`));
  }

  try {
    await connect();
    console.log(`📦 Updating "${MAIN_CATEGORY}" prices (company_id=${COMPANY_ID})`);

    const dbProducts = await loadConcreteProducts();
    const dbIndex = buildDbIndex(dbProducts);

    let updatedDocs = 0;
    let unchangedDocs = 0;
    let missingRows = 0;
    let noPriceRows = 0;

    for (const row of parsed) {
      if (row.price == null || Number.isNaN(row.price)) {
        noPriceRows++;
        continue;
      }

      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];
      if (docs.length === 0) {
        missingRows++;
        console.warn(`⚠ Missing match: ${row.line}`);
        continue;
      }

      for (const doc of docs) {
        const prev = Number(doc.price || 0);
        if (prev === row.price) {
          unchangedDocs++;
          continue;
        }
        await Product.updateOne(
          { _id: doc._id },
          {
            $set: {
              price: row.price,
              lastPriceChange: addPriceChangeSnapshot(prev, row.price),
            },
          }
        );
        updatedDocs++;
      }
    }

    console.log("\n📊 Update summary:");
    console.log(`   Parsed rows: ${parsed.length}`);
    console.log(`   Rows with no price (kept as-is): ${noPriceRows}`);
    console.log(`   Updated documents: ${updatedDocs}`);
    console.log(`   Already correct documents: ${unchangedDocs}`);
    console.log(`   Missing rows (no DB match): ${missingRows}`);
  } finally {
    await disconnect();
  }
}

async function verifyConcreteAdmixturesPrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);
  }

  try {
    await connect();
    console.log(`🔎 Verifying "${MAIN_CATEGORY}" prices (company_id=${COMPANY_ID})`);

    const dbProducts = await loadConcreteProducts();
    const dbIndex = buildDbIndex(dbProducts);

    const missing = [];
    const mismatches = [];
    let matched = 0;
    let noPriceRows = 0;

    for (const row of parsed) {
      if (row.price == null || Number.isNaN(row.price)) {
        noPriceRows++;
        continue;
      }
      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];
      if (docs.length === 0) {
        missing.push(row.line);
        continue;
      }
      for (const doc of docs) {
        const got = Number(doc.price || 0);
        if (got !== row.price) {
          mismatches.push({
            row: row.line,
            product: doc.name,
            sku: String(doc.sku),
            expected: row.price,
            actual: got,
            id: String(doc._id),
          });
        } else {
          matched++;
        }
      }
    }

    console.log("\n📊 Verify summary:");
    console.log(`   Exact matches: ${matched}`);
    console.log(`   Missing rows: ${missing.length}`);
    console.log(`   Price mismatches: ${mismatches.length}`);
    console.log(`   Rows with no price in list: ${noPriceRows}`);

    if (missing.length > 0) {
      console.log("\n--- Missing rows ---");
      missing.forEach((m) => console.log(`   • ${m}`));
    }
    if (mismatches.length > 0) {
      console.log("\n--- Price mismatches ---");
      mismatches.forEach((m) => {
        console.log(
          `   • ${m.product} | expected ${m.expected} | actual ${m.actual} | _id ${m.id}`
        );
      });
    }

    const ok = missing.length === 0 && mismatches.length === 0;
    console.log(ok ? "\n✅ Verification passed." : "\n❌ Verification failed.");
    return { ok, missing, mismatches };
  } finally {
    await disconnect();
  }
}

async function printNoPriceRowsCurrentValues() {
  const { parsed } = parsePriceList();
  const noPriceRows = parsed.filter((r) => r.price == null || Number.isNaN(r.price));

  try {
    await connect();
    console.log(`🔎 Current DB values for no-price rows (${MAIN_CATEGORY}, company_id=${COMPANY_ID})\n`);
    const dbProducts = await loadConcreteProducts();
    const dbIndex = buildDbIndex(dbProducts);

    noPriceRows.forEach((row, idx) => {
      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];
      if (docs.length === 0) {
        console.log(`${String(idx + 1).padStart(2, "0")}. ${row.line} -> NOT_FOUND`);
        return;
      }
      const prices = [...new Set(docs.map((d) => Number(d.price || 0)))];
      const names = [...new Set(docs.map((d) => d.name))];
      console.log(
        `${String(idx + 1).padStart(2, "0")}. ${row.line} -> PKR ${prices
          .map((p) => p.toLocaleString("en-PK"))
          .join(", ")} | ${names[0]}`
      );
    });
  } finally {
    await disconnect();
  }
}

async function insertNoPriceMissingProducts() {
  const { parsed } = parsePriceList();
  const noPriceRows = parsed.filter((r) => r.price == null || Number.isNaN(r.price));

  try {
    await connect();
    console.log(`➕ Inserting missing no-price rows (${MAIN_CATEGORY}, company_id=${COMPANY_ID})\n`);
    const dbProducts = await loadConcreteProducts();
    const dbIndex = buildDbIndex(dbProducts);

    let inserted = 0;
    let alreadyPresent = 0;

    for (const row of noPriceRows) {
      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];
      if (docs.length > 0) {
        alreadyPresent++;
        continue;
      }

      const name = `${row.baseNameRaw} - ${row.sku} ${row.unit}`;
      const doc = {
        name,
        description: row.baseNameRaw,
        sku: row.sku,
        unit: row.unit,
        price: 0,
        category: { mainCategory: MAIN_CATEGORY },
        company_id: COMPANY_ID,
        stock: 0,
        minStock: 0,
        isActive: true,
      };
      const created = await Product.create(doc);
      inserted++;
      const list = dbIndex.get(key) || [];
      list.push(created);
      dbIndex.set(key, list);
      console.log(`   + ${name} (price placeholder PKR 0)`);
    }

    console.log("\n📊 Insert summary:");
    console.log(`   Inserted: ${inserted}`);
    console.log(`   Already present: ${alreadyPresent}`);
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  const verifyOnly = process.argv.includes("--verify");
  const printNoPrice = process.argv.includes("--print-no-price-current");
  const insertNoPriceMissing = process.argv.includes("--insert-no-price-missing");
  const run = insertNoPriceMissing
    ? insertNoPriceMissingProducts
    : printNoPrice
    ? printNoPriceRowsCurrentValues
    : verifyOnly
      ? verifyConcreteAdmixturesPrices
      : updateConcreteAdmixturesPrices;
  run()
    .then((res) => {
      if (verifyOnly && res && (!res.ok)) {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Script failed:", err);
      process.exit(1);
    });
}

module.exports = {
  parsePriceList,
  updateConcreteAdmixturesPrices,
  verifyConcreteAdmixturesPrices,
  printNoPriceRowsCurrentValues,
  insertNoPriceMissingProducts,
};
