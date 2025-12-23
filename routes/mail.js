const express = require('express');
const router = express.Router();
const controller = require('../controllers/mailAppController'); // Ensure this matches your file name
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

// --- MIDDLEWARE ---
const isAuth = (req, res, next) => {
    if (req.session.mailUser) {
        next();
    } else {
        // If it's an API call (AJAX), send 401 instead of redirecting
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        res.redirect('/mail/login');
    }
};

// --- AUTH ROUTES ---
router.get('/login', controller.loginPage);
router.post('/login', controller.login);
router.get('/logout', controller.logout);

// --- MAIN APP (VIEW) ---
router.get('/', isAuth, controller.mailApp);

// --- API DATA ENDPOINTS ---
router.get('/list', isAuth, controller.list);

// --- EMAIL ACTIONS ---
router.post('/send', isAuth, controller.sendMail);
router.post('/reply', isAuth, controller.replyMail);
router.post('/draft', isAuth, controller.saveDraft);

// --- STATE ACTIONS ---
router.post('/star/:id', isAuth, controller.toggleStar);
router.post('/trash/:id', isAuth, controller.moveToTrash);
router.post('/read/:id', isAuth, controller.markRead); // Added this to match controller
router.delete('/:id', isAuth, controller.deletePermanent);

// --- WEBHOOKS ---
router.post('/inbound', controller.handleInbound);

// --- UTILITIES ---
router.post('/attachments', upload.array('files'), (req, res) => {
    res.json({ success: true, files: req.files });
});

module.exports = router;