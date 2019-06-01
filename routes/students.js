const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const config = require("config");
const mailer = require("../libs/mail");
const mailAuth = require('../middleware/mailVerify');
const { Student, validateStudent } = require("../models/student");

// Initial registration route
router.post("/", async (req, res) => {
  const email = req.body.email;

  // Check if email is an IITK email id
  const regex = /^[a-zA-Z0-9]+@iitk\.ac\.in$/;
  if (!email.match(regex))
    return res.status(400).send("Send valid IITK email id (*@iitk.ac.in)");

  // Check if student is already registered
  const studentInDB = await Student.findOne({ email: email });
  if (studentInDB) {
    if (studentInDB.isVerified) return res.status(400).send('Student already registered and verified');
    else return res.status(200).send('Redirect to token verification');
  }


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
    const token = student.generateAuthToken({ useMailKey: true });
    mailer.sendVerificationMail(email, "Verify your email ID", `${config.get("domain")}/verify?token=${token}`);
    res.status(200).send("Verification mail sent");
  } catch (ex) {
    res.status(500).send("Internal server error");
  }
});

// Login route
router.get("/", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Joi validation
  const { error } = validateStudent({ email: email, password: password });
  if (error) return res.status(400).send(error.details[0].message);

  // Check if email exists
  const student = await Student.findOne({ email: email });
  if (!student) return res.status(400).send("Student not found");

  // Check if the student is verified
  if (!student.isVerified) return res.status(401).send("Student not verified");

  // Check if password is correct
  const match = await bcrypt.compare(password, student.password);
  if (!match) return res.status(401).send("Incorrect password");

  // Generate token and send
  const token = student.generateAuthToken();
  res.header(token).send("Authorised");
});

// Set password after verification
router.post("/setpwd", mailAuth, async (req, res) => {
  const decoded = req.token;
  const password = req.body.password;
  if (!token) return res.status(401).send('Access denied')
  try {

    // Retrieve the student from database
    const student = await Student.findById(decoded._id);
    if (!student) return res.status(400).send('Student not found');

    // Verify the student in case unverified, and set the hashed password
    student.isVerified = true;
    const salt = await bcrypt.genSalt();
    student.password = await bcrypt.hash(password, salt);
    student.save();

    // Send confirmation response
    res.send('Student verified');

  } catch (error) {
    return res.status(400).send("Invalid token.");
  };
});

module.exports = router;
