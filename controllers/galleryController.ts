import type { Request, Response } from 'express';
import getDB from '../database/db.js'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your gallery folder
const galleryDir = path.join(__dirname, '..', 'public', 'gallery');

// Ensure the gallery directory exists
if (!fs.existsSync(galleryDir)) {
    fs.mkdirSync(galleryDir, { recursive: true });
}

interface GalleryItem {
    item_id: number;
    filename: string;
    caption: string;
    category_id: number;
    media_type: 'image' | 'video';
    upload_date: string;
    category_name?: string;
}

export const getUpload = async (req: Request, res: Response): Promise<void> => {
    const db = await getDB();
    const categories = await db.all('SELECT * FROM categories');
    res.render('admin/gallery_upload', { title: 'Upload Media', categories });
};

export const postUpload = async (req: Request, res: Response): Promise<void> => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        return res.redirect('/admin/gallery/upload?error=nofile');
    }
    
    const db = await getDB();
    const { caption, category_id } = req.body;

    try {
        // Process all images in parallel
        await Promise.all(files.map(async (file) => {
            const baseName = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const isVideo = file.mimetype.startsWith('video/');
            const mediaType = isVideo ? 'video' : 'image';

            const finalFilename = isVideo ? `${baseName}${path.extname(file.originalname)}`: `${baseName}.webp`;
            const originalPath = file.path;

            try {
                if (!isVideo) {
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
                } else {
                    // 3. Process VIDEO (v6: direct move to gallery folder)
                    fs.renameSync(originalPath, path.join(galleryDir, finalFilename));
                }

                // 4. Save to Database with media_type
                await db.run(
                    'INSERT INTO gallery_items (filename, caption, category_id, media_type) VALUES (?, ?, ?, ?)', 
                    [finalFilename, caption, category_id, mediaType]
                );
            } finally {
                if (!isVideo && fs.existsSync(originalPath)) {
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

export const getManage = async (req: Request, res: Response): Promise<void> => {
    const db = await getDB();
    const images = await db.all<GalleryItem[]>(`
        SELECT g.*, c.name as category_name 
        FROM gallery_items g 
        LEFT JOIN categories c ON g.category_id = c.category_id 
        ORDER BY upload_date DESC
    `);
    res.render('admin/gallery_manage', { title: 'Manage Gallery', images });
};

export const deleteImage = async (req: Request, res: Response): Promise<void> => {
    const itemId = req.params.id;
    const db = await getDB();

    try {
        const image = await db.get<GalleryItem>('SELECT filename, media_type FROM gallery_items WHERE item_id = ?', [itemId]);
        
        if (image) {
            const mainFilePath = path.join(galleryDir, image.filename);
            const thumbFilePath = path.join(galleryDir, `thumb_${image.filename}`);

            if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
            
            // Only attempt to delete thumb if it was an image
            if (image.media_type === 'image' && fs.existsSync(thumbFilePath)) {
                fs.unlinkSync(thumbFilePath);
            }

            await db.run('DELETE FROM gallery_items WHERE item_id = ?', [itemId]);
        }
        
        res.redirect('/admin/gallery/manage');
    } catch (err) {
        console.error("Delete Error:", err);
        res.redirect('/admin/gallery/manage?error=true');
    }
};