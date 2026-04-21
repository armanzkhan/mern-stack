/* eslint-disable no-console */
const mongoose = require("mongoose");
const Product = require("../models/Product");

const MONGO_URI =
  process.env.CONNECTION_STRING ||
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  "mongodb://127.0.0.1:27017/Ressichem";

const COMPANY_ID = "RESSICHEM";
const TARGET_CATEGORY = "Epoxy Paint System";

const PRICE_LIST_TEXT = `
Ressi EPO Iron Putty		0.5	 3,045 	 6,090
		1	 5,329 	 5,329
		5	 24,737 	 4,947
Ressi Rust Off-CC		1	 1,146 	 1,146
		5	 3,806 	 761
		20	 12,180 	 609
RESSI EPO PRIMER	Ressi EPO Prime Interior C1	1	 2,893 	 2,893
		5	 13,703 	 2,741
		20	 53,288 	 2,664
	Ressi EPO Prime Proctected C2	1	 3,045 	 3,045
		5	 14,464 	 2,893
		20	 56,333 	 2,817
	Ressi EPO Prime Urban Mastic C3	1	 3,197 	 3,197
		5	 15,225 	 3,045
		20	 59,378 	 2,969
	Ressi EPO Prime Industrial Mastic C4	1	 3,959 	 3,959
		5	 19,031 	 3,806
		20	 74,603 	 3,730
	Ressi EPO Prime Marine Mastic C5	1	 4,111 	 4,111
		5	 19,793 	 3,959
		20	 77,648 	 3,882
RESSI EPO SHIELD	Ressi EPO Shield Interior C1 (White) 	1	 3,502 	 3,502
		5	 14,464 	 2,893
		20	 56,333 	 2,817
	Ressi EPO Shield Interior C1 (Red) 	1	 3,582 	 3,582
		5	 14,848 	 2,970
		20	 57,855 	 2,893
	Ressi EPO Shield Interior C1 (Grey) 	1	 3,502 	 3,502
		5	 14,464 	 2,893
		20	 56,333 	 2,817
	Ressi EPO Shield Interior C1 (Blue) 	1	 3,886 	 3,886
		5	 16,371 	 3,274
		20	 63,945 	 3,197
	Ressi EPO Shield Interior C1 (Yellow) 	1	 3,727 	 3,727
		5	 15,986 	 3,197
		20	 60,900 	 3,045
	Ressi EPO Shield Interior C1 (Green) 	1	 3,502 	 3,502
		5	 14,464 	 2,893
		20	 56,333 	 2,817
	Ressi EPO Shield Protected C2 (White) 	1	 3,654 	 3,654
		5	 15,986 	 3,197
		20	 62,423 	 3,121
	Ressi EPO Shield Protected C2 (Red) 	1	 3,727 	 3,727
		5	 16,371 	 3,274
		20	 63,945 	 3,197
RESSI EPO SHIELD	Ressi EPO Shield Protected C2 (Grey) 	1	 3,654 	 3,654
		5	 15,986 	 3,197
		20	 62,423 	 3,121
	Ressi EPO Shield Protected C2 (Blue) 	1	 4,031 	 4,031
		5	 17,893 	 3,579
		20	 70,035 	 3,502
	Ressi EPO Shield Protected C2 (Yellow) 	1	 3,886 	 3,886
		5	 17,509 	 3,502
		20	 66,990 	 3,350
	Ressi EPO Shield Protected C2 (Green) 	1	 3,654 	 3,654
		5	 15,986 	 3,197
		20	 62,423 	 3,121
	Ressi EPO Shield-Urban Mastic C3 (White)	1	 3,806 	 3,806
		5	 17,509 	 3,502
		20	 68,513 	 3,426
	Ressi EPO Shield-Urban Mastic C3 (Red)	1	 3,872 	 3,872
		5	 17,893 	 3,579
		20	 70,035 	 3,502
	Ressi EPO Shield-Urban Mastic C3 (Grey)	1	 3,806 	 3,806
		5	 17,509 	 3,502
		20	 68,513 	 3,426
	Ressi EPO Shield-Urban Mastic C3 (Blue)	1	 4,191 	 4,191
		5	 19,401 	 3,880
		20	 76,125 	 3,806
	Ressi EPO Shield-Urban Mastic C3 (Yellow)	1	 4,031 	 4,031
		5	 19,031 	 3,806
		20	 73,080 	 3,654
	Ressi EPO Shield-Urban Mastic C3 (Green)	1	 3,806 	 3,806
		5	 17,509 	 3,502
		20	 68,513 	 3,426
	Ressi EPO Shield-Industrial Mastic C4 (White)	1	 4,111 	 4,111
		5	 19,793 	 3,959
		20	 77,648 	 3,882
	Ressi EPO Shield-Industrial Mastic C4 (Red)	1	 4,191 	 4,191
		5	 20,177 	 4,035
		20	 79,170 	 3,959
	Ressi EPO Shield-Industrial Mastic C4 (Grey)	1	 4,111 	 4,111
		5	 19,793 	 3,959
		20	 77,648 	 3,882
	Ressi EPO Shield-Industrial Mastic C4 (Blue)	1	 4,488 	 4,488
		5	 21,692 	 4,338
		20	 85,260 	 4,263
	Ressi EPO Shield-Industrial Mastic C4 (Yellow)	1	 4,336 	 4,336
		5	 21,315 	 4,263
		20	 82,215 	 4,111
RESSI EPO SHIELD	Ressi EPO Shield-Industrial Mastic C4 (Green)	1	 4,111 	 4,111
		5	 19,793 	 3,959
		20	 77,648 	 3,882
	Ressi EPO Shield-Marine Mastic C5 (BLACK)	1	 4,415 	 4,415
		5	 21,315 	 4,263
		20	 83,738 	 4,187
	Ressi EPO Shield-Marine Mastic C5 (Red)	1	 4,495 	 4,495
		5	 21,692 	 4,338
		20	 85,260 	 4,263
	Ressi EPO Shield-Marine Mastic C5 (Grey)	1	 4,415 	 4,415
		5	 21,315 	 4,263
		20	 83,738 	 4,187
	Ressi EPO Shield-Marine Mastic C5 (Blue)	1	 4,952 	 4,952
		5	 23,222 	 4,644
		20	 91,350 	 4,568
	Ressi EPO Shield-Marine Mastic C5 (Yellow)	1	 4,640 	 4,640
		5	 22,838 	 4,568
		20	 88,305 	 4,415
	Ressi EPO Shield-Marine Mastic C5 (Green)	1	 4,415 	 4,415
		5	 21,315 	 4,263
		20	 83,738 	 4,187
`;

function toNumber(value) {
  return Number(String(value || "").replace(/,/g, "").trim());
}

function parseRows(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  const rows = [];
  let lastName = "";

  for (const rawLine of lines) {
    if (/^product/i.test(rawLine) || /^price/i.test(rawLine)) continue;

    const tokens = rawLine
      .split(/\t+/)
      .map((part) => part.trim())
      .filter((part) => part !== "");

    if (tokens.length < 3) continue;

    let name;
    let skuText;
    let priceText;

    if (tokens.length >= 5) {
      name = tokens[1] || tokens[0];
      skuText = tokens[tokens.length - 3];
      priceText = tokens[tokens.length - 2];
    } else if (tokens.length === 4) {
      name = tokens[0];
      skuText = tokens[1];
      priceText = tokens[2];
    } else {
      // 3 tokens => continuation row: SKU, Price, Unit price
      name = lastName;
      skuText = tokens[0];
      priceText = tokens[1];
    }

    const sku = String(skuText || "").trim();
    const price = toNumber(priceText);
    if (!name || !sku || !Number.isFinite(price)) continue;

    const cleanName = String(name).replace(/\s+/g, " ").trim();
    lastName = cleanName;
    rows.push({ name: cleanName, sku, price });
  }

  // Keep only unique name+sku pair (last wins)
  const dedupMap = new Map();
  for (const row of rows) {
    dedupMap.set(`${row.name.toLowerCase()}||${row.sku}`, row);
  }
  return Array.from(dedupMap.values());
}

function inferUnit(name) {
  const upper = String(name || "").toUpperCase();
  if (upper.includes("LTR")) return "LTR";
  if (upper.includes("KG")) return "KG";
  return "LTR";
}

async function upsertRows(rows) {
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const existing = await Product.findOne({
      company_id: COMPANY_ID,
      name: new RegExp(`^${row.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      sku: row.sku,
    });

    const updatePayload = {
      company_id: COMPANY_ID,
      name: row.name,
      sku: row.sku,
      price: row.price,
      unit: inferUnit(row.name),
      isActive: true,
      category: {
        mainCategory: TARGET_CATEGORY,
        subCategory: "",
        subSubCategory: "",
      },
    };

    if (existing) {
      await Product.updateOne({ _id: existing._id }, { $set: updatePayload });
      updated += 1;
    } else {
      await Product.create({
        ...updatePayload,
        stock: 0,
        minStock: 0,
      });
      created += 1;
    }
  }

  return { created, updated };
}

async function verify(rows) {
  const failures = [];
  for (const row of rows) {
    const doc = await Product.findOne({
      company_id: COMPANY_ID,
      name: new RegExp(`^${row.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      sku: row.sku,
      "category.mainCategory": TARGET_CATEGORY,
      isActive: true,
    }).lean();
    if (!doc || Number(doc.price) !== Number(row.price)) {
      failures.push({
        name: row.name,
        sku: row.sku,
        expectedPrice: row.price,
        actualPrice: doc ? doc.price : null,
      });
    }
  }
  return failures;
}

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const rows = parseRows(PRICE_LIST_TEXT);
    console.log(`Parsed rows: ${rows.length}`);

    const { created, updated } = await upsertRows(rows);
    console.log(`Created: ${created}`);
    console.log(`Updated: ${updated}`);

    const failures = await verify(rows);
    if (failures.length > 0) {
      console.log(`Verification failures: ${failures.length}`);
      console.log(failures.slice(0, 20));
      process.exitCode = 1;
    } else {
      console.log("Verification passed: all rows present with matching prices/category.");
    }
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Script failed:", err);
  process.exitCode = 1;
});

