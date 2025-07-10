module.exports = (req,res ,next) =>{
    const phoneNumber = req.headers['x-phone-number'] || req.body.phoneNumber;

    if(!phoneNumber){
        return res.status(401).json({
            error:'Unauthorized. Missing Phone Number.'
        });
    }
    req.phoneNumber = phoneNumber;
    next();
}