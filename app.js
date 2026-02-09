const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const getDB = require('./database/db'); 

// Route Imports
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');
const galleryRoutes = require('./routes/gallery');
const bookingRoutes = require('./routes/bookings');
const settingsRoutes = require('./routes/settings');
const serviceRoutes = require('./routes/services');
const categoryRoutes = require('./routes/categories');
const mailRoutes = require('./routes/mail');



const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'darkroom_sqlite_secret',
    resave: false,
    saveUninitialized: false
}));

app.use(async (req, res, next) => {
    res.locals.user = req.session.user || null;

    try {
        const db = await getDB();
        const settingsRows = await db.all('SELECT * FROM settings');
        
        const settings = {};
        settingsRows.forEach(row => {
            settings[row.key] = row.value;
        });
        
        if (!settings.site_title) settings.site_title = 'My Portfolio';
        
        res.locals.settings = settings;
    } catch (err) {
        console.error("Error loading settings:", err);
        res.locals.settings = {};
    }

    next();
});

// Mount Routes
app.use('/', publicRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/gallery', galleryRoutes);
app.use('/admin/bookings', bookingRoutes);
app.use('/admin/settings', settingsRoutes);
app.use('/admin/services', serviceRoutes);
app.use('/admin/categories', categoryRoutes);
app.use('/mail', mailRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});