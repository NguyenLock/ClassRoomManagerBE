const jwt = require('jsonwebtoken');
// const AccessToken = require('twilio/lib/jwt/AccessToken');
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

        const userRef = db.collection('users').doc(phoneNumber);
        const userDoc = await userRef.get();

        if(!userDoc.exists){
            await userRef.set({
                phoneNumber: phoneNumber,
                userType: 'student',
                createdAt: new Date().toISOString()
            })
        }

        let userType = 'student';
        if(userDoc.exists){
            userType = userDoc.data().userType || 'student';
        }
        const tokenPayload = {
            phoneNumber: phoneNumber,
            userType
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET,{
            expiresIn: process.env.JWT_EXPIRES_IN
        });
        res.json({success: true, userType, accessToken: token});
    }catch(error){
        res.status(500).json({
            error: 'Internal server error'
        })
    }
}

exports.editInstructorProfile = async (req, res) => {
    try {
        const phoneNumber = req.phoneNumber;
        const { name, email } = req.body;

        const userRef = db.collection('users').doc(phoneNumber);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            return res.status(404).json({ error: 'Instructor not found' });
        }

        const currentData = userDoc.data();
        if (currentData.userType !== 'instructor') {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updateData = {
            name,
            email,
            updatedAt: new Date().toISOString()
        };

        await userRef.update(updateData);

        res.json({
            success: true,
            data: {
                phoneNumber,
                name,
                email,
                userType: 'instructor'
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getCurrentUser = async (req, res) => {
    try {
        const userType = req.user.userType;
        let userData;

        if (userType === 'instructor') {
            const userRef = db.collection('users').doc(req.user.phoneNumber);
            const userDoc = await userRef.get();
            
            if (!userDoc.exists) {
                return res.status(404).json({ error: 'User not found' });
            }

            const data = userDoc.data();
            userData = {
                phoneNumber: data.phoneNumber,
                name: data.name,
                email: data.email,
                userType: data.userType,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
        } else {
            const studentRef = db.collection('students');
            const studentQuery = await studentRef.where('email', '==', req.user.email).get();

            if (studentQuery.empty) {
                return res.status(404).json({ error: 'User not found' });
            }

            const data = studentQuery.docs[0].data();
            userData = {
                email: data.email,
                name: data.name,
                phoneNumber: data.phoneNumber,
                userType: 'student',
                isVerified: data.isVerified,
                accountSetup: data.accountSetup,
                createdAt: data.createdAt,
                updatedAt: data.updatedAt
            };
        }

        res.json({
            success: true,
            data: userData
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getAllInstructors = async (req, res) => {
    try {
        if (req.user.userType !== 'student') {
            return res.status(403).json({ 
                success: false,
                error: 'Access denied. Student only.' 
            });
        }

        const usersRef = db.collection('users');
        const instructorsQuery = await usersRef.where('userType', '==', 'instructor').get();

        const instructors = [];
        instructorsQuery.forEach(doc => {
            const data = doc.data();
            instructors.push({
                phoneNumber: data.phoneNumber,
                name: data.name,
                email: data.email
            });
        });

        res.json({
            success: true,
            total: instructors.length,
            data: instructors
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            error: 'Internal server error' 
        });
    }
};
