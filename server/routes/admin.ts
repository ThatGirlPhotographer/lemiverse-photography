import express, { type Request, type Response, type NextFunction, Router } from 'express';
import * as authController from '../controllers/authController.js';

const router: Router = express.Router();
const isAuth = (req: Request, res: Response, next: NextFunction): void => {
    // @ts-ignore
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

router.get('/login', authController.getLogin);
router.post('/login', authController.postLogin);
router.get('/dashboard', isAuth, authController.getDashboard);
router.get('/reset-password', isAuth, authController.getResetPassword);
router.post('/reset-password', isAuth, authController.postResetPassword);

router.get('/logout', (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout Error:", err);
        }
        res.redirect('/admin/login');
    });
});

export default router;