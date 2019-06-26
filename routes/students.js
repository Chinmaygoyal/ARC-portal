const router = require("express").Router();
const bcrypt = require("bcrypt");
const config = require("config");
const mailer = require("../libs/mail");
const tokenAuth = require("../middleware/tokenAuth");
const { Student, validateStudent } = require("../models/student");
const { Professor } = require("../models/professor");

//Regex has been changed for testing
//Added method of professor verification


// Initial registration route
router.post("/register", async (req, res) => {
  const email = req.body.email;
  // Check if email is an IITK email id
  // const regex = /^[a-zA-Z0-9]+@iitk\.ac\.in$/;
  const regex = /^[a-zA-Z0-9]+@+[a-zA-Z0-9]+.+[a-zA-Z0-9]/;
 
  if (!email.match(regex))
    return res.status(400).send("Send valid IITK email id (*@iitk.ac.in)");
  // Check if student/professor is already registered
  const professorInDB = await Professor.findOne({ email: email });
  const studentInDB = await Student.findOne({ email: email });
  if (professorInDB){
    if (professorInDB.isVerified)
      return res.status(400).send("Account already exists. Please log in.");
    else{
      try {
        const token = professorInDB.generateAuthToken({ useMailKey: true });
        mailer.sendVerificationMail(
          email,
          "Verify your email ID",
          `${config.get("domain")}/verify.html?token=${token}`
        );
        res.status(200).send("Verification mail sent");
      } catch (ex) {
        res.status(500).send("Email ID does not exist");
      }
    }
  }
  else if (studentInDB) {
    if (studentInDB.isVerified)
      return res.status(400).send("Account already exists. Please log in.");
    else
      return res
        .status(400)
        .send("Verification mail already sent. Check your mail for verification.");
  }else{
    // Create student in database
    const student = new Student({
      name: "SampleName",
      rollNumber: "123456",
      email: email,
      department: "ABC",
      isVerified: false

    });
    // Save the student, send verification mail
    try {
      await student.save();
      const token = student.generateAuthToken({ useMailKey: true });
      mailer.sendVerificationMail(
        email,
        "Verify your email ID",
        `${config.get("domain")}/verify.html?token=${token}`
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
  // Check if email exists
  var student = await Student.findOne({ email: email });
  
  //testing
  if(!student)
     student = await Professor.findOne({email:email});
  //
  
  if (!student) return res.status(400).send("Incorrect email ID");
  // Check if the student is verified
  if (!student.isVerified) return res.status(401).send("Account not verified");
  // Check if password is correct
  const match = await bcrypt.compare(password, student.password);
  if (!match) return res.status(401).send("Incorrect password");
  // Generate token and send
  const token = student.generateAuthToken();
  res.header("x-auth-token", token).send("Authorised");
});

// Change password
router.post("/changepwd", tokenAuth, async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;
  // Check if student exists
  const student = Student.findById(req.user._id);
  if (!student) return res.status(400).send("Student does not exist");
  // Check old password
  const isCorrect = await bcrypt.compare(oldPassword, student.password);
  if (!isCorrect) res.status(401).send("Old password incorrect");
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
  res.send("Password updated successfully");
});

module.exports = router;
