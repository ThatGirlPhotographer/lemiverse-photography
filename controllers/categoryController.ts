import type { Request, Response } from 'express';
import getDB from '../database/db.js';

interface Category {
    category_id: number;
    name: string;
    count?: number;
}

/**
 * Retrieves all categories and calculates the number of items in each for the admin view.
 */
export const getCategories = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const categories = await db.all<Category[]>('SELECT * FROM categories ORDER BY name ASC');
        const counts = await db.all<{ category_id: number; count: number }[]>(`
            SELECT c.category_id, COUNT(g.item_id) as count 
            FROM categories c 
            LEFT JOIN gallery_items g ON c.category_id = g.category_id 
            GROUP BY c.category_id
        `);
        
        const categoriesWithCounts = categories.map(cat => {
            const match = counts.find(c => c.category_id === cat.category_id);
            return { ...cat, count: match ? match.count : 0 };
        });

        res.render('admin/categories', { 
            title: 'Manage Categories', 
            categories: categoriesWithCounts 
        });
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.redirect('/admin/dashboard');
    }
};

/**
 * Adds a new category to the database.
 */
export const addCategory = async (req: Request, res: Response): Promise<void> => {
    const { name } = req.body;
    
    try {
        const db = await getDB();
        await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
        res.redirect('/admin/categories');
    } catch (err) {
        console.error('Error adding category:', err);
        res.redirect('/admin/categories?error=exists');
    }
};

/**
 * Deletes a category and unsets it for any associated gallery items.
 */
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    
    try {
        const db = await getDB();
        await db.run('DELETE FROM categories WHERE category_id = ?', [id]);
        await db.run('UPDATE gallery_items SET category_id = NULL WHERE category_id = ?', [id]);
        
        res.redirect('/admin/categories');
    } catch (err) {
        console.error('Error deleting category:', err);
        res.redirect('/admin/categories');
    }
};