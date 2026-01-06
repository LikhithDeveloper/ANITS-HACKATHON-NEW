import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Award, FileText, CheckCircle, XCircle, AlertCircle, Sun, Moon } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';
import { useContext } from 'react';
import './CandidateFeedback.css';

const CandidateFeedback = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/screening/feedback/${id}`);
                if (!res.ok) throw new Error("Failed to load");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeedback();
    }, [id]);

    if (loading) return (
        <div className="feedback-loading">
            <div className="loader"></div>
            <p>Analyzing skills and generating growth plan...</p>
        </div>
    );

    if (!data) return (
        <div className="feedback-error">
            <h2>Access Unavailable</h2>
            <p>This report link may have expired.</p>
        </div>
    );

    const renderContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h1 key={i} className="main-title">{line.replace('# ', '')}</h1>;
            if (line.startsWith('### ')) return <h3 key={i} className="section-title">{line.replace('### ', '')}</h3>;
            
            // Table Row
            if (line.startsWith('|')) {
                // Formatting tables in simple way (or use a real parser)
                const cells = line.split('|').filter(c => c.trim() !== '');
                if (line.includes('---')) return null; // Skip separator
                return (
                    <div key={i} className="table-row">
                        {cells.map((cell, idx) => (
                            <span key={idx} className="table-cell">{cell.trim()}</span>
                        ))}
                    </div>
                );
            }

            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="block-strong">{line.replace(/\*\*/g, '')}</strong>;
            if (line.startsWith('- **')) {
               const parts = line.split('**:');
               return <li key={i}><strong>{parts[0].replace('- **', '')}</strong>: {parts[1]}</li>;
            }
            if (line.startsWith('- ')) return <li key={i}>{line.substring(2)}</li>;
            
            return <p key={i}>{line}</p>;
        });
    };

    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <div className="feedback-page">
            <div className="theme-toggle-fixed" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 11000 }}>
                <button onClick={toggleTheme} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>
            <div className="feedback-container">
                <motion.div 
                    initial={{opacity:0, y:20}} 
                    animate={{opacity:1, y:0}} 
                    className="feedback-card"
                >
                    <header className="feedback-header">
                        <div className="icon-badge"><TrendingUp size={32}/></div>
                        <h1>Skill Analysis Report</h1>
                        <p className="subtitle">Personalized feedback for <strong>{data.candidate}</strong></p>
                    </header>
                    
                    <div className="feedback-body">
                         <div className="feedback-notice">
                             <AlertCircle size={20} />
                             <p>While we couldn't move forward for the <strong>{data.role}</strong> role, your potential is clear. Use this analysis to bridge gaps and come back stronger.</p>
                         </div>

                        <div className="markdown-content">
                            {renderContent(data.feedback)}
                        </div>
                    </div>

                    <footer className="feedback-footer">
                        <p>Success is not final, failure is not fatal.</p>
                        <span className="brand">TalentScout AI Career Growth</span>
                    </footer>
                </motion.div>
            </div>
        </div>
    );
};

export default CandidateFeedback;
