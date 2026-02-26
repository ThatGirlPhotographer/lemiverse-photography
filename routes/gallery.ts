import express, { type Request, type Response, type NextFunction, Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as controller from '../controllers/galleryController.js';

const router: Router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/gallery/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

const isAuth = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

router.get('/upload', isAuth, controller.getUpload);
router.post('/upload', isAuth, upload.array('image', 15), controller.postUpload);
router.get('/manage', isAuth, controller.getManage);
router.post('/delete/:id', isAuth, controller.deleteImage);

export default router;