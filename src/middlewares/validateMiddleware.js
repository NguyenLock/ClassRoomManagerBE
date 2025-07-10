module.exports = (fields = []) =>{
    return (req, res, next) =>{
        for(let field of fields){
            if(!req.body[field]){
                return res.status(400).json({
                    error: `Missing required field: ${field}`
                });
            }
        }
        next();
    }
}