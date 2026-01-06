import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, CheckCircle, ExternalLink, ArrowRight, Sun, Moon } from 'lucide-react';
import ThemeContext from '../context/ThemeContext';
import './CandidateGuidance.css';

const CandidateGuidance = () => {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme, toggleTheme } = useContext(ThemeContext);

    useEffect(() => {
        const fetchGuidance = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/screening/guidance/${id}`);
                if (!res.ok) throw new Error("Failed to load");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGuidance();
    }, [id]);

    if (loading) return (
        <div className="guidance-loading">
            <div className="loader"></div>
            <p>Generating your personalized interview roadmap...</p>
        </div>
    );

    if (!data) return (
        <div className="guidance-error">
            <h2>Link Invalid or Expired</h2>
            <p>Please contact the recruiting team.</p>
        </div>
    );

    // Simple Markdown Parser for headers and lists
    const renderContent = (text) => {
        if (!text) return null;
        return text.split('\n').map((line, i) => {
            if (line.startsWith('### ')) return <h3 key={i}>{line.replace('### ', '')}</h3>;
            if (line.startsWith('## ')) return <h2 key={i}>{line.replace('## ', '')}</h2>;
            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i} className="block-strong">{line.replace(/\*\*/g, '')}</strong>;
            if (line.match(/^\d\./)) return <p key={i} className="list-item"><strong>{line.split('.')[0]}.</strong> {line.substring(2)}</p>;
            if (line.startsWith('- ')) return <li key={i}>{line.substring(2)}</li>;
            return <p key={i}>{line}</p>;
        });
    };

    return (
        <div className="guidance-page">
            <div className="theme-toggle-fixed" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 11000 }}>
                <button onClick={toggleTheme} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </button>
            </div>
            <div className="guidance-container">
                <motion.div 
                    initial={{opacity:0, y:20}} 
                    animate={{opacity:1, y:0}} 
                    className="guidance-card-main"
                >
                    <header className="guidance-header">
                        <div className="success-icon"><CheckCircle size={40}/></div>
                        <h1>Congratulations, {data.candidate}!</h1>
                        <p className="subtitle">You have been shortlisted for the <strong>{data.role}</strong> position.</p>
                        <div className="divider"></div>
                        <p className="intro-text">
                            To help you succeed in the next steps, we've curated a personalized preparation guide for you.
                        </p>
                    </header>

                    <div className="guidance-body">
                        <div className="guide-title">
                            <BookOpen size={20} className="icon"/> 
                            <span>Your Interview Roadmap</span>
                        </div>
                        
                        <div className="markdown-content">
                            {renderContent(data.guidance)}
                        </div>
                    </div>

                    <footer className="guidance-footer">
                        <p>Good luck! We look forward to meeting you.</p>
                        <div style={{margin: '15px 0'}}>
                            <a href="mailto:likhith931@gmail.com" style={{color: '#3b82f6', textDecoration:'none', fontWeight: '600'}}>
                                Need Help? Contact Us
                            </a>
                        </div>
                        <span className="brand">Powered by TalentScout AI</span>
                    </footer>
                </motion.div>
            </div>
        </div>
    );
};

export default CandidateGuidance;
