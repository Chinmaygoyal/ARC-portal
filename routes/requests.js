const { Request} = require("../models/request");
const router = require("express").Router();
const { Project} = require("../models/project");
const { Student, validateStudent } = require("../models/student");
const { Professor, validateProfessor } = require("../models/professor");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

router.get('/view/professor',async(req,res)=>{
    //get prof id if prof
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

    var profuser = await Professor.findOne({_id: user._id});

    const profrequest = await Request
        .find({professor:profuser});
        res.send(profrequest);



});
//for prof
router.post('/view/professor/',async(req,res)=>{
    //get the id of requests;
    const id = req.body.id;
    const request = await Request.findById(id);
    const result= req.body.status;
    
    //res.send("ok");

    if (!request) return;
   
    if(result == "true"){
         request.set({
            status: "true",
            
        });
        
        // const project = await Project.findById(id);
        // if (!project) return;
        // const student = await Project.findById(id);
        // if (!student) return;
        // project.students.push(student._id);
        // project.save();  
        
    }else{
         request.set({
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
    res.send("request posted");
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