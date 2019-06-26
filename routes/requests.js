const { Request} = require("../models/request");
const { Student} = require("../models/student");
const { Professor} = require("../models/professor");
const router = require("express").Router();
const { Project} = require("../models/project");
const jwt = require("jsonwebtoken");

router.get('/view/professor',async(req,res)=>{
    //get prof id if prof
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

//professor views a request

router.get('/view/:id',async(req,res)=>{
    //get prof id if prof
    const id = req.params.id;
    
    await Request.findById(id).populate('project','title').populate('student','name department').exec((err,request)=>{
        if(err){
            console.log({success:false,message:err});
        }
        else{
            //console.log(request);
            res.render('dash/requestdetailview',{request:request});
        }
        });
});

//for prof
router.post('/view/professor/',async(req,res)=>{
    //get the id of requests;
    const id = req.body.id;
    const request = await Request.findById(id);
    const result= req.body.status;
    
    if (!request) res.send("NO requests found");
   
    if(result == "true"){
         request.set({
            status: "true",
            
        });
        
        const project = await Project.findById(request.project._id);
        console.log(project);
        if (!project) res.send("Request related project not found");
        const student = request.student;
        if (!student) return;
        const pos= project.students.indexOf(student);

        if(pos<0)
        {
            project.students.push(student);
            //console.log(pos);
               
        }
        
       project.save();  
               
    }else{
         request.set({
            status: "false",
        });
        const project = await Project.findById(request.project._id);       
        const student = request.student;
        const pos= project.students.indexOf(student);
        if(1)
            project.students.splice(pos,1);
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
    var student = await Student.findOne({_id: user._id});

    const project = await Project.findById(id);
    if(!project) return res.status(404).send("No project found");
    
    const request= await Request.findOne({'project':project,'student':student});
    

    console.log(request);
    if(!request)
    {
        try{
        const result = await createrequest(project.professor,project,student);
        }
        catch(err){
            console.log(err);
        }
        res.send("request posted");
    }
    else
    {
        res.send("Already Requested");
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