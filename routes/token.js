const bcrypt = require('bcrypt');
const Joi = require('joi');
const mailAuth = require('../middleware/mailVerify');
const { Student } = require('../models/student');
const router = require('express').Router();
const { Professor } = require('../models/professor');

// Mail token confirmation
router.post('/verify', mailAuth, async (req, res) => {
    const decoded = req.token;
    const password = req.body.password;

    // Joi validation
    const { error } = Joi.validate({ password: password }, { password: Joi.string().required().min(8).max(255) });
    if (error) return res.status(400).send(error.details[0].message);

    try {
        // Retrieve the student from database
        if(decoded.is_prof){
            const professor = await Professor.findById(decoded._id);
            if(!professor)  return res.status(401).send('User not found');
            if(professor.isVerified==true){
                res.status(401).send("Already Set the Password")
            }
            professor.isVerified = true;
            const salt = await bcrypt.genSalt();
            professor.password = await bcrypt.hash(password, salt);
            professor.save();
        }else{
            const student = await Student.findById(decoded._id);
            if (!student) return res.status(401).send('User not found');
            if(student.isVerified==true){
                res.status(401).send("Already Set the Password")
            }
            student.isVerified = true;
            const salt = await bcrypt.genSalt();
            student.password = await bcrypt.hash(password, salt);
            student.save();
        }
        // Send confirmation response
        res.send('Password set successfully');
    }catch (error){
        return res.status(401).send("Invalid token.");
    };
});

// Resend initial verification token
router.post('/resend', async (req, res) => {
    const email = req.body.email;
    const professor = await Professor.findOne({ email: email });
    const student = await Student.findOne({ email: email });
    if (!professor){
        if (!student) return res.status(400).send('Email ID not registered');
        if (student.isVerified) return res.status(400).send('Email ID already verified');
        // Generate new token and send mail
        try{
            const token = student.generateAuthToken();
            mailer.sendVerificationMail(email, "Verify your email ID", `${config.get('domain')}/verify?token=${token}`);
            res.status(200).send('Verification mail sent');
        }catch (ex) {
            res.status(500).send('Internal server error');
        }    
    }else{
        // Generate new token and send mail
        try {
            const token = professor.generateAuthToken();
            mailer.sendVerificationMail(email, "Verify your email ID", `${config.get('domain')}/verify?token=${token}`);
            res.status(200).send('Verification mail sent');
        } catch (ex) {
            res.status(500).send('Internal server error');
        }    
    }
});

module.exports = router;