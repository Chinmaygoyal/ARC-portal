const router = require("express").Router();
const { Project, validateProject } = require("../models/project");
router.get('/',async (req, res) => {
    res.send(Project);





});