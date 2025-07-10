const db = require('../config/firebase');

module.exports = (requiredRole = 'instructor') =>{
    return async (req, res, next) =>{
        try{
            const phoneNumber = req.phoneNumber || req.body.phoneNumber;
            if(!phoneNumber){
                return res.status(401).json({
                    error: 'Unauthorized. Missing Phone Number!'
                })
            }
            const userDoc = await db.collection('users').doc(phoneNumber).get();
            if(!userDoc.exists){
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