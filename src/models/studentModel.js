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
};
exports.assignLesson = async ({studentPhone, title, description}) =>{
    try{
        const studentRef = studentsCollection.doc(studentPhone);
        const studentDoc = await studentRef.get();

        if(!studentDoc.exists){
            throw new Error('Student not found');
        }
        const studentData = studentDoc.data();
        const lessons = studentData.lessons || [];

        lessons.push({
            title,
            description,
            assignedAt: new Date().toISOString(),
        });
        await studentRef.update({lessons});
        return lessons;
    }catch(error){
        console.error('Error assigning lesson', error);
        throw error;
    }
};
