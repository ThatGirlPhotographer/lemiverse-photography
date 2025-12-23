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

module.exports = router;