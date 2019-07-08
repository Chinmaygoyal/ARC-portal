const nodemailer = require("nodemailer");
const mailBody = require("../config/mail-body.json");
const mailInfo = require("../config/mail-credentials.json");
const ejs = require("ejs");

const password = process.env.password;

// Set up the transporter
const smtpTransport = nodemailer.createTransport({
  host: mailInfo.host,
  port: mailInfo.portSSL,
  secure: true,
  auth: {
    user: mailInfo.username,
    pass: password
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
}
function sendStatus(recipient, subject, status, name, projecttitle) {
  ejs.renderFile(
    "./config/statusmail.ejs",
    { name: name, status: status, projecttitle: projecttitle },
    function(err, str) {
      if (err) console.log(err);
      const mailOptions = {
        from: mailInfo.username,
        to: recipient,
        subject: subject,
        html: str
      };
      smtpTransport.sendMail(mailOptions);
    }
  );
}

exports.sendVerificationMail = sendVerificationMail;
exports.sendStatus = sendStatus;
