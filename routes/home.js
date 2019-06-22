const router = require("express").Router();
const { Project} = require("../models/project");
const { Request} = require("../models/request");
const jwt = require("jsonwebtoken");
const { Student, validateStudent } = require("../models/student");
const { Professor, validateProfessor } = require("../models/professor");

var express = require('express'); 
var app = express();
app.set('view engine', 'ejs');
// api to give the newly added projects
router.get('/student',async (req, res) => {
    var date = Date.now();
    date = date-(1296000000);
    var recentproject = await Project.find({createdAt:{$gte:date}});

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
    const studentrequests=await Request.find({student:studentuser});
    res.send(studentrequests+recentproject);
    
});

router.get('/',async (req, res) => {
    
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
    if(studentuser)
    {
    var studentrequest= await Request.find({student:studentuser});
    projectall=await Project.find({});
    res.render('studentview',{projectall:projectall,});
    
    }
    else
    {
    var profuser = await Professor.findOne({_id: user._id});
    var profrequest = await Request.find({professor:profuser})
    
    
    
    res.render('professorview',{profrequest:profrequest,});


        


    }
    



});


module.exports = router;