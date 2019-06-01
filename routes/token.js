const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Student } = require('../models/student');
const router = require('express').Router();

// Mail token confirmation
router.get('/verify', async (req, res) => {
    const token = req.query.token;
    const password = req.body.password;
    // Preliminary check
    if (!token) return res.status(400).send('Confirmation failed: token not provided');
    if (!password) return res.status(400).send('Bad request: password is required.');

    try {
        // Decode and validate the token
        const studentInfo = jwt.verify(token, config.get('authTokenKey'));
        if (studentInfo.exp > new Date().getTime / 1000) return res.status(401).send('Access denied: token expired');
        const student = await Student.findById(studentInfo._id);
        if (!student) return res.status(400).send('Verification time expired. Register again.');

        // Hash and set the password. Verify the student, in case this is first verification.
        const hash = await bcrypt.hash(password, await bcrypt.genSalt());
        student.password = hash;
        student.isVerified = true;
        await student.save();

        res.send('Password set successfully');

    } catch (ex) {
        res.status(500).send('Internal server error.');
    }
});

// Resend initial verification token
router.post('/resend', async (req, res) => {
    const email = req.body.email;
    const student = await Student.findOne({ email: email });
    if (!student) return res.status(400).send('Email ID not registered');
    if (student.isVerified) return res.status(400).send('Email ID already verified');

    // Generate new token and send mail
    try {
        const token = student.generateAuthToken();
        mailer.sendVerificationMail(email, "Verify your email ID", `${config.get('domain')}/verify?token=${token}`);
        res.status(200).send('Verification mail sent');
    } catch (ex) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;