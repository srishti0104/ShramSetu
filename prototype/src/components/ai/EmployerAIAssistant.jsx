/**
 * Employer AI Assistant Component
 * 
 * Specialized AI assistant for employers with worker search and hiring features
 * Adapted from worker AI assistant - searches for workers instead of jobs
 */

import { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';
import groqService from '../../services/ai/groqService';
import geminiService from '../../services/ai/geminiService';
import pollyService from '../../services/aws/pollyService';

export default function EmployerAIAssistant({ onTabChange, contextPage, contextPrompt, onSpeakingChange, onStopSpeakingCallback }) {
  console.log('🤖 EmployerAIAssistant rendering, onTabChange:', typeof onTabChange);
  console.log('📍 Context page:', contextPage);
  
  // Set initial message based on context
  const getInitialMessage = () => {
    if (contextPrompt) {
      return `नमस्ते! ${contextPrompt}`;
    }
    return 'नमस्ते! मैं श्रम सेतु AI असिस्टेंट हूं। मैं आपकी प्रतिभा खोज, कर्मचारी प्रबंधन, और व्यवसाय सलाह में मदद कर सकता हूं।\n\nHello! I am ShramSetu AI Assistant for Employers. I can help you with talent search, worker management, and business advice. How can I assist you today?';
  };
  
  // Load chat history from sessionStorage or use initial messages
  const loadChatHistory = () => {
    const savedMessages = sessionStorage.getItem('employer_ai_chat_history');
    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    }
    return [
      {
        role: 'assistant',
        content: getInitialMessage(),
        timestamp: Date.now()
      },
      {
        role: 'assistant',
        content: '💡 त्वरित सुझाव: बस बताएं कि आपको क्या चाहिए!\n💡 Quick tip: Just say what you need!\n\n• "मिस्त्री चाहिए" / "need mason" - मैं कुशल कर्मचारी ढूंढूंगा\n• "कर्मचारी प्रबंधन" / "worker management" - मैं प्रबंधन में मदद करूंगा\n• "व्यवसाय सलाह" / "business advice" - मैं सलाह दूंगा',
        timestamp: Date.now() + 1000,
        isProactive: true
      }
    ];
  };
  
  const [messages, setMessages] = useState(loadChatHistory());
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [aiProvider, setAiProvider] = useState('groq');
  const [agenticMode, setAgenticMode] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  
  // Notify parent when speaking state changes
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isSpeaking);
    }
  }, [isSpeaking, onSpeakingChange]);
  
  // Pass stop speaking callback to parent
  useEffect(() => {
    if (onStopSpeakingCallback) {
      onStopSpeakingCallback(stopSpeaking);
    }
  }, [onStopSpeakingCallback]);
  
  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    sessionStorage.setItem('employer_ai_chat_history', JSON.stringify(messages));
  }, [messages]);
  
  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  // Cleanup speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, []);

  // Stop speech when voice mode is disabled
  useEffect(() => {
    if (!voiceMode && isSpeaking) {
      stopSpeaking();
    }
    if (!voiceMode) {
      setVoiceProcessing(false);
    }
  }, [voiceMode]);

  // Helper function to extract worker details from message (adapted from extractJobDetails)
  const extractWorkerDetails = (message) => {
    const lowerMessage = message.toLowerCase();
    const details = {};
    
    // Same job type mapping but for finding workers with those skills
    const skillTypes = {
      // PAINTING
      'painting': { category: 'painting', skill: 'Painter' },
      'painter': { category: 'painting', skill: 'Painter' },
      'पेंटिंग': { category: 'painting', skill: 'Painter' },
      'पेंटर': { category: 'painting', skill: 'Painter' },
      
      // CONSTRUCTION
      'construction': { category: 'construction', skill: 'Construction' },
      'mason': { category: 'construction', skill: 'Mason' },
      'राजमिस्त्री': { category: 'construction', skill: 'Mason' },
      'मिस्त्री': { category: 'construction', skill: 'Mason' },
      
      // PLUMBING
      'plumbing': { category: 'plumbing', skill: 'Plumber' },
      'plumber': { category: 'plumbing', skill: 'Plumber' },
      'प्लंबर': { category: 'plumbing', skill: 'Plumber' },
      
      // ELECTRICAL
      'electrical': { category: 'electrical', skill: 'Electrician' },
      'electrician': { category: 'electrical', skill: 'Electrician' },
      'बिजली': { category: 'electrical', skill: 'Electrician' },
      
      // CARPENTRY
      'carpentry': { category: 'carpentry', skill: 'Carpenter' },
      'carpenter': { category: 'carpentry', skill: 'Carpenter' },
      'बढ़ई': { category: 'carpentry', skill: 'Carpenter' }
    };
    
    // Extract skill type
    for (const [keyword, skillInfo] of Object.entries(skillTypes)) {
      if (lowerMessage.includes(keyword)) {
        details.skillType = skillInfo.category.charAt(0).toUpperCase() + skillInfo.category.slice(1);
        details.skills = skillInfo.skill;
        console.log(`✅ Matched keyword "${keyword}" -> Category: ${details.skillType}, Skill: ${details.skills}`);
        break;
      }
    }
    
    // Extract location (Indian cities)
    const cities = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'jaipur'];
    for (const city of cities) {
      if (lowerMessage.includes(city)) {
        details.location = city.charAt(0).toUpperCase() + city.slice(1);
        console.log(`✅ Matched city: ${details.location}`);
        break;
      }
    }
    
    return details;
  };

  const quickActions = [
    { id: 'post-job', label: '➕ नौकरी पोस्ट करें / Post a Job', prompt: 'मैं नौकरी पोस्ट करना चाहता हूं / I want to post a job' },
    { id: 'posted-jobs', label: '📋 पोस्ट की गई नौकरियां / View Posted Jobs', prompt: 'मेरी पोस्ट की गई नौकरियां दिखाएं / Show my posted jobs' },
    { id: 'applicants', label: '📝 आवेदक देखें / View Applicants', prompt: 'मेरी नौकरी के लिए किसने आवेदन किया है? / Who has applied for my job postings?' },
    { id: 'manage', label: '👥 कर्मचारी प्रबंधन / Worker Management', prompt: 'कर्मचारी प्रबंधन में मदद चाहिए / I need help with worker management' },
    { id: 'compliance', label: '⚖️ श्रम कानून / Labor Laws', prompt: 'भारत में नियोक्ता के रूप में मेरे क्या दायित्व हैं? / What are my obligations as an employer in India?' },
    { id: 'hiring', label: '💼 भर्ती सलाह / Hiring Advice', prompt: 'अच्छे कर्मचारी कैसे चुनें? / How to select good workers?' }
  ];

  // Text-to-Speech with emoji filtering
  const speakText = async (text) => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      setIsSpeaking(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Filter out emojis
      const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]/gu, '');
      
      setIsSpeaking(true);
      
      await pollyService.speak(textWithoutEmojis, 'hi-IN', {
        rate: 0.8,
        volume: 1,
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: (error) => {
          console.error('🔊 Polly error:', error);
          setIsSpeaking(false);
          fallbackToWebSpeech(textWithoutEmojis);
        }
      });
    } catch (error) {
      console.error('🔊 Speech error:', error);
      setIsSpeaking(false);
      const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]/gu, '');
      fallbackToWebSpeech(textWithoutEmojis);
    }
  };

  const fallbackToWebSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      return;
    }

    window.speechSynthesis.cancel();
    
    setTimeout(() => {
      const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(textWithoutEmojis);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }, 200);
  };

  const stopSpeaking = () => {
    console.log('🔇 Stopping all speech synthesis...');
    
    if (pollyService && pollyService.stop) {
      pollyService.stop();
    }
    
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }, 100);
      setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      }, 300);
    }
    
    setIsSpeaking(false);
  };

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const userMessage = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      let suggestedActions = [];
      
      if (useAI) {
        const aiService = aiProvider === 'gemini' ? geminiService : groqService;
        const result = await aiService.chatAssistant(message, {
          location: 'India',
          language: 'English/Hindi',
          userType: 'employer'
        });
        
        if (result.success) {
          response = result.content;
          
          // Detect intent for WORKER SEARCH (adapted from job search)
          const lowerMessage = message.toLowerCase();
          console.log('🔍 Analyzing employer message:', lowerMessage);
          
          // Posted jobs detection
          if (lowerMessage.includes('posted job') || lowerMessage.includes('my job') || lowerMessage.includes('jobs posted') || lowerMessage.includes('view jobs') || lowerMessage.includes('show jobs') || lowerMessage.includes('मेरी नौकरी') || lowerMessage.includes('पोस्ट की गई') || lowerMessage.includes('नौकरियां दिखाएं')) {
            suggestedActions.push({ 
              label: '📋 View Posted Jobs', 
              path: 'home',
              description: 'See all your posted jobs'
            });
          }
          
          // Applications management - detect when employer wants to see applicants
          if (lowerMessage.includes('application') || lowerMessage.includes('applications') || lowerMessage.includes('applicant') || lowerMessage.includes('applicants') || lowerMessage.includes('applied') || lowerMessage.includes('apply') || lowerMessage.includes('आवेदन') || lowerMessage.includes('आवेदक') || lowerMessage.includes('job posting') || lowerMessage.includes('posted job') || lowerMessage.includes('my job') || lowerMessage.includes('who applied') || lowerMessage.includes('candidates') || lowerMessage.includes('shortlist')) {
            suggestedActions.push({ 
              label: '📋 View Job Applications', 
              path: 'applications',
              description: 'See all applicants for your job postings'
            });
          }
          
          // Post job detection
          if (lowerMessage.includes('post job') || lowerMessage.includes('post a job') || lowerMessage.includes('create job') || lowerMessage.includes('new job') || lowerMessage.includes('job posting') || lowerMessage.includes('नौकरी पोस्ट') || lowerMessage.includes('नौकरी बनाएं') || lowerMessage.includes('नई नौकरी')) {
            suggestedActions.push({ 
              label: '➕ Post a Job', 
              path: 'post-job',
              description: 'Create a new job posting'
            });
          }
          
          // Attendance tracking
          if (lowerMessage.includes('attendance') || lowerMessage.includes('हाजिरी') || lowerMessage.includes('उपस्थिति')) {
            suggestedActions.push({ label: '📅 Go to Attendance', path: 'post-job' });
          }
          
          // Grievance
          if (lowerMessage.includes('grievance') || lowerMessage.includes('complaint') || lowerMessage.includes('शिकायत')) {
            suggestedActions.push({ label: '🛡️ Go to Grievance', path: 'grievance' });
          }
          
          // Rating
          if (lowerMessage.includes('rating') || lowerMessage.includes('review') || lowerMessage.includes('रेटिंग')) {
            suggestedActions.push({ label: '⭐ Go to Rating', path: 'rating' });
          }
        } else {
          response = 'क्षमा करें, मुझे आपकी मदद करने में समस्या हो रही है। कृपया पुनः प्रयास करें।\n\nSorry, I\'m having trouble helping you. Please try again.';
        }
      } else {
        response = `Echo: ${message}`;
      }

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        actions: suggestedActions
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // AGENTIC MODE: Auto-execute first action
      if (agenticMode && suggestedActions.length > 0) {
        const firstAction = suggestedActions[0];
        console.log('🤖 Agentic mode: Auto-executing action:', firstAction);
        
        const autoMessage = {
          role: 'assistant',
          content: `🤖 Taking you to ${firstAction.label}...`,
          timestamp: Date.now(),
          isAutoAction: true
        };
        setMessages(prev => [...prev, autoMessage]);
        
        if (firstAction.filters) {
          sessionStorage.setItem('worker_search_filters', JSON.stringify(firstAction.filters));
          console.log('💾 Auto-stored worker filters:', firstAction.filters);
        }
        
        if (onTabChange && firstAction.path) {
          console.log('🔄 Auto-switching to tab:', firstAction.path);
          setTimeout(() => {
            onTabChange(firstAction.path);
          }, 500);
        }
      }

      if (voiceMode) {
        await speakText(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'क्षमा करें, कुछ गलत हो गया। कृपया पुनः प्रयास करें।\n\nSorry, something went wrong. Please try again.',
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action.prompt);
  };

  const clearChat = () => {
    setMessages(loadChatHistory());
    sessionStorage.removeItem('employer_ai_chat_history');
  };

  const handleActionClick = (action) => {
    console.log('🎯 Action clicked:', action);
    if (action.filters) {
      sessionStorage.setItem('worker_search_filters', JSON.stringify(action.filters));
    }
    if (onTabChange && action.path) {
      onTabChange(action.path);
    }
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant__header">
        <div className="ai-assistant__title">
          <h2>
            <img 
              src="/images/chatbot-avatar.png" 
              alt="AI"
              style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', verticalAlign: 'middle', marginRight: '10px'}}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            ShramSetu AI Assistant (Employer)
          </h2>
          <p>Powered by {aiProvider === 'gemini' ? 'Google Gemini' : 'Groq AI'} - Your intelligent hiring companion</p>
        </div>
        
        <div className="ai-assistant__controls">
          <div className="ai-assistant__toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {useAI ? '🤖 AI Mode' : '🎭 Mock Mode'}
            </span>
          </div>
          
          <div className="ai-assistant__toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={agenticMode}
                onChange={(e) => setAgenticMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {agenticMode ? '⚡ Auto-Action' : '👆 Manual'}
            </span>
          </div>
          
          <div className="ai-assistant__toggle">
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={voiceMode}
                onChange={(e) => setVoiceMode(e.target.checked)}
              />
              <span className="toggle-slider"></span>
            </label>
            <span className="toggle-label">
              {voiceMode ? '🎤 Voice Mode' : '⌨️ Text Mode'}
            </span>
          </div>
          
          {useAI && (
            <div className="ai-assistant__provider">
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="ai-provider-select"
              >
                <option value="gemini">🌟 Gemini (Best for Hindi)</option>
                <option value="groq">⚡ Groq (Fastest)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="quick-actions">
        <h4>💡 त्वरित सुझाव / Quick Actions</h4>
        <div className="quick-actions__grid">
          {quickActions.map(action => (
            <button
              key={action.id}
              className="quick-action-btn"
              onClick={() => handleQuickAction(action)}
              disabled={isLoading}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="ai-assistant__chat">
        <div className="chat-messages" ref={chatMessagesRef}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message message--${message.role}`}
            >
              <div className="message__avatar">
                {message.role === 'user' ? '👤' : (
                  <img 
                    src="/images/chatbot-avatar.png" 
                    alt="AI Assistant"
                    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '🤖';
                    }}
                  />
                )}
              </div>
              <div className="message__content">
                <div className={`message__text ${message.isAutoAction ? 'auto-action' : ''}`}>
                  {message.content}
                </div>
                {message.actions && message.actions.length > 0 && (
                  <div className="message__actions">
                    {message.actions.map((action, actionIndex) => (
                      <button
                        key={actionIndex}
                        className="message__action-btn"
                        onClick={() => handleActionClick(action)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="message__time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message message--assistant">
              <div className="message__avatar">🤖</div>
              <div className="message__content">
                <div className="message__loading">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input">
          <div className="input-group">
            <input
              type="text"
              className="chat-input__field"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
            />
            <button
              className="chat-input__send"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
