const { Resend } = require('resend');
const resend = new Resend('re_2dCPQ7Db_4QpP8pG9MfCicMdtKqNYczYu');

exports.sendAutoResponse = async (customerEmail, customerName) => {
    try {
        await resend.emails.send({
            from: 'Lemiverse <contact@your-verified-domain.com>',
            to: [customerEmail],
            subject: 'We received your message',
            html: `<h3>Hi ${customerName},</h3><p>We received your message and will reply shortly.</p>`
        });
    } catch (error) { console.error(error); }
};
exports.sendManualReply = async (toEmail, subject, content) => {
    try {
        await resend.emails.send({
            from: 'Lemi <contact@your-verified-domain.com>',
            to: [toEmail],
            subject: subject,
            html: `<div style="font-family:sans-serif; color:#333;">${content}</div>`
        });
        return true;
    } catch (error) { return false; }
};
exports.sendNewEmail = async (toEmail, subject, content) => {
    try {
        await resend.emails.send({
            from: 'Lemi <contact@your-verified-domain.com>',
            to: [toEmail],
            subject: subject,
            html: `<div style="font-family:sans-serif; color:#333;">${content}</div>`
        });
        return true;
    } catch (error) { return false; }
};