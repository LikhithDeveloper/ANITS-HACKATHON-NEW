# TalentScout AI - Frontend Application

The React-based frontend for TalentScout AI, featuring a modern, dark-themed UI for recruiters to manage jobs and screen candidates.

## 🚀 Features
*   **Recruiter Dashboard**: Overview of all active job postings and status.
*   **Job Creation**: Detailed form to specify skills, requirements, and job details.
*   **Smart Bulk Upload**:
    *   Drag-and-drop interface support multiple PDF files.
    *   **Client-Side Batching**: Uploads files in chunks of 5 to ensure backend stability and provide real-time feedback.
    *   **Progress Bar**: Visual indicator of the analysis progress.
*   **Candidate Insights**:
    *   Expandable cards showing Match Score and Status.
    *   Detailed view of "Missing Critical Skills" and "AI Summary".
    *   Color-coded scores (Green/Yellow/Red).

## 🛠 Tech Stack
*   **Vite**: Fast build tool and dev server.
*   **React**: Component-based UI.
*   **Framer Motion**: Smooth animations for page transitions and card interactions.
*   **Lucide React**: Modern icon set.
*   **React Dropzone**: File handling.
*   **Module CSS**: Custom styling variables (`index.css`).

## ⚙️ Setup
1.  **Install Dependencies**
    ```bash
    npm install
    ```
2.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

## 📂 Key Components
*   `pages/Dashboard.jsx`: Main hub for recruiters.
*   `pages/JobDetails.jsx`: Complex view handling both job info and the screening/candidates tab. Implements the batch upload logic.
*   `components/Navbar.jsx`: Responsive navigation with auth state awareness.
*   `context/AuthContext.jsx`: Handles user session and JWT storage.

## 🎨 Design System
The app uses a "Dark Premium" theme defined in `index.css`:
*   **Backgrounds**: Deep slate/black (`#0f172a`, `#1e293b`).
*   **Accents**: Blue (`#3b82f6`) and Emerald (`#10b981`) for success states.
*   **Typography**: Inter/System fonts for clean readability.
