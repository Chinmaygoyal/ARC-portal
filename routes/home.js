const router = require("express").Router();
const { Project} = require("../models/project");
const { Request} = require("../models/request");
const jwt = require("jsonwebtoken");
const { Student, validateStudent } = require("../models/student");
const { Professor, validateProfessor } = require("../models/professor");

// api to give the newly added projects
router.get('/student',async (req, res) => {
    var date = Date.now();
    date = date-(1296000000);
    var recentproject = await Project.find({createdAt:{$gte:date}});

    //get the student id if student
    const student ="abcdefgh";
    const studentrequests = await Request.find({student:student});
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
    if(!user) return res.send("Not logged in");
    
    if(user.is_prof == false){
        var student = await Student.findOne({_id: user._id});
        if(student){
            var request = await Request.find({student:student});
            res.send(request);
        }else return res.status(404).send("Not found.");
    }else{
        var professor = await Professor.findOne({_id: user._id});
        if(professor){
            var profrequest = await Request.find({professor:professor});
            res.render("professor.ejs",{profrequest:profrequest,});
        }else return res.status(404).send("Not found.");
    }
});

module.exports = router;