const { Request} = require("../models/request")

router.get('/requests/view/professor',async(req,res)=>{
    //get prof id if prof
    const professor = "abcdefgh";
    const profrequests = await Request
        .find({professor:professor});
        res.send(profrequests);
});

router.put('/requests/view/professor/:id',async(req,res)=>{
    //get prof id if prof
    const id = req.params.id;
    const changerequest = await Request
        .find({_id:id});
    

        res.send(profrequests);
});


router.post('/requests/createrequests',async(req,res)=>{

});


module.exports = router;