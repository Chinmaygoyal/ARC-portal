const router = require("express").Router();
const tokenAuth = require("../middleware/tokenAuth");
const { Project } = require("../models/project");
const { Professor } = require("../models/professor");
const { isProf, isStudent } = require("../middleware/userCheck");
const { Request } = require("../models/request");
const { Student } = require("../models/student");
const json2csv = require("json2csv").parse;
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const GridFsStorage = require("multer-gridfs-storage");
const db = mongoose.connection;

let gfs;
db.once("open", function() {
  gfs = Grid(db.db, mongoose.mongo);
});

//See the uploaded file of the project
router.get("/view/file/:id", tokenAuth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) return res.status(404).send("Not found");
    if (!project.file) return res.status(404).send("No file found.");
    var readstream = await gfs.createReadStream({
      _id: project.file,
      root: "projectfile"
    });
    readstream.pipe(res);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
});

//File upload settings

//For development purposes mime type has been changed.
//It should be 'application/pdf'
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "text/plain") cb(null, true);
  else cb(new Error("Please upload a file in pdf format"), false);
};

const storage = new GridFsStorage({
  url:
    "mongodb+srv://new_user1:Arciitk@arcportal-z5xml.mongodb.net/test?retryWrites=true&w=majority",
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "projectfile"
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 3 * 1024 * 1024
  },
  fileFilter: fileFilter
}).single("projectfile");

// PROF SIDE (API): Create new project
router.post("/createproject", tokenAuth, isProf, async (req, res) => {
  const professor = await Professor.findOne({ _id: req.user._id });
  try {
    upload(req, res, async err => {
      if (err) {
        // A Multer error occurred when uploading.
        console.log(err.message);
        res.send(err.message);
      } else {
        const project = new Project({ ...req.body, professor: professor });
        if (req.file) {
          project.set({ file: req.file.id });
          // Everything went fine.
          if (project.description == "")
            project.set({
              description: "The project file contains the project description."
            });
        }
        if (project.description == "")
          project.set({
            description: "No description."
          });
        await project.save();
      }
    });
    res.redirect("/home");
  } catch (err) {
    res.status(400).send("Please fill the complete information");
    console.log(err.message);
  }
});

// STUDENT SIDE: See all projects
router.get("/", tokenAuth, isStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user._id }).select(
      "name rollNumber"
    );
    const projects = await Project.find({ available: true })
      .sort({ createdAt: "desc" })
      .populate("professor", "name department");
    res.render("dash/projects", {
      projects: projects,
      name: student.name,
      rollNumber: student.rollNumber
    });
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err.message);
  }
});

// STUDENT SIDE: See student's current projects
router.get("/self", tokenAuth, isStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user._id }).select(
      "name rollNumber"
    );
    const projects = await Project.find({ students: req.user._id })
      .sort({ createdAt: "desc" })
      .populate("professor", "name department");
    res.render("dash/projectself", {
      projects: projects,
      name: student.name,
      rollNumber: student.rollNumber
    });
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err.message);
  }
});

// STUDENT SIDE (API): Get project
router.get("/view/:id", tokenAuth, isStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user._id }).select(
      "name rollNumber"
    );
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) return res.status(404).send("Project not found");
    if (!project.available)
      return res.status(400).send("You cannot request this project.");
    res.render("dash/studentprojectview", {
      project: project,
      name: student.name,
      rollNumber: student.rollNumber
    });
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err.message);
  }
});

// PROF SIDE: Create new project form
router.get("/createproject", tokenAuth, isProf, async (req, res) => {
  const professor = await Professor.findOne({ _id: req.user._id });
  res.render("dash/createproject", { name: professor.name });
});

// Create new professor (FOR DEV ONLY)
router.post("/createprofessor", async (req, res) => {
  try {
    const prof = new Professor(req.body);
    await prof.save();
    res.send(prof);
  } catch (err) {
    res.send("Please fill the complete information");
    console.log(req.body);
  }
});

//PROF side to view all requests of a particular project
router.get("/:id", tokenAuth, isProf, async (req, res) => {
  const id = req.params.id;
  const professor = await Professor.findOne({ _id: req.user._id });
  const project = await Project.findById(id);
  const requests = await Request.find({ project: project }).populate(
    "student",
    "name department rollNumber email"
  );

  res.render("dash/projectpage", {
    project: project,
    requests: requests,
    name: professor.name
  });
});
//Download route for the project csv
router.get("/download/:id/", tokenAuth, isProf, async (req, res) => {
  const id = req.params.id;
  const project = await Project.findById(id);
  const requests = await Request.find({
    project: project,
    status: true
  }).populate("student", "name department rollNumber email");
  var records = new Array();

  for (var i = 0; i < requests.length; i++) {
    records.push({
      Name: requests[i].student.name,
      Department: requests[i].student.department,
      RollNumber: requests[i].student.rollNumber,
      Email: requests[i].student.email
    });
  }
  if (records.length == 0)
    res.end(
      "<script>alert('NO students have been selected');window.location.href='../../home';</script>"
    );
  var today = new Date();
  if (records.length) {
    const csvString = json2csv(records);
    res.setHeader(
      "Content-disposition",
      "attachment; filename=" + project.title + "  " + today + ".csv"
    );
    res.set("Content-Type", "text/csv");
    res.status(200).send(csvString);
  }
});

// PROF SIDE: Open or close project
router.post("/view/professor/", tokenAuth, isProf, async (req, res) => {
  try {
    const project = await Project.findById(req.body.id);
    const result = req.body.status;
    // If no such project found
    if (!project) res.status(404).send("No project found");
    // Set project status as indicated by req.body.status
    project.set({ available: result });
    await project.save();
    res.end();
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;
