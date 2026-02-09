const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '..', 'store', 'email.sqlite');

let dbInstance;

if (fs.existsSync(dbPath)) {
    console.log('Email Database exists at:', dbPath);
} else {
    console.log('Email Database does not exist at:', dbPath, 'Creating new database...');
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
}

async function getDB() {
    if (dbInstance) return dbInstance;
    dbInstance = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });
    await dbInstance.exec(`
        CREATE TABLE IF NOT EXISTS emails (
            id TEXT PRIMARY KEY,
            sender TEXT,
            recipient TEXT,
            subject TEXT,
            body TEXT,
            folder TEXT DEFAULT 'inbox',
            isRead INTEGER DEFAULT 0,
            isStarred INTEGER DEFAULT 0,
            labels TEXT DEFAULT '[]',
            dateCreated TEXT,
            replyTo TEXT,
            attachments TEXT DEFAULT '[]'
        );
    `);
    return dbInstance;
}

const emailDB = {
    create: async (email) => {
        const db = await getDB();
        return await db.run(`
            INSERT INTO emails (id, sender, recipient, subject, body, folder, isRead, isStarred, labels, dateCreated, replyTo, attachments)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            email.id, email.sender, email.recipient, email.subject, email.body, email.folder, 
            email.isRead, email.isStarred, email.labels, email.dateCreated, email.replyTo, email.attachments
        ]);
    },

    findAll: async (folder, search = '') => {
        const db = await getDB();
        let query = `SELECT * FROM emails WHERE folder = ?`;
        const params = [folder];

        if (search) {
            query += ` AND (subject LIKE ? OR sender LIKE ? OR body LIKE ?)`;
            const term = `%${search}%`;
            params.push(term, term, term);
        }
        query += ` ORDER BY dateCreated DESC`;
        return await db.all(query, params);
    },

    findById: async (id) => {
        const db = await getDB();
        return await db.get('SELECT * FROM emails WHERE id = ?', id);
    },

    update: async (id, updates) => {
        const db = await getDB();
        const fields = Object.keys(updates).map((key) => `${key} = ?`).join(', ');
        const values = Object.values(updates);
        return await db.run(`UPDATE emails SET ${fields} WHERE id = ?`, [...values, id]);
    },

    delete: async (id) => {
        const db = await getDB();
        return await db.run('DELETE FROM emails WHERE id = ?', id);
    },

    countUnread: async () => {
        const db = await getDB();
        const res = await db.get("SELECT COUNT(*) as count FROM emails WHERE folder = 'inbox' AND isRead = 0");
        return res ? res.count : 0;
    }
};

module.exports = emailDB;