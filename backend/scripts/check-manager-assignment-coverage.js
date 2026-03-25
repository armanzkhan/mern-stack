const path = require("path");
const mongoose = require("mongoose");
const Customer = require("../models/Customer");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
if (!process.env.CONNECTION_STRING && !process.env.MONGODB_URI) {
  require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
}

const MONGODB_URI = process.env.CONNECTION_STRING || process.env.MONGODB_URI;
const COMPANY_ID = "RESSICHEM";

async function main() {
  await mongoose.connect(MONGODB_URI);

  const total = await Customer.countDocuments({ company_id: COMPANY_ID });
  const assignedLegacy = await Customer.countDocuments({
    company_id: COMPANY_ID,
    "assignedManager.manager_id": { $exists: true, $ne: null },
  });
  const assignedArray = await Customer.countDocuments({
    company_id: COMPANY_ID,
    assignedManagers: {
      $elemMatch: {
        manager_id: { $exists: true, $ne: null },
        isActive: true,
      },
    },
  });
  const fullyAssigned = await Customer.countDocuments({
    company_id: COMPANY_ID,
    $and: [
      { "assignedManager.manager_id": { $exists: true, $ne: null } },
      {
        assignedManagers: {
          $elemMatch: {
            manager_id: { $exists: true, $ne: null },
            isActive: true,
          },
        },
      },
    ],
  });

  console.log("Manager assignment coverage");
  console.log(JSON.stringify({ total, assignedLegacy, assignedArray, fullyAssigned }, null, 2));

  await mongoose.disconnect();
}

if (require.main === module) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

