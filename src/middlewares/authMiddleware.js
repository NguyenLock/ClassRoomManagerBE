const jwt = require('jsonwebtoken');

module.exports = (req,res ,next) =>{
   const authHeader = req.headers['authorization'];
    if(!authHeader){
        return res.status(401).json({
            error: 'Unauthorized. Missing Authorization Header.'
        });
    }
    const tokenParts = authHeader.split(' ');
    if(tokenParts.length !==2 || tokenParts[0] !== 'Bearer'){
        return res.status(401).json({
            error: 'Unauthorized. Invalid Authorization Header Format.'
        })
    }
    const token = tokenParts[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;
        req.phoneNumber = decoded.phoneNumber;
        req.userType = decoded.userType;
        next();
    }catch(error){
        return res.status(401).json({
            error: 'Unauthorized. Invalid Token.'
        });
    }
}