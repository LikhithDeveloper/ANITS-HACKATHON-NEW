import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Briefcase, MapPin, Users, Award, CheckCircle, Plus, X, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import './CreateJob.css';

const CreateJob = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [phases, setPhases] = useState([]);
  const [newPhase, setNewPhase] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'Full-time',
    vacancies: 1,
    experienceLevel: 'Entry Level',
    skills: '',
    description: '',
    requirements: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addPhase = (e) => {
      e.preventDefault();
      if (newPhase.trim()) {
          setPhases([...phases, newPhase.trim()]);
          setNewPhase('');
      }
  };

  const removePhase = (index) => {
      setPhases(phases.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
          ...formData,
          recruitmentPhases: phases
      };

      const res = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        navigate('/dashboard');
      } else {
        alert('Failed to create job');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-job-page">
      <div className="container">
        <motion.div 
          className="job-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header ... */}
          <div className="card-header">
            <h2>Post a New Job</h2>
            <p>Create a job profile to start screening candidates</p>
          </div>

          <form onSubmit={handleSubmit} className="job-form">
            {/* ... Existing fields (title, etc) ... */}
            <div className="form-row">
              <div className="form-group">
                <label>Job Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required placeholder="e.g. Senior React Developer" />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input type="text" name="department" value={formData.department} onChange={handleChange} required placeholder="e.g. Engineering" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <div className="input-icon-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. Remote / New York" />
                </div>
              </div>
              <div className="form-group">
                <label>Job Type</label>
                <select name="type" value={formData.type} onChange={handleChange}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>People Cutoff</label>
                 <div className="input-icon-wrapper">
                  <Users size={18} className="input-icon" />
                  <input type="number" name="vacancies" value={formData.vacancies} onChange={handleChange} min="1" />
                </div>
              </div>
              <div className="form-group">
                <label>Experience Level</label>
                <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}>
                  <option>Entry Level</option>
                  <option>Mid Level</option>
                  <option>Senior Level</option>
                  <option>Director</option>
                </select>
              </div>
            </div>

            <div className="form-group">
               <label>Required Skills (Comma separated)</label>
               <input type="text" name="skills" value={formData.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB, TypeScript" required />
            </div>

            {/* Recruitment Phases UI */}
            <div className="form-group">
                <label>Recruitment Phases (Rounds)</label>
                <div className="phases-input-group">
                    <input 
                        type="text" 
                        value={newPhase} 
                        onChange={(e) => setNewPhase(e.target.value)} 
                        placeholder="Add a round (e.g. Coding Test)"
                        onKeyPress={(e) => e.key === 'Enter' && addPhase(e)}
                    />
                    <button type="button" onClick={addPhase} className="add-phase-btn"><Plus size={20}/></button>
                </div>
                <div className="phases-list">
                    {phases.map((phase, i) => (
                        <span key={i} className="phase-tag">
                            {i+1}. {phase}
                            <button type="button" onClick={() => removePhase(i)} className="remove-phase"><X size={14}/></button>
                        </span>
                    ))}
                </div>
            </div>

            <div className="form-group">
              <label>Job Description</label>
              <textarea name="description" rows="4" value={formData.description} onChange={handleChange} required placeholder="Describe the role responsibilities..." />
            </div>

            <div className="form-group">
              <label>Requirements</label>
              <textarea name="requirements" rows="4" value={formData.requirements} onChange={handleChange} required placeholder="List qualifications and requirements..." />
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job Profile'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateJob;
