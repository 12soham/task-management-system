import React, { useState, useEffect } from 'react';
import { aiService } from '../services/aiService';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';

const AiBriefingCard = () => {
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBriefing = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await aiService.getDailyBriefing();
      setBriefing(data);
    } catch {
      setError('Could not load AI briefing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, []);

  return (
    <div className="ai-briefing-card">
      <div className="ai-briefing-header">
        <div className="ai-badge">
          <Sparkles size={16} />
          <span>Gemini Standup Briefing</span>
        </div>
        <button 
          onClick={fetchBriefing} 
          disabled={loading} 
          className="btn-ai-refresh"
          title="Regenerate AI Briefing"
        >
          <RefreshCw size={14} className={loading ? 'spinning' : ''} />
          <span>{loading ? 'Analyzing...' : 'Refresh'}</span>
        </button>
      </div>

      {loading ? (
        <div className="ai-briefing-loading">
          <div className="ai-pulse-bar"></div>
          <p>Gemini is reviewing your active tasks and organizing today's agenda...</p>
        </div>
      ) : error ? (
        <div className="ai-briefing-error">
          <p>{error}</p>
        </div>
      ) : briefing ? (
        <div className="ai-briefing-content">
          <p className="ai-summary-text">{briefing.summary}</p>

          <div className="ai-sections-grid">
            {briefing.priorities && briefing.priorities.length > 0 && (
              <div className="ai-section">
                <div className="ai-section-title">
                  <CheckCircle size={15} color="#10b981" />
                  <span>Key Priorities</span>
                </div>
                <ul className="ai-list">
                  {briefing.priorities.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {briefing.risks && briefing.risks.length > 0 && (
              <div className="ai-section">
                <div className="ai-section-title">
                  <AlertTriangle size={15} color="#f59e0b" />
                  <span>Watchouts & Deadlines</span>
                </div>
                <ul className="ai-list">
                  {briefing.risks.map((item, idx) => (
                    <li key={idx} className="risk-item">{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {briefing.productivityTip && (
            <div className="ai-tip-box">
              <Lightbulb size={16} color="#4f46e5" />
              <span><strong>Coach Tip:</strong> {briefing.productivityTip}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default AiBriefingCard;
