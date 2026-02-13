const express = require('express');
const router = express.Router();
const controller = require('../controllers/publicController');


router.get('/', controller.getHome);
router.get('/about', controller.getAbout);
router.get('/gallery', controller.getGallery);
router.get('/services', controller.getServices);
router.get('/contact', controller.getContact);
router.post('/contact', controller.postContact);

module.exports = router;