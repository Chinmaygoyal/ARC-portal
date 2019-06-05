const nodemailer = require('nodemailer');
const mailBody = require('../config/mail-body.json');
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
function sendVerificationMail(recipient, subject, verificationLink) {
    const mailOptions = {
        from: mailInfo.username,
        to: recipient,
        subject: subject,
        html: mailBody.verifyMail.replace("$", verificationLink)
    };

    smtpTransport.sendMail(mailOptions);
};

exports.sendVerificationMail = sendVerificationMail;