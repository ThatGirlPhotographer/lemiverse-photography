const getDB = require('../database/db');

exports.getHome = (req, res) => res.render('public/home', { title: 'Home' });

exports.getGallery = async (req, res) => {
    try {
        const db = await getDB();
        const category = req.query.cat;
        
        let query = 'SELECT * FROM gallery_items ORDER BY upload_date DESC';
        let params = [];

        if (category) {
            query = 'SELECT * FROM gallery_items WHERE category_id = ? ORDER BY upload_date DESC';
            params = [category];
        }

        const images = await db.all(query, params);
        const categories = await db.all('SELECT * FROM categories');
        res.render('public/gallery', { title: 'Gallery', images, categories });
    } catch (err) {
        console.error("Gallery Error:", err);
        res.status(500).send("Error loading gallery");
    }
};

exports.getServices = async (req, res) => {
    try {
        const db = await getDB();
        const services = await db.all('SELECT * FROM services');
        res.render('public/services', { title: 'Services', services });
    } catch (err) {
        console.error("Services Error:", err);
        res.status(500).send("Error loading services");
    }
};

exports.getContact = (req, res) => res.render('public/contact', { title: 'Contact' });
exports.postContact = async (req, res) => {
    const { name, email, message } = req.body;
    
    try {
        const db = await getDB();
        await db.run(
            'INSERT INTO bookings (name, email, message, status) VALUES (?, ?, ?, ?)', 
            [name, email, message, 'Pending']
        );

        res.render('public/contact', { 
            title: 'Contact', 
            settings: { contact_success: true } 
        });

    } catch (err) {
        console.error("Error submitting contact form:", err);
        res.redirect('/contact?error=true'); 
    }
};