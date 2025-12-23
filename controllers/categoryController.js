const getDB = require('../database/db');

exports.getCategories = async (req, res) => {
    try {
        const db = await getDB();
        const categories = await db.all('SELECT * FROM categories ORDER BY name ASC');
        const counts = await db.all(`
            SELECT c.category_id, COUNT(g.item_id) as count 
            FROM categories c 
            LEFT JOIN gallery_items g ON c.category_id = g.category_id 
            GROUP BY c.category_id
        `);
        
        const categoriesWithCounts = categories.map(cat => {
            const match = counts.find(c => c.category_id === cat.category_id);
            return { ...cat, count: match ? match.count : 0 };
        });

        res.render('admin/categories', { title: 'Manage Categories', categories: categoriesWithCounts });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
};

exports.addCategory = async (req, res) => {
    const db = await getDB();
    const { name } = req.body;
    
    try {
        await db.run('INSERT INTO categories (name) VALUES (?)', [name]);
        res.redirect('/admin/categories');
    } catch (err) {
        console.error(err);
        res.redirect('/admin/categories?error=exists');
    }
};

exports.deleteCategory = async (req, res) => {
    const db = await getDB();
    const { id } = req.params;
    await db.run('DELETE FROM categories WHERE category_id = ?', [id]);
    await db.run('UPDATE gallery_items SET category_id = NULL WHERE category_id = ?', [id]);
    
    res.redirect('/admin/categories');
};