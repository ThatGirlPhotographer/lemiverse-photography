import type { Request, Response } from 'express';
import getDB from '../database/db.js';

interface GalleryItem {
    item_id: number;
    filename: string;
    caption: string;
    category_id: number;
    media_type: 'image' | 'video'; 
}

interface Category {
    category_id: number;
    name: string;
}

interface Service {
    service_id: number;
    title: string;
    description: string;
    price: string;
    sale_price?: string;
    is_on_sale: number;
}

export const getHome = (req: Request, res: Response): void => {
    res.render('public/home', { title: 'Home' });
};

export const getAbout = (req: Request, res: Response): void => {
    res.render('public/about', { title: 'About' });
};

export const getGallery = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const categoryId = req.query.cat;
        
        let query = 'SELECT item_id, filename, caption, category_id, media_type FROM gallery_items ORDER BY upload_date DESC';
        let params: any[] = [];

        if (categoryId) {
            query = 'SELECT item_id, filename, caption, category_id, media_type FROM gallery_items WHERE category_id = ? ORDER BY upload_date DESC';
            params = [categoryId];
        }

        const images = await db.all<GalleryItem[]>(query, params);
        const categories = await db.all<Category[]>('SELECT * FROM categories');

        res.render('public/gallery', { 
            title: 'Gallery', 
            images, 
            categories,
            selectedCat: categoryId 
        });
    } catch (err) {
        console.error("Gallery Error:", err);
        res.status(500).render('error', { errorCode: 500, errorTitle: 'SOFT FOCUS', errorDesc: "Error loading gallery" });
    }
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const services = await db.all<Service[]>('SELECT * FROM services');
        res.render('public/services', { title: 'Services', services });
    } catch (err) {
        console.error("Services Error:", err);
        res.status(500).render('error', { errorCode: 500, errorTitle: 'SOFT FOCUS', errorDesc: "Error loading services" });
    }
};

export const getContact = (req: Request, res: Response): void => {
    res.render('public/contact', { title: 'Contact' });
};

export const postContact = async (req: Request, res: Response): Promise<void> => {
    const { name, email, message, budget } = req.body; // Added budget for v6
    
    try {
        const db = await getDB();
        await db.run(
            'INSERT INTO bookings (name, email, message, budget, status) VALUES (?, ?, ?, ?, ?)', 
            [name, email, message, budget, 'Pending']
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