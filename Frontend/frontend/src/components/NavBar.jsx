import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, User, Sparkles } from 'lucide-react';
import AiAssistantModal from './AiAssistantModal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            <div className="brand-icon">
              <CheckSquare size={22} color="#ffffff" />
            </div>
            <span className="brand-text">Trello<span className="brand-accent">Lite</span></span>
          </Link>

          {user && (
            <div className="navbar-right">
              <button 
                onClick={() => setIsAiModalOpen(true)}
                className="btn-navbar-ai"
                title="Open Gemini Task Assistant"
              >
                <Sparkles size={16} />
                <span>Ask Gemini</span>
              </button>

              <div className="user-profile">
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <div className="user-meta">
                  <span className="user-name">{user.name || 'User'}</span>
                  <span className="user-role">{user.role || 'USER'}</span>
                </div>
              </div>

              <button onClick={handleLogout} className="btn-logout" title="Logout">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <AiAssistantModal 
        isOpen={isAiModalOpen} 
        onClose={() => setIsAiModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
