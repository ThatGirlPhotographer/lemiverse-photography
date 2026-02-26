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

// Access environment variables
const SITE_KEY = process.env.TURNSTILE_SITE_KEY;
const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;

/**
 * Helper to fetch settings from the DB and format them into an object
 * This ensures the view always has access to site_title, contact_email, etc.
 */
async function getSettingsMap() {
    const db = await getDB();
    const rows = await db.all('SELECT key, value FROM settings');
    const settings: Record<string, string> = {};
    rows.forEach(row => {
        settings[row.key] = row.value;
    });
    return settings;
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

export const getContact = async (req: Request, res: Response): Promise<void> => {
    try {
        const settings = await getSettingsMap();
        res.render('public/contact', { 
            title: 'Contact', 
            settings, 
            siteKey: SITE_KEY, 
            error: null 
        });
    } catch (err) {
        console.error("Error loading contact page:", err);
        res.status(500).send("Internal Server Error");
    }
};

export const postContact = async (req: Request, res: Response): Promise<void> => {
    const { name, email, message, budget, 'cf-turnstile-response': turnstileToken } = req.body;
    
    // Fetch settings immediately for potential re-render
    const settings = await getSettingsMap();

    const renderError = (msg: string) => {
        return res.render('public/contact', { 
            title: 'Contact', 
            settings, 
            siteKey: SITE_KEY, 
            error: msg 
        });
    };

    if (!turnstileToken) {
        return renderError('Please complete the security challenge.');
    }

    try {
        const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const verifyResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${SECRET_KEY}&response=${turnstileToken}`
        });

        const verifyData: any = await verifyResponse.json();

        if (!verifyData.success) {
            return renderError('Security challenge failed. Please try again.');
        }

        const db = await getDB();
        await db.run(
            'INSERT INTO bookings (name, email, message, budget, status) VALUES (?, ?, ?, ?, ?)', 
            [name, email, message, budget, 'Pending']
        );

        // Success Response: Pass the success flag inside the settings object
        res.render('public/contact', { 
            title: 'Contact', 
            siteKey: SITE_KEY,
            settings: { ...settings, contact_success: true },
            error: null
        });

    } catch (err) {
        console.error("Error submitting contact form:", err);
        return renderError('Server error. Please try again later.');
    }
};