# TalentScout AI 🚀

TalentScout AI is an advanced, AI-powered recruitment platform designed to streamline the hiring process. It leverages Large Language Models (LLMs) to automate resume screening, generate biased-free candidate analysis, and provide personalized interview guidance.

## 🌟 Features

*   **AI-Powered Resume Screening**: Automatically parses PDFs and analyzes candidates against job descriptions using Groq/Llama models.
*   **Unbiased Hiring**: "Blind Screening" mode hides candidate names and gender to reduce unconscious bias.
*   **Smart Job Management**: Create job postings with customizable recruitment phases.
*   **Candidate Experience**:
    *   **Guidance Page**: Personalized interview preparation roadmaps for shortlisted candidates.
    *   **Feedback Page**: Constructive skill gap analysis for rejected candidates.
*   **Modern UI**: Sleek, light-themed interface built with React and Glassmorphism design principles.

## 🏗 Tech Stack

*   **Frontend**: React.js, Vite, CSS Modules (Light AI Theme), Framer Motion.
*   **Backend**: Node.js, Express.js.
*   **Database**: MongoDB (via Mongoose).
*   **AI Engine**: Groq API (Llama 3 models).
*   **Tools**: Multer (File Uploads), PDF-Parse.

## 📂 Project Structure

```
ANITS-HACKATHON/
├── backend/            # Express Server, API Routes, AI Logic
├── frontend/           # React Application (Vite)
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

*   Node.js (v16 or higher)
*   MongoDB (Local or Atlas URI)
*   Groq API Key(s)

### Quick Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd ANITS-HACKATHON
    ```

2.  **Install Dependencies**:
    *   **Backend**:
        ```bash
        cd backend
        npm install
        ```
    *   **Frontend**:
        ```bash
        cd frontend
        npm install
        ```

3.  **Configuration**:
    *   See `backend/README.md` for `.env` and API key setup.

4.  **Run the Application**:
    *   Open Terminal 1 (Backend):
        ```bash
        cd backend
        npm run dev     # or node server.js
        ```
    *   Open Terminal 2 (Frontend):
        ```bash
        cd frontend
        npm run dev
        ```

5.  **Access**:
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:5000`

## 🛡 License

This project is developed for the ANITS Hackathon.
