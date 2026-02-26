import type { Request, Response } from 'express';
import getDB from '../database/db.js';


interface Booking {
    booking_id: number;
    name: string;
    email: string;
    message: string;
    budget: string;
    status: string;
    created_at: string;
}

export const getBookings = async (req: Request, res: Response): Promise<void> => {
    try {
        const db = await getDB();
        const allBookings = await db.all<Booking[]>('SELECT * FROM bookings ORDER BY created_at DESC');
        
        const pending = allBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
        const completed = allBookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

        res.render('admin/bookings', { 
            title: 'Manage Bookings', 
            pendingBookings: pending,
            completedBookings: completed
        });
    } catch (err) {
        console.error('Error fetching bookings:', err);
        res.redirect('/admin/dashboard');
    }
};

export const updateStatus = async (req: Request, res: Response): Promise<void> => {
    const { id, status } = req.body; 

    try {
        const db = await getDB();
        await db.run('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, id]);

        res.redirect('/admin/bookings');
    } catch (err) {
        console.error('Error updating booking status:', err);
        res.redirect('/admin/bookings');
    }
};

export const deleteBooking = async (req: Request, res: Response): Promise<void> => {
    const bookingId = req.params.id;
    try {
        const db = await getDB();
        await db.run('DELETE FROM bookings WHERE booking_id = ?', [bookingId]);
        res.redirect('/admin/bookings');
    } catch (err) {
        console.error('Error deleting booking:', err);
        res.redirect('/admin/bookings');
    }
};