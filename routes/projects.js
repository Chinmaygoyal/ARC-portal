const router = require("express").Router();
const { Project} = require("../models/project");
const jwt = require("jsonwebtoken");
const { Student, validateStudent } = require("../models/student");
const { Professor, validateProfessor } = require("../models/professor");

//all project list
router.get('/',async (req, res) => {
    try{
        const projects = await Project.find();
        res.send(projects);   
    }
    catch(err){
        console.log(err.message);
    }
});

//department wise sorted 
router.get('/view/:department',async (req,res) => {
    const department = req.params.department;
    try{
        const projects = await Project
            .find({department: department});
        if(projects.length == 0) return res.status(404).send("No project found");
        res.send(projects);
    }
    catch(err){
        console.log(err.message);
    }
});

//detailed view of project
router.get('/view/:department/:id',async (req,res) => {
    const department = req.params.department;
    const id = req.params.id;
    try{
        const projects = await Project
            .find({
                department: department,
                _id: id
            });
        if(projects.length == 0) return res.status(404).send("No project found");
        res.send(projects);
    }
    catch(err){
        console.log(err.message);
    }
});

//project post request
router.post('/createproject',async (req, res) => {
    const title = req.body.title;
    const no_openings = req.body.no_openings; 
    const description = req.body.description; 
    const eligibility = req.body.eligibility; 
    const pre_requisites = req.body.pre_requisites;
    const duration = req.body.duration; 
  
    var express = require('express');
    var cookieParser = require('cookie-parser');
    var app = express();
    app.use(cookieParser());
    function getCookie(name)
    {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(req.headers.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    var user = jwt.decode(getCookie("auth_token"));
    if(!user)
        res.send("Not logged in");
    var professor  = await Professor.findOne({_id: user._id});    
   
    
    try{
        const result = await createproject(title,no_openings,description,eligibility,pre_requisites,duration,professor);
        res.send("Successfully created project");
        }
    catch(err){
        res.send("Please fill the complete information");
        console.log(err.message);
    }

});

//request to open create project form
router.get('/createproject',async (req, res) => {
res.render('createproject');
});

async function createproject(title,no_openings,description,eligibility,pre_requisites,duration,professor){
    const project = new Project({
        title: title,
        no_openings: no_openings,
        description: description,
        eligibility: eligibility,
        pre_requisites: pre_requisites,
        duration: duration,
        professor: professor,
    });
    await project.save();
    return project;
};

module.exports = router;    