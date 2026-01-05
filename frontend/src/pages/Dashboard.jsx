import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Plus, Briefcase, MapPin, Users, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/jobs', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        console.error("Error fetching jobs", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
        fetchJobs();
    }
  }, [user]);

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Recruiter Dashboard</h1>
            <p>Manage your job profiles and screenings</p>
          </div>
          <Link to="/create-job" className="btn btn-primary">
            <Plus size={20} /> Post New Job
          </Link>
        </div>

        {loading ? (
          <div className="loading-state">Loading your jobs...</div>
        ) : (
          <div className="jobs-grid">
            {jobs.length === 0 ? (
                <div className="empty-state">
                    <Briefcase size={48} />
                    <h3>No jobs posted yet</h3>
                    <p>Create your first job profile to start.</p>
                </div>
            ) : (
                jobs.map(job => (
                <motion.div 
                    key={job._id} 
                    className="job-card-mini"
                    whileHover={{ y: -5 }}
                >
                    <div className="job-status badge-open">{job.status}</div>
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                    <span><Briefcase size={14} /> {job.department}</span>
                    <span><MapPin size={14} /> {job.location}</span>
                    <span><Users size={14} /> {job.vacancies} Vacancies</span>
                    </div>
                    <Link to={`/jobs/${job._id}`} className="view-job-btn">
                    View Details <ChevronRight size={16} />
                    </Link>
                </motion.div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
