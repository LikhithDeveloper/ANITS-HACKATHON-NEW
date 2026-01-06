import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { useDropzone } from 'react-dropzone';
import { 
  Briefcase, MapPin, Users, Clock, Award, Eye, EyeOff,
  UploadCloud, FileText, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Mail, ExternalLink 
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
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [unbiasedMode, setUnbiasedMode] = useState(false);

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

  const toggleSelection = (appId) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(appId)) newSet.delete(appId);
      else newSet.add(appId);
      setSelectedIds(newSet);
  };

  const handleStatusChange = async (e) => {
      const newStatus = e.target.value;
      try {
          const res = await fetch(`http://localhost:5000/api/jobs/${id}/status`, {
              method: 'PUT',
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${user.token}` 
              },
              body: JSON.stringify({ status: newStatus })
          });
          if (res.ok) {
              const updatedJob = await res.json();
              setJob(updatedJob);
          }
      } catch (err) {
          alert("Failed to update status");
      }
  };

  const handleSendEmails = async () => {
    const idsArray = Array.from(selectedIds);
    const isManual = idsArray.length > 0;

    if (!window.confirm(isManual 
        ? `Send interview offers to ${idsArray.length} selected candidates?` 
        : "Send interview offers to all top matched candidates (score > 60%)?")) return;
    
    try {
        const res = await fetch(`http://localhost:5000/api/screening/${id}/send-emails`, {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${user.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ candidateIds: idsArray })
        });
        const data = await res.json();
        alert(data.message);
        if (data.success) setSelectedIds(new Set()); // Clear selection
    } catch (err) {
        alert("Failed to send emails");
    }
  };

  // Bulk Upload Logic
  const onDrop = async (acceptedFiles) => {
    setUploading(true);
    const totalFiles = acceptedFiles.length;
    setProgress(totalFiles > 0 ? 25 : 0);
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
            <div className={`status-badge ${job.status.toLowerCase()}`} style={{display: 'inline-block', padding: 0, overflow: 'hidden', verticalAlign: 'middle'}}>
                <select 
                    value={job.status} 
                    onChange={handleStatusChange}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'inherit',
                        fontSize: 'inherit',
                        fontWeight: 'inherit',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        outline: 'none'
                    }}
                >
                    <option value="Open" style={{color: '#10b981'}}>Open</option>
                    <option value="Closed" style={{color: '#ef4444'}}>Closed</option>
                </select>
            </div>
            <h1>{job.title}</h1>
            <div className="job-meta-row">
              <span><Briefcase size={16} /> {job.department}</span>
              <span><MapPin size={16} /> {job.location}</span>
              <span><Clock size={16} /> {job.type}</span>
              <span><Users size={16} /> {job.vacancies} People Cutoff</span>
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
            
            <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 12px' }}></div>

            <button 
                className={`tab-btn ${unbiasedMode ? 'active-blind' : ''}`}
                onClick={() => setUnbiasedMode(!unbiasedMode)}
                style={{ color: unbiasedMode ? '#8b5cf6' : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Toggle Unbiased Mode to hide PII"
            >
                {unbiasedMode ? <EyeOff size={16}/> : <Eye size={16}/>}
                {unbiasedMode ? 'Unbiased Mode On' : 'Blind Screening'}
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
              
              {job.status === 'Open' && (
                  <div className="candidates-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                      <button onClick={handleSendEmails} className="btn btn-primary" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <Mail size={18}/> {selectedIds.size > 0 ? `Send Email to Selected (${selectedIds.size})` : `Send Offer to Top Matches`}
                      </button>
                  </div>
              )}

              {/* Upload Area */}
              {job.status === 'Open' && (
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
              )}

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
                                    <Award size={14} /> Top Match (Within Cutoff)
                                </div>
                            )}
                            <div className="candidate-card-inner">
                                <div className="selection-col" onClick={(e) => { e.stopPropagation(); toggleSelection(app._id); }}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedIds.has(app._id)} 
                                        readOnly 
                                    />
                                </div>
                                <div className="content-col">
                                    <div className="candidate-header" onClick={() => setExpandedApp(expandedApp === app._id ? null : app._id)}>
                                        <div className="candidate-info">
                                            <h4>
                                                {unbiasedMode ? `Candidate #${index + 1}` : app.candidateName}
                                                {unbiasedMode && <span className="blind-badge" style={{ fontSize: '0.7em', marginLeft: '8px', background: '#e0e7ff', color: '#4338ca', padding: '2px 6px', borderRadius: '4px' }}>Unbiased</span>}
                                            </h4>
                                            <div className="candidate-sub-info">
                                                {!unbiasedMode && app.candidateEmail && (
                                                    <span className="info-pill"><Mail size={12}/> {app.candidateEmail}</span>
                                                )}
                                                
                                                {unbiasedMode ? (
                                                     <span className="info-pill disabled" style={{ cursor: 'not-allowed', opacity: 0.6 }}>
                                                         <EyeOff size={12}/> Resume Hidden (Blind Mode)
                                                     </span>
                                                ) : (
                                                    <a 
                                                        href={`http://localhost:5000/${app.resumePath.replace(/\\/g, '/')}`} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="info-pill link"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink size={12}/> View Resume
                                                    </a>
                                                )}
                                            </div>
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
                                            <p className="summary">
                                                <strong>Summary:</strong> {unbiasedMode ? app.aiAnalysis.summary.replace(new RegExp(app.candidateName, 'gi'), 'The candidate') : app.aiAnalysis.summary}
                                            </p>
                                            
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
                            </div>
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
