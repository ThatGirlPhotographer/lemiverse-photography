const express = require('express');
const router = express.Router();
const controller = require('../controllers/serviceController');

const isAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

router.get('/', isAuth, controller.getServices);
router.post('/add', isAuth, controller.addService);
router.post('/update', isAuth, controller.updateService);
router.post('/delete/:id', isAuth, controller.deleteService);

module.exports = router;