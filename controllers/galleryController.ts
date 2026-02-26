import type { Request, Response } from 'express';
import getDB from '../database/db.js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg'; // Added FFmpeg
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const galleryDir = path.join(__dirname, '..', 'public', 'gallery');

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
        await Promise.all(files.map(async (file) => {
            const baseName = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const isVideo = file.mimetype.startsWith('video/');
            const mediaType = isVideo ? 'video' : 'image';

            const finalFilename = isVideo ? `${baseName}${path.extname(file.originalname)}` : `${baseName}.webp`;
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
                    // 3. Process VIDEO
                    const posterFilename = `poster_${baseName}.jpg`;
                    const destinationPath = path.join(galleryDir, finalFilename);
                    
                    // Move original video file
                    fs.renameSync(originalPath, destinationPath);

                    // Generate Thumbnail (Poster) from video using FFmpeg
                    await new Promise((resolve, reject) => {
                        ffmpeg(destinationPath)
                            .screenshots({
                                timestamps: ['00:00:01'], // Capture frame at 1 second
                                filename: posterFilename,
                                folder: galleryDir,
                                size: '400x400'
                            })
                            .on('end', resolve)
                            .on('error', reject);
                    });
                }

                // 4. Save to Database
                await db.run(
                    'INSERT INTO gallery_items (filename, caption, category_id, media_type) VALUES (?, ?, ?, ?)', 
                    [finalFilename, caption, category_id, mediaType]
                );
            } finally {
                // Only unlink if it's an image (videos were moved via renameSync)
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
        const item = await db.get<GalleryItem>('SELECT filename, media_type FROM gallery_items WHERE item_id = ?', [itemId]);
        
        if (item) {
            const mainFilePath = path.join(galleryDir, item.filename);
            
            // Delete the main file (image or video)
            if (fs.existsSync(mainFilePath)) fs.unlinkSync(mainFilePath);
            
            // Delete associated thumbnail/poster
            if (item.media_type === 'image') {
                const thumbPath = path.join(galleryDir, `thumb_${item.filename}`);
                if (fs.existsSync(thumbPath)) fs.unlinkSync(thumbPath);
            } else {
                // If video, look for the 'poster_' file
                const baseName = item.filename.split('.')[0];
                const posterPath = path.join(galleryDir, `poster_${baseName}.jpg`);
                if (fs.existsSync(posterPath)) fs.unlinkSync(posterPath);
            }

            await db.run('DELETE FROM gallery_items WHERE item_id = ?', [itemId]);
        }
        
        res.redirect('/admin/gallery/manage');
    } catch (err) {
        console.error("Delete Error:", err);
        res.redirect('/admin/gallery/manage?error=true');
    }
};