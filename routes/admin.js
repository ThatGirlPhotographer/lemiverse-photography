const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');

const isAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

router.get('/login', controller.getLogin);
router.post('/login', controller.postLogin);
router.get('/dashboard', isAuth, controller.getDashboard);
router.get('/reset-password', isAuth, controller.getResetPassword);
router.post('/reset-password', isAuth, controller.postResetPassword);
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/admin/login');
});

module.exports = router;