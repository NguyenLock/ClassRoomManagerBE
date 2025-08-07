const db = require('../config/firebase');

module.exports = (requiredRole = 'instructor') =>{
    return async (req, res, next) =>{
        try{
            const userType = req.userType;
            if(!userType){
                return res.status(401).json({
                    error: 'Unauthorized. Missing User Type!'
                })
            }
            
            if(userType !== requiredRole){
                return res.status(403).json({
                    error: 'Forbidden. Insufficient permissions!'
                })
            }
            
            next();
        }catch(error){
            res.status(500).json({
                error: 'Internal Server Error'
            })
        }
    }
}