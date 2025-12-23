const getDB = require('../database/db');

exports.getSettings = async (req, res) => {
    try {
        const db = await getDB();
        const rows = await db.all('SELECT * FROM settings');
        
        const settings = {};
        rows.forEach(row => {
            settings[row.key] = row.value;
        });

        res.render('admin/settings', { title: 'Site Settings', settings });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
};

exports.postSettings = async (req, res) => {
    const db = await getDB();
    const data = req.body;

    try {
        for (const [key, value] of Object.entries(data)) {
            await db.run(`INSERT INTO settings (key, value) VALUES (?, ?) 
                          ON CONFLICT(key) DO UPDATE SET value = excluded.value`, [key, value]);
        }
        res.redirect('/admin/settings?success=true');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/settings?error=true');
    }
};