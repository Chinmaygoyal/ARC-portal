const router = require("express").Router();
const { Project } = require("../models/project");
const { Request } = require("../models/request");
const tokenAuth = require("../middleware/tokenAuth");
const { isStudent } = require("../middleware/userCheck");
const { Student } = require("../models/student");
const { Professor } = require("../models/professor");
var request=require('request');
var https = require('https');
// STUDENT SIDE: Get student's requests
router.get("/student", tokenAuth, isStudent, async (req, res) => {
  var student = await Student.findOne({ _id: req.user._id });
  const studentrequests = await Request.find({ student: student });
  res.send(studentrequests + "<br><br><br>" + recentproject);
});

// BOTH: Home page
router.get("/", tokenAuth, async (req, res) => {
  const isProf = req.user.is_prof;
  if (!isProf) {
    // User is a student
    try {
      const date = Date.now() - 15 * 24 * 60 * 60 * 1000; // 15 days
      const recentprojects = await Project.find({
        createdAt: { $gte: date }
      }).populate("professor", "name department");
      const studentrequests = await Request.find({ student: req.user._id })
        .populate("professor", "name department")
        .populate("project", "title description");
      res.render("dash/studentindex", {
        recentprojects: recentprojects,
        studentrequests: studentrequests
      });
    } catch (err) {
      res.status(400).send("Invalid User");
    }
  } else {
    // User is a professor
    try {
      const professor = await Professor.findOne({ _id: req.user._id });
      const projects = await Project.find({ professor: professor });
      res.render("dash/professorindex", { projects: projects });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});
//LOGOUT
router.get("/user/logout", tokenAuth, async (req, res) => {
  console.log(res.headers);
  res.render('dash/logout');
});

//TESTING... PCLUB SEARCH ROUTE
router.get("/STUDENTDATA/",async(req,res) => {
  
  var agent;
  agentOptions = {
    host: 'search.pclub.in'
  , port: '443'
  , path: '/'
  , rejectUnauthorized: false
  };
  
  agent = new https.Agent(agentOptions);
  var data;
  await request({
    url: "https://search.pclub.in/api/students"
  , method: 'GET'
  , agent: agent
  }, function (err, resp, body) {
  console.log(typeof(body));
    



    
});



});


module.exports = router;
