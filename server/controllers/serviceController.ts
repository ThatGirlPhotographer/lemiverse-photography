import type { Request, Response } from 'express';
import getDB from '../database/db.js';

interface Service {
    service_id: number;
    title: string;
    description: string;
    price: string;
    sale_price: string;
    is_on_sale: number;
}

/**
 * Utility to ensure price strings follow a consistent currency format.
 */
const formatPrice = (price: string): string => {
    if (!price) return '';
    const trimmedPrice = price.trim();
    return trimmedPrice.startsWith('£') ? trimmedPrice : `£${trimmedPrice}`;
};

export const getServices = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const services = await db.all<Service[]>('SELECT * FROM services ORDER BY service_id ASC');
        res.render('admin/services', { title: 'Manage Services', services });
    } catch (err) {
        console.error('Error fetching services:', err);
        res.redirect('/admin/dashboard');
    }
};

export const addService = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const is_on_sale = req.body.is_on_sale === 'on' ? 1 : 0;
        let { title, description, price, sale_price } = req.body;
        
        price = formatPrice(price);
        sale_price = formatPrice(sale_price);
        
        await db.run(
            'INSERT INTO services (title, description, price, sale_price, is_on_sale) VALUES (?, ?, ?, ?, ?)', 
            [title, description, price, sale_price, is_on_sale]
        );
            
        res.redirect('/admin/services');
    } catch (err) {
        console.error("Error adding service:", err);
        res.redirect('/admin/services?error=true');
    }
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const is_on_sale = req.body.is_on_sale === 'on' ? 1 : 0;
        let { service_id, title, description, price, sale_price } = req.body;
        
        price = formatPrice(price);
        sale_price = formatPrice(sale_price);

        await db.run(
            `UPDATE services SET title = ?, description = ?, price = ?, sale_price = ?, is_on_sale = ? WHERE service_id = ?`, 
            [title, description, price, sale_price, is_on_sale, service_id]
        );
            
        res.redirect('/admin/services');
    } catch (err) {
        console.error("Error updating service:", err);
        res.redirect('/admin/services?error=true');
    }
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const { id } = req.params;
        
        await db.run('DELETE FROM services WHERE service_id = ?', [id]);
        res.redirect('/admin/services');
    } catch (err) {
        console.error("Error deleting service:", err);
        res.redirect('/admin/services?error=true');
    }
};