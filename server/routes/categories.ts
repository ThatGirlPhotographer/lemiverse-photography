import express, { type Request, type Response, type NextFunction, Router } from 'express';
import * as controller from '../controllers/categoryController.js';

const router: Router = express.Router();

const isAuth = (req: Request, res: Response, next: NextFunction) => {
    // @ts-ignore
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

router.get('/', isAuth, controller.getCategories);
router.post('/add', isAuth, controller.addCategory);
router.post('/delete/:id', isAuth, controller.deleteCategory);

export default router;