# Study Platform

A full-stack learning management system with student and teacher accounts.

## Features

### Teachers Can:
- Upload videos
- Create quizzes with multiple choice questions
- Send messages to individual students or broadcast to all
- View quiz results and student scores

### Students Can:
- Watch videos
- Take quizzes and view scores
- Send messages to teachers

## Tech Stack

- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** SQLite (no installation needed)
- **Video Storage:** Cloudinary

## Setup

### Prerequisites
- [Node.js](https://nodejs.org/) installed

### 1. Cloudinary Setup (for videos)
1. Go to https://cloudinary.com/ and create a free account
2. Copy these 3 values from your Cloudinary Dashboard:
   - Cloud Name
   - API Key
   - API Secret

### 2. Configure the App

Open `server/.env` and fill in your Cloudinary credentials:
```env
JWT_SECRET="any-secret-key-you-want"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
PORT=5000
```

### 3. Install & Run

**Start the backend:**
```bash
cd server
npm install
npm run dev
```

**Start the frontend (in a new terminal):**
```bash
cd client
npm install
npm run dev
```

### 4. Open the App
Go to **http://localhost:3000** in your browser.

---

## Usage

1. **Register** as a Teacher or Student
2. **Teachers** can upload videos, create quizzes, and message students
3. **Students** can watch videos, take quizzes, and message teachers
