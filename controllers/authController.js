const getDB = require('../database/db');
const bcrypt = require('bcrypt');

exports.getLogin = (req, res) => res.render('admin/login', { title: 'Admin Login', error: null });

exports.postLogin = async (req, res) => {
    const db = await getDB();
    const { username, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);

    if (user) {
        const match = await bcrypt.compare(password, user.password_hash);
        if (match) {
            req.session.user = user;
            return res.redirect('/admin/dashboard');
        }
    }
    res.render('admin/login', { title: 'Login', error: 'Invalid credentials' });
};

exports.getDashboard = async (req, res) => {
    const db = await getDB();
    const bookings = await db.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
    const imgCountObj = await db.get('SELECT COUNT(*) as count FROM gallery_items');
    const bookCountObj = await db.get(
        "SELECT COUNT(*) as count FROM bookings WHERE status != 'completed' AND status != 'cancelled'"
    );

    const stats = {
        imgCount: imgCountObj.count,
        bookCount: bookCountObj ? bookCountObj.count : 0
    };

    res.render('admin/dashboard', { title: 'Dashboard', bookings, stats });
};