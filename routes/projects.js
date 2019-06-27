const router = require("express").Router();
const tokenAuth = require("../middleware/tokenAuth");
const { Project } = require("../models/project");
const { Professor } = require("../models/professor");
const { isProf, isStudent } = require("../middleware/userCheck");

// STUDENT SIDE: See all projects
router.get("/", tokenAuth, isStudent, async (req, res) => {
  try {
    const projects = await Project.find().populate(
      "professor",
      "name department"
    );
    res.render("dash/projects", { projects: projects });
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err.message);
  }
});

// STUDENT SIDE: See student's current projects
router.get("/self", tokenAuth, isStudent, async (req, res) => {
  try {
    const projects = await Project.find({ student: req.user._id }).populate(
      "professor",
      "name department"
    );
    res.render("dash/projectself", { projects: projects });
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err.message);
  }
});

//department wise sorted
router.get("/view/dept/:department", tokenAuth, async (req, res) => {
  const department = req.params.department;
  try {
    const projects = await Project.find({ department: department });
    if (projects.length == 0) return res.status(200).send("No project found");
    res.send(projects);
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err.message);
  }
});

// STUDENT SIDE (API): Get project
router.get("/view/:id", tokenAuth, isStudent, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id });
    if (!project) return res.status(404).send("Project not found");
    res.send(project);
  } catch (err) {
    res.status(500).send("Internal server error");
    console.log(err.message);
  }
});

// PROF SIDE (API): Create new project
router.post("/createproject", tokenAuth, isProf, async (req, res) => {
  const professor = await Professor.findOne({ _id: req.user._id });
  try {
    const project = new Project({ ...req.body, professor: professor });
    await project.save();
    res.redirect("/home");
  } catch (err) {
    res.status(400).send("Please fill the complete information");
    console.log(err.message);
  }
});

// PROF SIDE: Create new project form
router.get("/createproject", tokenAuth, isProf, async (req, res) => {
  res.render("dash/createproject");
});

// Create new professor (FOR DEV ONLY)
router.post("/createprofessor", async (req, res) => {
  const name = req.body.name;
  const email = req.body.email;
  const department = req.body.department;
  console.log(name, email, department);
  try {
    const prof = new Professor(req.body);
    await prof.save();
    res.send(prof);
  } catch (err) {
    res.send("Please fill the complete information");
    console.log(err.message);
  }
});

module.exports = router;
