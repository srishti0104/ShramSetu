/**
 * AI Assistant Component
 * 
 * Powered by AWS Bedrock for intelligent worker assistance
 */

import { useState } from 'react';
import './AIAssistant.css';
import groqService from '../../services/ai/groqService';
import geminiService from '../../services/ai/geminiService';

export default function AIAssistant({ onTabChange, contextPage, contextPrompt }) {
  console.log('🤖 AIAssistant rendering, onTabChange:', typeof onTabChange);
  console.log('📍 Context page:', contextPage);
  
  // Set initial message based on context
  const getInitialMessage = () => {
    if (contextPrompt) {
      return `नमस्ते! ${contextPrompt}`;
    }
    return 'नमस्ते! I am ShramSetu AI Assistant. I can help you with job advice, payslip analysis, grievances, and worker rights. How can I assist you today?';
  };
  
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: getInitialMessage(),
      timestamp: Date.now()
    },
    {
      role: 'assistant',
      content: '💡 Quick tip: Just say what you need! For example:\n• "mason job" - I\'ll find construction jobs\n• "salary problem" - I\'ll check your payslip\n• "complaint" - I\'ll help write a grievance',
      timestamp: Date.now() + 1000,
      isProactive: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [aiProvider, setAiProvider] = useState('gemini'); // 'gemini' or 'groq'
  const [agenticMode, setAgenticMode] = useState(true); // Auto-execute actions for illiterate users
  const [voiceMode, setVoiceMode] = useState(false); // Voice input/output mode
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Helper function to extract job details from message
  const extractJobDetails = (message) => {
    const lowerMessage = message.toLowerCase();
    const details = {};
    
    // Job types mapping - each skill maps to its own category
    const jobTypes = {
      'mason': { category: 'construction', skill: 'Mason' },
      'मिस्त्री': { category: 'construction', skill: 'Mason' },
      'construction': { category: 'construction', skill: 'Construction' },
      'निर्माण': { category: 'construction', skill: 'Construction' },
      'builder': { category: 'construction', skill: 'Builder' },
      'plumber': { category: 'plumbing', skill: 'Plumber' },
      'प्लंबर': { category: 'plumbing', skill: 'Plumber' },
      'plumbing': { category: 'plumbing', skill: 'Plumbing' },
      'electrician': { category: 'electrical', skill: 'Electrician' },
      'बिजली मिस्त्री': { category: 'electrical', skill: 'Electrician' },
      'electrical': { category: 'electrical', skill: 'Electrical' },
      'carpenter': { category: 'carpentry', skill: 'Carpenter' },
      'बढ़ई': { category: 'carpentry', skill: 'Carpenter' },
      'carpentry': { category: 'carpentry', skill: 'Carpentry' },
      'painter': { category: 'painting', skill: 'Painter' },
      'पेंटर': { category: 'painting', skill: 'Painter' },
      'painting': { category: 'painting', skill: 'Painting' },
      'delivery': { category: 'delivery', skill: 'Delivery' },
      'डिलीवरी': { category: 'delivery', skill: 'Delivery' },
      'driver': { category: 'delivery', skill: 'Driver' },
      'ड्राइवर': { category: 'delivery', skill: 'Driver' },
      'security': { category: 'security', skill: 'Security' },
      'सुरक्षा': { category: 'security', skill: 'Security' },
      'guard': { category: 'security', skill: 'Guard' },
      'गार्ड': { category: 'security', skill: 'Guard' },
      'cook': { category: 'hospitality', skill: 'Cook' },
      'रसोइया': { category: 'hospitality', skill: 'Cook' },
      'chef': { category: 'hospitality', skill: 'Chef' },
      'waiter': { category: 'hospitality', skill: 'Waiter' },
      'वेटर': { category: 'hospitality', skill: 'Waiter' },
      'cleaner': { category: 'cleaning', skill: 'Cleaner' },
      'सफाई': { category: 'cleaning', skill: 'Cleaner' },
      'housekeeping': { category: 'cleaning', skill: 'Housekeeping' },
      'factory': { category: 'manufacturing', skill: 'Factory' },
      'फैक्ट्री': { category: 'manufacturing', skill: 'Factory' },
      'manufacturing': { category: 'manufacturing', skill: 'Manufacturing' },
      'warehouse': { category: 'warehouse', skill: 'Warehouse' },
      'गोदाम': { category: 'warehouse', skill: 'Warehouse' }
    };
    
    // Extract job type and category
    for (const [keyword, jobInfo] of Object.entries(jobTypes)) {
      if (lowerMessage.includes(keyword)) {
        details.jobType = jobInfo.category.charAt(0).toUpperCase() + jobInfo.category.slice(1);
        details.skills = jobInfo.skill;
        console.log(`✅ Matched keyword "${keyword}" -> Category: ${details.jobType}, Skill: ${details.skills}`);
        break;
      }
    }
    
    // Extract location (Indian cities)
    const cities = ['mumbai', 'delhi', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'pimpri', 'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur', 'gwalior', 'vijayawada', 'jodhpur', 'madurai', 'raipur', 'kota'];
    
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
    { id: 'payslip', label: '💰 Analyze My Payslip', prompt: 'Help me understand my payslip and check if my wages are correct' },
    { id: 'jobs', label: '🔍 Find Jobs', prompt: 'I am looking for a job. Can you help me find suitable opportunities?' },
    { id: 'grievance', label: '📝 Write Grievance', prompt: 'I have a workplace issue and need help writing a formal complaint' },
    { id: 'rights', label: '⚖️ Worker Rights', prompt: 'What are my rights as a worker in India?' },
    { id: 'skills', label: '🎓 Skill Development', prompt: 'How can I improve my skills to get better jobs?' },
    { id: 'contract', label: '📄 Review Contract', prompt: 'I have a job offer. Can you help me review the contract?' }
  ];

  // Voice Recognition Setup
  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'hi-IN'; // Hindi language
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Voice recognition started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Heard:', transcript);
      setInputMessage(transcript);
      setIsListening(false);
      
      // Auto-send the message
      handleSendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error('🎤 Voice recognition error:', event.error);
      setIsListening(false);
      alert(`Voice recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Voice recognition ended');
    };

    recognition.start();
  };

  // Text-to-Speech for AI responses
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      return;
    }

    // Stop any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi voice
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      console.log('🔊 Speaking:', text);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      console.log('🔊 Finished speaking');
    };

    utterance.onerror = (event) => {
      console.error('🔊 Speech error:', event);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
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
        // Use selected AI provider (Gemini or Groq)
        const aiService = aiProvider === 'gemini' ? geminiService : groqService;
        const result = await aiService.chatAssistant(message, {
          location: 'India',
          language: 'English/Hindi'
        });
        
        if (result.success) {
          response = result.content;
          
          // Detect intent and suggest actions
          const lowerMessage = message.toLowerCase();
          console.log('🔍 Analyzing message:', lowerMessage);
          
          if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('employment') || lowerMessage.includes('नौकरी') || lowerMessage.includes('construction') || lowerMessage.includes('plumbing') || lowerMessage.includes('electrical') || lowerMessage.includes('painting') || lowerMessage.includes('carpentry') || lowerMessage.includes('mason') || lowerMessage.includes('plumber') || lowerMessage.includes('electrician') || lowerMessage.includes('painter') || lowerMessage.includes('carpenter')) {
            // Extract job details from message
            const jobDetails = extractJobDetails(message);
            console.log('📋 Extracted job details:', jobDetails);
            
            // Check if user provided specific details
            const hasDetails = jobDetails.jobType || jobDetails.location || jobDetails.skills;
            console.log('✅ Has details:', hasDetails);
            
            if (hasDetails) {
              // User provided details - create filtered search URL
              const queryParams = new URLSearchParams();
              if (jobDetails.jobType) queryParams.set('jobType', jobDetails.jobType);
              if (jobDetails.location) queryParams.set('location', jobDetails.location);
              if (jobDetails.skills) queryParams.set('skills', jobDetails.skills);
              
              // Store filter params in sessionStorage for the JobSearch component to read
              // IMPORTANT: Store category in lowercase to match CATEGORIES array
              sessionStorage.setItem('job_search_filters', JSON.stringify({
                category: jobDetails.jobType ? jobDetails.jobType.toLowerCase() : null,
                searchQuery: jobDetails.skills || '',
                location: jobDetails.location || ''
              }));
              
              const jobSearchUrl = `/jobs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
              console.log('🔗 Job search URL:', jobSearchUrl);
              console.log('💾 Stored filters in sessionStorage:', {
                category: jobDetails.jobType ? jobDetails.jobType.toLowerCase() : null,
                searchQuery: jobDetails.skills || '',
                location: jobDetails.location || ''
              });
              suggestedActions.push({ 
                label: `🔍 Find ${jobDetails.skills || jobDetails.jobType || 'Jobs'}`, 
                path: 'home',  // Navigate to home tab where JobFeed is displayed
                filters: {
                  category: jobDetails.jobType ? jobDetails.jobType.toLowerCase() : null,
                  searchQuery: jobDetails.skills || '',
                  location: jobDetails.location || ''
                }
              });
            }
            
            // Always provide option to browse all jobs
            suggestedActions.push({ 
              label: '📋 Browse All Jobs', 
              path: 'home'  // Navigate to home tab where JobFeed is displayed
            });
            
            console.log('🎯 Suggested actions:', suggestedActions);
          }
          if (lowerMessage.includes('payslip') || lowerMessage.includes('salary') || lowerMessage.includes('wage') || lowerMessage.includes('वेतन')) {
            suggestedActions.push({ label: '💰 Go to Payslip Auditor', path: 'payslip' });
          }
          if (lowerMessage.includes('grievance') || lowerMessage.includes('complaint') || lowerMessage.includes('problem') || lowerMessage.includes('शिकायत')) {
            suggestedActions.push({ label: '📝 Go to Grievance Form', path: 'grievance' });
          }
          if (lowerMessage.includes('attendance') || lowerMessage.includes('हाजिरी')) {
            suggestedActions.push({ label: '✅ Go to Attendance', path: 'attendance' });
          }
          if (lowerMessage.includes('payment') || lowerMessage.includes('ledger') || lowerMessage.includes('khata') || lowerMessage.includes('खाता')) {
            suggestedActions.push({ label: '📒 Go to E-Khata Ledger', path: 'ledger' });
          }
        } else {
          response = `Sorry, I encountered an error: ${result.error}. Please try again or use mock mode.`;
        }
      } else {
        // Mock AI responses
        response = getMockResponse(message);
      }

      const assistantMessage = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
        actions: suggestedActions
      };

      console.log('💬 Assistant message with actions:', assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
      
      // AGENTIC MODE: Auto-execute first action if enabled
      if (agenticMode && suggestedActions.length > 0) {
        const firstAction = suggestedActions[0];
        console.log('🤖 Agentic mode: Auto-executing action:', firstAction.label);
        
        // Show visual feedback
        const autoMessage = {
          role: 'assistant',
          content: `🤖 Taking you to ${firstAction.label}...`,
          timestamp: Date.now(),
          isAutoAction: true
        };
        setMessages(prev => [...prev, autoMessage]);
        
        // Instant redirect (no delay for better UX)
        if (firstAction.filters) {
          sessionStorage.setItem('job_search_filters', JSON.stringify(firstAction.filters));
          console.log('💾 Auto-stored filters:', firstAction.filters);
        }
        if (onTabChange && firstAction.path) {
          console.log('🔄 Auto-switching to tab:', firstAction.path);
          setTimeout(() => {
            onTabChange(firstAction.path);
          }, 500); // Reduced to 0.5 seconds
        }
        
        // Voice narration (if available)
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(response);
          utterance.lang = 'hi-IN'; // Hindi voice
          utterance.rate = 0.9; // Slightly slower for clarity
          window.speechSynthesis.speak(utterance);
        }
        
        // Auto-speak in voice mode
        if (voiceMode) {
          speakText(response);
        }
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getMockResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('payslip') || lowerMessage.includes('salary') || lowerMessage.includes('wage')) {
      return `I can help you analyze your payslip! Here's what to check:

**मुख्य बातें (Key Points):**

1. **Basic Salary**: Should meet minimum wage (₹176/day in most states)
2. **Deductions**: PF (12%), ESI (0.75%), Tax if applicable  
3. **Overtime**: 2x rate for extra hours (8+ hours/day)
4. **Allowances**: DA, HRA, Transport allowance

**Red Flags to Watch:**
- Salary below minimum wage
- No PF/ESI deductions (means no social security)
- Excessive deductions without explanation
- No overtime pay for extra hours

Upload your payslip in the Payslip Auditor tab for detailed analysis! I'll check compliance with Indian labor laws.`;
    }
    
    if (lowerMessage.includes('job') || lowerMessage.includes('work') || lowerMessage.includes('employment')) {
      return `I can help you find jobs! Here are some tips:

**नौकरी खोजने के तरीके (Job Search Tips):**

1. **Update Skills**: Learn new skills relevant to your field
2. **Location**: Consider jobs within 10km for daily commute
3. **Salary**: Don't accept below minimum wage (₹176/day)
4. **Documents**: Keep Aadhaar, PAN, bank details ready

**Popular Job Categories:**
- Construction: ₹300-500/day
- Manufacturing: ₹250-400/day  
- Delivery: ₹200-350/day
- Security: ₹180-300/day

Check the Job Search tab to find opportunities near you with GPS distance calculation!`;
    }
    
    if (lowerMessage.includes('grievance') || lowerMessage.includes('complaint') || lowerMessage.includes('problem')) {
      return `I can help you write a proper grievance! Include:

**शिकायत कैसे लिखें (How to Write Grievance):**

1. **Date and Details**: When and what happened exactly
2. **Evidence**: Photos, witnesses, documents
3. **Impact**: How it affects you and your work
4. **Solution**: What you want the employer to do

**Common Grievances:**
- Unpaid wages or overtime
- Unsafe working conditions
- Harassment or discrimination
- No PF/ESI benefits

Use the Grievance Form tab to submit your complaint with AI sentiment analysis to make it more effective!`;
    }
    
    if (lowerMessage.includes('rights') || lowerMessage.includes('law') || lowerMessage.includes('legal')) {
      return `Your key worker rights in India:

**मजदूर अधिकार (Worker Rights):**

1. **Minimum Wage**: ₹176/day (varies by state)
2. **Working Hours**: Max 8 hours/day, 48 hours/week
3. **Overtime Pay**: 2x rate for extra hours
4. **Safety**: Right to safe working conditions
5. **PF & ESI**: Social security benefits (mandatory for companies with 20+ employees)

**Important Laws:**
- Minimum Wages Act, 1948
- Factories Act, 1948
- Contract Labour Act, 1970
- Building and Construction Workers Act, 1996

**If Rights Violated:**
- File complaint with Labour Commissioner
- Contact trade unions
- Use grievance redressal mechanisms

Know your rights and don't hesitate to speak up! आपके अधिकार हैं, उनका इस्तेमाल करें।`;
    }

    if (lowerMessage.includes('mumbai') || lowerMessage.includes('delhi') || lowerMessage.includes('bangalore') || lowerMessage.includes('construction')) {
      return `Looking for work in major cities! Here's what I recommend:

**शहरों में काम (City Jobs):**

**Mumbai**: Construction, manufacturing, delivery
- Average: ₹350-500/day
- High demand areas: Andheri, Thane, Navi Mumbai

**Delhi**: Construction, security, manufacturing  
- Average: ₹300-450/day
- High demand areas: Gurgaon, Noida, Faridabad

**Bangalore**: IT support, construction, delivery
- Average: ₹280-400/day
- High demand areas: Electronic City, Whitefield

**Tips for City Jobs:**
- Stay near work area to save transport cost
- Join worker WhatsApp groups for job updates
- Keep multiple skill certificates ready

Use our Job Search feature to find opportunities with exact distances from your location!`;
    }
    
    return `Thank you for your question! I'm ShramSetu AI Assistant, here to help with:

**मैं आपकी कैसे मदद कर सकता हूं (How I Can Help):**

• **Job Search**: Find work opportunities near you
• **Payslip Analysis**: Check wage compliance and deductions  
• **Grievance Writing**: Help with workplace complaints
• **Worker Rights**: Know your legal protections
• **Skill Development**: Career growth suggestions

**Quick Actions Available:**
💰 Analyze payslip for wage violations
🔍 Search jobs with GPS distance
📝 Write professional grievances  
⚖️ Learn your worker rights
🎓 Get skill development advice

Please be more specific about what you need help with, or use the quick action buttons below!

आप हिंदी में भी पूछ सकते हैं। (You can also ask in Hindi)`;
  };

  const handleQuickAction = (action) => {
    handleSendMessage(action.prompt);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="ai-assistant">
      <div className="ai-assistant__header">
        <div className="ai-assistant__title">
          <h2>🤖 ShramSetu AI Assistant</h2>
          <p>Powered by {aiProvider === 'gemini' ? 'Google Gemini' : 'Groq AI'} - Your intelligent worker companion</p>
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

      <div className="ai-assistant__chat">
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message message--${message.role}`}
            >
              <div className="message__avatar">
                {message.role === 'user' ? '👤' : '🤖'}
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
                        onClick={() => {
                          // Store filters if provided
                          if (action.filters) {
                            sessionStorage.setItem('job_search_filters', JSON.stringify(action.filters));
                            console.log('💾 Stored filters:', action.filters);
                          }
                          // Navigate to tab using parent callback if available
                          if (onTabChange && action.path) {
                            console.log('🔄 Switching to tab:', action.path);
                            onTabChange(action.path);
                          } else if (action.path) {
                            // Fallback: store the tab to switch to and reload
                            sessionStorage.setItem('switch_to_tab', action.path);
                            window.location.reload();
                          }
                        }}
                        className="message__action-btn"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
                <div className="message__time">
                  {formatTimestamp(message.timestamp)}
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
                  <span>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="quick-actions">
          <h4>Quick Actions:</h4>
          <div className="quick-actions__grid">
            {quickActions.map(action => (
              <button
                key={action.id}
                onClick={() => handleQuickAction(action)}
                className="quick-action-btn"
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-input">
          <div className="input-group">
            {voiceMode ? (
              // Voice Mode UI
              <div className="voice-input-container">
                <button
                  onClick={startVoiceRecognition}
                  disabled={isLoading || isListening}
                  className={`voice-record-btn ${isListening ? 'listening' : ''}`}
                >
                  {isListening ? '🎤 Listening...' : '🎤 Tap to Speak'}
                </button>
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="voice-stop-btn"
                  >
                    🔇 Stop Speaking
                  </button>
                )}
              </div>
            ) : (
              // Text Mode UI
              <>
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask me anything about jobs, wages, rights, or skills..."
                  disabled={isLoading}
                  className="chat-input__field"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputMessage.trim()}
                  className="chat-input__send"
                >
                  {isLoading ? '⏳' : '📤'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}