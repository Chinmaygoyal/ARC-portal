const nodemailer = require('nodemailer');
const mailInfo = require('../config/mail-credentials.json');

// Set up the transporter
const smtpTransport = nodemailer.createTransport({
    host: mailInfo.host,
    port: mailInfo.portSSL,
    secure: true,
    auth: {
        user: mailInfo.username,
        pass: mailInfo.password
    }
});

// Mail sender function
function sendMail(recipient, subject, body) {
    const mailOptions = {
        from: mailInfo.username,
        to: recipient,
        subject: subject,
        text: body
    };

    smtpTransport.sendMail(mailOptions, (err, result) => {
        return err;
    });
};

exports.send = sendMail;