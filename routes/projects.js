const router = require("express").Router();
const { Project} = require("../models/project");


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
    let title = req.body.title;
    // let professor = req.body.professor;
    let no_openings = req.body.no_openings; 
    let description = req.body.description; 
    let eligibility = req.body.eligibility; 
    let pre_requisites = req.body.pre_requisites; 
    let duration = req.body.duration; 

    let project = new Project({
        title: title,
        // professor: professor,
        no_openings: no_openings,
        description: description,
        eligibility: eligibility,
        pre_requisites: pre_requisites,
        duration: duration,
        available: true,
    });

    try{
        const result = await project.save();
        res.send(result);
    }
    catch(err){
        res.send("Please fill the complete information");
        console.log(err.message);
    }
});

module.exports = router;