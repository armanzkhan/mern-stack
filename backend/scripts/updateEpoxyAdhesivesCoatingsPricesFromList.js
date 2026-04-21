// backend/scripts/updateEpoxyAdhesivesCoatingsPricesFromList.js
// Updates "Epoxy Adhesives and Coatings" from approved list.
// Run update: node backend/scripts/updateEpoxyAdhesivesCoatingsPricesFromList.js
// Run verify: node backend/scripts/updateEpoxyAdhesivesCoatingsPricesFromList.js --verify
require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const { connect, disconnect } = require("../config/_db");
const Product = require("../models/Product");

const MAIN_CATEGORY = "Epoxy Adhesives and Coatings";
const COMPANY_ID = process.env.COMPANY_ID || process.env.PRODUCT_BULK_COMPANY_ID || "RESSICHEM";
const UNITS = new Set(["KG", "LTR", "ML", "GM"]);

const PRICE_LIST_TEXT = `
ZEPOXY RER 128 1 KG KG 1 1,870
ZEPOXY RER 128 5 KG KG 5 9,075
ZEPOXY RER 128 10 KG KG 10 17,600
ZEPOXY RER 128 30 KG KG 30 49,500
ZEPOXY RER 128 230 KG KG 230 349,140
ZEPOXY RER 128 Y 1 KG KG 1 1,595
ZEPOXY RER 128 Y 5 KG KG 5 7,590
ZEPOXY RER 128 Y 10 KG KG 10 13,750
ZEPOXY RER 128 Y 30 KG KG 30 37,950
ZEPOXY RER 128 Y 230 KG KG 230 293,480
ZEPOXY RER 136 1 KG KG 1 1,870
ZEPOXY RER 136 5 KG KG 5 9,020
ZEPOXY RER 136 10 KG KG 10 17,050
ZEPOXY RER 136 30 KG KG 30 45,540
ZEPOXY RER 136 230 KG KG 230 331,430
ZEPOXY RER 011 X 75 1 KG KG 1 1,518
ZEPOXY RER 011 X 75 5 KG KG 5 7,150
ZEPOXY RER 011 X 75 10 KG KG 10 12,980
ZEPOXY RER 011 X 75 30 KG KG 30 35,640
ZEPOXY RER 011 X 75 200 KG KG 200 246,400
ZEPOXY RER 816 1 KG KG 1 2,167
ZEPOXY RER 816 5 KG KG 5 10,560
ZEPOXY RER 816 10 KG KG 10 19,470
ZEPOXY RER 816 30 KG KG 30 56,760
ZEPOXY RER 816 200 KG KG 200 345,400
ZEPOXY RER 816 Y 1 KG KG 1 1,958
ZEPOXY RER 816 Y 5 KG KG 5 9,075
ZEPOXY RER 816 Y 10 KG KG 10 17,600
ZEPOXY RER 816 Y 30 KG KG 30 51,150
ZEPOXY RER 816 Y 200 KG KG 230 308,000
ZEPOXY RER 126 1 KG KG 1 1,980
ZEPOXY RER 126 5 KG KG 5 9,625
ZEPOXY RER 126 10 KG KG 10 18,150
ZEPOXY RER 126 30 KG KG 30 51,150
ZEPOXY RER 126 230 KG KG 230 366,850
ZEPOXY RER AW 106 1 KG KG 1 2,591
ZEPOXY RER AW 106 5 KG KG 5 12,815
ZEPOXY RER AW 106 10 KG KG 10 25,410
ZEPOXY RER AW 106 30 KG KG 30 74,745
ZEPOXY RER AW 106 230 KG KG 230 566,720
ZEPOXY WR 110 1 KG KG 1 1,485
ZEPOXY WR 110 5 KG KG 5 7,288
ZEPOXY WR 110 10 KG KG 10 14,300
ZEPOXY WR 110 30 KG KG 30 41,580
Epoxy Adhesives and Coatings (Industrial)
Price List as on 16- March - 2026
PRODUCT KG/LTR SKU
ZEPOXY WR 110 200 KG KG 200 271,700
ZEPOXY WR 220 1 KG KG 1 1,513
ZEPOXY WR 220 5 KG KG 5 7,370
ZEPOXY WR 220 10 KG KG 10 14,300
ZEPOXY WR 220 30 KG KG 30 40,920
ZEPOXY WR 220 200 KG KG 200 266,200
ZEPOXY REH 140 1 KG KG 1 2,145
ZEPOXY REH 140 5 KG KG 5 10,340
ZEPOXY REH 140 10 KG KG 10 20,350
ZEPOXY REH 140 25 KG KG 25 49,500
ZEPOXY REH 140 200 KG KG 200 330,000
ZEPOXY REH 140-LVD 1 KG KG 1 2,035
ZEPOXY REH 140-LVD 5 KG KG 5 10,038
ZEPOXY REH 140-LVD 10 KG KG 10 19,800
ZEPOXY REH 140-LVD 25 KG KG 25 48,400
ZEPOXY REH 140-LVD 200 KG KG 200 382,800
ZEPOXY REH 125 1 KG KG 1 3,207
ZEPOXY REH 125 5 KG KG 5 15,895
ZEPOXY REH 125 10 KG KG 10 31,570
ZEPOXY REH 125 25 KG KG 25 77,825
ZEPOXY REH 125 200 KG KG 200 617,100
ZEPOXY REH 115 1 KG KG 1 2,046
ZEPOXY REH 115 5 KG KG 5 10,038
ZEPOXY REH 115 10 KG KG 10 19,800
ZEPOXY REH 115 25 KG KG 25 47,300
ZEPOXY REH 115 200 KG KG 200 332,200
ZEPOXY REH 147 1 KG KG 1 1,925
ZEPOXY REH 147 5 KG KG 5 9,515
ZEPOXY REH 147 10 KG KG 10 18,810
ZEPOXY REH 147 25 KG KG 25 45,925
ZEPOXY REH 147 200 KG KG 200 365,200
ZEPOXY REH 148 1 KG KG 1 2,090
ZEPOXY REH 148 5 KG KG 5 10,175
ZEPOXY REH 148 10 KG KG 10 19,800
ZEPOXY REH 148 25 KG KG 25 48,125
ZEPOXY REH 148 200 KG KG 200 312,400
ZEPOXY REH 149 1 KG KG 1 2,090
ZEPOXY REH 149 5 KG KG 5 10,175
ZEPOXY REH 149 10 KG KG 10 19,800
ZEPOXY REH 149 25 KG KG 25 48,125
ZEPOXY REH 149 200 KG KG 200 359,700
ZEPOXY REH 953 U 1 KG KG 1 2,657
ZEPOXY REH 953 U 5 KG KG 5 13,173
ZEPOXY REH 953 U 10 KG KG 10 26,070
ZEPOXY REH 953 U 25 KG KG 25 63,113
ZEPOXY REH 953 U 200 KG KG 200 499,400
ZEPOXY REH 160 1 KG KG 1 2,184
ZEPOXY REH 160 5 KG KG 5 10,780
ZEPOXY REH 160 10 KG KG 10 21,340
ZEPOXY REH 160 25 KG KG 25 52,388
ZEPOXY REH 160 200 KG KG 200 413,600
ZEPOXY REH 161 1 KG KG 1 2,244
ZEPOXY REH 161 5 KG KG 5 11,110
ZEPOXY REH 161 10 KG KG 10 21,945
ZEPOXY REH 161 25 KG KG 25 53,625
ZEPOXY REH 161 200 KG KG 200 424,600
ZEPOXY REH 205 1 KG KG 1 2,200
ZEPOXY REH 205 5 KG KG 5 10,450
ZEPOXY REH 205 10 KG KG 10 20,900
ZEPOXY REH 205 15 KG KG 15 29,700
ZEPOXY REH 205 200 KG KG 200 334,400
ZEPOXY REH 206 1 KG KG 1 2,151
ZEPOXY REH 206 5 KG KG 5 10,340
ZEPOXY REH 206 10 KG KG 10 20,240
ZEPOXY REH 206 15 KG KG 15 29,618
ZEPOXY REH 206 200 KG KG 200 374,000
ZEPOXY REH 207 1 KG KG 1 2,629
ZEPOXY REH 207 5 KG KG 5 12,925
ZEPOXY REH 207 10 KG KG 10 25,300
ZEPOXY REH 207 15 KG KG 15 37,125
ZEPOXY REH 207 200 KG KG 200 482,900
ZEPOXY REH 208 1 KG KG 1 2,085
ZEPOXY REH 208 5 KG KG 5 10,285
ZEPOXY REH 208 10 KG KG 10 20,350
ZEPOXY REH 208 15 KG KG 15 30,113
ZEPOXY REH 208 200 KG KG 200 390,500
ZEPOXY REH 7301 1 KG KG 1 2,200
ZEPOXY REH 7301 5 KG KG 5 10,175
ZEPOXY REH 7301 10 KG KG 10 20,020
ZEPOXY REH 7301 15 KG KG 15 27,390
ZEPOXY REH 7301 200 KG KG 200 312,400
ZEPOXY REH 243 1 KG KG 1 3,278
ZEPOXY REH 243 5 KG KG 5 16,170
ZEPOXY REH 243 10 KG KG 10 31,845
ZEPOXY REH 243 15 KG KG 15 47,025
ZEPOXY REH 243 180 KG KG 180 544,500
ZEPOXY REH 241 1 KG KG 1 1,997
ZEPOXY REH 241 5 KG KG 5 9,873
ZEPOXY REH 241 10 KG KG 10 19,470
ZEPOXY REH 241 15 KG KG 15 28,875
ZEPOXY REH 241 180 KG KG 180 337,590
Zepoxy REH 541 1 KG KG 1 3,207
Zepoxy REH 541 5 KG KG 5 15,923
Zepoxy REH 541 10 KG KG 10 31,570
Zepoxy REH 541 15 KG KG 15 47,025
Zepoxy REH 541 200 KG KG 200 617,100
ZEPOXY REH 360 1 KG KG 1 1,848
ZEPOXY REH 360 5 KG KG 5 9,103
ZEPOXY REH 360 10 KG KG 10 17,930
ZEPOXY REH 360 25 KG KG 25 43,588
ZEPOXY REH 360 200 KG KG 200 343,200
ZEPOXY REH 361 1 KG KG 1 1,705
ZEPOXY REH 361 5 KG KG 5 7,700
ZEPOXY REH 361 10 KG KG 10 15,180
ZEPOXY REH 361 25 KG KG 25 37,125
ZEPOXY REH 361 200 KG KG 200 278,300
ZEPOXY REH 347 1 KG KG 1 1,980
ZEPOXY REH 347 5 KG KG 5 9,405
ZEPOXY REH 347 10 KG KG 10 18,480
ZEPOXY REH 347 25 KG KG 25 44,550
ZEPOXY REH 347 200 KG KG 200 308,000
ZEPOXY REH 348 1 KG KG 1 1,683
ZEPOXY REH 348 5 KG KG 5 8,223
ZEPOXY REH 348 10 KG KG 10 16,170
ZEPOXY REH 348 25 KG KG 25 39,600
ZEPOXY REH 348 200 KG KG 200 313,500
ZEPOXY REH 7269 1 KG KG 1 4,681
ZEPOXY REH 7269 5 KG KG 5 23,265
ZEPOXY REH 7269 10 KG KG 10 46,310
ZEPOXY REH 7269 25 KG KG 25 115,225
ZEPOXY REH 7269 180 KG KG 180 823,680
ZEPOXY REH 5569 1 KG KG 1 3,218
ZEPOXY REH 5569 5 KG KG 5 15,895
ZEPOXY REH 5569 10 KG KG 10 31,240
ZEPOXY REH 5569 25 KG KG 25 77,275
ZEPOXY REH 5569 200 KG KG 200 605,000
ZEPOXY REH 2958 1 KG KG 1 2,035
ZEPOXY REH 2958 5 KG KG 5 10,038
ZEPOXY REH 2958 10 KG KG 10 19,800
ZEPOXY REH 2958 25 KG KG 25 48,400
ZEPOXY REH 2958 180 KG KG 180 344,520
ZEPOXY REH 2257 1 KG KG 1 2,002
ZEPOXY REH 2257 5 KG KG 5 9,873
ZEPOXY REH 2257 10 KG KG 10 19,470
ZEPOXY REH 2257 25 KG KG 25 47,438
ZEPOXY REH 2257 180 KG KG 180 336,600
ZEPOXY WH 230 1 KG KG 1 2,387
ZEPOXY WH 230 5 KG KG 5 11,798
ZEPOXY WH 230 10 KG KG 10 23,375
ZEPOXY WH 230 25 KG KG 25 57,200
ZEPOXY WH 230 200 KG KG 200 452,100
ZEPOXY ELECTROPOT 1.23 KG KG 1.23 2,129
ZEPOXY ELECTROPOT 24.6 KG KG 24.6 31,099
ZEPOXY ELECTROPOT DT-W WHITE 1.25 KG KG 1.25 2,232
ZEPOXY ELECTROPOT DT-W WHITE 25 KG KG 25 38,507
ZEPOXY ELECTROPOT ECONO 1.2 KG KG 1.2 2,064
ZEPOXY ELECTROPOT ECONO 24 KG KG 24 30,031
ZEPOXY Clear MINI KG 0.15 400
ZEPOXY Clear HALF KG 0.75 1,806
ZEPOXY Clear FULL KG 1.5 3,290
Zepoxy Clear 15 KG KIT KG 15 30,315
Zepoxy Clear 45 KG KIT KG 45 89,655
Zepoxy Clear AS Mini KG 0.15 490
Zepoxy Clear AS Half 750 Gm KG 0.75 2,064
Zepoxy Clear AS Full 1.5 KG KG 1.5 3,999
ZEPOXY 300 MINI 150 GM KG 0.15 413
ZEPOXY 300 HALF 750 GM KG 0.75 1,871
ZEPOXY 300 FULL 1.5 KG KG 1.5 3,419
ZEPOXY 300 15 KG KG 15 31,605
ZEPOXY 300 45 KG KG 45 92,880
ZEPOXY 350 FULL 1.5 KG KG 1.5 3,612
ZEPOXY 350 15 KG KG 15 34,185
ZEPOXY 350 45 KG KG 45 101,588
Zepoxy Resin Art Half KG 0.8 1,742
ZEPOXY RESIN ART FULL 1.5 KG KG 1.5 3,199
ZEPOXY RESIN ART 15 KG KG 15 29,025
ZEPOXY RESIN ART 45 KG KG 45 86,430
ZEPOXY FLEXICURE 1.4 KG KG 1.4 5,934
Zepoxy 400 KG 1.56 6,192
ZEPOXY 800 1.8 KG KG 1.56 -
ZEPOXY TABLE TOP DEEP POUR 1.5 KG KG 1.5 5,805
ZEPOXY TABLE TOP DEEP POUR 15 KG KG 15 57,083
ZEPOXY TABLE TOP DEEP POUR 45 KG KG 45 162,540
ZEPOXY 100 MINI 180 GM Mini GM 0.18 413
ZEPOXY 100 HALF 900 GM Half GM 0.9 1,871
ZEPOXY 100 FULL 1.8 KG Full KG 1.8 3,483
ZEPOXY 100 CP 54 KG CP KG 54 94,815
ZEPOXY 100 CP 63 KG CP KG 63 109,650
ZEPOXY 100-Y MINI 180 GM Mini GM 0.18 348
ZEPOXY 100-Y HALF 900 GM Half GM 0.9 -
ZEPOXY 100-Y FULL 1.8 KG Full KG 1.8 2,786
ZEPOXY 100-Y CP 54 KG CP KG 54 81,502
ZEPOXY 100 PLUS MINI 180 GM Mini GM 0.18 374
ZEPOXY 100 PLUS HALF 900 GM Half GM 0.9 1,638
ZEPOXY 100 PLUS FULL 1.8 KG Full KG 1.8 3,019
ZEPOXY 100 PLUS CP 54 KG CP KG 54 81,915
ZEPOXY 100 PLUS CP 63 KG CP KG 63 94,815
Zepoxy 100 CL MINI 180 GM Mini GM 0.18 -
Zepoxy 100 CL HALF 900 GM Half GM 0.9 -
Zepoxy 100 CL FULL 1.8 GM Full KG 1.8 -
Zepoxy 100 CL 45 KG CP KG 54 -
ZEPOXY 150 MINI 180 GM Mini GM 0.18 -
ZEPOXY 150 HALF 900 GM Half GM 0.9 -
ZEPOXY 150 FULL 1.8 KG Full KG 1.8 4,076
ZEPOXY 150 CP 54 KG CP KG 54 113,520
ZEPOXY 200 MINI 180 GM Mini GM 0.18 -
ZEPOXY 200 HALF 900 GM Half GM 0.9 -
ZEPOXY 200 FULL 1.8 KG Full KG 1.8 6,386
ZEPOXY 200 CP 54 KG CP KG 54 167,700
ZEPOXY 2011 MINI 180 GM Mini GM 0.18 -
ZEPOXY 2011 HALF 900 GM Half GM 0.9 -
ZEPOXY 2011 FULL 1.8 KG Full KG 1.8 6,321
ZEPOXY 2011 CP 54 KG CP KG 54 167,055
ZEPOXY KARA GARH MINI 180 GM Mini GM 0.18 400
ZEPOXY KARA GARH HALF 900 GM Half GM 0.9 1,651
ZEPOXY KARA GARH FULL 1.8 KG Full KG 1.8 3,032
ZEPOXY KARA GARH CP 54 KG CP KG 54 81,915
ZEPOXY KARA GARH CP 63 KG CP KG 63 94,815
ZEPOXY WOOD MASTER MINI 180 GM Mini GM 0.18 400
ZEPOXY WOOD MASTER HALF 900 GM Half GM 0.9 1,651
ZEPOXY WOOD MASTER FULL 1.8 KG Full KG 1.8 3,032
ZEPOXY WOOD MASTER CP 54 KG CP KG 54 74,175
ZEPOXY WOOD MASTER CP 63 KG CP KG 63 85,140
ZEPOXY CLUTCH LEATHER MINI 180 GM Mini GM 0.18 303
ZEPOXY CLUTCH LEATHER HALF 900 GM Half GM 0.9 1,374
ZEPOXY CLUTCH LEATHER FULL 1.8 KG Full KG 1.8 2,722
ZEPOXY CLUTCH LEATHER CP 54 KG CP KG 54 76,613
ZEPOXY CLUTCH LEATHER CP 63 KG CP KG 63 88,636
ZEPOXY KARA NOOR MINI 150 GM Mini GM 0.15 393
ZEPOXY KARA NOOR HALF 750 GM Half GM 0.75 1,742
ZEPOXY KARA NOOR FULL 1.5 KG Full KG 1.5 3,212
ZEPOXY KARA NOOR CP 15 KG CP KG 15 31,128
ZEPOXY STEEL 5 MIN 10 GM STS GM 0.01 46
ZEPOXY STEEL 5 MIN 30 GM MTS GM 0.03 142
ZEPOXY STEEL 5 MIN 2 KG CP KG 2 9,030
ZEPOXY STEEL 5 MIN 40 KG BP KG 40 172,860
ZEPOXY STEEL 90 MIN 10 GM STS GM 0.01 41
ZEPOXY STEEL 90 MIN 30 GM MTS GM 0.03 116
ZEPOXY STEEL 90 MIN 2 KG CP KG 2 7,353
ZEPOXY STEEL 90 MIN 40 KG BP KG 40 139,320
ZEPOXY CRYSTAL 10 GM STS GM 0.01 65
ZEPOXY CRYSTAL 30 GM MTS GM 0.03 206
ZEPOXY CRYSTAL 2 KG CP KG 2 8,837
ZEPOXY CRYSTAL 40 KG BP KG 40 180,600
ZEPOXY ULTIMATE 10 GM STS GM 0.01 71
ZEPOXY ULTIMATE 30 MTS GM MTS GM 0.03 142
ZEPOXY ULTIMATE 2 KG CP KG 2 -
ZEPOXY ULTIMATE 40 KG BP KG 40 -
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
    .replace(/\s*-\s*[0-9]+(?:\.[0-9]+)?\s*(KG|LTR|ML|GM)\s*$/i, "")
    .trim();
}

function preprocessRawLines(text) {
  const raw = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out = [];
  const continuationOnly = /^([0-9]+(?:\.[0-9]+)?)(?:\s+([0-9,]+|-))?$/;
  for (const line of raw) {
    const m = line.match(continuationOnly);
    if (m && out.length > 0) out[out.length - 1] = `${out[out.length - 1]} ${line}`;
    else out.push(line);
  }
  return out;
}

function isNumericToken(t) {
  return /^[0-9]+(?:\.[0-9]+)?$/.test(String(t || ""));
}

function parsePriceList() {
  const lines = preprocessRawLines(PRICE_LIST_TEXT);
  const parsed = [];
  const skipped = [];

  for (const line of lines) {
    if (/^(EPOXY ADHESIVES|PRICE LIST AS ON|PRODUCT\b)/i.test(line)) continue;
    if (!line.trim()) continue;

    const tokens = line.trim().split(/\s+/);
    if (tokens.length < 3) {
      skipped.push(line);
      continue;
    }

    let price = null;
    let work = [...tokens];
    const last = work[work.length - 1];
    if (last === "-") {
      work.pop();
      price = null;
    } else if (/^[0-9,]+$/.test(last)) {
      work.pop();
      price = Number(String(last).replace(/,/g, ""));
    }

    let skuIdx = -1;
    for (let i = work.length - 1; i >= 0; i--) {
      if (isNumericToken(work[i])) {
        skuIdx = i;
        break;
      }
    }
    if (skuIdx < 0) {
      skipped.push(line);
      continue;
    }

    let unitIdx = -1;
    for (let i = skuIdx - 1; i >= 0; i--) {
      if (UNITS.has(String(work[i]).toUpperCase())) {
        unitIdx = i;
        break;
      }
    }
    if (unitIdx < 0) {
      skipped.push(line);
      continue;
    }

    const sku = normalizeSku(work[skuIdx]);
    const unit = String(work[unitIdx]).toUpperCase();
    const prevIsUnit = unitIdx - 1 >= 0 && UNITS.has(String(work[unitIdx - 1]).toUpperCase());
    const expectedNameTokens = prevIsUnit ? work.slice(0, unitIdx) : work.slice(0, skuIdx + 1);
    const expectedName = expectedNameTokens.join(" ").replace(/\s+/g, " ").trim();

    let baseNameRaw = expectedName
      .replace(/\s+[0-9]+(?:\.[0-9]+)?\s+(KG|LTR|ML|GM)\s*$/i, "")
      .replace(/\s+(KG|LTR|ML|GM)\s+[0-9]+(?:\.[0-9]+)?\s*$/i, "")
      .trim();
    if (!baseNameRaw) baseNameRaw = expectedName;

    parsed.push({
      line,
      expectedName,
      baseNameRaw,
      baseKey: canonicalBaseName(baseNameRaw),
      unit,
      sku,
      price,
    });
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
    changedByName: "Epoxy Adhesives and Coatings price list (bulk)",
    changedByEmail: "system@ressichem.com",
    changedAt: new Date(),
  };
}

async function updateEpoxyAdhesivesPrices() {
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

async function verifyEpoxyAdhesivesPrices() {
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
      nameMismatches.forEach((m) => console.log(`   • expected \"${m.expected}\" | actual \"${m.actual}\"`));
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
  const run = verify ? verifyEpoxyAdhesivesPrices : updateEpoxyAdhesivesPrices;
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

module.exports = {
  parsePriceList,
  updateEpoxyAdhesivesPrices,
  verifyEpoxyAdhesivesPrices,
};
