const router = require("express").Router();
const { Project} = require("../models/project");
router.get('/',async (req, res) => {
    var d= Date.now();
    //var dt= d.date();
    d=d-(1296000000);
    console.log(d);
    var recentproject=await Project.find({createdAt:{$gte:d}});
       
    res.send(recentproject);

 

});












module.exports = router;