// backend/scripts/updateDecorativeConcretePrices.js
// Updates Decorative Concrete prices from approved list.
// Run update: node backend/scripts/updateDecorativeConcretePrices.js
// Run verify: node backend/scripts/updateDecorativeConcretePrices.js --verify
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const MAIN_CATEGORY = "Decorative Concrete";
const COMPANY_ID = process.env.COMPANY_ID || process.env.PRODUCT_BULK_COMPANY_ID || "RESSICHEM";

const PRICE_LIST_TEXT = `
RESSI OVERLAY 50 KG KG 50 4,313
RESSI PIGMENTED HARDENER - 0001 (WHITE) 20 KG KG 20 6,000
RESSI PIGMENTED HARDENER - 3700 (TERRACOTTA) 20 KG KG 20 6,000
RESSI PIGMENTED HARDENER - 1600 (YELLOW) 20 KG KG 20 6,000
RESSI PIGMENTED HARDENER - 9000 (GREY) 20 KG KG 20 6,000
RESSI PIGMENTED HARDENER - 5210 - 1 (SKY BLUE) 20 KG KG 20 6,000
RESSI PIGMENTED HARDENER - 9321 (BROWN) 20 KG KG 20 6,000
RESSI POWDER RELEASE - 0001 (WHITE) 10 KG KG 10 9,125
RESSI POWDER RELEASE - 3700 (TERRACOTTA) 10 KG KG 10 9,125
RESSI POWDER RELEASE - 1600 (YELLOW) 10 KG KG 10 9,125
RESSI POWDER RELEASE - 9000 (GREY) 10 KG KG 10 9,125
RESSI POWDER RELEASE - 5210 - 1 (SKY BLUE) 10 KG KG 10 9,125
RESSI POWDER RELEASE - 9321 (BROWN) 10 KG KG 10 9,125
RESSI CHROME SEAL 1 LTR LTR 1
RESSI CHROME SEAL 5 LTR LTR 5
RESSI CHROME SEAL 10 LTR LTR 10
RESSI CHROME SEAL 15 LTR LTR 15
RESSI CHROME SEAL 25 LTR LTR 25
RESSI LIQUID RELEASE 1 LTR LTR 1
RESSI LIQUID RELEASE 5 LTR LTR 5
RESSI LIQUID RELEASE 10 LTR LTR 10
RESSI LIQUID RELEASE 15 LTR LTR 15
RESSI LIQUID RELEASE 25 LTR LTR 25
RESSI VERTI MIX 20 KG KG 20
RESSI ACID ITCH 1 LTR LTR 1 938
RESSI ACID ITCH 5 LTR LTR 5 3,250
RESSI ACID ITCH 10 LTR LTR 10 5,750
RESSI ACID ITCH 15 LTR LTR 15 8,125
RESSI ACID ITCH 25 LTR LTR 25 12,500
RESSI REACTIVE STAIN - HONEY WHITE 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - HONEY WHITE 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - HONEY WHITE 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - HONEY WHITE 15 LTR LTR 15 17,813
RESSI REACTIVE STAIN - HONEY WHITE 25 LTR LTR 25 29,063
RESSI REACTIVE STAIN - NECTARINE 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - NECTARINE 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - NECTARINE 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - NECTARINE 15 LTR LTR 15 17,813
RESSI REACTIVE STAIN - NECTARINE 25 LTR LTR 25 29,063
RESSI REACTIVE STAIN - PERSIMMON 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - PERSIMMON 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - PERSIMMON 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - PERSIMMON 15 LTR LTR 15 17,813
RESSI REACTIVE STAIN - PERSIMMON 25 LTR LTR 25 29,063
RESSI REACTIVE STAIN - RUST BROWN 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - RUST BROWN 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - RUST BROWN 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - RUST BROWN 15 LTR LTR 15 17,813
COLOUR CODE KG/LTR SKU APP PRICE
RESSI REACTIVE STAIN - RUST BROWN 25 LTR LTR 25 29,063
RESSI REACTIVE STAIN - STORM GREEN 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - STORM GREEN 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - STORM GREEN 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - STORM GREEN 15 LTR LTR 15 17,813
RESSI REACTIVE STAIN - STORM GREEN 25 LTR LTR 25 29,063
RESSI REACTIVE STAIN - KAHLUA 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - KAHLUA 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - KAHLUA 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - KAHLUA 15 LTR LTR 15 17,813
RESSI REACTIVE STAIN - KAHLUA 25 LTR LTR 25 29,063
RESSI REACTIVE STAIN - CITRUS GREEN 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - CITRUS GREEN 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - CITRUS GREEN 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - CITRUS GREEN 15 LTR LTR 15 17,813
RESSI REACTIVE STAIN - CITRUS GREEN 25 LTR LTR 25 29,063
RESSI REACTIVE STAIN - COOL BLUE 1 LTR LTR 1 2,438
RESSI REACTIVE STAIN - COOL BLUE 5 LTR LTR 5 7,500
RESSI REACTIVE STAIN - COOL BLUE 10 LTR LTR 10 13,125
RESSI REACTIVE STAIN - COOL BLUE 15 LTR LTR 15 17,813
RESSI REACTIVE STAIN - COOL BLUE 25 LTR LTR 25 29,063
RESSI NEUTRALIZER 1 LTR LTR 1 1,500
RESSI NEUTRALIZER 5 LTR LTR 5 6,875
RESSI NEUTRALIZER 10 LTR LTR 10 12,500
RESSI NEUTRALIZER 15 LTR LTR 15 17,813
RESSI NEUTRALIZER 25 LTR LTR 25 28,125
RESSI DURA COAT 1 LTR LTR 1
RESSI DURA COAT 5 LTR LTR 5
RESSI DURA COAT 10 LTR LTR 10
RESSI DURA COAT 15 LTR LTR 15
RESSI DURA COAT 25 LTR LTR 25
RESSI POLYMER 1 LTR LTR 1 4,500
RESSI POLYMER 5 LTR LTR 5 21,250
RESSI POLYMER 10 LTR LTR 10 40,625
RESSI POLYMER 15 LTR LTR 15 58,125
RESSI POLYMER 25 LTR LTR 25 95,313
MT Base Coat kg 20 2,313
MT Top Coat kg 20 3,188
MICRO TOPPING - POLYMER LIQUID 1 KG kg 1 4,875
MICRO TOPPING - POLYMER LIQUID 5 KG kg 5 23,750
MICRO TOPPING - POLYMER LIQUID 10 KG kg 10 46,250
MICRO TOPPING - POLYMER LIQUID 15 KG kg 15 67,500
MICRO TOPPING - POLYMER LIQUID 25 KG kg 25 104,688
TERRAZZO RETARDER 1 LTR LTR 1 1,750
TERRAZZO RETARDER 5 LTR LTR 5 7,250
TERRAZZO RETARDER 10 LTR LTR 10 14,375
TERRAZZO RETARDER 15 LTR LTR 15 22,500
TERRAZZO RETARDER 25 LTR LTR 25 35,000
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

  const formatA = /^(.+?)\s+([0-9]+(?:\.[0-9]+)?)\s+(KG|LTR)\s+(KG|LTR)\s+([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/i;
  const formatB = /^(.+?)\s+(KG|LTR)\s+([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/i;

  for (const line of lines) {
    if (/^(COLOUR CODE|PRODCUT|PRODUCT)\b/i.test(line)) continue;

    let m = line.match(formatA);
    if (m) {
      const [, baseNameRaw, displaySize, displayUnit, unit, sku, priceRaw] = m;
      const expectedName = `${baseNameRaw.replace(/\s+/g, " ").trim()} ${normalizeSku(displaySize)} ${String(
        displayUnit
      ).toUpperCase()}`;
      parsed.push({
        line,
        baseNameRaw: baseNameRaw.replace(/\s+/g, " ").trim(),
        baseKey: canonicalBaseName(baseNameRaw),
        displaySize: normalizeSku(displaySize),
        displayUnit: String(displayUnit).toUpperCase(),
        unit: String(unit).toUpperCase(),
        sku: normalizeSku(sku),
        price: priceRaw ? Number(String(priceRaw).replace(/,/g, "")) : null,
        expectedName,
      });
      continue;
    }

    m = line.match(formatB);
    if (m) {
      const [, baseNameRaw, unit, sku, priceRaw] = m;
      const expectedName = `${baseNameRaw.replace(/\s+/g, " ").trim()} ${String(unit).trim()} ${normalizeSku(
        sku
      )}`;
      parsed.push({
        line,
        baseNameRaw: baseNameRaw.replace(/\s+/g, " ").trim(),
        baseKey: canonicalBaseName(baseNameRaw),
        displaySize: normalizeSku(sku),
        displayUnit: String(unit).toUpperCase(),
        unit: String(unit).toUpperCase(),
        sku: normalizeSku(sku),
        price: priceRaw ? Number(String(priceRaw).replace(/,/g, "")) : null,
        expectedName,
      });
      continue;
    }

    skipped.push(line);
  }

  return { parsed, skipped };
}

function makeKey(baseKey, sku, unit) {
  return `${baseKey}::${normalizeSku(sku)}::${String(unit || "").toUpperCase()}`;
}

async function loadDecorativeProducts() {
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
    changedByName: "Decorative Concrete price list (bulk)",
    changedByEmail: "system@ressichem.com",
    changedAt: new Date(),
  };
}

async function updateDecorativeConcretePrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);
    skipped.forEach((l) => console.warn(`   - ${l}`));
  }

  try {
    await connect();
    console.log(`📦 Updating "${MAIN_CATEGORY}" prices (company_id=${COMPANY_ID})`);

    const dbProducts = await loadDecorativeProducts();
    const dbIndex = buildDbIndex(dbProducts);

    let updatedDocs = 0;
    let renamedDocs = 0;
    let unchangedDocs = 0;
    let missingRows = 0;
    let insertedDocs = 0;
    let noPriceRows = 0;

    for (const row of parsed) {
      if (row.price == null || Number.isNaN(row.price)) {
        noPriceRows++;
        continue;
      }

      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];
      if (docs.length === 0) {
        if (row.price == null || Number.isNaN(row.price)) {
          missingRows++;
          console.warn(`⚠ Missing no-price row (not inserted): ${row.line}`);
          continue;
        }
        const name = `${row.baseNameRaw} - ${row.sku} ${row.unit}`;
        const created = await Product.create({
          name: row.expectedName || name,
          description: row.baseNameRaw,
          sku: row.sku,
          unit: row.unit,
          price: row.price,
          category: { mainCategory: MAIN_CATEGORY },
          company_id: COMPANY_ID,
          stock: 0,
          minStock: 0,
          isActive: true,
          lastPriceChange: addPriceChangeSnapshot(0, row.price),
        });
        insertedDocs++;
        const arr = dbIndex.get(key) || [];
        arr.push(created);
        dbIndex.set(key, arr);
        console.log(`   + Inserted missing: ${name}`);
        continue;
      }

      for (const doc of docs) {
        const prev = Number(doc.price || 0);
        const patch = {};
        const expectedName = row.expectedName || doc.name;
        if (String(doc.name || "").trim() !== String(expectedName || "").trim()) {
          patch.name = expectedName;
          renamedDocs++;
        }
        const expectedDescription = row.baseNameRaw;
        if (String(doc.description || "").trim() !== String(expectedDescription || "").trim()) {
          patch.description = expectedDescription;
        }
        if (String(doc.sku || "") !== String(row.sku || "")) patch.sku = row.sku;
        if (String(doc.unit || "").toUpperCase() !== String(row.unit || "").toUpperCase()) patch.unit = row.unit;

        if (row.price != null && !Number.isNaN(row.price)) {
          if (prev !== row.price) {
            patch.price = row.price;
            patch.lastPriceChange = addPriceChangeSnapshot(prev, row.price);
            updatedDocs++;
          } else if (Object.keys(patch).length === 0) {
            unchangedDocs++;
            continue;
          } else {
            unchangedDocs++;
          }
        } else if (Object.keys(patch).length === 0) {
          unchangedDocs++;
          continue;
        }

        await Product.updateOne({ _id: doc._id }, { $set: patch });
      }
    }

    console.log("\n📊 Update summary:");
    console.log(`   Parsed rows: ${parsed.length}`);
    console.log(`   Rows with no price (kept as-is): ${noPriceRows}`);
    console.log(`   Updated documents: ${updatedDocs}`);
    console.log(`   Renamed documents: ${renamedDocs}`);
    console.log(`   Inserted missing documents: ${insertedDocs}`);
    console.log(`   Already correct documents: ${unchangedDocs}`);
    console.log(`   Missing rows (no DB match): ${missingRows}`);
  } finally {
    await disconnect();
  }
}

async function verifyDecorativeConcretePrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);
  }

  try {
    await connect();
    console.log(`🔎 Verifying "${MAIN_CATEGORY}" prices (company_id=${COMPANY_ID})`);

    const dbProducts = await loadDecorativeProducts();
    const dbIndex = buildDbIndex(dbProducts);

    const missing = [];
    const mismatches = [];
    const nameMismatches = [];
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
        const expectedName = String(row.expectedName || "").trim();
        if (expectedName && String(doc.name || "").trim() !== expectedName) {
          nameMismatches.push({
            row: row.line,
            expectedName,
            actualName: String(doc.name || ""),
            id: String(doc._id),
          });
        }
        const got = Number(doc.price || 0);
        if (row.price != null && !Number.isNaN(row.price)) {
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
    }

    console.log("\n📊 Verify summary:");
    console.log(`   Exact matches: ${matched}`);
    console.log(`   Missing rows: ${missing.length}`);
    console.log(`   Price mismatches: ${mismatches.length}`);
    console.log(`   Name mismatches: ${nameMismatches.length}`);
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
    if (nameMismatches.length > 0) {
      console.log("\n--- Name mismatches ---");
      nameMismatches.forEach((m) => {
        console.log(`   • expected: ${m.expectedName} | actual: ${m.actualName} | _id ${m.id}`);
      });
    }

    const ok = missing.length === 0 && mismatches.length === 0 && nameMismatches.length === 0;
    console.log(ok ? "\n✅ Verification passed." : "\n❌ Verification failed.");
    return { ok, missing, mismatches };
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  const verifyOnly = process.argv.includes("--verify");
  const run = verifyOnly ? verifyDecorativeConcretePrices : updateDecorativeConcretePrices;
  run()
    .then((res) => {
      if (verifyOnly && res && !res.ok) {
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
  updateDecorativeConcretePrices,
  verifyDecorativeConcretePrices,
};
