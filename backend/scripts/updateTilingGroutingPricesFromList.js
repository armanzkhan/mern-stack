// backend/scripts/updateTilingGroutingPricesFromList.js
// Updates "Tiling and Grouting Materials" from approved list.
// Run update: node backend/scripts/updateTilingGroutingPricesFromList.js
// Run verify: node backend/scripts/updateTilingGroutingPricesFromList.js --verify
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const MAIN_CATEGORY = "Tiling and Grouting Materials";
const COMPANY_ID = process.env.COMPANY_ID || process.env.PRODUCT_BULK_COMPANY_ID || "RESSICHEM";

const PRICE_LIST_TEXT = `
RESSI TA 210 20 KG kg 20 787
RESSI TA 210 PLUS 20 KG KG 20 1,109
RESSI TA 220 (WHITE) 20 KG KG 20 1,491
RESSI TA 230 (GREY) 20 KG KG 20 1,801
RESSI TA 230 (WHITE) 20 KG KG 20 2,678
RESSI TA 240 20 KG KG 20 3,842
RESSI TA 250 20 KG KG 20 3,985
RESSI TA 260 20 KG KG 20 4,910
RESSI TA 270 20 KG KG 20 1,437
RESSI TA 280 20 KG KG 20 6,783
RESSI TA 290 20 KG KG 20 7,863
RESSI TA 300 20 KG KG 20 3,317
Ressi TA Re Bond 245 KG 20 2,905
RESSI ETA 25 KG KG 25 15,434
RESSI ETA SF-1 32 KG KG 32 41,495
RESSI TA 0001 B 20 KG KG 20 4,206
RESSI TA QS - 1 20 KG KG 20 6,866
RESSI TG 810-0001 (BRIGHT WHITE) 1 KG KG 1 221
RESSI TG 810-0001 (BRIGHT WHITE) 15 KG KG 15 3,108
RESSI TG 810-1110 (IVORY) 1 KG KG 1 221
RESSI TG 810-1110 (IVORY) 15 KG KG 15 3,108
RESSI TG 810-8111 (DARK IVORY) 1 KG KG 1 221
RESSI TG 810-8111 (DARK IVORY) 15 KG KG 15 3,108
RESSI TG 810-1211 (BEIGE) 1 KG KG 1 221
RESSI TG 810-1211 (BEIGE) 15 KG KG 15 3,108
RESSI TG 810-1421 (DARK BEIGE) 1 KG KG 1 221
RESSI TG 810-1421 (DARK BEIGE) 15 KG KG 15 3,108
RESSI TG 810-1600 (YELLOW) 1 KG KG 1 221
RESSI TG 810-1600 (YELLOW) 15 KG KG 15 3,108
RESSI TG 810-3100 (PINK) 1 KG KG 1 221
RESSI TG 810-3100 (PINK) 15 KG KG 15 3,108
RESSI TG 810-3700 (TERRACOTTA) 1 KG KG 1 221
RESSI TG 810-3700 (TERRACOTTA) 15 KG KG 15 3,108
RESSI TG 810-4720 (BURGUNDY) 1 KG KG 1 221
RESSI TG 810-4720 (BURGUNDY) 15 KG KG 15 3,108
RESSI TG 810-5110 (LIGHT GREY) 1 KG KG 1 218
RESSI TG 810-5110 (LIGHT GREY) 15 KG KG 15 3,105
RESSI TG 810-5210-2 (MARBLE BEIGE) 1 KG KG 1 218
RESSI TG 810-5210-2 (MARBLE BEIGE) 15 KG KG 15 3,105
RESSI TG 810-9111-1 (DESSERT TAN) 1 KG KG 1 218
RESSI TG 810-9111-1 (DESSERT TAN) 15 KG KG 15 3,105
RESSI TG 810-6110 (OFF WHITE) 1 KG KG 1 218
RESSI TG 810-6110 (OFF WHITE) 15 KG KG 15 3,105
RESSI TG 810-6400 (PEACH) 1 KG KG 1 218
RESSI TG 810-6400 (PEACH) 15 KG KG 15 3,105
RESSI TG 810-1950 (MAPLE WOOD) 1 KG KG 1 218
RESSI TG 810-1950 (MAPLE WOOD) 15 KG KG 15 3,105
RESSI TG 810-9000 (GRAY) 1 KG KG 1 222
COLOUR CODE KG/LTR SKU APP PRICE
RESSI TG 810-9000 (GRAY) 15 KG KG 15 3,106
RESSI TG 810-9111 (ASH WHITE) 1 KG KG 1 222
RESSI TG 810-9111 (ASH WHITE) 15 KG KG 15 3,106
RESSI TG 810-9200 (DARK GREY) 1 KG KG 1 222
RESSI TG 810-9200 (DARK GREY) 15 KG KG 15 3,106
RESSI TG 810-9321 (BROWN) 1 KG KG 1 222
RESSI TG 810-9321 (BROWN) 15 KG KG 15 3,106
RESSI TG 810-9642 (DARK BROWN) 1 KG KG 1 222
RESSI TG 810-9642 (DARK BROWN) 15 KG KG 15 3,106
RESSI TG 810-9960 (BLACK) 1 KG KG 1 222
RESSI TG 810-9960 (BLACK) 15 KG KG 15 3,108
RESSI TG 810-2400 (LIGHT GREEN) 1 KG KG 1 234
RESSI TG 810-2400 (LIGHT GREEN) 15 KG KG 15 3,309
RESSI TG 810-2770 (AQUA GREEN) 1 KG KG 1 294
RESSI TG 810-2770 (AQUA GREEN) 15 KG KG 15 4,007
RESSI TG 810-5210-1 (SKY BLUE) 1 KG KG 1 265
RESSI TG 810-5210-1 (SKY BLUE) 15 KG KG 15 3,607
RESSI TG 810-5410-1 (AQUA BLUE) 1 KG KG 1 265
RESSI TG 810-5410-1 (AQUA BLUE) 15 KG KG 15 3,606
RESSI TG 810-5410 (DARK BLUE) 1 KG KG 1 598
RESSI TG 810-5410 (DARK BLUE) 15 KG KG 15 8,422
RESSI TG 810-5960 (INDIGO BLUE) 1 KG KG 1 842
RESSI TG 810-5960 (INDIGO BLUE) 15 KG KG 15 12,026
RESSI TG 810-5650 (PURPLE) 1 KG KG 1 265
RESSI TG 810-5650 (PURPLE) 15 KG KG 15 3,607
RESSI TG 820-0001 (BRIGHT WHITE) 1 KG KG 1 311
RESSI TG 820-0001 (BRIGHT WHITE) 15 KG KG 15 4,413
RESSI TG 820-1110 (IVORY) 1 KG KG 1 305
RESSI TG 820-1110 (IVORY) 15 KG KG 15 4,413
RESSI TG 820-8111 (DARK IVORY) 1 KG KG 1 305
RESSI TG 820-8111 (DARK IVORY) 15 KG KG 15 4,413
RESSI TG 820-1211 (BEIGE) 1 KG KG 1 305
RESSI TG 820-1211 (BEIGE) 15 KG KG 15 4,413
RESSI TG 820-1421 (DARK BEIGE) 1 KG KG 1 305
RESSI TG 820-1421 (DARK BEIGE) 15 KG KG 15 4,413
RESSI TG 820-1600 (YELLOW) 1 KG KG 1 305
RESSI TG 820-1600 (YELLOW) 15 KG KG 15 4,413
RESSI TG 820-2400 (LIGHT GREEN) 1 KG KG 1 311
RESSI TG 820-2400 (LIGHT GREEN) 15 KG KG 15 4,413
RESSI TG 820-2770 (AQUA GREEN) 1 KG KG 1 573
RESSI TG 820-2770 (AQUA GREEN) 15 KG KG 15 8,219
RESSI TG 820-3100 (PINK) 1 KG KG 1 311
RESSI TG 820-3100 (PINK) 15 KG KG 15 4,413
RESSI TG 820-3700 (TERRACOTTA) 1 KG KG 1 305
RESSI TG 820-3700 (TERRACOTTA) 15 KG KG 15 4,413
RESSI TG 820-4720 (BURGUNDY) 1 KG KG 1 598
RESSI TG 820-4720 (BURGUNDY) 15 KG KG 15 8,422
RESSI TG 820-5650 (PURPLE) 1 KG KG 1 573
RESSI TG 820-5650 (PURPLE) 15 KG KG 15 8,422
RESSI TG 820-5110 (LIGHT GREY) 1 KG KG 1 311
RESSI TG 820-5110 (LIGHT GREY) 15 KG KG 15 4,413
RESSI TG 820-5210-1 (SKY BLUE) 1 KG KG 1 338
RESSI TG 820-5210-1 (SKY BLUE) 15 KG KG 15 4,610
RESSI TG 820-5410-1 (AQUA BLUE) 1 KG KG 1 336
RESSI TG 820-5410-1 (AQUA BLUE) 15 KG KG 15 4,413
RESSI TG 820-5210-2 (MARBLE BEIGE) 1 KG KG 1 305
RESSI TG 820-5210-2 (MARBLE BEIGE) 15 KG KG 15 4,410
RESSI TG 820-9111-1 (DESSERT TAN) 1 KG KG 1 305
RESSI TG 820-9111-1 (DESSERT TAN) 15 KG KG 15 4,413
RESSI TG 820-5410 (DARK BLUE) 1 KG KG 1 776
RESSI TG 820-5410 (DARK BLUE) 15 KG KG 15 11,226
RESSI TG 820-5960 (INDIGO BLUE) 1 KG KG 1 1,110
RESSI TG 820-5960 (INDIGO BLUE) 15 KG KG 15 16,238
RESSI TG 820-6110 (OFF WHITE) 1 KG KG 1 305
RESSI TG 820-6110 (OFF WHITE) 15 KG KG 15 4,413
RESSI TG 820-6400 (PEACH) 1 KG KG 1 311
RESSI TG 820-6400 (PEACH) 15 KG KG 15 4,413
RESSI TG 820-1950 (MAPLE WOOD) 1 KG KG 1 604
RESSI TG 820-1950 (MAPLE WOOD) 15 KG KG 15 8,620
RESSI TG 820-9000 (GRAY) 1 KG KG 1 311
RESSI TG 820-9000 (GRAY) 15 KG KG 15 4,210
RESSI TG 820-9111 (ASH WHITE) 1 KG KG 1 311
RESSI TG 820-9111 (ASH WHITE) 15 KG KG 15 4,413
RESSI TG 820-9200 (DARK GREY) 1 KG KG 1 311
RESSI TG 820-9200 (DARK GREY) 15 KG KG 15 4,210
RESSI TG 820-9321 (BROWN) 1 KG KG 1 305
RESSI TG 820-9321 (BROWN) 15 KG KG 15 4,210
RESSI TG 820-9642 (DARK BROWN) 1 KG KG 1 604
RESSI TG 820-9642 (DARK BROWN) 15 KG KG 15 8,619
RESSI TG 820-9960 (BLACK) 1 KG KG 1 561
RESSI TG 820-9960 (BLACK) 15 KG KG 15 8,219
RESSI TG CR HIGH GLOSS-0001 (BRIGHT WHITE) 1.4 KG KG 1.4 6,682
RESSI TG CR HIGH GLOSS-1110 (IVORY) 1.4 KG KG 1.4 6,682
RESSI TG CR HIGH GLOSS-1211 (BEIGE) 1.4 KG KG 1.4 6,682
RESSI TG CR HIGH GLOSS-5110 (LIGHT GREY) 1.4 KG KG 1.4 6,682
RESSI TG CR HIGH GLOSS-5210-1 (SKY BLUE) 1.4 KG KG 1.4 6,682
RESSI TG CR HIGH GLOSS-9960 (BLACK) 1.4 KG KG 1.4 6,682
CR SEMI GLOSS-0001 (BRIGHT WHITE) 1.54 KG KG 1.54 7,482
CR SEMI GLOSS-1110 (IVORY) 1.54 KG KG 1.54 7,482
CR SEMI GLOSS-1211 (BEIGE) 1.54 KG KG 1.54 7,482
CR SEMI GLOSS-5110 (LIGHT GREY) 1.54 KG KG 1.54 7,482
CR SEMI GLOSS-5210-1 (SKY BLUE) 1.54 KG KG 1.54 7,482
CR SEMI GLOSS-9960 (BLACK) 1.54 KG KG 1.54 7,482
RESSI ETG DP MATT-0001 (BRIGHT WHITE) 1.6 KG KG 1.6 3,472
RESSI ETG DP MATT-1110 (IVORY) 1.6 KG KG 1.6 3,472
RESSI ETG DP MATT-1211 (BEIGE) 1.6 KG KG 1.6 3,472
RESSI ETG DP MATT-5110-1(LIGHT GREY) 1.6 KG KG 1.6 3,472
RESSI ETG DP MATT-5210 (SKY BLUE) 1.6 KG KG 1.6 3,472
RESSI ETG DP MATT-9960 (BLACK) 1.6 KG KG 1.6 3,472
RESSI TILE LATEX 1 LTR LTR 1 1,414
RESSI TILE LATEX 5 LTR LTR 5 6,551
RESSI TILE LATEX 10 LTR LTR 10 12,159
RESSI TILE LATEX 15 LTR LTR 15 17,040
RESSI TILE LATEX 25 LTR LTR 25 26,729
RESSI TILE LATEX 200 LTR LTR 200 208,485
RESSI GROUT LATEX 805 1 KG KG 1 1,548
RESSI GROUT LATEX 805 5 KG KG 5 7,353
RESSI GROUT LATEX 805 10 KG KG 10 13,630
RESSI GROUT LATEX 805 15 KG KG 15 18,710
RESSI GROUT LATEX 805 25 KG KG 30 34,883
RESSI GROUT LATEX 805 200 KG KG 200 227,196
RESSI TA 2K (GREY) 25 KG KG 25 4,945
RESSI TA 2K (WHITE) 25 KG KG 25 5,881
RESSI TA HPA 20 KG KG 20 30,738
RESSI GROUT SEAL 1 LTR LTR 1 2,470
RESSI GROUT SEAL 5 LTR LTR 5 11,360
RESSI GROUT SEAL 10 LTR LTR 10 21,383
RESSI GROUT SEAL 15 LTR LTR 15 30,738
RESSI GROUT SEAL 25 LTR LTR 25 50,117
RESSI GROUT SEAL 200 LTR LTR 200 340,792
RESSI GROUT ADMIX 1 LTR LTR 1 2,673
RESSI GROUT ADMIX 5 LTR LTR 5 12,028
RESSI GROUT ADMIX 10 LTR LTR 10 23,668
RESSI GROUT ADMIX 15 LTR LTR 15 32,743
RESSI GROUT ADMIX 25 LTR LTR 25 49,448
RESSI GROUT ADMIX 200 LTR LTR 200 367,521
RESSI TG 2K-0001 (BRIGHT WHITE) 1.5 KG KG 1.5 1,539
RESSI TG 2K-1110 (IVORY) 1.5 KG KG 1.5 1,539
RESSI TG 2K-1211 (BEIGE) 1.5 KG KG 1.5 1,539
RESSI TG 2K-5110 (LIGHT GREY) 1.5 KG KG 1.5 1,539
RESSI TG 2K-5210-1 (SKY BLUE) 1.5 KG KG 1.5 1,539
RESSI TG 2K-9960 (BLACK) 1.5 KG KG 1.5 1,539
RESSI TG BATH SEAL 2K-0001 (BRIGHT WHITE) 1.5 KG KG 1.5 1,873
RESSI TG BATH SEAL 2K-1110 (IVORY) 1.5 KG KG 1.5 1,873
RESSI TG BATH SEAL 2K-1211 (BEIGE) 1.5 KG KG 1.5 1,873
RESSI TG BATH SEAL 2K-5110 (LIGHT GREY) 1.5 KG KG 1.5 1,873
RESSI TG BATH SEAL 2K-5210-1 (SKY BLUE) 1.5 KG KG 1.5 1,873
RESSI TG BATH SEAL 2K-9960 (BLACK) 1.5 KG KG 1.5 1,873
Ressi EPO Grout Pro (Arctic White) ML 0.4 3,009
Ressi EPO Grout Pro (Midnight Noir) ML 0.4 3,076
Ressi EPO Grout Pro (Soft Ivory) ML 0.4 3,073
Ressi EPO Grout Pro (Walnut Brown) ML 0.4 3,073
Ressi EPO Grout Pro (Silver Spark) ML 0.4 3,073
Ressi EPO Grout Pro (Classic Copper) ML 0.4 3,073
Ressi EPO Grout Pro (Imperial Gold) ML 0.4 3,073
Ressi EPO Grout Pro (Desert Sand) ML 0.4 3,073
Ressi EPO Grout Pro (Coastal Blue) ML 0.4 3,073
Ressi EPO Grout Pro (Urban Ash) ML 0.4 3,073
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
    .replace(/\s*-\s*[0-9]+(?:\.[0-9]+)?\s*(KG|LTR|ML)\s*$/i, "")
    .trim();
}

function preprocessRawLines(text) {
  const raw = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  const continuationOnly = /^([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/;
  for (const line of raw) {
    const m = line.match(continuationOnly);
    if (m && out.length > 0) out[out.length - 1] = `${out[out.length - 1]} ${line}`;
    else out.push(line);
  }
  return out;
}

function parsePriceList() {
  const lines = preprocessRawLines(PRICE_LIST_TEXT);
  const parsed = [];
  const skipped = [];

  const formatA = /^(.+?)\s+([0-9]+(?:\.[0-9]+)?)\s+(KG|LTR|ML)\s+(KG|LTR|ML)\s+([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/i;
  const formatB = /^(.+?)\s+(KG|LTR|ML)\s+([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/i;

  for (const line of lines) {
    if (/^(COLOUR CODE|PRODCUT|PRODUCT)\b/i.test(line)) continue;

    let m = line.match(formatA);
    if (m) {
      const [, baseNameRaw, displaySizeRaw, displayUnitRaw, unitRaw, skuRaw, priceRaw] = m;
      const baseName = baseNameRaw.replace(/\s+/g, " ").trim();
      const expectedName = `${baseName} ${displaySizeRaw} ${displayUnitRaw}`.replace(/\s+/g, " ").trim();
      parsed.push({
        line,
        baseNameRaw: baseName,
        baseKey: canonicalBaseName(baseName),
        unit: String(unitRaw).toUpperCase(),
        sku: normalizeSku(skuRaw),
        price: priceRaw ? Number(String(priceRaw).replace(/,/g, "")) : null,
        expectedName,
      });
      continue;
    }

    m = line.match(formatB);
    if (m) {
      const [, baseNameRaw, unitRaw, skuRaw, priceRaw] = m;
      const baseName = baseNameRaw.replace(/\s+/g, " ").trim();
      const expectedName = `${baseName} ${unitRaw} ${skuRaw}`.replace(/\s+/g, " ").trim();
      parsed.push({
        line,
        baseNameRaw: baseName,
        baseKey: canonicalBaseName(baseName),
        unit: String(unitRaw).toUpperCase(),
        sku: normalizeSku(skuRaw),
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

async function loadProducts() {
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

function priceSnapshot(prev, next) {
  return {
    previousPrice: Number(prev || 0),
    newPrice: Number(next),
    changedByName: "Tiling and Grouting Materials price list (bulk)",
    changedByEmail: "system@ressichem.com",
    changedAt: new Date(),
  };
}

async function updateTilingGroutingPrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);
    skipped.forEach((l) => console.warn(`   - ${l}`));
  }

  try {
    await connect();
    console.log(`📦 Updating "${MAIN_CATEGORY}" (company_id=${COMPANY_ID})`);

    const dbProducts = await loadProducts();
    const dbIndex = buildDbIndex(dbProducts);

    let updatedPrices = 0;
    let renamed = 0;
    let insertedPriced = 0;
    let insertedNoPrice = 0;
    let unchanged = 0;

    for (const row of parsed) {
      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];

      if (docs.length === 0) {
        const hasPrice = row.price != null && !Number.isNaN(row.price);
        const created = await Product.create({
          name: row.expectedName,
          description: row.baseNameRaw,
          sku: row.sku,
          unit: row.unit,
          price: hasPrice ? row.price : 0,
          category: { mainCategory: MAIN_CATEGORY },
          company_id: COMPANY_ID,
          stock: 0,
          minStock: 0,
          isActive: true,
          ...(hasPrice ? { lastPriceChange: priceSnapshot(0, row.price) } : {}),
        });
        const list = dbIndex.get(key) || [];
        list.push(created);
        dbIndex.set(key, list);
        if (hasPrice) insertedPriced++;
        else insertedNoPrice++;
        continue;
      }

      for (const doc of docs) {
        const patch = {};
        if (String(doc.name || "").trim() !== String(row.expectedName || "").trim()) {
          patch.name = row.expectedName;
          renamed++;
        }
        if (String(doc.description || "").trim() !== String(row.baseNameRaw || "").trim()) {
          patch.description = row.baseNameRaw;
        }
        if (String(doc.sku || "") !== String(row.sku || "")) patch.sku = row.sku;
        if (String(doc.unit || "").toUpperCase() !== String(row.unit || "").toUpperCase()) patch.unit = row.unit;

        if (row.price != null && !Number.isNaN(row.price)) {
          const prev = Number(doc.price || 0);
          if (prev !== row.price) {
            patch.price = row.price;
            patch.lastPriceChange = priceSnapshot(prev, row.price);
            updatedPrices++;
          }
        }

        if (Object.keys(patch).length === 0) {
          unchanged++;
          continue;
        }
        await Product.updateOne({ _id: doc._id }, { $set: patch });
      }
    }

    console.log("\n📊 Update summary:");
    console.log(`   Parsed rows: ${parsed.length}`);
    console.log(`   Updated prices: ${updatedPrices}`);
    console.log(`   Renamed docs: ${renamed}`);
    console.log(`   Inserted priced rows: ${insertedPriced}`);
    console.log(`   Inserted no-price rows (price=0): ${insertedNoPrice}`);
    console.log(`   Already correct docs: ${unchanged}`);
  } finally {
    await disconnect();
  }
}

async function verifyTilingGroutingPrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);

  try {
    await connect();
    console.log(`🔎 Verifying "${MAIN_CATEGORY}" (company_id=${COMPANY_ID})`);
    const dbProducts = await loadProducts();
    const dbIndex = buildDbIndex(dbProducts);

    const missing = [];
    const priceMismatches = [];
    const nameMismatches = [];
    let priceMatches = 0;
    let noPriceRows = 0;

    for (const row of parsed) {
      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];
      if (docs.length === 0) {
        missing.push(row.line);
        continue;
      }

      for (const doc of docs) {
        if (String(doc.name || "").trim() !== String(row.expectedName || "").trim()) {
          nameMismatches.push({
            expected: row.expectedName,
            actual: String(doc.name || ""),
            id: String(doc._id),
          });
        }
        if (row.price == null || Number.isNaN(row.price)) {
          noPriceRows++;
          continue;
        }
        const got = Number(doc.price || 0);
        if (got !== row.price) {
          priceMismatches.push({
            expected: row.price,
            actual: got,
            line: row.line,
            id: String(doc._id),
          });
        } else {
          priceMatches++;
        }
      }
    }

    console.log("\n📊 Verify summary:");
    console.log(`   Exact price matches: ${priceMatches}`);
    console.log(`   Missing rows: ${missing.length}`);
    console.log(`   Price mismatches: ${priceMismatches.length}`);
    console.log(`   Name mismatches: ${nameMismatches.length}`);
    console.log(`   Rows with no price in list: ${noPriceRows}`);

    if (missing.length > 0) {
      console.log("\n--- Missing rows ---");
      missing.forEach((m) => console.log(`   • ${m}`));
    }
    if (priceMismatches.length > 0) {
      console.log("\n--- Price mismatches ---");
      priceMismatches.forEach((m) => console.log(`   • ${m.line} -> expected ${m.expected}, actual ${m.actual}`));
    }
    if (nameMismatches.length > 0) {
      console.log("\n--- Name mismatches ---");
      nameMismatches.forEach((m) => console.log(`   • expected "${m.expected}" | actual "${m.actual}"`));
    }

    const ok = missing.length === 0 && priceMismatches.length === 0 && nameMismatches.length === 0;
    console.log(ok ? "\n✅ Verification passed." : "\n❌ Verification failed.");
    return { ok, missing, priceMismatches, nameMismatches };
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  const verify = process.argv.includes("--verify");
  const run = verify ? verifyTilingGroutingPrices : updateTilingGroutingPrices;
  run()
    .then((res) => {
      if (verify && res && !res.ok) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Script failed:", err);
      process.exit(1);
    });
}

module.exports = { parsePriceList, updateTilingGroutingPrices, verifyTilingGroutingPrices };
