import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import getDB from '../database/db.js';

interface User {
    id: number;
    username: string;
    password_hash: string;
}

export const getLogin = (req: Request, res: Response): void => {
    res.render('admin/login', { title: 'Admin Login', error: null });
};

export const postLogin = async (req: Request, res: Response): Promise<void> => {
    const { username, password, 'cf-turnstile-response': turnstileToken } = req.body;

    if (!turnstileToken) {
        return res.render('admin/login', { title: 'Login', error: 'Please complete the security challenge.' });
    }

    try {
        const verifyUrl = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
        const verifyResponse = await fetch(verifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
        });

        const verifyData: any = await verifyResponse.json();
        if (!verifyData.success) {
            return res.render('admin/login', { title: 'Login', error: 'Security challenge failed. Try again.' });
        }

        const db = await getDB();
        const user = await db.get<User>('SELECT * FROM users WHERE username = ?', [username]);

        if (user) {
            const match = await bcrypt.compare(password, user.password_hash);
            if (match) {
                // @ts-ignore
                req.session.user = user;
                return res.redirect('/admin/dashboard');
            }
        }
        res.render('admin/login', { title: 'Login', error: 'Invalid credentials' });
    } catch (err) {
        console.error('Login Error:', err);
        res.render('admin/login', { title: 'Login', error: 'Server error during login.' });
    }
};

export const getDashboard = async (req: Request, res: Response): Promise<void> => {
    const db = await getDB();
    
    const bookings = await db.all('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 5');
    const imgCountObj = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM gallery_items');
    const bookCountObj = await db.get<{ count: number }>(
        "SELECT COUNT(*) as count FROM bookings WHERE status != 'completed' AND status != 'cancelled'"
    );

    const stats = {
        imgCount: imgCountObj?.count || 0,
        bookCount: bookCountObj?.count || 0
    };

    res.render('admin/dashboard', { title: 'Dashboard', bookings, stats });
};

export const getResetPassword = (req: Request, res: Response): void => {
    res.render('admin/reset-password', { title: 'Reset Password', error: null, success: null });
};

export const postResetPassword = async (req: Request, res: Response): Promise<void> => {
    const { newPassword, confirmPassword } = req.body;
    // @ts-ignore
    const user = req.session.user;

    if (!user) return res.redirect('/admin/login');

    if (!newPassword || newPassword.length < 6) {
        return res.render('admin/reset-password', { title: 'Reset Password', error: 'Password too short', success: null });
    }

    if (newPassword !== confirmPassword) {
        return res.render('admin/reset-password', { title: 'Reset Password', error: 'Passwords do not match', success: null });
    }

    try {
        const db = await getDB();
        const hashedPass = await bcrypt.hash(newPassword, 10);
        
        await db.run('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPass, user.id]);

        // @ts-ignore
        req.session.user.password_hash = hashedPass;

        res.render('admin/reset-password', { 
            title: 'Reset Password', 
            error: null, 
            success: 'Password updated successfully!' 
        });
    } catch (err) {
        console.error('Password Reset Error:', err);
        res.render('admin/reset-password', { title: 'Reset Password', error: 'Server error. Try again.', success: null });
    }
};