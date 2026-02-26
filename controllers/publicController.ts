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
    // Need to pass settings object and siteKey to the view
    const settings = req.app.get('settings') || {};
    res.render('public/contact', { 
        title: 'Contact', 
        settings, 
        siteKey: SITE_KEY, 
        error: null 
    });
};

export const postContact = async (req: Request, res: Response): Promise<void> => {
    const { name, email, message, budget, 'cf-turnstile-response': turnstileToken } = req.body;
    const settings = req.app.get('settings') || {};

    // Internal helper to handle re-rendering with error state
    const renderError = (msg: string) => {
        return res.render('public/contact', { 
            title: 'Contact', 
            settings, 
            siteKey: SITE_KEY, 
            error: msg 
        });
    };

    // 1. Validate Turnstile Token existence
    if (!turnstileToken) {
        return renderError('Please complete the security challenge.');
    }

    try {
        // 2. Verify Token with Cloudflare
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

        // 3. Security passed: Save to Database
        const db = await getDB();
        await db.run(
            'INSERT INTO bookings (name, email, message, budget, status) VALUES (?, ?, ?, ?, ?)', 
            [name, email, message, budget, 'Pending']
        );

        // 4. Success Response
        // Note: We merge contact_success into the existing settings object
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