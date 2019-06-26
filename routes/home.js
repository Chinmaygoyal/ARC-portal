const router = require("express").Router();
const { Project} = require("../models/project");
const { Request} = require("../models/request");
const jwt = require("jsonwebtoken");
const { Student, validateStudent } = require("../models/student");
const { Professor, validateProfessor } = require("../models/professor");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// api to give the newly added projects
router.get('/student',async (req, res) => {

    
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

    const studentrequests=await Request.find({student:student});
    res.send(studentrequests+'<br><br><br>'+recentproject);
    
});

router.get('/',async (req, res) => {
    
   function getCookie(name)
    {
        var re = new RegExp(name + "=([^;]+)");
        var value = re.exec(req.headers.cookie);
        return (value != null) ? unescape(value[1]) : null;
    }
    
    var user = jwt.decode(getCookie("auth_token"));
    if(!user) return res.send("Not logged in");
    var student = await Student.findOne({_id: user._id});
    var professor = await Professor.findOne({_id: user._id});
    if(student)
    {
        try{
            var date = Date.now();
            date = date-(1296000000);
            var recentprojects = await Project.find({createdAt:{$gte:date}}).populate('professor','name department');
            var studentrequests = await Request.find({student:student._id}).populate('professor','name department').populate('project','title description');
            res.render('dash/studentindex',{recentprojects:recentprojects,studentrequests:studentrequests});
        }
        catch(err){
            res.status(400).send("Invalid User");
        
        }
    }else{    
        try{
         const projects = await Project.find({professor:professor})
            res.render('dash/professorindex',{projects:projects});
        }catch(err){
            res.status(400).send("Invalid User");
        }
    }
});

module.exports = router;