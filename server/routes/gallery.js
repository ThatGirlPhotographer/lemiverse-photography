const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/galleryController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/gallery/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

const isAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

// Upload Routes
router.get('/upload', isAuth, controller.getUpload);
router.post('/upload', isAuth, upload.array('image', 15), controller.postUpload);

// Management Routes
router.get('/manage', isAuth, controller.getManage);
router.post('/delete/:id', isAuth, controller.deleteImage);

module.exports = router;