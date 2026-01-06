---
description: Migration plan to move file storage from local uploads to Cloudinary
---

# Cloudinary Storage Migration Plan

## Goal
Replace the local `uploads/` folder with Cloudinary cloud storage for resume PDFs. This ensures persistence and scalability.

## 1. Install Dependencies
We need the Cloudinary SDK, the Multer storage engine for it, and Axios to download files for parsing.
- Run: `npm install cloudinary multer-storage-cloudinary axios` (in `backend` directory)

## 2. Environment Configuration
- Update `backend/.env` with the provided credentials.
- Add: `CLOUDINARY_URL=cloudinary://116132144199897:BEDm3YERFBW5JU4rwy26Uy3Wh6s@dbpgyw4as`

## 3. Create Cloudinary Config
- **File**: `backend/config/cloudinary.js`
- **Action**: Initialize Cloudinary and configure the Multer storage engine.
    - Set folder to `anits-hackathon-resumes`.
    - Allowed formats: `['pdf']`.

## 4. Update Screening Routes
- **File**: `backend/routes/screeningRoutes.js`
- **Action**: Replace the existing `diskStorage` configuration with the Cloudinary storage configuration.
    - Import the storage from `../config/cloudinary`.
    - `upload` middleware will now stream files directly to Cloudinary.

## 5. Update Resume Parser
- **File**: `backend/utils/resumeParser.js`
- **Issue**: Currently uses `fs.readFileSync`, which works only for local files. Cloudinary returns a URL.
- **Action**: Refactor `parseResume` to handle URLs:
    - Check if `filePath` starts with `http`.
    - If **URL**: Use `axios` to fetch the file buffer (`responseType: 'arraybuffer'`).
    - If **Local File**: Use `fs.readFileSync` (fallback).
    - Pass the buffer to `pdf-parse`.

## 6. Update Screening Controller
- **File**: `backend/controllers/screeningController.js`
- **Action**:
    - **Remove Cleanup**: Delete lines containing `fs.unlinkSync(req.file.path)`. 
      - *Reason*: The file is no longer local, so `fs.unlink` will throw an error. We want to keep the file on Cloudinary (especially for bulk applications).
    - **Bulk Screen**: The logic `req.files.map(f => f.path)` will automatically capture the Cloudinary secure URL, which is perfect for saving to the database.

## 7. Verification
- **Test**: Upload a resume via the "Job Details" page.
- **Expectation**: 
    - No file appears in `uploads/`.
    - The file appears in your Cloudinary Dashboard.
    - The Resume Parsing works correctly (AI analysis returns results).
    - clicking "View Resume" in the UI opens the Cloudinary URL.

// turbo-all
