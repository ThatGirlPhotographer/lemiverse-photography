const express = require('express');
const router = express.Router();
const controller = require('../controllers/categoryController');

const isAuth = (req, res, next) => {
    if (req.session.user) next();
    else res.redirect('/admin/login');
};

router.get('/', isAuth, controller.getCategories);
router.post('/add', isAuth, controller.addCategory);
router.post('/delete/:id', isAuth, controller.deleteCategory);

module.exports = router;