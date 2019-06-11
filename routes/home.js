const router = require("express").Router();
const { Project} = require("../models/project");


// api to give the newly added projects
router.get('/',async (req, res) => {
    var date = Date.now();
    date = date-(1296000000);
    var recentproject = await Project.find({createdAt:{$gte:date}});
    res.send(recentproject);
});

module.exports = router;