const express = require('express');
const router = express.Router();
const controller = require('../controllers/settingsController');

const isAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

router.get('/', isAuth, controller.getSettings);
router.post('/', isAuth, controller.postSettings);

module.exports = router;