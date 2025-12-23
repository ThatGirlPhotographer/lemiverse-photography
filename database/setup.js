const getDB = require('./db');
const bcrypt = require('bcrypt');

async function setup() {
    const db = await getDB();

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password_hash TEXT
        );

        CREATE TABLE IF NOT EXISTS categories (
            category_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE
        );

        CREATE TABLE IF NOT EXISTS gallery_items (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            filename TEXT,
            caption TEXT,
            category_id INTEGER,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories(category_id)
        );

        CREATE TABLE IF NOT EXISTS services (
            service_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            price TEXT
        );

        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- NEW: Table for Site Settings (Title, Social Links, etc.)
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );


    `);

    try {
        const hash = await bcrypt.hash('lemisphotos_lemi25!', 10);
        await db.run(`INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`, ['lemi', hash]);
        
        await db.run(`INSERT OR IGNORE INTO categories (name) VALUES ('Portraits'), ('Outdoors'), ('Animals)`);
        
        await db.run(`INSERT OR IGNORE INTO services (title, description, price) VALUES 
            ('Portrait Session', '1 Hour Studio', '£200')`);

        await db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
            ('site_title', 'Lemiverse Photography'),
            ('about_text', 'Professional photographer based in the UK.'),
            ('instagram_link', 'https://instagram.com'),
            ('facebook_link', 'https://facebook.com'),
            ('contact_email', 'contact@lemiverse.win')
        `);
            
        console.log('Database initialized successfully with SQLite!');
    } catch (e) {
        console.error('Error seeding data:', e);
    }
}

setup();