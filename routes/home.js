const router = require("express").Router();
const { Project } = require("../models/project");
const { Request } = require("../models/request");
const tokenAuth = require("../middleware/tokenAuth");
const { isProf, isStudent } = require("../middleware/userCheck");
const { Student } = require("../models/student");
const { Professor } = require("../models/professor");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const Grid = require("gridfs-stream");
const crypto = require("crypto");
const config = require("config");
const GridFsStorage = require("multer-gridfs-storage");
const db = mongoose.connection;

let gfs;
db.once("open", function() {
  gfs = Grid(db.db, mongoose.mongo);
});

//Resume student view route
router.get("/resume", tokenAuth, isStudent, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.user._id });
    if (!student) return res.status(401).send("You are not logged in.");
    if (!student.resume) return res.status(404).send("No resume found.");
    var readstream = await gfs.createReadStream({
      _id: student.resume,
      root: "resume"
    });
    readstream.pipe(res);
  } catch (err) {
    console.log(err.message);
    res.send(err.message);
  }
});

//Resume Professor view route
router.get("/resume/:id", tokenAuth, isProf, async (req, res) => {
  try {
    const student = await Student.findOne({ _id: req.params.id });
    if (!student) return res.status(404).send("Not found");
    if (!student.resume) return res.status(404).send("No resume found.");
    var readstream = await gfs.createReadStream({
      _id: student.resume,
      root: "resume"
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
  url: config.get("DB_URL"),
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "resume"
        };
        resolve(fileInfo);
      });
    });
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024
  },
  fileFilter: fileFilter
}).single("resume");

// STudent profile resume upload route
router.post("/student/profile", tokenAuth, isStudent, async (req, res) => {
  upload(req, res, async err => {
    if (err) {
      // A Multer error occurred when uploading.
      console.log(err.message);
      res.status(500).send(err.message);
    } else {
      const student = await Student.findOne({ _id: req.user._id });
      if (student.resume) {
        gfs.remove({ _id: student.resume, root: "resume" }, function(err) {
          if (err) return res.status(500).send(err.message);
        });
      }
      student.set({ resume: req.file.id });
      await student.save();
      // Everything went fine.
      res.send("File uploaded successfully");
    }
  });
});

// BOTH: Home page
router.get("/", tokenAuth, async (req, res) => {
  const isProf = req.user.is_prof;
  if (!isProf) {
    // User is a student
    try {
      const student = await Student.findOne({ _id: req.user._id }).select(
        "name rollNumber"
      );
      const date = Date.now() - 15 * 24 * 60 * 60 * 1000; // 15 days
      const recentprojects = await Project.find({
        createdAt: { $gte: date },
        available: true
      })
        .sort({ createdAt: "desc" })
        .populate("professor", "name department");
      const studentrequests = await Request.find({ student: req.user._id })
        .sort({ createdAt: "desc" })
        .populate("professor", "name department")
        .populate("project", "title description");
      res.render("dash/studentindex", {
        recentprojects: recentprojects,
        studentrequests: studentrequests,
        name: student.name,
        rollNumber: student.rollNumber
      });
    } catch (err) {
      res.status(400).send("Invalid User");
    }
  } else {
    // User is a professor
    try {
      const professor = await Professor.findOne({ _id: req.user._id });
      const projects = await Project.find({ professor: professor }).sort({
        createdAt: "desc"
      });
      res.render("dash/professorindex", {
        projects: projects,
        name: professor.name
      });
    } catch (err) {
      res.status(400).send(err.message);
    }
  }
});
//LOGOUT
router.get("/user/logout", tokenAuth, async (req, res) => {
  res.render("dash/logout");
});

// STudent profile route
router.get("/student/profile", tokenAuth, async (req, res) => {
  var student = await Student.findOne({ _id: req.user._id });
  res.render("dash/studentprofile", { student: student });
});

//Change Password Route
router.get("/profile/changepwd", tokenAuth, async (req, res) => {
  var student = await Student.findOne({ _id: req.user._id });
  var professor = await Professor.findOne({ _id: req.user._id });
  if (student)
    res.render("dash/changepasswordstud", {
      student: student,
      name: student.name,
      rollNumber: student.rollNumber
    });
  if (professor)
    res.render("dash/changepasswordprof", { professor: professor });
});

module.exports = router;
