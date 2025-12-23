const getDB = require('../database/db');
const fs = require('fs');
const path = require('path');


exports.getUpload = async (req, res) => {
    const db = await getDB();
    const categories = await db.all('SELECT * FROM categories');
    res.render('admin/gallery_upload', { title: 'Upload Photo', categories });
};

exports.postUpload = async (req, res) => {
    if (!req.file) return res.redirect('/admin/gallery/upload?error=nofile');
    
    const db = await getDB();
    const { caption, category_id } = req.body;
    const filename = req.file.filename;

    await db.run('INSERT INTO gallery_items (filename, caption, category_id) VALUES (?, ?, ?)', 
        [filename, caption, category_id]);
        
    res.redirect('/admin/gallery/manage');
};
exports.getManage = async (req, res) => {
    const db = await getDB();
    const images = await db.all(`
        SELECT g.*, c.name as category_name 
        FROM gallery_items g 
        LEFT JOIN categories c ON g.category_id = c.category_id 
        ORDER BY upload_date DESC
    `);
    res.render('admin/gallery_manage', { title: 'Manage Gallery', images });
};

exports.deleteImage = async (req, res) => {
    const itemId = req.params.id;
    const db = await getDB();

    try {
        const image = await db.get('SELECT filename FROM gallery_items WHERE item_id = ?', [itemId]);
        
        if (image) {
            const filePath = path.join(__dirname, '..', 'public', 'gallery', image.filename);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            await db.run('DELETE FROM gallery_items WHERE item_id = ?', [itemId]);
        }
        
        res.redirect('/admin/gallery/manage');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/gallery/manage?error=true');
    }
};