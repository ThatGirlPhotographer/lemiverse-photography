const express = require('express');
const router = express.Router();
const controller = require('../controllers/bookingController');

const isAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

router.get('/', isAuth, controller.getBookings);
router.post('/status', isAuth, controller.updateStatus);
router.post('/delete/:id', isAuth, controller.deleteBooking);

module.exports = router;