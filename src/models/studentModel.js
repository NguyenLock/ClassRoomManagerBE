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
exports.getAllStudents = async () =>{
    try{
        const getStudents = await studentsCollection.get();
        return getStudents.docs.map(doc =>{
            const StudentData = doc.data();
            return{
                name: StudentData.name,
                phoneNumber: StudentData.phoneNumber,
                email: StudentData.email,
            }
        });
    }catch(error){
        console.error('Error getting all students', error);
        throw error;
    }
};
exports.getStudentByPhone = async ({phoneNumber}) =>{
    try{
        const doc = await studentsCollection.doc(phoneNumber).get();
        if(!doc.exists){
            return null;
        }
        return doc.data();
    }catch(error){
        throw error;
    }
};
exports.editStudentByPhone = async ({phoneNumber, updateData}) =>{
    try{
        const studentRef = studentsCollection.doc(phoneNumber);
        const studentDoc = await studentRef.get();
        if(!studentDoc.exists){
            throw new Error('Student not found');
        }
        await studentRef.update(updateData);
        const updatedStudent = await studentRef.get();
        return updatedStudent.data();
    }catch(error){
        console.error('Error editing student', error);
        throw error;
    }
};
exports.deleteStudentByPhone = async ({phoneNumber}) =>{
    try{
        const studentRef = studentsCollection.doc(phoneNumber);
        const studentDoc = await studentRef.get();
        if(!studentDoc.exists){
            throw new Error('Student not found');
        }
        await studentRef.delete();
    }catch(error){
        console.error('Error deleting student', error);
        throw error;
    }
}