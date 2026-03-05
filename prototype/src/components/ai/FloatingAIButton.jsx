/**
 * Floating AI Assistant Button
 * 
 * Appears on every page for instant AI help
 */

import { useState, useEffect } from 'react';
import './FloatingAIButton.css';
import AIAssistant from './AIAssistant';

export default function FloatingAIButton({ onTabChange, currentPage }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contextPrompt, setContextPrompt] = useState('');

  // Set context-aware prompts based on current page
  useEffect(() => {
    const prompts = {
      'home': 'नमस्ते! Looking for jobs? Need help with anything?',
      'jobs': 'Need help finding the right job? Ask me about job types, locations, or wages!',
      'payslip': 'Upload your payslip and I\'ll check if your wages are correct!',
      'grievance': 'Having workplace issues? I\'ll help you write a strong complaint!',
      'attendance': 'Need help marking attendance? Ask me anything!',
      'ledger': 'Questions about your payments? I can help track your earnings!',
      'rating': 'Want to rate your employer or check your worker rating?',
      'voice': 'Use voice commands! Just speak and I\'ll help you navigate.',
      'sync': 'Having sync issues? I can help troubleshoot!',
      'profile': 'Need to update your profile or skills?',
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
        <button 
          className={`floating-ai-btn ${isOpen ? 'open' : ''}`}
          onClick={toggleAI}
          aria-label="AI Assistant"
        >
          {isOpen ? '✕' : '🤖'}
        </button>
      </div>

      {/* AI Assistant Modal */}
      {isOpen && (
        <div className="floating-ai-modal">
          <div className="floating-ai-modal__content">
            <AIAssistant 
              onTabChange={(tab) => {
                if (onTabChange) {
                  onTabChange(tab);
                  setIsOpen(false); // Close modal after navigation
                }
              }}
              contextPage={currentPage}
              contextPrompt={contextPrompt}
            />
          </div>
        </div>
      )}
    </>
  );
}
