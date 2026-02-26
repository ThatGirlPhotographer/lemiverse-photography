import express, { type Request, type Response, type NextFunction, Router } from 'express';
import * as bookingController from '../controllers/bookingController.js';

const router: Router = express.Router();
const isAuth = (req: Request, res: Response, next: NextFunction): void => {
    // @ts-ignore
    if (req.session && req.session.user) {
        next();
    } else {
        res.redirect('/admin/login');
    }
};

router.get('/', isAuth, bookingController.getBookings);
router.post('/status', isAuth, bookingController.updateStatus);
router.post('/delete/:id', isAuth, bookingController.deleteBooking);

export default router;