const router = require("express").Router();
const { Project} = require("../models/project");


// api to give the newly added projects
router.get('/',async (req, res) => {
    var date = Date.now();
    date = date-(1296000000);
    var recentproject = await Project.find({createdAt:{$gte:date}});

    //get the student id if student
    const student ="abcdefgh";
    const studentrequests=await Request.find({student:student});
    res.send(studentrequests+recentproject);
    
});

module.exports = router;