import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import { 
  Briefcase, MapPin, Users, Clock, Award, 
  UploadCloud, FileText, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Mail 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './JobDetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expandedApp, setExpandedApp] = useState(null);
  const [progress, setProgress] = useState(0);

  // Fetch Job and Applications
  const fetchData = async () => {
    try {
      const jobRes = await fetch(`http://localhost:5000/api/jobs/${id}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const jobData = await jobRes.json();
      setJob(jobData);

      const appRes = await fetch(`http://localhost:5000/api/screening/${id}/applications`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      const appData = await appRes.json();
      setApplications(appData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [id, user]);

  const handleSendEmails = async () => {
    if (!window.confirm("Send interview offers to all top matched candidates?")) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/screening/${id}/send-emails`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${user.token}` }
        });
        const data = await res.json();
        alert(data.message);
    } catch (err) {
        alert("Failed to send emails");
    }
  };

  // Bulk Upload Logic
  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    setProgress(0);
    const totalFiles = acceptedFiles.length;
    const BATCH_SIZE = 5;

    try {
      for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
        const chunk = acceptedFiles.slice(i, i + BATCH_SIZE);
        const formData = new FormData();
        chunk.forEach(file => {
          formData.append('resumes', file);
        });

        const res = await fetch(`http://localhost:5000/api/screening/${id}/bulk-screen`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${user.token}` },
          body: formData
        });
        
        if (!res.ok) {
           console.error(`Batch ${i} failed`);
        }

        // Update progress
        const processedCount = Math.min(i + BATCH_SIZE, totalFiles);
        setProgress(Math.round((processedCount / totalFiles) * 100));
      }
      
      // All done
      fetchData();
      setActiveTab('candidates');

    } catch (err) {
      console.error(err);
      alert('Error uploading resumes');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: {'application/pdf': ['.pdf']},
    multiple: true
  });

  if (loading || !job) return <div className="loading-state">Loading Job Profile...</div>;

  return (
    <div className="job-details-page">
      <div className="container">
        {/* Header */}
        <div className="job-header">
          <div className="job-title-section">
            <span className={`status-badge ${job.status.toLowerCase()}`}>{job.status}</span>
            <h1>{job.title}</h1>
            <div className="job-meta-row">
              <span><Briefcase size={16} /> {job.department}</span>
              <span><MapPin size={16} /> {job.location}</span>
              <span><Clock size={16} /> {job.type}</span>
              <span><Users size={16} /> {job.vacancies} Vacancies</span>
            </div>
          </div>
          
          <div className="job-actions">
            <button 
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`tab-btn ${activeTab === 'candidates' ? 'active' : ''}`}
              onClick={() => setActiveTab('candidates')}
            >
              Candidates <span className="count-badge">{applications.length}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="job-content">
          {activeTab === 'overview' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overview-section">
              <section className="detail-block">
                <h3>Description</h3>
                <p>{job.description}</p>
              </section>
              <section className="detail-block">
                <h3>Requirements</h3>
                <p>{job.requirements}</p>
              </section>
              <section className="detail-block">
                <h3>Required Skills</h3>
                <div className="skills-list">
                  {job.skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </section>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="candidates-section">
              
              <div className="candidates-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={handleSendEmails} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <Mail size={18}/> Send Offer to Top Matches
                  </button>
              </div>

              {/* Upload Area */}
              <div {...getRootProps()} className={`bulk-dropzone ${isDragActive ? 'active' : ''}`}>
                <input {...getInputProps()} />
                <UploadCloud size={40} className="upload-icon" />
                {uploading ? (
                  <div className="upload-status">
                    <p>Analyzing resumes... {progress}%</p>
                    <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
                    </div>
                    <span className="sub-text">Please keep this tab open</span>
                  </div>
                ) : (
                  <div>
                    <p>Drag & drop resumes here, or click to select files</p>
                    <span className="sub-text">Supports bulk upload (PDF only)</span>
                  </div>
                )}
              </div>

              {/* Candidates List */}
              <div className="candidates-list">
                {applications.length === 0 ? (
                    <div className="no-candidates">No candidates screened yet. Upload resumes above.</div>
                ) : (
                    applications.map((app, index) => {
                        const isTopPick = index < job.vacancies && app.aiAnalysis.matchScore >= 60;
                        return (
                        <div key={app._id} className={`candidate-card ${isTopPick ? 'top-pick-card' : ''}`}>
                            {isTopPick && (
                                <div className="top-pick-badge">
                                    <Award size={14} /> Top Match (Within Vacancies)
                                </div>
                            )}
                            <div className="candidate-header" onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}>
                                <div className="candidate-info">
                                    <h4>{app.candidateName}</h4>
                                    <span className="file-name"><FileText size={14}/> {app.resumePath.split('-').slice(1).join('-')}</span>
                                </div>
                                <div className="candidate-score">
                                    <div className={`score-circle score-${app.aiAnalysis.matchStatus.split(' ')[0].toLowerCase()}`}>
                                        {app.aiAnalysis.matchScore}%
                                    </div>
                                    <span className="match-status">{app.aiAnalysis.matchStatus}</span>
                                    {expandedApp === app._id ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
                                </div>
                            </div>
                            
                            <AnimatePresence>
                            {expandedApp === app._id && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }} 
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="candidate-details"
                                >
                                    <p className="summary"><strong>Summary:</strong> {app.aiAnalysis.summary}</p>
                                    
                                    <div className="skills-gap">
                                        <div className="missing-critical">
                                            <h5>Missing Critical Skills</h5>
                                            {app.aiAnalysis.missingSkills.critical.length > 0 ? (
                                                app.aiAnalysis.missingSkills.critical.map((s, i) => <span key={i} className="tag critical">{s}</span>)
                                            ) : <span className="tag success">None!</span>}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            </AnimatePresence>
                        </div>
                    )})
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
