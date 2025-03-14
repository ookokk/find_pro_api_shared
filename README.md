Project Overview

Admin Server is a backend system built with Node.js and Express, designed to manage user interactions, job postings, messaging, and more. The project utilizes MongoDB as its database, managed via Mongoose, and includes real-time features such as WebSocket-based messaging. This system is ideal for applications that require user authentication, job listings, and communication features.

I also prepared mobile client app for this server.
[link](https://github.com/Find-Pro/mobile)

Features

User Authentication: Secure user authentication with JWT.
Job Management: Users can post and manage job listings.
Messaging System: Real-time chat functionality using WebSockets.
User Interactions: Follow, block, and comment on users.
Task Scheduling: Automated tasks using node-cron.
File Uploads: Multer for handling profile and cover pictures.

Tech Stack

Node.js (Runtime Environment)
Express.js (Backend Framework)
MongoDB (Database)
Mongoose (ODM for MongoDB)
WebSockets (Real-time messaging)
JWT (Authentication & Authorization)
Multer (File uploads)
CORS & Cookie-parser (Security & Middleware)
dotenv (Environment variable management)
node-cron (Task scheduling)

Installation

Clone the repository:
```
git clone https://github.com/Find-Pro/server
```
Install dependencies:
```
npm install
```

Set up environment variables in a .env file:

MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

Start the server:
```
npm run dev
```
Contribution

Feel free to fork and contribute! Make sure to open a pull request with your changes.


Check out the mobile client on stores : 

https://apps.apple.com/us/app/find-pro/id6740331723?platform=iphone


https://play.google.com/store/apps/details?id=com.kok.findpro

![Untitled](https://github.com/user-attachments/assets/6769e53d-7c05-44ef-b435-c90f5e2c3f60)
