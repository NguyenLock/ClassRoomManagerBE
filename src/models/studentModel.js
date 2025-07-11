const db = require('../config/firebase');

const studentsCollection = db.collection('students');

exports.addStudent = async ({name, phoneNumber, email}) => {
    try{
        const studentDoc = await studentsCollection.doc(phoneNumber).get();
        if(studentDoc.exists){
            throw new Error('Student already exists');
        }
        const studentInfo = {
            name: name,
            phoneNumber: phoneNumber,
            email: email,
            lessons: [],
            createdAt: new Date().toISOString(),
        };
        await studentsCollection.doc(phoneNumber).set(studentInfo);
        return studentInfo;
    }catch(error){
        console.error('Error adding student', error);
        throw error;
    }
}