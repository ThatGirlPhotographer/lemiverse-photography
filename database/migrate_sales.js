const getDB = require('./db');

async function migrate() {
    const db = await getDB();
    try {
        await db.exec(`ALTER TABLE services ADD COLUMN sale_price TEXT;`);
        await db.exec(`ALTER TABLE services ADD COLUMN is_on_sale BOOLEAN DEFAULT 0;`);
        await db.exec(`ALTER TABLE contact_messages ADD COLUMN is_starred INTEGER DEFAULT 0;`);
        console.log("Migration successful: Added sale columns.");
    } catch (e) {
        console.log("Migration skipped (Columns might already exist).");
    }
}
migrate();