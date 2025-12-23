const emailDB = require('../database/emailDB');
const { v4: uuidv4 } = require('uuid');
const { Resend } = require('resend');

// --- CONFIGURATION ---
const resend = new Resend('re_2dCPQ7Db_4QpP8pG9MfCicMdtKqNYczYu');
const SENDER_EMAIL = 'Lemiverse <onboarding@lemiverse.win>';
const isAuthenticated = (req) => !!req.session.mailUser;


exports.loginPage = (req, res) => {
    if (isAuthenticated(req)) return res.redirect('/mail');
    res.render('mail/login', { error: null });
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (email === 'admin@lemiverse.win' && password === 'admin123') {
        req.session.mailUser = { email, name: 'Admin' };
        return res.redirect('/mail');
    }
    res.render('mail/login', { error: 'Invalid credentials' });
};

exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/mail/login');
};

// --- APP VIEW & DATA ---
exports.mailApp = async (req, res) => {
    if (!isAuthenticated(req)) return res.redirect('/mail/login');
    
    try {
        const folder = req.query.folder || 'inbox';
        const search = req.query.q || '';
        const emails = await emailDB.findAll(folder, search);
        const unreadCount = await emailDB.countUnread();

        res.render('mail/app', { 
            emails,
            currentFilter: folder,
            searchQuery: search,
            unreadCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).send("Database Error");
    }
};

exports.list = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const folder = req.query.folder || 'inbox';
        const search = req.query.q || '';

        const emails = await emailDB.findAll(folder, search);
        res.json(emails); 
    } catch (err) {
        console.error("List Error:", err);
        res.status(500).json({ error: "Database Error" });
    }
};

// --- API ACTIONS ---
exports.sendMail = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });

    const { to, subject, body } = req.body;
    const safeBody = body || '';

    try {
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: [to],
            subject: subject,
            html: safeBody.replace(/\n/g, '<br>') 
        });

        if (error) {
            console.error("Resend Error:", error);
            return res.status(500).json({ error: error.message });
        }

        const newEmail = {
            id: uuidv4(),
            sender: 'Me',
            recipient: to,
            subject: subject,
            body: safeBody,
            folder: 'sent',
            isRead: 1,
            isStarred: 0,
            labels: '[]',
            dateCreated: new Date().toISOString(),
            replyTo: null,
            attachments: '[]'
        };

        await emailDB.create(newEmail);
        res.redirect('/mail?sent=true');

    } catch (err) {
        console.error("Send Error:", err);
        res.redirect('/mail?error=true');
    }
};

exports.replyMail = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });

    const { id, to, subject, body } = req.body;
    const safeBody = body || '';

    try {
        const { data, error } = await resend.emails.send({
            from: SENDER_EMAIL,
            to: [to],
            subject: subject,
            html: safeBody.replace(/\n/g, '<br>')
        });

        if (error) {
            console.error("Resend Error:", error);
            return res.status(500).json({ error: error.message });
        }

        const replyEmail = {
            id: uuidv4(),
            sender: 'Me',
            recipient: to,
            subject: subject,
            body: safeBody,
            folder: 'sent',
            isRead: 1,
            isStarred: 0,
            labels: '[]',
            dateCreated: new Date().toISOString(),
            replyTo: id,
            attachments: '[]'
        };

        await emailDB.create(replyEmail);
        await emailDB.update(id, { isRead: 1 });

        res.redirect('/mail');

    } catch (err) {
        console.error("Reply Error:", err);
        res.redirect('/mail?error=true');
    }
};

exports.saveDraft = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });

    const { to, subject, body } = req.body;
    try {
        const draft = {
            id: uuidv4(),
            sender: 'Me',
            recipient: to,
            subject: subject || '(No Subject)',
            body: body || '',
            folder: 'draft',
            isRead: 1,
            isStarred: 0,
            labels: '[]',
            dateCreated: new Date().toISOString(),
            replyTo: null,
            attachments: '[]'
        };

        await emailDB.create(draft);
        res.redirect('/mail');
    } catch (err) {
        console.error(err);
        res.redirect('/mail?error=true');
    }
};

exports.markRead = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    await emailDB.update(req.params.id, { isRead: 1 });
    res.json({ success: true });
};

exports.toggleStar = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    const { starred } = req.body;
    await emailDB.update(req.params.id, { isStarred: starred ? 1 : 0 });
    res.json({ success: true });
};

exports.moveToTrash = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    await emailDB.update(req.params.id, { folder: 'trash' });
    res.json({ success: true });
};

exports.deletePermanent = async (req, res) => {
    if (!isAuthenticated(req)) return res.status(401).json({ error: 'Unauthorized' });
    await emailDB.delete(req.params.id);
    res.json({ success: true });
};

exports.handleInbound = async (req, res) => {
    const payload = req.body;
    
    try {
        const newEmail = {
            id: uuidv4(),
            sender: payload.from || 'Unknown',
            recipient: payload.to[0] || 'Me',
            subject: payload.subject || '(No Subject)',
            body: payload.text || payload.html || '',
            folder: 'inbox',
            isRead: 0,
            isStarred: 0,
            labels: '[]',
            dateCreated: new Date().toISOString(),
            replyTo: null,
            attachments: '[]'
        };

        await emailDB.create(newEmail);
        res.status(200).send('Email Received');
    } catch (err) {
        console.error("Webhook Error:", err);
        res.status(500).send('Error processing');
    }
};