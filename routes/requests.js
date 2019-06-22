const { Request} = require("../models/request");
const { Student} = require("../models/student");
const { Professor} = require("../models/professor");
const router = require("express").Router();
const { Project} = require("../models/project");
const { Student, validateStudent } = require("../models/student");
const { Professor, validateProfessor } = require("../models/professor");
const jwt = require("jsonwebtoken");

router.get('/view/professor',async(req,res)=>{
    //get prof id if prof
    var app = express();
    app.use(cookieParser());
    function getCookie(name){
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(req.headers.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    var user = jwt.decode(getCookie("auth_token"));
    if(!user)
        res.send("Not logged in");
    var prof_user = await Professor.findOne({_id: user._id});
    const prof_request = await Request
        .find({professor:prof_user});
        res.send(prof_request);
});
//for prof
router.post('/view/professor/',async(req,res)=>{
    //get the id of requests;
    const id = req.id;
    const request = await Request.findById(id);
    const response = req.val;
    if (!request) return res.status(400).send("Invalid option.");
    //What the heck is this? How is the id same for both request and project??
    if(response == true){
        request.set({
            status: true,
        });
        const project = await Project.findById(request.project);
        if (!project) return res.status(400).send("Invalid option.");
        const student = await Student.findById(request.student);
        if (!student) return res.status(400).send("Invalid option.");
        project.students.push(student._id);
        project.save();
    }else{
        await request.set({
            status: "false",
        });
            
    }
    await request.save();
    res.send("done");
});


//for student
router.post('/createrequests/:id',async(req,res)=>{
    const id = req.params.id;
    
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
    var studentuser = await Student.findOne({_id: user._id});

    const project = await Project.findById(id);
    if(!project) return res.status(404).send("No project found");
    try{
    const result = await createrequest(project.professor,project,studentuser);
    }
    catch(err){
        console.log(err);
    }
});

async function createrequest(professor,project,student){
    const request = new Request({
        project:project,
        professor:professor,
        student:student,
    });
    request.save();
};

module.exports = router;