const getDB = require('../database/db');

const formatPrice = (price) => {
    if (!price) return '';
    price = price.trim();
    return price.startsWith('£') ? price : `£${price}`;
};

exports.getServices = async (req, res) => {
    try {
        const db = await getDB();
        const services = await db.all('SELECT * FROM services ORDER BY service_id ASC');
        res.render('admin/services', { title: 'Manage Services', services });
    } catch (err) {
        console.error(err);
        res.redirect('/admin/dashboard');
    }
};
exports.addService = async (req, res) => {
    try {
        const db = await getDB();
        const is_on_sale = req.body.is_on_sale === 'on' ? 1 : 0;
        let { title, description, price, sale_price } = req.body;
        price = formatPrice(price);
        sale_price = formatPrice(sale_price);
        
        await db.run('INSERT INTO services (title, description, price, sale_price, is_on_sale) VALUES (?, ?, ?, ?, ?)', 
            [title, description, price, sale_price, is_on_sale]);
            
        res.redirect('/admin/services');
    } catch (err) {
        console.error("Error adding service:", err);
        res.redirect('/admin/services?error=true');
    }
};

exports.updateService = async (req, res) => {
    try {
        const db = await getDB();
        const is_on_sale = req.body.is_on_sale === 'on' ? 1 : 0;
        let { service_id, title, description, price, sale_price } = req.body;
        price = formatPrice(price);
        sale_price = formatPrice(sale_price);

        await db.run(`UPDATE services SET title = ?, description = ?, price = ?, sale_price = ?, is_on_sale = ? WHERE service_id = ?`, 
            [title, description, price, sale_price, is_on_sale, service_id]);
            
        res.redirect('/admin/services');
    } catch (err) {
        console.error("Error updating service:", err);
        res.redirect('/admin/services?error=true');
    }
};

exports.deleteService = async (req, res) => {
    try {
        const db = await getDB();
        const { id } = req.params;
        
        await db.run('DELETE FROM services WHERE service_id = ?', [id]);
        res.redirect('/admin/services');
    } catch (err) {
        console.error("Error deleting service:", err);
        res.redirect('/admin/services?error=true');
    }
};