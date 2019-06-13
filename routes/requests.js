const { Request} = require("../models/request");
const router = require("express").Router();


router.get('/requests/view/professor',async(req,res)=>{
    //get prof id if prof
    const professor = "abcdefgh";
    const profrequest = await Request
        .find({professor:professor});
        res.send(profrequests);
});

router.put('/requests/view/professor/:id',async(req,res)=>{
    //get the id of requests;
    const id = req.params.id;
    const request = await Course.findById(id);
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