const router = require("express").Router();
const { Project} = require("../models/project");
const jwt = require("jsonwebtoken");
const { Student, validateStudent } = require("../models/student");
const { Professor, validateProfessor } = require("../models/professor");





router.get('/',async (req, res) => {
    try{
        const projects = await Project.find();
        res.send(projects);   
    }
    catch(err){
        console.log(err.message);
    }
});

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
    var professor  = await Student.findOne({_id: user._id});    
   
    
    try{
        const result = await createproject(title,no_openings,description,eligibility,pre_requisites,duration,professor);
        res.send(result)    }
    catch(err){
        res.send("Please fill the complete information");
        console.log(err.message);
    }

});

router.get('/createproject',async (req, res) => {


res.render('dash/createproject');

});

async function createproject(title,no_openings,description,eligibility,pre_requisites,duration,profuser){
    const project = new Project({
        title: title,
        no_openings: no_openings,
        description: description,
        eligibility: eligibility,
        pre_requisites: pre_requisites,
        duration: duration,
        professor: profuser,
    });
    await project.save();
    return project;
};
//Create Professor START
router.post('/createprofessor',async (req, res) => {
    const name = req.body.name;
    const email = req.body.email; 
    const department = req.body.department; 
    console.log(name,email,department)
    try{
        const result = await createprofessor(name,department,email);
        res.send(result)    }
    catch(err){
        res.send("Please fill the complete information");
        console.log(err.message);
    }
});

async function createprofessor(name,department,email){
    const professor = new Professor({
        name: name,
        department: department,
        email: email,
    });
    await professor.save();
    return professor;
};

//END

module.exports = router;