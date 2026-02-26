import express, { Router } from 'express';
import * as controller from '../controllers/publicController.js';

const router: Router = express.Router();

router.get('/', controller.getHome);
router.get('/about', controller.getAbout);
router.get('/gallery', controller.getGallery);
router.get('/services', controller.getServices);
router.get('/contact', controller.getContact);
router.post('/contact', controller.postContact);

export default router;