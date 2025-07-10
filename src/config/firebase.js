const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
})

try{
    const db = admin.firestore();
    console.log('Firebase Connected Successfully');
    module.exports = db;
}catch(error){
    console.error('Error Connecting to Firebase', error);
    throw error;
}
 
