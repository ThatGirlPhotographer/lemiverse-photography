const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '..', 'store', 'portfolio.sqlite');

if (fs.existsSync(dbPath)) {
    console.log('Database exists at:', dbPath);
} else {
    console.log('Database does not exist at:', dbPath, 'Creating new database...');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

async function getDB() {
    return open({
        filename: dbPath,
        driver: sqlite3.Database
    });
}

module.exports = getDB;