const studentModel = require('../models/studentModel');

exports.addStudent = async (req, res) =>{
    try{
        const {name, phoneNumber, email} = req.body;
        if(!name || !phoneNumber || !email){
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }
        const studentInfo = await studentModel.addStudent({name, phoneNumber, email});
        res.status(201).json({
            message: 'Student added successfully',
            success: true,
        });

    }catch(error){
        console.error('Error adding student', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};
exports.assignLesson = async (req, res) =>{
    try{
        const {studentPhone, title, description} = req.body;
        if(!studentPhone || !title || !description){
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }
        const lessons = await studentModel.assignLesson({studentPhone, title, description});
        res.status(201).json({
            message: 'Lesson assigned successfully',
            success: true,
            lessons
        });
    }catch(error){
        if(error.message === 'Student not found'){
            return res.status(404).json({
                error: error.message
            })
        }
        console.error('Error assigning lesson', error);
        res.status(500).json({
            error: 'Internal Server Error'
        });
    }
};