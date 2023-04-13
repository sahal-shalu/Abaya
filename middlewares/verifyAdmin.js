


function verifyAdmin(req,res,next){
    if(req.session.admin){
        next()
    }else{
        console.log('not enterrr')
        res.redirect("/admin/login")
    }
}

module.exports = verifyAdmin