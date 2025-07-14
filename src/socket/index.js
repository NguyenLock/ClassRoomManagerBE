const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const db = require('../config/firebase');
const chatModel = require('../models/chatModel');

function initializeSocket(server) {
    const io = socketIO(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    
    io.use(async (socket, next) => {
        try {
            console.log('Socket authentication attempt...');
            const token = socket.handshake.auth.token;
            const selectedUserType = socket.handshake.auth.userType;

            if (!token) {
                return next(new Error('Authentication error: Token required'));
            }

            if (!selectedUserType) {
                return next(new Error('Authentication error: User type required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Decoded token:', decoded);

            
            if (decoded.userType !== selectedUserType) {
                return next(new Error(`Authentication error: Token is for ${decoded.userType}, not ${selectedUserType}`));
            }
            
            
            if (decoded.userType === 'instructor') {
                if (!decoded.phoneNumber) {
                    return next(new Error('Authentication error: Invalid instructor token'));
                }
                const userRef = db.collection('users').doc(decoded.phoneNumber);
                const userDoc = await userRef.get();
                if (!userDoc.exists || userDoc.data().userType !== 'instructor') {
                    return next(new Error('Authentication error: Invalid instructor'));
                }
                console.log('Instructor authenticated:', decoded.phoneNumber);
            } else if (decoded.userType === 'student') {
                if (!decoded.email) {
                    return next(new Error('Authentication error: Invalid student token'));
                }
                const studentRef = await db.collection('students').where('email', '==', decoded.email).get();
                if (studentRef.empty) {
                    return next(new Error('Authentication error: Invalid student'));
                }
                console.log('Student authenticated:', decoded.email);
            } else {
                return next(new Error('Authentication error: Invalid user type'));
            }
            
            socket.user = decoded;
            next();
        } catch (error) {
            console.error('Socket authentication error:', error);
            next(new Error('Authentication error: ' + (error.message || 'Invalid token')));
        }
    });

   
    io.on('connection', (socket) => {
        const identifier = socket.user.userType === 'instructor' ? 
            socket.user.phoneNumber : socket.user.email;
        console.log(`User connected: ${identifier}`);

        
        if (socket.user.userType === 'instructor') {
            socket.join('instructor-room');
            console.log(`Instructor joined room: instructor-room`);
        } else {
            socket.join(`student-${socket.user.email}`);
            console.log(`Student joined room: student-${socket.user.email}`);
        }

        
        socket.on('send-message', async (data) => {
            try {
                console.log('Received message data:', data);
                const { recipientEmail, message } = data;
                const sender = socket.user;
                console.log('Sender info:', sender);

                
                if (sender.userType === 'student') {
                    console.log('Student sending message to all instructors');
                    
                    const instructorsRef = await db.collection('users')
                        .where('userType', '==', 'instructor')
                        .get();
                    
                    console.log('Found instructors:', instructorsRef.size);
                    
                    const messageData = {
                        studentEmail: sender.email,
                        fromName: sender.name,
                        message,
                        senderType: 'student'
                    };

                    
                    await chatModel.saveMessage(messageData);
                    
                    instructorsRef.forEach(doc => {
                        io.to('instructor-room').emit('new-message', {
                            ...messageData,
                            timestamp: new Date()
                        });
                        console.log('Message sent to instructor room');
                    });

                    socket.emit('new-message', {
                        ...messageData,
                        timestamp: new Date()
                    });
                    console.log('Message sent back to student');

                } else if (sender.userType === 'instructor') {
                    console.log('Instructor sending message to student:', recipientEmail);
                    
                    const studentRef = await db.collection('students')
                        .where('email', '==', recipientEmail)
                        .get();
                    
                    if (studentRef.empty) {
                        throw new Error('Student not found');
                    }
                    console.log('Student found, sending message');

                    const messageData = {
                        studentEmail: recipientEmail,
                        instructorPhone: sender.phoneNumber,
                        message,
                        senderType: 'instructor'
                    };

                    await chatModel.saveMessage(messageData);
                    
                    io.to(`student-${recipientEmail}`).emit('new-message', {
                        ...messageData,
                        timestamp: new Date()
                    });
                    console.log('Message sent to student room');

                    socket.emit('new-message', {
                        ...messageData,
                        timestamp: new Date()
                    });
                    console.log('Message sent back to instructor');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('error', { message: 'Failed to send message: ' + error.message });
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${identifier}`);
        });
    });

    return io;
}

module.exports = initializeSocket;
