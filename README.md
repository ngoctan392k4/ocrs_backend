# Online Course Registration System
## Table of Contents
- [Online Course Registration System](#online-course-registration-system)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [❓ Problem Description](#-problem-description)
  - [🎯 Project Objectives](#-project-objectives)
  - [🚀 Backend Scope](#-backend-scope)
  - [✨ Key Features](#-key-features)
    - [Student](#student)
    - [Instructor](#instructor)
    - [Admin](#admin)
    - [System](#system)
    - [Payment System](#payment-system)
    - [Communication](#communication)
  - [📝 Installation \& Setup](#-installation--setup)
    - [Prerequisites](#prerequisites)
    - [Configuration for .env file](#configuration-for-env-file)
    - [Backend Setup](#backend-setup)

## Overview
The OCRS Backend is a Node.js/Express-based RESTful API server that manage the main logic of the Online Course Registration System at XYZ University. It manages all business logic, database operations, authentication, payment processing, and communication services for the course registration platform.

## ❓ Problem Description
- At XYZ University, the current course registration process is paper-based and manual. 
- Students must fill out registration forms and submit them to the academic office. Staff then manually enter the data into the management system to create individual study schedules.
- The critical challenges:
  - **Manual & Paper-Based**: Students must fill out physical forms
  - **Time-Consuming**: Process takes several days to complete
  - **Error-Prone**: High risk of human errors
  - **Scheduling Conflicts**: Difficult to detect and manage conflicts
=> To solve these issues, the university made the decision to develop an Online Course Registration System that allows students, instructors, and administrators to manage course registration efficiently through a web-based system.

## 🎯 Project Objectives
- Allow students to search, register, add/drop courses online 
- Automatically manage class capacity and scheduling conflicts
- Automatically cancel classes if they do not have enough students to open
- Handle alternative courses when a class is canceled
- Support online payment and invoice generation
- Enable instructors to manage classes and enter grades
- Provide smart course recommendations and timetable suggestions
- Reduce manual work and improve accuracy and efficiency

## 🚀 Backend Scope
The backend system provides the **core business logic and data management** for the Online Course Registration System at XYZ University.  
It handles authentication, course registration rules, scheduling logic, payment integration, and academic data management.

## ✨ Key Features
- Student
    - Search and view available courses
    - Register / add / drop courses
    - Select alternative courses
    - View timetable and academic results
    - Online tuition payment and invoice

- Instructor
    - View assigned classes
    - Manage student lists
    - Enter grades

- System
    - Automatic class cancellation (less than 10 students)
    - Smart timetable conflict detection
    - Course recommendation based on academic history
    - Chatbot for course registration assistance

### Student
- **Available Course Check**: Search and filter available courses
- **Course Registration**: Register, add, or drop courses during add/ drop period
- **Alternative Courses**: Select alternatives when classes are cancelled
- **Transcript Viewing**: View academic results
- **Online Payment**: Pay tuition via QR code
- **Payment History**: Track payment records and invoices
- **Smart Timetable**: Suggest classes without scheduling conflicts with registered classes
- **AI Chatbot**: Get assistance for course registration questions
- **Smart Recommendations**: Receive personalized course suggestions

### Instructor
- **Teaching Schedule**: View assigned class times and locations
- **Student Management**: View student lists for each class
- **Grade Management**: Enter and manage student grades

### Admin
- **Admin Dashboard**: University Performance
- **Account Management**: Create, edit, and deactivate user accounts
- **Class Management**: Create, edit, and delete classes and schedules
- **Course Management**: Create, edit, and delete courses
- **Course Opening**: Open courses for upcoming semester
- **Payment Tracking**: Monitor all students' payment

### System
- **Automation**: Automatic class cancellation (less than 10 students)
- **Authentication**: Secure login
- **Role-Based Access**: Access Management based on users' role
- **Password Recovery**: Password reset

### Payment System
- Integration with PayOS payment gateway
- Invoice generation and email delivery
- Payment history and tracking

### Communication
- Email notifications (payment, password reset)
- Invoice delivery via Mailtrap/Nodemailer (for demo)

## 📝 Installation & Setup
### Prerequisites
- Git
- Node.js 
- npm
- PostgreSQL Database
- PgAdmin/ DBeaver (any Database Management System)
- PayOS account (for payment processing)
- Google AI Studio account (for Gemini API)
- Mailtrap account (for email testing/sending)

### Configuration for .env file  
- Step 1: Create .env file from the root folder
- Step 2: Update the env variables based on the following example:
```env
PORT=3001  
db_user=postgres < user of database >
db_host=postgres < host of database >
db_name=ocrs < name of database >
db_password=ocrs < password of database >
db_port=5432 < port of database >
service_host=sandbox.smtp.mailtrap.io < host of mailtrap for demo >
service_port=2525  < port of mailtrap for demo >
service_user=demo  < user of mailtrap for demo >
service_user_pwd=demo123 < password of mailtrap for demo >
service_sender=xyzuni@edu.com < any email for sender option in nodemailer >
PAYOS_CLIENT_ID=123xyz < Client ID PAYOS from PAYOS API > 
PAYOS_API_KEY=123xyz < API KEY from PAYOS account >
PAYOS_CHECKSUM_KEY=123xyz  < Checksum Key from PAYOS account >
GEMINI_API_KEY=123xyz  < Gemini API key from account >
```

### Backend Setup
- Step 1: Install dependencies with the following bash
```shell
    npm install
```
- Step 2: Running the backend with the following bash
```shell
    npm run start:dev
```