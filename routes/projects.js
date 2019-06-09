const router = require("express").Router();
const { Project} = require("../models/project");



router.post('/createproject',async (req, res) => {
    let title = req.body.title; 
    let professor = req.body.professor; 
    let no_openings = req.body.no_openings; 
    let description = req.body.description; 
    let eligibility = req.body.eligibility; 
    let pre_requisites = req.body.pre_requisites; 
    let duration = req.body.duration; 

    let project = new Project({
        title: title,
        professor: professor,
        no_openings: no_openings,
        description: description,
        eligibility: eligibility,
        pre_requisites: pre_requisites,
        duration: duration,
        available: true,
    })

    try{
        const result = await project.save();
    }
    catch(err){
        res.send("Please fill the complete information");
        console.log(err);
    }

});
module.exports = router;