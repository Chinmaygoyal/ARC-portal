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
    const title = req.body.title;
    const no_openings = req.body.no_openings; 
    const description = req.body.description; 
    const eligibility = req.body.eligibility; 
    const pre_requisites = req.body.pre_requisites;
    const duration = req.body.duration; 

    try{
        const result = await createproject(title,no_openings,description,eligibility,pre_requisites,duration);
        res.send(result)    }
    catch(err){
        res.send("Please fill the complete information");
        console.log(err.message);
    }
});

async function createproject(title,no_openings,description,eligibility,pre_requisites,duration){
    const project = new Project({
        title: title,
        no_openings: no_openings,
        description: description,
        eligibility: eligibility,
        pre_requisites: pre_requisites,
        duration: duration,
    });
    project.save();
    return project;
};

module.exports = router;