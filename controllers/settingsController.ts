import type { Request, Response } from 'express';
import getDB from '../database/db.js';

interface SettingRow {
    key: string;
    value: string;
}

export const getSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const rows = await db.all<SettingRow[]>('SELECT * FROM settings');
        const settings: Record<string, string> = {};
        rows.forEach(row => {
            if (row.key !== 'contact_email') {
                settings[row.key] = row.value;
            }
        });

        res.render('admin/settings', { title: 'Site Settings', settings });
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.redirect('/admin/dashboard');
    }
};

export const postSettings = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const data = req.body;

        for (const [key, value] of Object.entries(data)) {
            if (key === 'contact_email') continue;

            await db.run(
                `INSERT INTO settings (key, value) VALUES (?, ?) 
                 ON CONFLICT(key) DO UPDATE SET value = excluded.value`, 
                [key, value]
            );
        }
        
        res.redirect('/admin/settings?success=true');
    } catch (err) {
        console.error('Error saving settings:', err);
        res.redirect('/admin/settings?error=true');
    }
};