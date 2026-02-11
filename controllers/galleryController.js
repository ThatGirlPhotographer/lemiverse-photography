const getDB = require('../database/db');
const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Make sure to npm install sharp

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
    if (!req.file) return res.redirect('/admin/gallery/upload?error=nofile');
    
    const db = await getDB();
    const { caption, category_id } = req.body;

    // Create a unique base name to avoid collisions and force .webp extension
    const baseName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const finalFilename = `${baseName}.webp`;
    
    const originalPath = req.file.path; // Multer's temp file path

    try {
        // 1. Process MAIN Image (Optimized for Viewer)
        // Max width 1200px, preserves aspect ratio, converts to WebP
        await sharp(originalPath)
            .resize(1200, null, { withoutEnlargement: true })
            .webp({ quality: 80 })
            .toFile(path.join(galleryDir, finalFilename));

        // 2. Process THUMBNAIL (Optimized for Gallery Grid)
        // 400x400 square crop, lower quality for speed
        await sharp(originalPath)
            .resize(400, 400, { fit: 'cover' })
            .webp({ quality: 60 })
            .toFile(path.join(galleryDir, `thumb_${finalFilename}`));

        // 3. Cleanup: Delete the original heavy temp file
        if (fs.existsSync(originalPath)) {
            fs.unlinkSync(originalPath);
        }

        // 4. Save to Database
        await db.run(
            'INSERT INTO gallery_items (filename, caption, category_id) VALUES (?, ?, ?)', 
            [finalFilename, caption, category_id]
        );
            
        res.redirect('/admin/gallery/manage');
    } catch (err) {
        console.error("Sharp Image Processing Error:", err);
        // Clean up temp file even if processing fails
        if (fs.existsSync(originalPath)) fs.unlinkSync(originalPath);
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

            // Delete both optimized files
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