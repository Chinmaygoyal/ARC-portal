const { Request} = require("../models/request");
const router = require("express").Router();


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

router.post('/view/professor/',async(req,res)=>{
    //get the id of requests;
    const id = req.id;
    const request = await Course.findById(id);
    const response= req.val;
    if (!request) return;
    //
    if(response == true){
        request.set({
            status: true,
        });
        const project = await Course.findById(id);
        if (!project) return;
        const student = await Course.findById(id);
        if (!student) return;
        project.students.push(student._id);
        project.save();
    }else{
        request.set({
            status: false,
        });
    }
});

router.post('/requests/createrequests/:id',async(req,res)=>{
    const id = req.params.id;
    const project = await Course.findById(id);
    if(!project) return res.status(404).send("No project found");
    try{
    const result = await createrequest(project.professor._id,id,student._id);
    }
    catch(err){
        console.log(err);
    }
});

async function createrequest(professor,project,student){
    const request = new Request({
        project,
        professor,
        student
    });
    request.save();
};


module.exports = router;