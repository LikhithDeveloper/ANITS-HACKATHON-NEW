---
description: Implementation plan for Unbiased (Blind) Screening feature
---

# Unbiased Screening Implementation Plan

## Goal
To implement a "Blind Screening" mode that removes bias-inducing PII (Personally Identifiable Information) from the candidate review process, ensuring candidates are evaluated solely on their skills and match score.

## 1. Backend Updates (`backend/controllers/screeningController.js`)
- **Objective**: Ensure AI generated summaries are free of gender bias.
- **Action**: Update the system prompt for `analyze_resume` (and by extension `bulkScreenResumes`) to explicitly instruct the LLM:
    - To use neutral language (e.g., "The candidate," "They") in the `summary`.
    - To strictly avoid using the candidate's name or gendered pronouns in the qualitative analysis text.

## 2. Frontend Updates (`frontend/src/pages/JobDetails.jsx`)
- **Objective**: Create a UI toggle to mask PII.
- **Action**:
    - **Step 1**: Add a state variable `unbiasedMode` (boolean), default `false`.
    - **Step 2**: Add a toggle switch/button in the `JobHeader` or `JobActions` section to enable/disable "Unbiased Mode".
    - **Step 3**: Conditional Rendering based on `unbiasedMode`:
        - **Name**: Replace `app.candidateName` with a generic alias (e.g., "Candidate #1").
        - **Email**: Hide or replace with `[Hidden in Unbiased Mode]`.
        - **Resume Link**: Disable the "View Resume" link and change text to "Resume Hidden" (since the PDF itself contains PII).
        - **Avatar/Icons**: Ensure no gender-specific placeholders are used (current design uses generic icons, so this is fine).
    - **Step 4**: Styling:
        - Add visual cues (e.g., a "Blind Mode Active" badge) when the mode is on.

## 3. Verification
- **Test Case**: Upload a resume with a clearly gendered name (e.g., "Alice Smith").
- **Expected Result**: 
    - In Unbiased Mode: Name shows as "Candidate #X", Email hidden, Summary uses "The candidate..."
    - In Normal Mode: "Alice Smith" is visible.

## Executing Code Refactoring
**Note**: We will modify existing files. No new files are strictly necessary, but we might touch CSS.
