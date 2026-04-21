// backend/scripts/updateDryMixMortarsPremixPrices.js
// Updates "Dry Mix Mortars / Premix Plasters" from approved list.
// Run update: node backend/scripts/updateDryMixMortarsPremixPrices.js
// Run verify: node backend/scripts/updateDryMixMortarsPremixPrices.js --verify
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const MAIN_CATEGORY = "Dry Mix Mortars / Premix Plasters";
const COMPANY_ID = process.env.COMPANY_ID || process.env.PRODUCT_BULK_COMPANY_ID || "RESSICHEM";

const PRICE_LIST_TEXT = `
RESSI DECOREND 20000 C-0001 (WHITE) 1 KG KG 1 359
RESSI DECOREND 20000 C-0001 (WHITE) 12 KG KG 12 3,647
RESSI DECOREND 20000 C-9000 W (DARK FAIR FACE CONCRETE) 1 KG KG 1 359
RESSI DECOREND 20000 C-9000 W (DARK FAIR FACE CONCRETE) 12 KG KG 12 3,647
RESSI DECOREND 20000 C-7000 W (FAIR FACE CONCRETE) 1 KG KG 1 359
RESSI DECOREND 20000 C-7000 W (FAIR FACE CONCRETE) 12 KG KG 12 3,647
RESSI DECOREND 20000 C-9111 (ASH WHITE) 1 KG KG 1 359
RESSI DECOREND 20000 C-9111 (ASH WHITE) 12 KG KG 12 3,647
RESSI DECOREND 20000 C-8500 (DESSERT SAND 3) 1 KG KG 1 359
RESSI DECOREND 20000 C-8500 (DESSERT SAND 3) 12 KG KG 12 3,647
RESSI DECOREND 20000 C-1200 (DESSERT SAND 1) 1 KG KG 1 359
RESSI DECOREND 20000 C-1200 (DESSERT SAND 1) 12 KG KG 12 3,462
RESSI PLASTOREND 100-0001 B (BRILLIANT WHITE) 50 KG KG 50 8,036
RESSI PLASTOREND 100-0001 (WHITE) 50 KG KG 50 7,665
RESSI PLASTOREND 100-0003 (MED WHITE) 50 KG KG 50 7,047
RESSI PLASTOREND 100-8400-1 HD (ADOBE BUFF) 50 KG KG 50 7,665
RESSI PLASTOREND 100-1100(DESSERT SAND 3) 50 KG KG 50 7,665
RESSI PLASTOREND 100-1101 (DESSERT SAND 4) 50 KG KG 50 7,665
RESSI PLASTOREND 100-9111 TG (ASH WHITE 1) 50 KG KG 50 7,665
RESSI PLASTOREND 100-6110 TG (ASH WHITE 2) 50 KG KG 50 7,665
RESSI PLASTOREND 100-1111 (DESSERT SAND 5) 50 KG KG 50 7,665
RESSI PLASTOREND 100-1211-2 (DIRTY WHITE) 50 KG KG 50 7,665
RESSI PLASTOREND 100-1200 (DESSERT SAND 1 ) 50 KG KG 50 7,665
RESSI PLASTOREND 100-1210 (DESSERT SAND 2) 50 KG KG 50 7,665
RESSI PLASTOREND 100-7000 W (F/F CEMENT MEDIUM) 50 KG KG 50 7,294
RESSI PLASTOREND 100-7000 WL (F/F CEMENT LIGHT) 50 KG KG 50 7,294
RESSI PLASTOREND 100-9000 W ( F/F CEMENT) 50 KG KG 50 7,665
RESSI PLASTOREND 100-GRG (GREY 2) 50 KG KG 50 7,665
RESSI PLASTOREND 100-9210 (GREY 3) 50 KG KG 50 7,665
RESSI PLASTOREND 100-9110 W (MEDIUM GREY ) 50 KG KG 50 7,665
RESSI PLASTOREND 100-TG (LIGHT GREY) 50 KG KG 50 7,665
RESSI PLASTOREND 100-9311 HD (GREY 1) 50 KG KG 50 7,665
RESSI PLASTOREND 100-GOG (LIGHT GREY 2) 50 KG KG 50 7,665
RESSI PLASTOREND 100-NW ( ULTRA LIGHT PINK) 50 KG KG 50 7,665
RESSI PLASTOREND 100-1211 (BIEGE) 50 KG KG 50 7,665
RESSI PLASTOREND 100-CHG (LIGHT WALNUT BROWN) 50 KG KG 50 7,665
RESSI PLASTOREND 100-3990 X 9 (RED) 50 KG KG 50 11,621
RESSI PLASTOREND 100-6800 (DARK ORANGE) 50 KG KG 50 11,744
RESSI PLASTOREND 100-6400 (LIGHT ORANGE) 50 KG KG 50 7,294
RESSI PLASTOREND 100-3400 (PINK) 50 KG KG 50 7,294
RESSI PLASTOREND 100-8820 X 2 HD (WHEATISH 1) 50 KG KG 50 7,294
RESSI PLASTOREND 100-1320 (WHEATISH 2) 50 KG KG 50 7,294
RESSI PLASTOREND 100-1220 (WHEATISH 3) 50 KG KG 50 7,294
RESSI PLASTOREND 100-CHW (WHEATISH 4) 50 KG KG 50 7,294
RESSI PLASTOREND 100-8810 X 1 (WHEATISH 5) 50 KG KG 50 7,294
RESSI PLASTOREND 100-8500 HD (DESSERT SAND 3) 50 KG KG 50 7,294
RESSI PLASTOREND 100-5211 (LIGHT SKY BLUE) 50 KG KG 50 7,294
RESSI PLASTOREND 100-5210 (SKY BLUE) 50 KG KG 50 7,294
RESSI PLASTOREND 110-0001 B (BRILLIANT WHITE) 50 KG KG 50 8,901
RESSI PLASTOREND 110-0001 (WHITE) 50 KG KG 50 8,159
COLOUR CODE KG/LTR SKU APP PRICE
RESSI PLASTOREND 110-0003 (MED WHITE) 50 KG KG 50 8,159
RESSI PLASTOREND 110-8400-1 HD (ADOBE BUFF) 50 KG KG 50 8,159
RESSI PLASTOREND 110-1100 (DESSERT SAND 3) 50 KG KG 50 8,159
RESSI PLASTOREND 110-1101 (DESSERT SAND 4) 50 KG KG 50 8,159
RESSI PLASTOREND 110-9111 TG (ASH WHITE 1) 50 KG KG 50 8,159
RESSI PLASTOREND 110-6110 TG (ASH WHITE 2) 50 KG KG 50 8,159
RESSI PLASTOREND 110-1111 (DESSERT SAND 5) 50 KG KG 50 8,159
RESSI PLASTOREND 110-1211-2 (DIRTY WHITE) 50 KG KG 50 8,159
RESSI PLASTOREND 110-1200 (DESSERT SAND 1) 50 KG KG 50 7,665
RESSI PLASTOREND 110-1210 ( DESSERT SAND 2) 50 KG KG 50 7,541
RESSI PLASTOREND 110-7000 W (F/F CEMENT MEDIUM) 50 KG KG 50 7,541
RESSI PLASTOREND 110-7000 WL (F/F CEMENT LIGHT) 50 KG KG 50 7,541
RESSI PLASTOREND 110-9000 W (FAIR FACE CEMENT) 50 KG KG 50 7,541
RESSI PLASTOREND 110-GRG (GREY2) 50 KG KG 50 7,541
RESSI PLASTOREND 110-9210 W (GREY 3) 50 KG KG 50 7,541
RESSI PLASTOREND 110-9110 W (MEDIUM GREY) 50 KG KG 50 7,541
RESSI PLASTOREND 110-TG (LIGHT GREY) 50 KG KG 50 7,541
RESSI PLASTOREND 110-9311 HD ( GREY 1) 50 KG KG 50 7,541
RESSI PLASTOREND 110-GOG (LIGHT GREY 2) 50 KG KG 50 7,541
RESSI PLASTOREND 110-NW (ULTRA LIGHT PINK 50 KG KG 50 7,665
RESSI PLASTOREND 110-1211 (BIEGE) 50 KG KG 50 7,541
RESSI PLASTOREND 110-CHG (LIGHT WALNUT BROWN) 50 KG KG 50 7,541
RESSI PLASTOREND 110-3990 X 9 (RED) 50 KG KG 50 11,621
RESSI PLASTOREND 110-6800 (DARK ORANGE) 50 KG KG 50 11,744
RESSI PLASTOREND 110-6400 (LIGHT ORANGE) 50 KG KG 50 7,418
RESSI PLASTOREND 110-3400 (PINK) 50 KG KG 50 7,418
RESSI PLASTOREND 110-8820 X 2 HD (WHEATISH1) 50 KG KG 50 7,418
RESSI PLASTOREND 110-1320 (WHEATISH 2) 50 KG KG 50 7,418
RESSI PLASTOREND 110-1220 (WHEATISH 3) 50 KG KG 50 7,418
RESSI PLASTOREND 110-CHW (WHEATISH 4) 50 KG KG 50 7,418
RESSI PLASTOREND 110-8810 X 1 (WHEATISH 5) 50 KG KG 50 7,418
RESSI PLASTOREND 110-8500 HD (DESSERT SAND 3) 50 KG KG 50 7,418
RESSI PLASTOREND 110-5211 ( LIGHT SKY BLUE) 50 KG KG 50 7,418
RESSI PLASTOREND 110-5210 (SKY BLUE) 50 KG KG 50 7,418
RESSI PLASTOREND 120 (MARKET GRADE) 50 KG KG 50 1,545
RESSI PLASTOREND 120 (MACHINE GRADE)-GREY AND WHITE BASE 50 KG KG 50 2,534
RESSI PLASTOREND 120 C-0001 B (BRILLIANT WHITE) 50 KG KG 50 4,451
RESSI PLASTOREND 120 C-0001 (WHITE) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-0003 (MED WHITE) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-8400-1 HD (ADOBE BUFF) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-1100 (DESSERT SAND 3) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-1101 (DESSERT SAND 4) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-9111 TG (ASH WHITE 1) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-6110 TG (ASH WHITE 2) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-1111 ( DESSERT SAND 5) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-1211-2 (DIRTY WHITE) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-1200 (DESSERT SAND 1) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-1210 ( DESSERT SAND 2) 50 KG KG 50 3,894
RESSI PLASTOREND 120 C-7000 W (F/F CEMENT MEDIUM) 50 KG KG 50 3,523
RESSI PLASTOREND 120 C-7000 WL (F/F CEMENT LIGHT) 50 KG KG 50 3,214
RESSI PLASTOREND 120 C-9000 W ( F/F CEMENT) 50 KG KG 50 3,709
RESSI PLASTOREND 120 C-GRG (GREY 2) 50 KG KG 50 3,771
RESSI PLASTOREND 120 C-9210 (GREY 3) 50 KG KG 50 3,771
RESSI PLASTOREND 120 C-9110 W (MEDIUM GREY) 50 KG KG 50 3,771
RESSI PLASTOREND 120 C-9311 HD (GREY 1) 50 KG KG 50 3,647
RESSI PLASTOREND 120 C-GOG (LIGHT GREY 2) 50 KG KG 50 3,771
RESSI PLASTOREND 120 C-NW (ULTRA LIGHT PINK) 50 KG KG 50 3,771
RESSI PLASTOREND 120 C-1211 (BEIGE) 50 KG KG 50 3,771
RESSI PLASTOREND 120 C-CHG (LIGHT WALNUT BROWN) 50 KG KG 50 3,771
RESSI PLASTOREND 120 C-3990 X 9 (RED) 50 KG KG 50 5,934
RESSI PLASTOREND 120 C-6800 (DARK ORANGE) 50 KG KG 50 4,945
RESSI PLASTOREND 120 C-6400 (LIGHT ORANGE) 50 KG KG 50 5,440
RESSI PLASTOREND 120 C-3400 (PINK) 50 KG KG 50 5,563
RESSI PLASTOREND 120 C-8820 X 2 HD (WHEATISH 1) 50 KG KG 50 3,709
RESSI PLASTOREND 120 C-1320 (WHEATISH 2) 50 KG KG 50 4,945
RESSI PLASTOREND 120 C-1220 (WHEATISH 3) 50 KG KG 50 3,709
RESSI PLASTOREND 120 C-CHW (WHEATISH 4) 50 KG KG 50 3,709
RESSI PLASTOREND 120 C-8810 X 1 (WHEATISH 5) 50 KG KG 50 3,709
RESSI PLASTOREND 120 C-8500 HD (DESSERT SAND 3) 50 KG KG 50 3,709
RESSI PLASTOREND 120 C-5211 (LIGHT SKY BLUE) 50 KG KG 50 3,585
RESSI PLASTOREND 120 C-5210 (SKY BLUE) 50 KG KG 50 4,945
RESSI SC 310-0001 (PASTY WHITE) 50 KG KG 50 14,835
RESSI SC 310-1100 (HARVEST SAND) 50 KG KG 50 9,025
RESSI SC 310-8400-1 (ADOBE BUFF) 50 KG KG 50 8,036
RESSI SC 310-8500 (SAND STONE) 50 KG KG 50 8,036
RESSI SC 310-8700 (STEADMAN BUFF) 50 KG KG 50 8,036
RESSI SC 310-8820 X 2 (BT DESSERT TAN 1) 50 KG KG 50 8,036
RESSI SC 310-1422 (SUN BUFF) 50 KG KG 50 8,036
RESSI SC 310-8900 (SAND BUFF) 50 KG KG 50 8,036
RESSI SC 310-8810 X 1 (NUTMEG) 50 KG KG 50 8,036
RESSI SC 310-8920 X 2 (DESSERT TAN 2) 50 KG KG 50 8,036
RESSI SC 310-1950 X 2 (MAPEL WOOD) 50 KG KG 50 11,744
RESSI SC 310-3110 X 4 (MISTSY WAVE) 50 KG KG 50 8,036
RESSI SC 310-9110 W (MEDIUM GREY 1) 50 KG KG 50 8,036
RESSI SC 310-7000 W (FAIR FACE GREY ) 50 KG KG 50 8,159
RESSI SC 310-9311 (GREY 1) 50 KG KG 50 8,036
RESSI SC 310-9640 (LIGHT GREY) 50 KG KG 50 8,036
RESSI SC 310-9400 (GREY) 50 KG KG 50 8,036
RESSI SC 310-9600 (MEDIUM GREY 2) 50 KG KG 50 8,036
RESSI SC 310-9620 ( SMOKEY GREY) 50 KG KG 50 8,036
RESSI SC 310-9700 (SUN GREY) 50 KG KG 50 8,036
RESSI SC 310-9522 (PHILLY GREY) 50 KG KG 50 8,036
RESSI SC 310-9800 (CHARCOAL) 50 KG KG 50 11,374
RESSI SC 310-9960 (BLACK) 50 KG KG 50 11,374
RESSI SC 310-3400 X 4 (CORAL) 50 KG KG 50 8,036
RESSI SC 310-3700 X 4 (BRICK RED) 50 KG KG 50 11,374
RESSI SC 310-3900 X 1-1 (TERRACOTTA) 50 KG KG 50 11,374
RESSI SC 310-3900 X 1 (RED WOOD) 50 KG KG 50 9,890
RESSI SC 310-4740 (AUTUMN BROWN) 50 KG KG 50 11,744
RESSI SC 310-4810 X 4 (CHESNUT) 50 KG KG 50 11,744
RESSI SC 310-4900 (WALNUT) 50 KG KG 50 11,744
RESSI SC 310-1762 (WACCAMAW) 50 KG KG 50 10,508
Ressi Lime O Might 8000 KG 50
RESSI PFS 620 50 KG KG 50 2,163
RESSI GYPS O MIGHT 9000 50 KG KG 50
RESSI SLS 610 20 KG KG 20 5,192
RESSI SLS 610 50 KG KG 50 12,981
RESSI SLS PRIMER 1 KG KG
1 890
RESSI SLS PRIMER 5 KG KG
5 3,523
RESSI SLS PRIMER 10 KG KG 10 6,429
RESSI SLS PRIMER 15 KG KG 15 9,025
RESSI SLS PRIMER 25 KG KG 25 14,835
RESSI SLS PRIMER 200 KG KG 200 117,444
RESSI BLM 510 50 KG KG 50 2,225
RESSI BRC 7000 50 KG KG 50 4,080
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

function preprocessRawLines(text) {
  const raw = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  const continuationOnly = /^([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/;
  for (const line of raw) {
    const m = line.match(continuationOnly);
    if (m && out.length > 0) {
      out[out.length - 1] = `${out[out.length - 1]} ${line}`;
    } else {
      out.push(line);
    }
  }
  return out;
}

function parsePriceList() {
  const lines = preprocessRawLines(PRICE_LIST_TEXT);
  const parsed = [];
  const skipped = [];

  const formatA = /^(.+?)\s+([0-9]+(?:\.[0-9]+)?)\s+(KG|LTR)\s+(KG|LTR)\s+([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/i;
  const formatB = /^(.+?)\s+(KG|LTR)\s+([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+))?$/i;

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
        displaySize: normalizeSku(displaySizeRaw),
        displayUnit: String(displayUnitRaw).toUpperCase(),
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
        displaySize: normalizeSku(skuRaw),
        displayUnit: String(unitRaw).toUpperCase(),
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

async function loadDryMixProducts() {
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
    changedByName: "Dry Mix Mortars / Premix Plasters price list (bulk)",
    changedByEmail: "system@ressichem.com",
    changedAt: new Date(),
  };
}

async function updateDryMixPrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);
    skipped.forEach((l) => console.warn(`   - ${l}`));
  }

  try {
    await connect();
    console.log(`📦 Updating "${MAIN_CATEGORY}" (company_id=${COMPANY_ID})`);

    const dbProducts = await loadDryMixProducts();
    const dbIndex = buildDbIndex(dbProducts);

    let updatedDocs = 0;
    let renamedDocs = 0;
    let unchangedDocs = 0;
    let insertedWithPrice = 0;
    let insertedNoPrice = 0;
    let missingRows = 0;

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
          ...(hasPrice ? { lastPriceChange: addPriceChangeSnapshot(0, row.price) } : {}),
        });
        const list = dbIndex.get(key) || [];
        list.push(created);
        dbIndex.set(key, list);
        if (hasPrice) insertedWithPrice++;
        else insertedNoPrice++;
        continue;
      }

      for (const doc of docs) {
        const patch = {};
        const expectedName = String(row.expectedName || "").trim();
        if (String(doc.name || "").trim() !== expectedName) {
          patch.name = expectedName;
          renamedDocs++;
        }
        const expectedDescription = String(row.baseNameRaw || "").trim();
        if (String(doc.description || "").trim() !== expectedDescription) {
          patch.description = expectedDescription;
        }
        if (String(doc.sku || "") !== String(row.sku || "")) patch.sku = row.sku;
        if (String(doc.unit || "").toUpperCase() !== String(row.unit || "").toUpperCase()) patch.unit = row.unit;

        if (row.price != null && !Number.isNaN(row.price)) {
          const prev = Number(doc.price || 0);
          if (prev !== row.price) {
            patch.price = row.price;
            patch.lastPriceChange = addPriceChangeSnapshot(prev, row.price);
            updatedDocs++;
          }
        }

        if (Object.keys(patch).length === 0) {
          unchangedDocs++;
          continue;
        }

        await Product.updateOne({ _id: doc._id }, { $set: patch });
      }
    }

    console.log("\n📊 Update summary:");
    console.log(`   Parsed rows: ${parsed.length}`);
    console.log(`   Updated prices: ${updatedDocs}`);
    console.log(`   Renamed docs: ${renamedDocs}`);
    console.log(`   Inserted priced rows: ${insertedWithPrice}`);
    console.log(`   Inserted no-price rows (price=0): ${insertedNoPrice}`);
    console.log(`   Already correct docs: ${unchangedDocs}`);
    console.log(`   Missing rows (unhandled): ${missingRows}`);
  } finally {
    await disconnect();
  }
}

async function verifyDryMixPrices() {
  const { parsed, skipped } = parsePriceList();
  if (skipped.length > 0) {
    console.warn(`⚠ Skipped ${skipped.length} unparsable line(s).`);
  }

  try {
    await connect();
    console.log(`🔎 Verifying "${MAIN_CATEGORY}" (company_id=${COMPANY_ID})`);

    const dbProducts = await loadDryMixProducts();
    const dbIndex = buildDbIndex(dbProducts);

    const missing = [];
    const priceMismatches = [];
    const nameMismatches = [];
    let matchedPriceRows = 0;
    let noPriceRows = 0;

    for (const row of parsed) {
      const key = makeKey(row.baseKey, row.sku, row.unit);
      const docs = dbIndex.get(key) || [];
      if (docs.length === 0) {
        missing.push(row.line);
        continue;
      }

      for (const doc of docs) {
        const expectedName = String(row.expectedName || "").trim();
        if (String(doc.name || "").trim() !== expectedName) {
          nameMismatches.push({
            line: row.line,
            expected: expectedName,
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
            line: row.line,
            expected: row.price,
            actual: got,
            id: String(doc._id),
          });
        } else {
          matchedPriceRows++;
        }
      }
    }

    console.log("\n📊 Verify summary:");
    console.log(`   Exact price matches: ${matchedPriceRows}`);
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
      priceMismatches.forEach((m) => {
        console.log(`   • expected ${m.expected}, actual ${m.actual} | ${m.line} | _id ${m.id}`);
      });
    }
    if (nameMismatches.length > 0) {
      console.log("\n--- Name mismatches ---");
      nameMismatches.forEach((m) => {
        console.log(`   • expected "${m.expected}" | actual "${m.actual}" | _id ${m.id}`);
      });
    }

    const ok =
      missing.length === 0 &&
      priceMismatches.length === 0 &&
      nameMismatches.length === 0;
    console.log(ok ? "\n✅ Verification passed." : "\n❌ Verification failed.");
    return { ok, missing, priceMismatches, nameMismatches };
  } finally {
    await disconnect();
  }
}

if (require.main === module) {
  const verifyOnly = process.argv.includes("--verify");
  const run = verifyOnly ? verifyDryMixPrices : updateDryMixPrices;
  run()
    .then((result) => {
      if (verifyOnly && result && !result.ok) process.exit(1);
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Script failed:", err);
      process.exit(1);
    });
}

module.exports = {
  parsePriceList,
  updateDryMixPrices,
  verifyDryMixPrices,
};
