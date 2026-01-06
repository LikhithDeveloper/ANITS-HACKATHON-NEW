# TalentScout AI - Frontend

The frontend user interface for TalentScout AI, built using React and Vite. It provides a modern, responsive experience for recruiters to manage jobs and candidates.

## 🎨 Design System

*   **Theme**: "Light AI" (Clean White & Slate Blue `#4D7AF6`).
*   **Styling**: Plain CSS with CSS Modules/Variables approach.
*   **Components**: Custom implementations of Modals, Dropzones, and Dashboards.

## 🛠 Setup & Run

### 1. Install Dependencies
Navigate to the frontend directory:
```bash
cd frontend
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

## 📱 Key Pages

*   **Landing Page**: Hero section and feature highlights.
*   **Auth**: Login and Registration for recruiters.
*   **Dashboard**: Overview of open job positions.
*   **Create Job**: Form to define roles, skills, and interview phases.
*   **Job Details**:
    *   **Overview Tab**: Job stats.
    *   **Candidates Tab**: List of applicants with "Match Score" badges (Strong/Good/Weak).
    *   **Unbiased Mode**: Toggle to hide names/emails during review.
*   **Resume Screening**: Drag & Drop interface for bulk PDF uploads.

## 🔗 Public Candidate Pages
These pages are accessible without login, designed to be sent via email to candidates:
*   `/guidance/:id` - Personalized interview roadmap for shortlisted candidates.
*   `/feedback/:id` - Skill gap analysis for rejected candidates.

## 🧩 Key Components

*   **Navbar.jsx**: Responsive navigation with glassmorphism effect.
*   **Hero.jsx**: Animated entry section.
*   **AuthContext.jsx**: Handles JWT token storage and user session.
