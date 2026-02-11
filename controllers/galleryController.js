const getDB = require('../database/db');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Path to your gallery folder
const galleryDir = path.join(__dirname, '..', 'public', 'gallery');

// Ensure the gallery directory exists
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

exports.getUpload = async (req, res) => {
    const db = await getDB();
    const categories = await db.all('SELECT * FROM categories');
    res.render('admin/gallery_upload', { title: 'Upload Photo', categories });
};

exports.postUpload = async (req, res) => {
    // Note: Since we are uploading multiple, we check req.files instead of req.file
    if (!req.files || req.files.length === 0) {
        return res.redirect('/admin/gallery/upload?error=nofile');
    }
    
    const db = await getDB();
    const { caption, category_id } = req.body;

    try {
        // Process all images in parallel
        await Promise.all(req.files.map(async (file) => {
            // Create a unique base name for each file in the loop
            const baseName = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const finalFilename = `${baseName}.webp`;
            const originalPath = file.path;

            try {
                // 1. Process MAIN Image
                await sharp(originalPath)
                    .resize(1200, null, { withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(path.join(galleryDir, finalFilename));

                // 2. Process THUMBNAIL
                await sharp(originalPath)
                    .resize(400, 400, { fit: 'cover' })
                    .webp({ quality: 60 })
                    .toFile(path.join(galleryDir, `thumb_${finalFilename}`));

                // 3. Save to Database (the same caption is applied to all)
                await db.run(
                    'INSERT INTO gallery_items (filename, caption, category_id) VALUES (?, ?, ?)', 
                    [finalFilename, caption, category_id]
                );
            } finally {
                // 4. Cleanup: Delete temp file regardless of Sharp's success/failure
                if (fs.existsSync(originalPath)) {
                    fs.unlinkSync(originalPath);
                }
            }
        }));
            
        res.redirect('/admin/gallery/manage');
    } catch (err) {
        console.error("Batch Processing Error:", err);
        res.redirect('/admin/gallery/upload?error=processing');
    }
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
            const mainFilePath = path.join(galleryDir, image.filename);
            const thumbFilePath = path.join(galleryDir, `thumb_${image.filename}`);

            if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
            if (fs.existsSync(thumbFilePath)) fs.unlinkSync(thumbFilePath);

            await db.run('DELETE FROM gallery_items WHERE item_id = ?', [itemId]);
        }
        
        res.redirect('/admin/gallery/manage');
    } catch (err) {
        console.error("Delete Error:", err);
        res.redirect('/admin/gallery/manage?error=true');
    }
};