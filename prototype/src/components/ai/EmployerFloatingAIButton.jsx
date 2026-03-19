/**
 * Floating AI Assistant Button for Employers
 * 
 * Appears on every page for instant AI help - Employer version
 */

import { useState, useEffect } from 'react';
import './FloatingAIButton.css';
import EmployerAIAssistant from './EmployerAIAssistant';

export default function EmployerFloatingAIButton({ onTabChange, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextPrompt, setContextPrompt] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [stopSpeakingCallback, setStopSpeakingCallback] = useState(null);

  // Set context-aware prompts based on current page for employers
  useEffect(() => {
    const prompts = {
      'home': 'नमस्ते! Looking for workers? Need help with anything?',
      'talent-search': 'Need help finding the right talent? Ask me about skills, locations, or experience!',
      'applications': 'Need help managing applications? I can help you review and shortlist candidates!',
      'attendance': 'Need help tracking attendance? Ask me anything!',
      'ledger': 'Questions about payments? I can help track your expenses!',
      'rating': 'Want to rate workers or check your employer rating?',
      'voice': 'Use voice commands! Just speak and I\'ll help you navigate.',
      'sync': 'Having sync issues? I can help troubleshoot!',
      'profile': 'Need to update your business profile?',
      'settings': 'Need help with app settings?',
      'help': 'I\'m here to help! Ask me anything about ShramSetu.'
    };
    
    setContextPrompt(prompts[currentPage] || 'नमस्ते! How can I help you today?');
  }, [currentPage]);

  const toggleAI = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Button with Context Tooltip */}
      <div className="floating-ai-container">
        {!isOpen && (
          <div className="floating-ai-tooltip">
            {contextPrompt}
          </div>
        )}
        
        {/* Stop Speaking Button - Shows when voice is active */}
        {isSpeaking && !isOpen && (
          <button 
            className="floating-stop-btn"
            onClick={() => stopSpeakingCallback && stopSpeakingCallback()}
            aria-label="Stop Speaking"
            title="Stop voice output"
          >
            🔇
          </button>
        )}
        
        <button 
          className={`floating-ai-btn ${isOpen ? 'open' : ''}`}
          onClick={toggleAI}
          aria-label="AI Assistant"
        >
          {isOpen ? (
            <span className="emoji-fallback">✕</span>
          ) : (
            <img 
              src="/images/chatbot-avatar.png" 
              alt="AI Assistant"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          )}
          {!isOpen && <span className="emoji-fallback" style={{display: 'none'}}>🤖</span>}
        </button>
      </div>

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="floating-ai-modal">
          <div className="floating-ai-modal__content">
            <EmployerAIAssistant 
              onTabChange={(tab) => {
                console.log('🎯 EmployerFloatingAIButton: onTabChange called with tab:', tab);
                console.log('🎯 EmployerFloatingAIButton: Parent onTabChange exists?', !!onTabChange);
                setIsOpen(false);
                if (onTabChange) {
                  console.log('🎯 EmployerFloatingAIButton: Calling parent onTabChange with:', tab);
                  setTimeout(() => {
                    console.log('🎯 EmployerFloatingAIButton: EXECUTING parent onTabChange NOW');
                    onTabChange(tab);
                    console.log('🎯 EmployerFloatingAIButton: Parent onTabChange executed');
                  }, 100);
                } else {
                  console.error('❌ EmployerFloatingAIButton: onTabChange prop not provided!');
                }
              }}
              contextPage={currentPage}
              contextPrompt={contextPrompt}
              onSpeakingChange={setIsSpeaking}
              onStopSpeakingCallback={(callback) => setStopSpeakingCallback(() => callback)}
            />
          </div>
        </div>
      )}
    </>
  );
}
