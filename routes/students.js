const router = require('express').Router();
const bcrypt = require('bcrypt');
const mailer = require('../libs/mail');
const { Student, validateStudent } = require('../models/student');

// Initial registration route
router.post('/', async(req, res) => {
    const email = req.body.email;

    // Check if email is an IITK email id
    const regex = /^[a-z0-9]+@iitk.ac.in$/;
    if (!email.match(regex)) return res.status(400).send('Send valid IITK email id (*@iitk.ac.in)');

    // Check if student is already registered
    const studentInDB = await Student.findOne({ email: email });
    if (studentinDB) return res.status(400).send('Redirect to token generation page');

    // Create student in database
    const student = new Student({
        name: "SampleName",
        rollNumber: "123456",
        email: email,
        isVerified: false
    });

    // Save the student, send verification mail
    try {
        await student.save();
        const token = student.generateAuthToken();
        // TODO: Enter official link once project is up 
        mailer.sendVerificationMail(email, "Verify your email ID", `ENTER_ROUTE_HANDLER_HERE.com/verify?${token}`);
        res.status(200).send('Verification mail sent');
    } catch (ex) {
        res.status(500).send('Internal server error');
    }
});

module.exports = router;