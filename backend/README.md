# TalentScout AI - Backend

The backend service for TalentScout AI, built with Node.js and Express. It handles authentication, file processing, and interactions with the Groq AI API.

## 🛠 Requirements

*   Node.js
*   MongoDB instance
*   Groq API Key (for LLM inference)

## ⚙️ Configuration

### 1. Environment Variables
Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/talentscout  # Or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_jwt_key
```

### 2. API Keys
For the AI features to work, you must configure your Groq API keys.
Create a file `backend/config/keys.js`:

```javascript
// backend/config/keys.js
const GROQ_KEYS = [
    "gsk_your_first_groq_key_here",
    "gsk_your_second_key_optional_for_rotation"
];

module.exports = { GROQ_KEYS };
```
*Note: The system supports key rotation to handle rate limits.*

## 🏃‍♂️ Running the Server

```bash
# Install dependencies
npm install

# Run in development mode (nodemon)
npm run dev

# Run in production
node server.js
```

## 🔌 API Endpoints

### Auth
*   `POST /api/auth/register` - Register a new recruiter/company.
*   `POST /api/auth/login` - Login and receive JWT.

### Jobs
*   `POST /api/jobs` - Create a new job posting.
*   `GET /api/jobs` - List all jobs.
*   `GET /api/jobs/:id` - Get job details.

### Screening (AI)
*   `POST /api/screening/analyze` - Single resume analysis.
*   `POST /api/screening/:jobId/bulk-screen` - Upload multiple resumes (PDF) for sorting.
*   `GET /api/screening/:jobId/applications` - Get ranked candidates.
*   `GET /api/screening/guidance/:id` - Public link for candidate interview prep.
*   `GET /api/screening/feedback/:id` - Public link for rejection feedback.
