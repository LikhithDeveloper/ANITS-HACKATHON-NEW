# TalentScout AI - Backend API

The backend for TalentScout AI, built with Node.js, Express, and MongoDB. It handles user authentication, job management, and AI-powered resume screening via Groq.

## ⚙️ Setup & Installation

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret_key
    GROQ_API_KEY=your_primary_key (Note: Controller uses an internal pool of 7 keys)
    ```

3.  **Run Server**
    ```bash
    node server.js
    npm run dev
    ```

3.  **🔑 API Key Configuration**
    The application uses a pool of Groq API Keys to handle rate limiting.
    These keys are stored in [`config/keys.js`](./config/keys.js).
    You can update the `GROQ_KEYS` array in this file to add or rotate your own keys.

## 📡 API Endpoints

### Authentication
*   `POST /api/auth/register` - Register a new Recruiter (Company Name, Website required).
*   `POST /api/auth/login` - Login and receive JWT.
*   `GET /api/auth/me` - Get current user profile.

### Jobs
*   `POST /api/jobs` - Create a new Job Profile.
*   `GET /api/jobs` - Get all jobs created by the logged-in recruiter.
*   `GET /api/jobs/:id` - Get specific job details.

### Screening & AI
*   `POST /api/screening/analyze` - Single resume analysis (Ephemeral).
*   `POST /api/screening/:jobId/bulk-screen` - Bulk upload resumes (PDF).
    *   **Features**: Accepts array of files (limit 100), checks mime-type, analyzes via Groq, saves to DB.
    *   **Logic**: Uses Smart Batching (5 parallel requests) to respect rate limits.
*   `GET /api/screening/:jobId/applications` - Get ranked list of candidates for a job.

## 🧠 AI Engine Details
*   **Model**: Llama-3.1-8b-instant (via Groq Cloud).
*   **Prompting**: Uses strict system prompts to score candidates from 0-100 based on exact Job Description alignment.
*   **Resilience**: Implements automatic key rotation if a `429` Rate Limit error is encountered.

## 🛡 Security
*   **Auth**: All protected routes require `Authorization: Bearer <token>` header.
*   **Validation**: PDF-only file upload restriction.
