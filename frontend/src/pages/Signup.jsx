import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { Mail, Lock, User, Briefcase, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    companyName: '',
    companyWebsite: '' 
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Basic URL validation (optional, but good UX)
    if (!formData.companyWebsite.includes('.')) {
        setError("Please enter a valid website URL");
        return;
    }
    
    const res = await register(formData);
    if (res.success) {
      navigate('/resume-screening');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-page">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Join thousands of modern recruiters</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <div className="input-icon-wrapper">
              <User size={18} className="input-icon" />
              <input 
                type="text" 
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company Carries Page</label>
            <div className="input-icon-wrapper">
               <Briefcase size={18} className="input-icon" />
              <input 
                type="text" 
                name="companyName"
                placeholder="Biosiplen"
                value={formData.companyName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Company Carres Page</label>
            <div className="input-icon-wrapper">
               <Globe size={18} className="input-icon" />
              <input 
                type="url" 
                name="companyWebsite"
                placeholder="https://acmecorp.com"
                value={formData.companyWebsite}
                onChange={handleChange}
                required
              />
            </div>
          </div>


          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="recruiter@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary auth-btn">
            Sign Up
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="text-accent">Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
