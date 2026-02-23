/**
 * AI Assistant Component
 * 
 * Powered by AWS Bedrock for intelligent worker assistance
 */

import { useState } from 'react';
import './AIAssistant.css';
import bedrockService from '../../services/aws/bedrockService';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'नमस्ते! I am ShramSetu AI Assistant. I can help you with job advice, payslip analysis, grievances, and worker rights. How can I assist you today?',
      timestamp: Date.now()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);

  const quickActions = [
    { id: 'payslip', label: '💰 Analyze My Payslip', prompt: 'Help me understand my payslip and check if my wages are correct' },
    { id: 'jobs', label: '🔍 Find Jobs', prompt: 'I am looking for a job. Can you help me find suitable opportunities?' },
    { id: 'grievance', label: '📝 Write Grievance', prompt: 'I have a workplace issue and need help writing a formal complaint' },
    { id: 'rights', label: '⚖️ Worker Rights', prompt: 'What are my rights as a worker in India?' },
    { id: 'skills', label: '🎓 Skill Development', prompt: 'How can I improve my skills to get better jobs?' },
    { id: 'contract', label: '📄 Review Contract', prompt: 'I have a job offer. Can you help me review the contract?' }
  ];

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
      
      if (useAI) {
        // Use AWS Bedrock
        const result = await bedrockService.chatAssistant(message, {
          location: 'India',
          language: 'English/Hindi'
        });
        
        if (result.success) {
          response = result.content;
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
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
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
          <p>Powered by AWS Bedrock - Your intelligent worker companion</p>
        </div>
        
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
            {useAI ? '🤖 AWS Bedrock AI' : '🎭 Mock AI'}
          </span>
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
                <div className="message__text">
                  {message.content}
                </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}