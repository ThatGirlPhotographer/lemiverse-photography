import sqlite3 from 'sqlite3'
import { open, Database } from 'sqlite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '..', 'store', 'portfolio.sqlite');

if (fs.existsSync(dbPath)) {
    console.log('Database exists at:', dbPath);
} else {
    console.log('Database does not exist at:', dbPath, 'Creating new database...');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

async function getDB(): Promise<Database> {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

export default getDB;