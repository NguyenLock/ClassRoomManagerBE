const db = require('../config/firebase')
const {client, fromPhone} = require('../config/twilio');
const generate6Code = require('../utils/generateCode');


exports.createAccessCode = async (req, res) =>{
    try{
        const {phoneNumber} = req.body;
        if(!phoneNumber){
            return res.status(400).json({
                error: 'Phone number is required'
            })
        }
        const accessCode = generate6Code();

        await db.collection('accessCodes').doc(phoneNumber).set({
            code: accessCode,
            createdAt: new Date().toISOString()
        });
        await client.messages.create({
            body: `Your access code is ${accessCode}`,
            from: fromPhone,
            to: phoneNumber
        });
        res.json({messages: 'Access code sent to your Phone Number'});
    } catch(error){
        console.error('Error creating access code', error);
        res.status(500).json({
            error: 'Internal server error'
        })
    };
}

exports.verifyAccessCode = async (req, res) =>{
    try{
        const {phoneNumber, accessCode} = req.body;
        if(!phoneNumber || !accessCode){
            return res.status(400).json({
                error: 'PhoneNumber and accessCode Are Required'
            })
        }
        const docRef = db.collection('accessCodes').doc(phoneNumber);
        const doc = await docRef.get();

        if(!doc.exists){
            return res.status(404).json({
                error: 'Access code not found'
            });
        }
        const data = doc.data();
        if(String(data.code) !== String(accessCode)){
            return res.status(400).json({
                error: 'Invalid Access Code'
            })
        }
        await docRef.delete();

        const userDoc = await db.collection('users').doc(phoneNumber).get();
        let userType = 'student';
        if(userDoc.exists){
            userType = userDoc.data().userType || 'student';
        }
        res.json({success: true, userType});
    }catch(error){
        console.error('Error Verifying Access Code', error);
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}
