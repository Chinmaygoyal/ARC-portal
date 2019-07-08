const { Request } = require("../models/request");
const { Student } = require("../models/student");
const { Professor } = require("../models/professor");
const { Project } = require("../models/project");
const tokenAuth = require("../middleware/tokenAuth");
const { isProf, isStudent } = require("../middleware/userCheck");
const router = require("express").Router();
const mail = require("../libs/mail");
router.get("/view/professor", tokenAuth, isProf, async (req, res) => {
  var prof_user = await Professor.findOne({ _id: req.user._id });
  const prof_request = await Request.find({ professor: prof_user });
  res.send(prof_request);
});

// PROF SIDE: See a student request
router.get("/view/:id", tokenAuth, isProf, async (req, res) => {
  try {
    const professor = await Professor.findOne({ _id: req.user._id });
    const request = await Request.findById(req.params.id)
      .populate("project", "title")
      .populate("student", "name department email");
    res.render("dash/requestdetailview", {
      request: request,
      name: professor.name
    });
  } catch (error) {
    res.status(404).send("Request not found");
  }
});

// PROF SIDE: Accept or reject request
router.post("/view/professor/", tokenAuth, isProf, async (req, res) => {
  const request = await Request.findById(req.body.id);
  const result = req.body.status;
  // If no such request found
  if (!request) res.status(404).send("No requests found");
  // Set request status as indicated by req.body.status
  request.set({ status: result });

  // Get the project
  const project = await Project.findById(request.project._id);
  if (!project) return res.status(404).send("Project not found");
  // Get the student
  const student = await Student.findById(request.student._id);
  if (!student)
    return res.status(400).send("Bad request: Student is necessary");
  const pos = project.students.indexOf(student._id);
  //console.log(project);
  // Add or remove student from project accordingly
  if (result == "true") {
    if (pos < 0) {
      project.students.push(student);
      mail.sendStatus(
        student.email,
        "Project Status Changed",
        true,
        student.name,
        project.title
      );
    }
  } else {
    if (pos >= 0) {
      project.students.splice(pos, 1);
      mail.sendStatus(
        student.email,
        "Project Status Changed",
        false,
        student.name,
        project.title
      );
    }
  }
  // Save to DB and respond.
  await project.save();
  await request.save();
  res.send("done");
});

// STUDENT SIDE: Apply for a project (Create request)
router.post("/createrequests/:id", tokenAuth, isStudent, async (req, res) => {
  // Get the student and project
  const student = await Student.findOne({ _id: req.user._id });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).send("No project found");
  // Check if request already exists
  const request = await Request.findOne({ project: project, student: student });
  if (request) return res.status(400).send("Already requested");

  // Create new request
  try {
    const request = new Request({
      project: project,
      professor: project.professor,
      student: student,
      description: req.body.description
    });
    project.no_requests++;
    await project.save();
    await request.save();
    res.send("Project requested successfully");
  } catch (error) {
    res.status(500).send("Internal server error");
    console.log(error.message);
  }
});

//STUDENT SIDE : See a request and its status
router.get("/:id", tokenAuth, isStudent, async (req, res) => {
  const request = await Request.findById(req.params.id)
    .populate("project", "title")
    .populate("professor", "name department");
  if (request) {
    res.render("dash/studentrequestview", { request: request });
    //console.log(request);
  } else res.send("NO request found");
});

module.exports = router;
