const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const getDB = require('./database/db'); 
require('dotenv').config();

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

// --- CENTRALIZED ERROR MESSAGES ---
const errorData = {
    403: { 
        title: 'PRIVATE COLLECTION', 
        desc: 'This particular series is currently reserved for a private viewing.' 
    },
    500: { 
        title: 'SOFT FOCUS', 
        desc: 'The clarity shifted for a moment. We’re re-aligning the lens to find the sharpest light.' 
    },
    503: {
        title: 'RECALIBRATING',
        desc: 'The lens is currently being cleaned. This frame will return to focus shortly.'
    },
    default: { 
        title: 'LOST EXPOSURE', 
        desc: 'The light didn’t hit the sensor quite right. Let’s try another angle.' 
    }
};

// 1. Settings & Session Middleware
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

// 2. Maintenance Middleware 
app.use((req, res, next) => {
    if (path.extname(req.path) || req.path.startsWith('/admin')) return next();
    if (req.session.user) return next();

    try {
        const configPath = path.join(__dirname, 'maintenance.json');
        if (fs.existsSync(configPath)) {
            const maintenanceConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            
            let page = req.path.split('/')[1] || 'home';
            let pageConfig = maintenanceConfig[page];
            let isMaintenance = pageConfig === true || (pageConfig && pageConfig.enabled === true);

            if (isMaintenance) {
                let statusCode = (typeof pageConfig === 'object' && pageConfig.code) ? pageConfig.code : 503;
                
                const defaultContent = errorData[statusCode] || errorData.default;
                let errorTitle = defaultContent.title;
                let errorDesc = defaultContent.desc;

                if (typeof pageConfig === 'object') {
                    errorTitle = pageConfig.title || errorTitle;
                    errorDesc = pageConfig.desc || errorDesc;
                }

                return res.status(statusCode).render('error', { 
                    errorCode: statusCode,
                    errorTitle, 
                    errorDesc 
                });
            }
        }
    } catch (err) {
        console.error("Maintenance JSON error:", err);
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

// --- ERROR HANDLING SECTION ---
app.use((req, res, next) => {
    res.status(404).render('error', { 
        errorCode: '404', 
        errorTitle: 'OUT OF FRAME', 
        errorDesc: 'The subject you’re looking for has moved out of the composition.' 
    });
});

app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    
    // errorData is now pulled from the top of the file!
    const content = errorData[statusCode] || errorData.default;
    console.error(`[Error ${statusCode}]: ${err.message}`);

    res.status(statusCode).render('error', { 
        errorCode: statusCode, 
        errorTitle: content.title, 
        errorDesc: content.desc 
    });
});

const PORT = 6754;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});