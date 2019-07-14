const router = require("express").Router();
const bcrypt = require("bcrypt");
const config = require("config");
const mailer = require("../libs/mail");
const tokenAuth = require("../middleware/tokenAuth");
const { Student, validateStudent } = require("../models/student");
const { Professor } = require("../models/professor");
const search = require("../libs/studentsearch");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const axios = require("axios");


//Regex has been changed for testing
//Added method of professor verification

// Initial registration route
router.post("/register", async (req, res) => {
  process.env.domain = req.protocol + '://' + req.get('host');
  const email = req.body.email;
  // Check if email is an IITK email id
  // const regex = /^[a-zA-Z0-9]+@iitk\.ac\.in$/;
  const regex = /^[a-zA-Z0-9]+@+[a-zA-Z0-9]+.+[a-zA-Z0-9]/;

  const studentdetail = await search.getData(email);
  //console.log(studentdetail);

  if (!email.match(regex))
    return res.status(400).send("Send valid IITK email id (*@iitk.ac.in)");
  // Check if student or prof
  const professorInDB = await Professor.findOne({ email: email });
  const studentInDB = await Student.findOne({ email: email });
  // If professor, then:
  if (professorInDB) {
    if (professorInDB.isVerified)
      return res.status(400).send("Account already exists. Please log in.");
    else {
      try {
        const token = professorInDB.generateAuthToken({ useMailKey: true });
        mailer.sendVerificationMail(
          email,
          "Verify your email ID",
          `${process.env.domain}/verify.html?token=${token}`
        );
        res.status(200).send("Verification mail sent");
      } catch (ex) {
        res.status(500).send("Email ID does not exist");
      }
    }
    // If student, then:
  } else if (studentInDB) {
    if (studentInDB.isVerified)
      return res.status(400).send("Account already exists. Please log in.");
    else
      return res
        .status(400)
        .send(
          "Verification mail already sent. Check your mail for verification."
        );
  } else {
    // Create student in database
    const student = new Student({
      name: "SampleName",
      rollNumber: "123456",
      email: email,
      department: "ABC",
      isVerified: false
    });

    //if student data available push it into student

    if (studentdetail) {
      student.set({
        name: studentdetail.n,
        rollNumber: studentdetail.i,
        email: email,
        department: studentdetail.d,
        isVerified: false
      });
    }
    // Save the student, send verification mail
    try {
      await student.save();
      const token = student.generateAuthToken({ useMailKey: true });
      mailer.sendVerificationMail(
        email,
        "Verify your email ID",
        `${process.env.domain}/verify.html?token=${token}`
      );
      res.status(200).send("Verification mail sent");
    } catch (ex) {
      res.status(500).send("Email ID does not exist");
    }
  }
});

// Login route
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Joi validation
  const { error } = validateStudent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if user is a professor
  var user = await Professor.findOne({ email: email });
  // If not, then check if user is student
  if (!user) user = await Student.findOne({ email: email });
  // If none, send bad request.
  if (!user) return res.status(400).send("Incorrect email ID");

  // Check if the user is verified
  if (!user.isVerified) return res.status(401).send("Account not verified");
  // Check if password is correct
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).send("Incorrect password");
  // Generate token and send
  const token = user.generateAuthToken();
  res.header("x-auth-token", token).send("Authorised");
});

// Change password
router.post("/changepwd", tokenAuth, async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  // Check if student exists
  const student = await Student.findById(req.user._id);
  const professor = await Professor.findById(req.user._id);
  //if (!student) return res.status(400).send("Student does not exist");
  // Check old password

  if(!oldPassword) return res.status(400).send("Invalid password");
  if(student)
  {
  const isCorrect = await bcrypt.compare(oldPassword, student.password);
  if (!isCorrect) return res.status(400).send("Old password incorrect");
  // Joi validation of new password
  const { error } = Joi.validate(
    { password: newPassword },
    {
      password: Joi.string()
        .required()
        .min(8)
        .max(255)
    }
  );
  if (error) return res.status(400).send(error.details[0].message);
  // Update new password
  const hash = await bcrypt.hash(newPassword, await bcrypt.genSalt());
  student.password = hash;
  await student.save();
  // Send success response
  return res.status(200).send("Password updated successfully");
  }
  else if(professor)
  {
    const isCorrect = await bcrypt.compare(oldPassword, professor.password);
    if (!isCorrect) return res.status(400).send("Old password incorrect");
    // Joi validation of new password
    const { error } = Joi.validate(
      { password: newPassword },
      {
        password: Joi.string()
          .required()
          .min(8)
          .max(255)
      }
    );
    if (error) return res.status(400).send(error.details[0].message);
    // Update new password
    const hash = await bcrypt.hash(newPassword, await bcrypt.genSalt());
    professor.password = hash;
    await professor.save();
    // Send success response
    return res.status(200).send("Password updated successfully");
  }
  else
  return res.status(400).send("Invalid User");
});

router.post("/forgot", async (req, res) => {
  
 //RECAPTCHA STARTS HERE

  var verificationUrl = "https://www.google.com/recaptcha/api/siteverify?secret=" + "6Lcrka0UAAAAADVGvK-nCkBrxBuWNrzbiWl3Hlgy" + "&response=" + req.body['g-recaptcha-response'] + "&remoteip=" + req.connection.remoteAddress;
  const data = await axios.get(verificationUrl);
  if(!data.success)
    return res.status(400).send("INVALID CAPTCHA");
  console.log(data);
  //RECAPTCHA ENDS HERE

  process.env.domain = req.protocol + '://' + req.get('host');
  const email = req.body.email;
  const student = await Student.findOne({ email: email });
  const professor = await Professor.findOne({ email: email });
  

  if (student) {
    if (!student.isVerified) return res.send("Not Verified Account");

    options = { useMailKey: true };

    const key = options.useMailKey
      ? config.get("mailTokenKey")
      : config.get("authTokenKey");
    const jwtOptions = options.useMailKey ? { expiresIn: "30m" } : undefined;
    const salt = await bcrypt.genSalt();
    hpass = await bcrypt.hash(student.password, salt);
    const token = jwt.sign(
      {
        _id: student._id,
        rollNumber: student.rollNumber,
        email: student.email,
        is_prof: false,
        password: hpass
      },
      key,
      jwtOptions
    );

    try {
      mailer.sendVerificationMail(
        email,
        "Verify your email ID",
        `${process.env.domain}/forgot.html?token=${token}`
      );
      return res.status(200).send("Verification mail sent");
    } catch (ex) {
      return res.status(500).send(ex.message);
    }
  } else if (professor) {
    if (!professor.isVerified) return res.send("Not Verified Account");

    options = { useMailKey: true };

    const key = options.useMailKey
      ? config.get("mailTokenKey")
      : config.get("authTokenKey");
    const jwtOptions = options.useMailKey ? { expiresIn: "30m" } : undefined;
    const salt = await bcrypt.genSalt();
    hpass = await bcrypt.hash(professor.password, salt);
    const token = jwt.sign(
      {
        _id: professor._id,
        email: professor.email,
        is_prof: true,
        password: hpass
      },
      key,
      jwtOptions
    );

    try {
      mailer.sendVerificationMail(
        email,
        "Verify your email ID",
        `${process.env.domain}/forgot.html?token=${token}`
      );
      return res.status(200).send("Verification mail sent");
    } catch (ex) {
      return res.status(500).send(ex.message);
    }
  } else return res.send("Invalid Email ID");
});
module.exports = router;
