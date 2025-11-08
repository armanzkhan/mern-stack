// backend/scripts/initAllSeeds.js
/**
 * Sequentially run seed modules. Each seed module should export an async function.
 * This avoids child processes and ESM vs CJS issues.
 */
const path = require("path");

async function runSeed(modulePath) {
  console.log(`\n--- Running: ${modulePath}`);
  const fn = require(path.join(__dirname, modulePath));
  if (typeof fn === "function") {
    await fn();
  } else if (fn.default && typeof fn.default === "function") {
    await fn.default();
  } else {
    throw new Error(`Seed module ${modulePath} does not export a function`);
  }
}

(async () => {
  try {
    // order: initial data, notification perms, super admin, product categories, products
    await runSeed("seedInitialData.js");
    await runSeed("seedNotificationPermissions.js");
    await runSeed("seedSuperAdmin.js");
    await runSeed("seedProductCategories.js");
    await runSeed("seedProducts.js");
    console.log("\nAll seeds completed ✅");
    process.exit(0);
  } catch (err) {
    console.error("✖ Seed failed:", err);
    process.exit(1);
  }
})();
