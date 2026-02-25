import 'dotenv/config';
import getDB from './db.js'
import bcrypt from 'bcrypt'

async function setup(): Promise<void> {
    const db = await getDB();

    try {

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
            price TEXT,
            sale_price TEXT,
            is_on_sale BOOLEAN DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS bookings (
            booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            message TEXT,
            budget TEXT,
            status TEXT DEFAULT 'Pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );


    `);

        const password = process.env.ADMIN_PASSWORD || 'admin_password';
        const hash = await bcrypt.hash(password, 10);

        await db.run(`INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`, ['lemi', hash]);

        await db.run(`INSERT OR IGNORE INTO categories (name) VALUES ('Portraits'), ('Outdoors'), ('Animals'), ('Video'), ('Weddings')`);

        await db.run(`INSERT OR IGNORE INTO services (title, description, price, is_on_sale) VALUES ('Portrait Session', '1 Hour Studio Session', '£200', 0)`);

        await db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
            ('site_title', 'Lemiverse Photography'),
            ('about_text', 'Professional photographer and videographer based in the UK.'),
            ('instagram_link', 'https://instagram.com'),
            ('facebook_link', 'https://facebook.com')
        `);
   

        console.log('Database setup completed successfully.');
}  catch (error) {
        console.error('Error during database setup:', error);
    } 
}

setup();