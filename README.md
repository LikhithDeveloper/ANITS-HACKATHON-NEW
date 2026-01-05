# TalentScout AI - Advanced Resume Screening Agent

TalentScout AI is an intelligent recruitment platform designed to streamline the hiring process. It uses advanced Large Language Models (LLMs) to automatically screen resumes against job descriptions, providing recruiters with critical scoring, skill gap analysis, and candidate rankings.

## 🚀 Key Features

*   **Secure Authentication**: JWT-based stateless authentication for Recruiter accounts.
*   **Job Profile Management**: Create detailed job postings with specific requirements and skills.
*   **Bulk Resume Screening**: Upload 100+ resumes (PDF) simultaneously.
*   **Smart Batching**: Frontend-side chunking (5 files/batch) with real-time progress bars to ensure stability.
*   **AI-Powered Analysis**:
    *   **Strict Scoring (0-100)**: Critical evaluation logic to prevent inflation.
    *   **Skill Gap Analysis**: Identifies missing critical and optional skills.
    *   **4-Week Learning Plan**: Generates a personalized upskilling plan for candidates.
*   **API Rate Limit Handling**: Implements a Round-Robin Key Rotation strategy with 7+ API keys to bypass provider rate limits.
*   **Dashboard**: Centralized view for managing jobs and applications.

## 🛠 Technical Architecture

*   **Frontend**: React.js (Vite), Framer Motion (Animations), Lucide React (Icons), React Dropzone.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (Mongoose) - Stores Users, Jobs, and Application/Screening results.
*   **AI Engine**: Groq API (Llama-3.1-8b-instant) for high-speed, low-latency analysis.
*   **PDF Parsing**: `pdf-parse` for text extraction.

## 📂 Project Structure

```bash
ANITS-HACKATHON/
├── backend/            # Express Server & API
│   ├── controllers/    # Logic for Auth, Jobs, Screening
│   ├── models/         # Mongoose Schemas (User, Job, Application)
│   ├── routes/         # API Endpoints
│   └── utils/          # Resume Parser, AI Key Rotation
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI (Navbar, ProtectedRoute)
│   │   ├── context/    # AuthContext
│   │   ├── pages/      # Dashboard, JobDetails, CreateJob
│   │   └── ...
└── README.md           # Product Requirements Document (PRD)
```

## 🚀 Getting Started

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas URL)

### 2. Backend Setup
Navigate to `backend/` and verify `.env` configuration.
```bash
cd backend
npm install
node server.js
```

### 3. Frontend Setup
Navigate to `frontend/` and start the dev server.
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Security & Optimization
*   **Key Rotation**: The backend cycles through a pool of API keys to handle high-volume requests without hitting `429 Too Many Requests`.
*   **File Validation**: Strict server-side checks ensure only valid PDF MIME types are processed.
*   **Batched Processing**: Parallel processing is capped to batches of 5 to protect server resources.

## 👥 Contributors
Developed for ANITS Hackathon.
