# Classroom Management Backend

A comprehensive Node.js backend application for managing classroom activities, student enrollment, lessons, and real-time communication between instructors and students.

## 🚀 Features

### Authentication & Authorization

- **Multi-role Authentication**: Support for both instructors and students
- **Phone Number Verification**: SMS-based verification using Twilio
- **Email Verification**: Account setup with email verification
- **JWT Token Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for instructors and students

### Student Management

- **Student Registration**: Instructors can add students via email
- **Account Setup**: Students complete profile setup via verification link
- **Profile Management**: Students can edit their profiles
- **Phone Number Integration**: SMS notifications and verification

### Lesson Management

- **Lesson Creation**: Instructors can create lessons with title and description
- **Lesson Assignment**: Assign lessons to specific students
- **Progress Tracking**: Mark lessons as completed
- **Lesson Viewing**: Students can view their assigned lessons

### Real-time Communication

- **Socket.IO Integration**: Real-time chat functionality
- **Instructor-Student Chat**: Direct messaging between instructors and students
- **Chat History**: Persistent chat message storage
- **Real-time Notifications**: Instant message delivery

### Additional Features

- **Firebase Integration**: Cloud storage for user data and lessons
- **Email Notifications**: Automated email sending for account verification
- **SMS Integration**: Twilio-based SMS for verification codes
- **CORS Support**: Cross-origin resource sharing enabled
- **Static File Serving**: Chat interface served via public directory

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Firebase Firestore
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time Communication**: Socket.IO
- **SMS Service**: Twilio
- **Email Service**: Nodemailer (Gmail)
- **Password Hashing**: bcrypt
- **Development**: Nodemon for auto-restart

## 📋 Prerequisites

- Node.js (v14 or higher)
- Firebase project with Firestore enabled
- Twilio account for SMS services
- Gmail account for email services

## ⚙️ Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/NguyenLock/ClassRoomManagerBE.git
   cd ClassRoomManagerBE
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:

   ```env
   PORT=8080
   JWT_SECRET=your_jwt_secret_key

   # Firebase Configuration
   FIREBASE_DATABASE_URL=your_firebase_database_url

   # Twilio Configuration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number

   # Email Configuration
   EMAIL_USER=your_gmail_address
   EMAIL_APP_PASSWORD=your_gmail_app_password
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587

   # Frontend URL
   FRONTEND_URL=http://localhost:3000
   ```

4. **Firebase Setup**

   - Create a Firebase project
   - Generate a service account key
   - Save it as `src/config/firebase-admin.json`

5. **Start the application**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🔗 API Endpoints

### Authentication Routes (`/auth`)

- `POST /auth/create-access-code` - Generate SMS verification code
- `POST /auth/verify-access-code` - Verify SMS code and get JWT token
- `GET /auth/me` - Get current user information

### Student Authentication Routes (`/student-auth`)

- `POST /student-auth/setup-account/:verificationToken` - Complete student account setup
- `POST /student-auth/login-email` - Student login with email/password
- `POST /student-auth/validate-code` - Validate access code for students
- `PUT /student-auth/edit-profile` - Edit student profile

### Instructor Routes (`/instructor`)

- `POST /instructor/addStudent` - Add new student (instructor only)
- `POST /instructor/lesson/create` - Create new lesson
- `GET /instructor/lessons` - Get all lessons
- `GET /instructor/lesson/:lessonId` - Get specific lesson
- `POST /instructor/assignLesson` - Assign lesson to student
- `GET /instructor/students` - Get all students
- `GET /instructor/student/:studentId` - Get specific student

### Lesson Routes (`/lessons`)

- `GET /lessons/my-lessons` - Get student's assigned lessons
- `POST /lessons/mark-completed` - Mark lesson as completed

### Chat Routes (`/chat`)

- `GET /chat` - Access chat interface
- `GET /chat/history` - Get chat history

## 🔐 Authentication Flow

### For Instructors:

1. Request access code via phone number (`/auth/create-access-code`)
2. Verify SMS code (`/auth/verify-access-code`)
3. Receive JWT token for authenticated requests

### For Students:

1. Instructor adds student email (`/instructor/addStudent`)
2. Student receives verification email
3. Student sets up account (`/student-auth/setup-account/:token`)
4. Student logs in with email/password (`/student-auth/login-email`)

## 🔄 Real-time Features

The application uses Socket.IO for real-time communication:

- **Authentication**: Socket connections require JWT token
- **Role-based Rooms**: Separate handling for instructors and students
- **Message Persistence**: All messages stored in Firebase
- **Online Status**: Track user connection status

### Socket Events:

- `connection` - User connects to chat
- `join_room` - Join specific chat room
- `send_message` - Send message to recipient
- `receive_message` - Receive incoming message
- `disconnect` - User disconnects

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-based Access**: Middleware for role verification
- **Input Validation**: Request validation middleware
- **CORS Configuration**: Controlled cross-origin access
- **Environment Variables**: Sensitive data protection

## 🚦 Development

### Available Scripts:

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Testing the Chat Feature:

1. Start the server
2. Navigate to `http://localhost:8080/chat`
3. Use the provided HTML interface for testing

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Author

**Nguyen Tan Loc** **aka** **JohnMarston**

## 🔧 Troubleshooting

- if you test by phone number, there are only 2 valid prefixes +84 or 0
  For example: +84123456789 or 0123456789