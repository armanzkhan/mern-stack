/**
 * Copy entire database "Ressichem" to "Testing" on the same cluster.
 *
 * Prerequisites:
 *   - .env in backend folder with MONGODB_URI or CONNECTION_STRING (Atlas connection string).
 *   - Connection string can point to Ressichem; script will use both DBs on same cluster.
 *
 * Run from backend folder:
 *   node scripts/copy-db-ressichem-to-testing.js
 *
 * Or with explicit URI:
 *   MONGODB_URI="mongodb+srv://user:pass@cluster0.xxx.mongodb.net/Ressichem?retryWrites=true&w=majority" node scripts/copy-db-ressichem-to-testing.js
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const { MongoClient } = require("mongodb");

const SOURCE_DB = "Ressichem";
const TARGET_DB = "Testing";

const uri =
  process.env.MONGODB_URI ||
  process.env.CONNECTION_STRING ||
  process.env.CONNECTION_STRING_ATLAS;

if (!uri) {
  console.error("❌ Set MONGODB_URI or CONNECTION_STRING in backend/.env (Atlas connection string).");
  process.exit(1);
}

// Use base URI without database path so we can open both Ressichem and Testing
const baseUri = uri.replace(/\/([^/?]+)(\?|$)/, (_, db, rest) => rest || "?");

async function copyDatabase() {
  const client = new MongoClient(uri, { maxPoolSize: 10 });
  try {
    await client.connect();
    console.log("✅ Connected to cluster.\n");

    const src = client.db(SOURCE_DB);
    const dst = client.db(TARGET_DB);

    const collections = await src.listCollections().toArray();
    console.log(`📂 Found ${collections.length} collections in "${SOURCE_DB}".\n`);

    for (const { name } of collections) {
      const coll = src.collection(name);
      const count = await coll.countDocuments();
      const docs = await coll.find({}).toArray();

      if (docs.length === 0) {
        await dst.createCollection(name);
        console.log(`  ${name}: 0 documents (empty collection created).`);
        continue;
      }

      const targetColl = dst.collection(name);
      await targetColl.deleteMany({});
      await targetColl.insertMany(docs);
      console.log(`  ${name}: ${docs.length} documents copied.`);
    }

    console.log(`\n✅ Done. Database "${SOURCE_DB}" copied to "${TARGET_DB}".`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

copyDatabase();
