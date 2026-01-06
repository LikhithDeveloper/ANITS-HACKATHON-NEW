const { parseResume } = require("../utils/resumeParser");
const fs = require("fs");
const Job = require("../models/Job");
const Application = require("../models/Application");
require("dotenv").config();

// pool of keys
const { GROQ_KEYS } = require('../config/keys');

let keyIndex = 0;

const getNextKey = () => {
    const key = GROQ_KEYS[keyIndex];
    keyIndex = (keyIndex + 1) % GROQ_KEYS.length;
    return key;
};

// Helper: Call AI Service with Retry/Rotation
const generateAnalysis = async (resumeText, jobDescription) => {
  const prompt = `
You are a critically strict Technical Recruiter and Subject Matter Expert.
Your task is to Evaluate the Candidate Resume AGAINST the provided Job Description (JD) with extreme rigor.

SCORING GUIDELINES:
- **0-40 (Weak Match):** Missing critical skills, insufficient experience, or irrelevant background.
- **41-70 (Good Match):** Has most critical skills but lacks depth or some optional skills.
- **71-100 (Strong Match):** EXCEPTIONAL fit. Matches ALL critical skills, experience levels, and domain requirements perfectly.

RULES:
- **The skills should be alteast 90% similar to the given job description.If the job description demands experience.otherwise for enty level 50% skills should match and mid level 80% skills should match and senior level 80% skills should match.
- **Do not consider any experience that is not mentioned in the job description.If experience is not mentioned in the job description, do not consider any experience.
- **Do not consider any education that is not mentioned in the job description.If education is not mentioned in the job description, do not consider any education.
- **UNBIASED SCREENING PROTOCOL**:
  - The 'summary' field MUST be completely gender-neutral. Use "The candidate" or "They", strictly avoiding "He" or "She".
  - Ignore the candidate's name, gender, age, race, or university prestige. Focus ONLY on the skills and experience alignment.

Return ONLY raw JSON in this exact structure:
{
  "candidateName": "The Real Name of the Candidate",
  "candidateEmail": "Extracted Email from Resume",
  "matchScore": 0-100,
  "matchStatus": "Strong Match | Good Match | Weak Match",
  "summary": "Concise, critical evaluation of fit.",
  "missingSkills": {
    "critical": ["List ONLY skills from JD that are strictly missing in Resume"],
    "optional": []
  },
  "resumeImprovements": ["Specific advice to align resume with THIS JD"],
  "learningPlan": [
    { "duration": "Week 1" or "Month 1", "focus": "Topic/Skill", "action": "Specific learning resource or project" }
  ]
}

Job Description:
${jobDescription.substring(0, 5000)}

Candidate Resume:
${resumeText.substring(0, 5000)}

INSTRUCTION FOR LEARNING PLAN:
- If the candidate is a strong match or has minor gaps, create a **4-Week Intensive Plan**.
- If the candidate has significant gaps (missing critical skills, wrong stack), create a **long-term plan (e.g., 3-6 Months)** split by months (e.g., "Month 1", "Month 2").
- Be realistic. Do not suggest learning "Advanced System Design" in Week 1 for a Junior role.
`;

  // Try up to 3 times (or loop through keys)
  let lastError = null;
  
  // We prefer to try different keys if we hit rate limits
  for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
      const currentKey = getNextKey();
      
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
            "Authorization": `Bearer ${currentKey}`,
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a strict JSON generator. Output only valid JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
            }),
        });

        if (!response.ok) {
            if (response.status === 429) {
                console.warn(`Rate limit on key ${currentKey.substring(0,8)}..., switching...`);
                continue; // Try next key
            }
            const errData = await response.json();
            throw new Error(`Groq API Error: ${errData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Clean potential markdown blocks
        const jsonStr = content.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

      } catch (err) {
         console.error(`Attempt ${attempt + 1} failed:`, err.message);
         lastError = err;
         // If it's a JSON parse error, don't retry, just fail
         if (err.message.includes("JSON")) throw err;
         // If it's not rate limit, strict fail? Or just retry? 
         // For now, retry on network/API errors.
      }
  }

  throw new Error(`Failed after retries. Last error: ${lastError?.message}`);
};

// @desc    Single Resume Analysis (No Persistence)
// @route   POST /api/screening/analyze
const analyzeResume = async (req, res) => {
  try {
    if (!req.file || !req.body.jobDescription) {
      return res.status(400).json({ message: "Resume and Job Description required." });
    }

    const resumeText = await parseResume(req.file.path);
    const analysis = await generateAnalysis(resumeText, req.body.jobDescription);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error("Screening Error:", error);
    res.status(500).json({ message: error.message || "Failed to analyze resume" });
  } finally {
    if (req.file && req.file.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
  }
};

// @desc    Bulk Screen Resumes for a Job
// @route   POST /api/screening/:jobId/bulk-screen
const bulkScreenResumes = async (req, res) => {
  try {
    const { jobId } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No resume files uploaded" });
    }

    // 1. Fetch Job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Job profile not found" });
    }

    // 2. Concatenate Job Description + Requirements + Skills
    const fullJobDesc = `
      Title: ${job.title}
      Description: ${job.description}
      Requirements: ${job.requirements}
      Skills: ${job.skills.join(', ')}
      Experience: ${job.experienceLevel}
    `;

    // 3. Process Files (Smart Batching - 5 at a time)
    // We cannot use Promise.all for 100 files as it will hit API rate limits immediately.
    const BATCH_SIZE = 5;
    const results = [];
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        const batchResults = await Promise.all(batch.map(async (file) => {
          try {
            // Strict PDF Check
            if (file.mimetype !== 'application/pdf' && !file.originalname.toLowerCase().endsWith('.pdf')) {
                throw new Error("Invalid file format. Only PDF allowed.");
            }

            const resumeText = await parseResume(file.path);
            const analysis = await generateAnalysis(resumeText, fullJobDesc);
            
            // Save Application
            await Application.create({
              job: jobId,
              resumePath: file.path, 
              candidateName: analysis.candidateName || "Candidate",
              candidateEmail: analysis.candidateEmail || "",
              aiAnalysis: analysis,
              status: 'Screened'
            }); 
            
            // Clean up file after successful processing
            try { fs.unlinkSync(file.path); } catch(e) { console.error("Cleanup error", e); }

            return { status: 'success', file: file.originalname, data: analysis };
          } catch (err) {
            console.error(`Error processing ${file.originalname}:`, err.message);
            // Clean up file if processing failed
            try { fs.unlinkSync(file.path); } catch(e) {}
            return { status: 'error', file: file.originalname, error: err.message };
          }
        }));

        results.push(...batchResults);
        
        // Optional: Small delay between batches to be nice to the API
        // await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Sort results by score just for the response
    results.sort((a, b) => {
        if (a.status !== 'success' || b.status !== 'success') return 0;
        return b.data.matchScore - a.data.matchScore;
    });

    res.json({
      success: true,
      jobTitle: job.title,
      totalProcessed: results.length,
      results
    });

  } catch (error) {
    console.error("Bulk Screening Error:", error);
    res.status(500).json({ message: "Bulk screening failed" });
  }
};

// @desc    Get Applications (Screening Results) for a Job
// @route   GET /api/screening/:jobId/applications
const getJobApplications = async (req, res) => {
  try {
    // Ideally check if user owns the job
    const applications = await Application.find({ job: req.params.jobId }).sort({ 'aiAnalysis.matchScore': -1 });
    res.json(applications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch applications" });
  }
};

// @desc    Send emails to top candidates
// @route   POST /api/screening/:jobId/send-emails
// @route   POST /api/screening/:jobId/send-emails
const sendSelectionEmails = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { candidateIds } = req.body;
        
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ message: "Job not found" });

        const allApplications = await Application.find({ job: jobId }).sort({ 'aiAnalysis.matchScore': -1 });
        
        // Determine Selected IDs
        let selectedIdsSet = new Set();

        if (candidateIds && Array.isArray(candidateIds) && candidateIds.length > 0) {
            // Manual Selection
            candidateIds.forEach(id => selectedIdsSet.add(id));
        } else {
            // Auto Selection (Top Matches)
            // Filter (Score >= 60) and Slice (Vacancies limit)
            const topCandidates = allApplications
                .filter(app => app.aiAnalysis.matchScore >= 60)
                .slice(0, job.vacancies);
            
            topCandidates.forEach(app => selectedIdsSet.add(app._id.toString()));
        }

        // Proceed with processing (even if 0 selected - implies reject all)

        let sentSuccess = 0;
        let sentRejection = 0;
        const sendEmail = require('../utils/mailer'); 

        for (const candidate of allApplications) {
             if (!candidate.candidateEmail || !candidate.candidateEmail.includes('@')) continue;

             const isSelected = selectedIdsSet.has(candidate._id.toString());

             if (isSelected) {
                 // Send Selection Email
                 const subject = `Update on your application for ${job.title}`;
                 const guidanceLink = `http://localhost:5173/guidance/${candidate._id}`;
                 const body = `Dear ${candidate.candidateName},\n\nWe are pleased to inform you that your profile has been shortlisted for the ${job.title} position.\n\nBased on your strong match score of ${candidate.aiAnalysis.matchScore}%, we would like to proceed with the next steps.\n\nTo help you prepare for the interview, we have generated a personalized preparation roadmap with key topics and resources:\n\n👉 Access your Guide: ${guidanceLink}\n\nBest Regards,\nTalentScout Recruiting Team`;
                 
                 await sendEmail(candidate.candidateEmail, subject, body);
                 sentSuccess++;
                 
                 // Optional: Update status
                 candidate.status = 'Interview';
                 await candidate.save();

             } else {
                 // Send Rejection Email
                 const subject = `Update on your application for ${job.title}`;
                 const feedbackLink = `http://localhost:5173/feedback/${candidate._id}`;
                 const body = `Dear ${candidate.candidateName},\n\nThank you for your interest in the ${job.title} position.\n\nAfter careful review, we have decided to move forward with other candidates.\n\nHowever, we want to help you grow. We generated a personalized "Skill Analysis & Feedback Report" based on your resume:\n\n👉 Access your feedback: ${feedbackLink}\n\nWe will keep your resume on file.\n\nBest Wishes,\nTalentScout Recruiting Team`;

                 await sendEmail(candidate.candidateEmail, subject, body);
                 sentRejection++;

                 // Optional: Update status
                 candidate.status = 'Rejected';
                 await candidate.save();
             }
        }

        res.json({ 
            success: true, 
            message: `Process Complete: ${sentSuccess} offers sent, ${sentRejection} rejection emails sent.` 
        });

    } catch (err) {
        console.error("Email Sending Error:", err);
        res.status(500).json({ message: "Failed to send emails" });
    }
};

// @desc    Get Interview Preparation Guidance for a Candidate
// @route   GET /api/screening/guidance/:id
const getCandidateGuidance = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id).populate('job');
        if (!app) return res.status(404).json({ message: "Application link invalid" });

        // Check Cache
        if (app.interviewGuidance) {
            return res.json({
                candidate: app.candidateName,
                role: app.job.title,
                guidance: app.interviewGuidance
            });
        }

        const job = app.job;
        const prompt = `
        You are an Expert Career Coach and Interview Prep Guide.
        
        Context:
        Candidate Name: ${app.candidateName}
        Role Applying For: ${job.title}
        Job Skills: ${job.skills.join(', ')}
        
        Task:
        Create a personalized "Interview Preparation Roadmap" for ${app.candidateName}.
        
        Include the following sections formatted in Markdown:
        
        1. **Role Insights**: Briefly explain what a ${job.title} typically does and what hiring managers look for.
        2. **Technical Refresh Topics**: 
           - List 3-4 key concepts to study for: ${job.skills.slice(0,3).join(', ')}.
           - Provide specific web search terms (e.g., "React Hooks Lifecycle", "Mongoose Indexing").
        3. **Recommended Resources**:
           - Suggest 3 concrete, high-quality websites, documentation links, or platforms (like LeetCode patterns, MDN, specific YouTube channels) relevant to these skills.
        4. **Behavioral Tip**: One piece of advice for the HR/Culture fit round.
        
        Tone: Encouraging, professional, and actionable.
        Output: Pure Markdown.
        `;

        // Call Groq (Reuse rotation logic simplified)
        let guidanceText = "Guidance generation currently unavailable. Please check back later.";
        
        for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
            const currentKey = getNextKey();
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                       "Authorization": `Bearer ${currentKey}`,
                       "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.3,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    guidanceText = data.choices[0].message.content;
                    break; 
                }
            } catch (ignored) {}
        }
        
        // Save to DB
        app.interviewGuidance = guidanceText;
        await app.save();

        res.json({
            candidate: app.candidateName,
            role: job.title,
            guidance: guidanceText
        });

    } catch (error) {
        console.error("Guidance Error:", error);
        res.status(500).json({ message: "Failed to load guidance" });
    }
};

// @desc    Get Rejection Feedback for a Candidate
// @route   GET /api/screening/feedback/:id
const getCandidateFeedback = async (req, res) => {
    try {
        const app = await Application.findById(req.params.id).populate('job');
        if (!app) return res.status(404).json({ message: "Application link invalid" });

        // Check Cache
        if (app.rejectionFeedback) {
             return res.json({
                candidate: app.candidateName,
                role: app.job.title,
                feedback: app.rejectionFeedback
            });
        }

        const job = app.job;

        // Fetch other open jobs for recommendations
        const otherJobs = await Job.find({ 
            _id: { $ne: job._id },
            status: 'Open' 
        })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('recruiter', 'companyWebsite companyName');

        const marketOpportunities = otherJobs.length > 0 ? otherJobs.map(j => 
            `- Role: ${j.title} at ${j.recruiter.companyName}\n  - Key Skills: ${j.skills.slice(0,4).join(', ')}\n  - Career Page: ${j.recruiter.companyWebsite}`
        ).join('\n') : "No other suitable openings found at this moment.";

        const prompt = `
        You are a supportive but strictly honest Senior Technical Recruiter and Career Mentor. 
        The candidate applied for "${job.title}" and was not selected.
        
        Task: 
        Provide a comprehensive, constructive "Deep-Dive Skill Analysis" to help them improve for future opportunities.
        
        Output strictly in Markdown with these specific sections:
        
        # 🔍 Application Analysis & Growth Report
        
        ### 1. Executive Summary
        Provide a professional summary of why the profile might not have been the best fit for *this specific role* taking into account the JD requirements. Focus on gaps in experience or specific technical mismatches.
        
        ### 2. 📊 Skill Gap Analysis
        Create a table comparing their skills to the JD:
        | Critical Skill | Status in Resume | Recommended Action |
        | --- | --- | --- |
        | (e.g. React) | (e.g. Basic Mention / Missing) | (e.g. Build a project using Redux) |
        *(Analyze top 5 required skills)*
        
        ### 3. 📝 Resume Optimization Audit
        - **Clarity & Structure**: Critique the layout and readability.
        - **Impact & Metrics**: Are they using "Achieved X results" or just "Did Y"?
        - **Keywords**: List specific keywords from the JD that were missing.
        
        ### 4. 🌟 Recommended Fits (Internal & Market)
        I have analyzed other open positions. Based on your skills, consider applying to these matching roles from our partner network if they align with your profile:
        *(Select only the most relevant 1-2 roles from the list below. If none fit well, suggest general roles they should target e.g. "Junior Developer").*
        
        **Available Openings Analyzed:**
        ${marketOpportunities}
        
        ### 5. 🚀 Personalized Growth Plan (Dynamic Timeline)
        Design a strategic learning sprint tailored to the specific gaps identified.
        
        *Instruction*: Determine a realistic timeline (e.g., 2 weeks for minor gaps, 6-8 weeks for major upskilling) and structure it accordingly.
        
        **Phase 1: Foundations & Quick Wins**
        - Focus: ...
        
        **Phase 2: Deep Dive & Practice**
        - Project/Task: ...
        
        **Phase 3: Real-world Application (If needed)**
        - ...
        
        Tone: Professional, Constructive, Encouraging, Action-Oriented.
        `;

        // Call Groq
        let feedbackText = "Feedback generation currently unavailable.";
        
        for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
            const currentKey = getNextKey();
            try {
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                       "Authorization": `Bearer ${currentKey}`,
                       "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.3,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    feedbackText = data.choices[0].message.content;
                    break; 
                }
            } catch (ignored) {}
        }
        
        // Save to DB
        app.rejectionFeedback = feedbackText;
        await app.save();

        res.json({
            candidate: app.candidateName,
            role: job.title,
            feedback: feedbackText
        });

    } catch (error) {
        console.error("Feedback Error:", error);
        res.status(500).json({ message: "Failed to load feedback" });
    }
};

module.exports = { analyzeResume, bulkScreenResumes, getJobApplications, sendSelectionEmails, getCandidateGuidance, getCandidateFeedback };
