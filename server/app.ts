import express, { type Request, type Response, type NextFunction } from 'express'
import session from 'express-session'
import path from 'path'
import fs from 'fs'
import bodyParser from 'body-parser'
import { fileURLToPath } from 'url'
import 'dotenv/config'

import getDB from './database/db.js' 
import { startHeartbeat } from './utils/uptime.js'


// Route Imports
import publicRoutes from './routes/public.js'
import adminRoutes from './routes/admin.js'
import galleryRoutes from './routes/gallery.js'
import bookingRoutes from './routes/bookings.js'
import settingsRoutes  from './routes/settings.js'
import serviceRoutes from './routes/services.js'
import categoryRoutes from './routes/categories.js'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

startHeartbeat('https://status.lemiverse.win', '433f5a698d0e', 'b5f86da9520f44006c24bae6cc9b66f1');

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
const errorData: Record<number | string, { title: string, desc: string }> = {
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
app.use(async (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    res.locals.user = req.session.user || null;

    try {
        const db = await getDB();
        const settingsRows = await db.all('SELECT * FROM settings');
        
        const settings: Record<string, string> = {};
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
app.use((req: Request, res: Response, next: NextFunction) => {
    if (path.extname(req.path) || req.path.startsWith('/admin')) return next();
    // @ts-ignore
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


// --- ERROR HANDLING SECTION ---
app.use((req, res, next) => {
    res.status(404).render('error', { 
        errorCode: '404', 
        errorTitle: 'OUT OF FRAME', 
        errorDesc: 'The subject you’re looking for has moved out of the composition.' 
    });
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
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