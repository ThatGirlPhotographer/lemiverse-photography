const getDB = require('../database/db');

exports.getBookings = async (req, res) => {
    try {
        const db = await getDB();
        const allBookings = await db.all('SELECT * FROM bookings ORDER BY created_at DESC');
        const pending = allBookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
        const completed = allBookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

        res.render('admin/bookings', { 
            title: 'Manage Bookings', 
            pendingBookings: pending,
            completedBookings: completed
        });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
};

exports.updateStatus = async (req, res) => {
    const { id, status } = req.body; 

    try {
        const db = await getDB();
        await db.run('UPDATE bookings SET status = ? WHERE booking_id = ?', [status, id]);
        
        res.redirect('/admin/bookings');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/bookings');
    }
};

exports.deleteBooking = async (req, res) => {
    const bookingId = req.params.id;
    try {
        const db = await getDB();
        await db.run('DELETE FROM bookings WHERE booking_id = ?', [bookingId]);
        res.redirect('/admin/bookings');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/bookings');
    }
};