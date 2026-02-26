import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import getDB from './db.js';

async function autoMigrate() {
    const db = await getDB();
    const migrationsDir = path.join(process.cwd(), 'database/migrations');

    // 1. Ensure the tracking table exists
    await db.exec(`
        CREATE TABLE IF NOT EXISTS _migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // 2. Read all .sql files from the migrations folder
    if (!fs.existsSync(migrationsDir)) {
        console.error('❌ Migrations folder not found at:', migrationsDir);
        return;
    }

    const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort(); // Ensures 001 runs before 002

    console.log(`🔎 Scanning ${files.length} migration files...`);

    for (const file of files) {
        // Check if this specific file has been applied before
        const alreadyApplied = await db.get('SELECT name FROM _migrations WHERE name = ?', [file]);

        if (!alreadyApplied) {
            console.log(`🚀 Applying Migration: ${file}`);
            let sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');

            try {
                // Use a transaction: if one line fails, the whole file is rolled back
                await db.exec('BEGIN TRANSACTION');

                // Execute the SQL content
                await db.exec(sql);

                // Special handling for the admin user if it's the initial setup
                if (file.includes('002')) {
                    const password = process.env.ADMIN_PASSWORD || 'admin_password';
                    const hash = await bcrypt.hash(password, 10);
                    await db.run(`INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`, ['lemi', hash]);
                }

                // Mark this file as finished
                await db.run('INSERT INTO _migrations (name) VALUES (?)', [file]);
                
                await db.exec('COMMIT');
                console.log(`✅ Finished ${file}`);
            } catch (err) {
                await db.exec('ROLLBACK');
    
                // Type-guard to handle the 'unknown' error type
                    const errorMessage = err instanceof Error ? err.message : String(err);
    
                    console.error(`❌ Error in ${file}:`, errorMessage);
                    process.exit(1);
            }
        }
    }

    console.log('✨ Portfolio Database is fully synced.');
}

autoMigrate().catch(console.error);