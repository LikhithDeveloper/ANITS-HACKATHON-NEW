import React, { useState, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ThemeContext from '../context/ThemeContext';
import { Menu, X, Brain, FileText, User, LogOut, Home, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Navbar.css';
import test from "../assets/image copy.png"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          {/* <Brain className="logo-icon" size={32} /> */}
          <img  src={test} alt="logo" className="logo-icon" width={70}></img>
          <span className="logo-text">TalentScout<span className="logo-accent">AI</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="navbar-links desktop-menu">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            <Home size={18} /> Home
          </Link>
          {user && (
            <Link to="/dashboard" className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                <LayoutDashboard size={18} /> Dashboard
            </Link>
          )}

          <button onClick={toggleTheme} className="btn-icon" style={{ marginLeft: '10px', cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text-primary)' }}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          
          <div className="nav-divider"></div>

          {user ? (
            <div className="auth-menu">
                <span className="user-greeting">Hi, {user.name}</span>
                <button onClick={logout} className="btn btn-outline nav-btn">
                <LogOut size={18} /> Logout
                </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary nav-btn">
              <User size={18} /> Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Link to="/" className="mobile-link" onClick={toggleMenu}>Home</Link>
          <Link to="/resume-screening" className="mobile-link" onClick={toggleMenu}>Resume Screening</Link>
          {user ? (
            <>
                 <span className="mobile-link" style={{color: 'white'}}>Hi, {user.name}</span>
                 <button className="mobile-link" onClick={() => { logout(); toggleMenu(); }}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="mobile-link" onClick={toggleMenu}>Login</Link>
          )}
          <button className="mobile-link" onClick={toggleTheme} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {theme === 'light' ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
