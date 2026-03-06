/**
 * AI Assistant Component
 * 
 * Powered by AWS Bedrock for intelligent worker assistance
 */

import { useState, useRef, useEffect } from 'react';
import './AIAssistant.css';
import groqService from '../../services/ai/groqService';
import geminiService from '../../services/ai/geminiService';
import pollyService from '../../services/aws/pollyService';

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
  
  // Load chat history from sessionStorage or use initial messages
  const loadChatHistory = () => {
    const savedMessages = sessionStorage.getItem('ai_chat_history');
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
        content: '💡 Quick tip: Just say what you need! For example:\n• "mason job" - I\'ll find construction jobs\n• "salary problem" - I\'ll check your payslip\n• "complaint" - I\'ll help write a grievance',
        timestamp: Date.now() + 1000,
        isProactive: true
      }
    ];
  };
  
  const [messages, setMessages] = useState(loadChatHistory());
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [aiProvider, setAiProvider] = useState('groq'); // 'gemini' or 'groq' - Default to Groq
  const [agenticMode, setAgenticMode] = useState(true); // Auto-execute actions for illiterate users
  const [voiceMode, setVoiceMode] = useState(false); // Voice input/output mode
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Ref for chat messages container to enable auto-scroll
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  
  // Save chat history to sessionStorage whenever messages change
  useEffect(() => {
    sessionStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);
  
  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  // Helper function to extract job details from message
  const extractJobDetails = (message) => {
    const lowerMessage = message.toLowerCase();
    const details = {};
    
    // ONLY map to the 5 main categories: Construction, Plumbing, Electrical, Painting, Carpentry
    // If keyword doesn't map to these 5, don't set category
    const jobTypes = {
      // Painting - all variations (CHECK FIRST to avoid "paint" matching before "painting")
      'painting': { category: 'painting', skill: 'Painter' },
      'painter': { category: 'painting', skill: 'Painter' },
      'painters': { category: 'painting', skill: 'Painter' },
      'पेंटिंग': { category: 'painting', skill: 'Painter' },
      'पेंटर': { category: 'painting', skill: 'Painter' },
      'रंगाई': { category: 'painting', skill: 'Painter' },
      'whitewash': { category: 'painting', skill: 'Painter' },
      'सफेदी': { category: 'painting', skill: 'Painter' },
      'painted': { category: 'painting', skill: 'Painter' },
      'paints': { category: 'painting', skill: 'Painter' },
      'paint': { category: 'painting', skill: 'Painter' },
      'रंगना': { category: 'painting', skill: 'Painter' },
      'रंग': { category: 'painting', skill: 'Painter' },
      'wall': { category: 'painting', skill: 'Painter' },
      'walls': { category: 'painting', skill: 'Painter' },
      'दीवार': { category: 'painting', skill: 'Painter' },
      'color': { category: 'painting', skill: 'Painter' },
      'colour': { category: 'painting', skill: 'Painter' },
      
      // Construction - all variations
      'construction': { category: 'construction', skill: 'Construction' },
      'constructing': { category: 'construction', skill: 'Construction' },
      'construct': { category: 'construction', skill: 'Construction' },
      'राजमिस्त्री': { category: 'construction', skill: 'Mason' },
      'मिस्त्री': { category: 'construction', skill: 'Mason' },
      'masonry': { category: 'construction', skill: 'Mason' },
      'masons': { category: 'construction', skill: 'Mason' },
      'mason': { category: 'construction', skill: 'Mason' },
      'निर्माण': { category: 'construction', skill: 'Construction' },
      'builders': { category: 'construction', skill: 'Builder' },
      'builder': { category: 'construction', skill: 'Builder' },
      'building': { category: 'construction', skill: 'Builder' },
      'build': { category: 'construction', skill: 'Builder' },
      'बिल्डर': { category: 'construction', skill: 'Builder' },
      'cement': { category: 'construction', skill: 'Mason' },
      'सीमेंट': { category: 'construction', skill: 'Mason' },
      'ईंट': { category: 'construction', skill: 'Mason' },
      
      // Plumbing - all variations
      'plumbing': { category: 'plumbing', skill: 'Plumber' },
      'plumbers': { category: 'plumbing', skill: 'Plumber' },
      'plumber': { category: 'plumbing', skill: 'Plumber' },
      'plumb': { category: 'plumbing', skill: 'Plumber' },
      'प्लंबर': { category: 'plumbing', skill: 'Plumber' },
      'drainage': { category: 'plumbing', skill: 'Plumber' },
      'pipes': { category: 'plumbing', skill: 'Plumber' },
      'pipe': { category: 'plumbing', skill: 'Plumber' },
      'पाइप': { category: 'plumbing', skill: 'Plumber' },
      'water': { category: 'plumbing', skill: 'Plumber' },
      'पानी': { category: 'plumbing', skill: 'Plumber' },
      'नाली': { category: 'plumbing', skill: 'Plumber' },
      'tap': { category: 'plumbing', skill: 'Plumber' },
      'leak': { category: 'plumbing', skill: 'Plumber' },
      'नल': { category: 'plumbing', skill: 'Plumber' },
      
      // Electrical - all variations
      'बिजली मिस्त्री': { category: 'electrical', skill: 'Electrician' },
      'इलेक्ट्रीशियन': { category: 'electrical', skill: 'Electrician' },
      'electricians': { category: 'electrical', skill: 'Electrician' },
      'electrician': { category: 'electrical', skill: 'Electrician' },
      'electrical': { category: 'electrical', skill: 'Electrician' },
      'electricity': { category: 'electrical', skill: 'Electrician' },
      'electric': { category: 'electrical', skill: 'Electrician' },
      'wiring': { category: 'electrical', skill: 'Electrician' },
      'बिजली': { category: 'electrical', skill: 'Electrician' },
      'lights': { category: 'electrical', skill: 'Electrician' },
      'light': { category: 'electrical', skill: 'Electrician' },
      'switch': { category: 'electrical', skill: 'Electrician' },
      'स्विच': { category: 'electrical', skill: 'Electrician' },
      'wire': { category: 'electrical', skill: 'Electrician' },
      'तार': { category: 'electrical', skill: 'Electrician' },
      'fan': { category: 'electrical', skill: 'Electrician' },
      'पंखा': { category: 'electrical', skill: 'Electrician' },
      
      // Carpentry - all variations
      'carpenters': { category: 'carpentry', skill: 'Carpenter' },
      'carpenter': { category: 'carpentry', skill: 'Carpenter' },
      'carpentry': { category: 'carpentry', skill: 'Carpenter' },
      'furniture': { category: 'carpentry', skill: 'Carpenter' },
      'फर्नीचर': { category: 'carpentry', skill: 'Carpenter' },
      'woodwork': { category: 'carpentry', skill: 'Carpenter' },
      'wooden': { category: 'carpentry', skill: 'Carpenter' },
      'लकड़ी': { category: 'carpentry', skill: 'Carpenter' },
      'दरवाजा': { category: 'carpentry', skill: 'Carpenter' },
      'अलमारी': { category: 'carpentry', skill: 'Carpenter' },
      'खिड़की': { category: 'carpentry', skill: 'Carpenter' },
      'cabinet': { category: 'carpentry', skill: 'Carpenter' },
      'window': { category: 'carpentry', skill: 'Carpenter' },
      'doors': { category: 'carpentry', skill: 'Carpenter' },
      'door': { category: 'carpentry', skill: 'Carpenter' },
      'wood': { category: 'carpentry', skill: 'Carpenter' },
      'बढ़ई': { category: 'carpentry', skill: 'Carpenter' }
    };
    
    // Extract job type and category - ONLY if it maps to one of the 5 categories
    // Check longer keywords first to avoid partial matches
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
    
    // Support both Hindi and English
    recognition.lang = 'en-IN'; // English (India) - better for mixed Hindi-English
    recognition.interimResults = false;
    recognition.maxAlternatives = 3; // Get multiple alternatives for better accuracy

    recognition.onstart = () => {
      setIsListening(true);
      console.log('🎤 Voice recognition started');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 Heard:', transcript);
      console.log('🎤 All alternatives:', Array.from(event.results[0]).map(r => r.transcript));
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

  // Text-to-Speech for AI responses using AWS Polly
  const speakText = async (text) => {
    try {
      setIsSpeaking(true);
      console.log('🔊 Speaking with AWS Polly:', text);
      
      await pollyService.speak(text, 'hi-IN', {
        rate: 0.9,
        volume: 1,
        onStart: () => {
          setIsSpeaking(true);
        },
        onEnd: () => {
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error('🔊 Polly error:', error);
          setIsSpeaking(false);
          // Fallback to browser TTS
          fallbackToWebSpeech(text);
        }
      });
    } catch (error) {
      console.error('🔊 Speech error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS
      fallbackToWebSpeech(text);
    }
  };

  // Fallback to browser Web Speech API if Polly fails
  const fallbackToWebSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    // Stop AWS Polly
    pollyService.stop();
    
    // Stop browser TTS as fallback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
          
          // Jobs detection - extensive keywords in English, Hindi, and Hinglish (all tenses)
          if (lowerMessage.includes('job') || lowerMessage.includes('jobs') || lowerMessage.includes('work') || lowerMessage.includes('working') || lowerMessage.includes('worked') || lowerMessage.includes('employment') || lowerMessage.includes('employ') || lowerMessage.includes('employed') || lowerMessage.includes('नौकरी') || lowerMessage.includes('naukri') || lowerMessage.includes('nokri') || lowerMessage.includes('काम') || lowerMessage.includes('kaam') || lowerMessage.includes('kam') || lowerMessage.includes('रोजगार') || lowerMessage.includes('rojgar') || lowerMessage.includes('rozgar') || lowerMessage.includes('धंधा') || lowerMessage.includes('dhanda') || lowerMessage.includes('dhandha') || lowerMessage.includes('construction') || lowerMessage.includes('plumbing') || lowerMessage.includes('electrical') || lowerMessage.includes('painting') || lowerMessage.includes('carpentry') || lowerMessage.includes('mason') || lowerMessage.includes('plumber') || lowerMessage.includes('electrician') || lowerMessage.includes('painter') || lowerMessage.includes('carpenter') || lowerMessage.includes('मिस्त्री') || lowerMessage.includes('mistri') || lowerMessage.includes('mistry') || lowerMessage.includes('राजमिस्त्री') || lowerMessage.includes('rajmistri') || lowerMessage.includes('प्लंबर') || lowerMessage.includes('plumber') || lowerMessage.includes('बिजली') || lowerMessage.includes('bijli') || lowerMessage.includes('bijlee') || lowerMessage.includes('पेंटर') || lowerMessage.includes('painter') || lowerMessage.includes('pentar') || lowerMessage.includes('बढ़ई') || lowerMessage.includes('badhai') || lowerMessage.includes('barhai') || lowerMessage.includes('निर्माण') || lowerMessage.includes('nirman') || lowerMessage.includes('nirmaan') || lowerMessage.includes('कारीगर') || lowerMessage.includes('karigar') || lowerMessage.includes('kaarigar') || lowerMessage.includes('मजदूर') || lowerMessage.includes('majdur') || lowerMessage.includes('mazdoor') || lowerMessage.includes('majdoor') || lowerMessage.includes('श्रमिक') || lowerMessage.includes('shramik') || lowerMessage.includes('कामगार') || lowerMessage.includes('kamgar') || lowerMessage.includes('kaamgaar') || lowerMessage.includes('vacancy') || lowerMessage.includes('vacancies') || lowerMessage.includes('hiring') || lowerMessage.includes('hire') || lowerMessage.includes('hired') || lowerMessage.includes('recruit') || lowerMessage.includes('recruiting') || lowerMessage.includes('recruitment') || lowerMessage.includes('position') || lowerMessage.includes('positions') || lowerMessage.includes('opening') || lowerMessage.includes('openings') || lowerMessage.includes('opportunity') || lowerMessage.includes('opportunities') || lowerMessage.includes('भर्ती') || lowerMessage.includes('bharti') || lowerMessage.includes('bharati') || lowerMessage.includes('रिक्ति') || lowerMessage.includes('rikti') || lowerMessage.includes('रिक्त') || lowerMessage.includes('rikt') || lowerMessage.includes('अवसर') || lowerMessage.includes('avsar') || lowerMessage.includes('मौका') || lowerMessage.includes('mauka') || lowerMessage.includes('mouka') || lowerMessage.includes('find') || lowerMessage.includes('finding') || lowerMessage.includes('found') || lowerMessage.includes('search') || lowerMessage.includes('searching') || lowerMessage.includes('searched') || lowerMessage.includes('looking') || lowerMessage.includes('look') || lowerMessage.includes('need') || lowerMessage.includes('needed') || lowerMessage.includes('needing') || lowerMessage.includes('want') || lowerMessage.includes('wanted') || lowerMessage.includes('wanting') || lowerMessage.includes('ढूंढ') || lowerMessage.includes('dhundh') || lowerMessage.includes('dhund') || lowerMessage.includes('खोज') || lowerMessage.includes('khoj') || lowerMessage.includes('तलाश') || lowerMessage.includes('talash') || lowerMessage.includes('talaash') || lowerMessage.includes('चाहिए') || lowerMessage.includes('chahiye') || lowerMessage.includes('chahie') || lowerMessage.includes('चाहता') || lowerMessage.includes('chahta') || lowerMessage.includes('चाहती') || lowerMessage.includes('chahti')) {
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
          
          // IMPORTANT: Check grievance FIRST before payslip to avoid false positives
          // Grievance detection - extensive keywords (including Roman Hindi)
          if (lowerMessage.includes('grievance') || lowerMessage.includes('complaint') || lowerMessage.includes('complain') || lowerMessage.includes('problem') || lowerMessage.includes('issue') || lowerMessage.includes('dispute') || lowerMessage.includes('conflict') || lowerMessage.includes('harassment') || lowerMessage.includes('unfair') || lowerMessage.includes('injustice') || lowerMessage.includes('wrong') || lowerMessage.includes('abuse') || lowerMessage.includes('exploitation') || lowerMessage.includes('शिकायत') || lowerMessage.includes('shikayat') || lowerMessage.includes('shikaayat') || lowerMessage.includes('समस्या') || lowerMessage.includes('samasya') || lowerMessage.includes('परेशानी') || lowerMessage.includes('pareshani') || lowerMessage.includes('दिक्कत') || lowerMessage.includes('dikkat') || lowerMessage.includes('मुद्दा') || lowerMessage.includes('mudda') || lowerMessage.includes('गड़बड़') || lowerMessage.includes('gadbad') || lowerMessage.includes('विवाद') || lowerMessage.includes('vivad') || lowerMessage.includes('झगड़ा') || lowerMessage.includes('jhagda') || lowerMessage.includes('उत्पीड़न') || lowerMessage.includes('utpidan') || lowerMessage.includes('अन्याय') || lowerMessage.includes('anyay') || lowerMessage.includes('गलत') || lowerMessage.includes('galat') || lowerMessage.includes('शोषण') || lowerMessage.includes('shoshan') || lowerMessage.includes('धोखा') || lowerMessage.includes('dhokha') || lowerMessage.includes('ठगी') || lowerMessage.includes('thagi') || lowerMessage.includes('अत्याचार') || lowerMessage.includes('atyachar') || lowerMessage.includes('दुर्व्यवहार') || lowerMessage.includes('durvyavahar') || lowerMessage.includes('मारपीट') || lowerMessage.includes('marpeet') || lowerMessage.includes('गाली') || lowerMessage.includes('gali') || lowerMessage.includes('gaali') || lowerMessage.includes('अपमान') || lowerMessage.includes('apman') || lowerMessage.includes('भेदभाव') || lowerMessage.includes('bhedbhav') || lowerMessage.includes('discrimination') || lowerMessage.includes('violence') || lowerMessage.includes('threat') || lowerMessage.includes('unsafe') || lowerMessage.includes('danger') || lowerMessage.includes('खतरा') || lowerMessage.includes('khatra') || lowerMessage.includes('असुरक्षित') || lowerMessage.includes('asurakshit') || lowerMessage.includes('धमकी') || lowerMessage.includes('dhamki') || lowerMessage.includes('darj') || lowerMessage.includes('दर्ज') || lowerMessage.includes('karni') || lowerMessage.includes('करनी') || lowerMessage.includes('write') || lowerMessage.includes('likho') || lowerMessage.includes('लिखो') || lowerMessage.includes('file') || lowerMessage.includes('submit')) {
            console.log('✅ Detected grievance intent');
            suggestedActions.push({ label: '📝 Go to Grievance Form', path: 'grievance' });
          }
          // Payslip detection - extensive keywords in English, Hindi, and Hinglish (all tenses)
          // Only trigger if NOT a grievance (to avoid "underpayment" triggering payslip)
          else if (lowerMessage.includes('payslip') || lowerMessage.includes('pay slip') || lowerMessage.includes('salary') || lowerMessage.includes('salaries') || lowerMessage.includes('wage') || lowerMessage.includes('wages') || lowerMessage.includes('pay') || lowerMessage.includes('paid') || lowerMessage.includes('paying') || lowerMessage.includes('payment') || lowerMessage.includes('payments') || lowerMessage.includes('earning') || lowerMessage.includes('earnings') || lowerMessage.includes('earned') || lowerMessage.includes('income') || lowerMessage.includes('वेतन') || lowerMessage.includes('vetan') || lowerMessage.includes('wetan') || lowerMessage.includes('तनख्वाह') || lowerMessage.includes('tankhwah') || lowerMessage.includes('tankhwa') || lowerMessage.includes('tankhuah') || lowerMessage.includes('पगार') || lowerMessage.includes('pagaar') || lowerMessage.includes('pagar') || lowerMessage.includes('मजदूरी') || lowerMessage.includes('majduri') || lowerMessage.includes('mazdoori') || lowerMessage.includes('majdoori') || lowerMessage.includes('वेतनपत्र') || lowerMessage.includes('vetan patra') || lowerMessage.includes('पेस्लिप') || lowerMessage.includes('payslip') || lowerMessage.includes('peslip') || lowerMessage.includes('आय') || lowerMessage.includes('aay') || lowerMessage.includes('aaye') || lowerMessage.includes('कमाई') || lowerMessage.includes('kamai') || lowerMessage.includes('kamaayi') || lowerMessage.includes('kamayi') || lowerMessage.includes('भुगतान') || lowerMessage.includes('bhugtan') || lowerMessage.includes('bhugatan') || lowerMessage.includes('पैसा') || lowerMessage.includes('paisa') || lowerMessage.includes('paise') || lowerMessage.includes('पैसे') || lowerMessage.includes('रुपया') || lowerMessage.includes('rupaya') || lowerMessage.includes('rupya') || lowerMessage.includes('रुपये') || lowerMessage.includes('rupaye') || lowerMessage.includes('rupye') || lowerMessage.includes('पारिश्रमिक') || lowerMessage.includes('parishramik') || lowerMessage.includes('दैनिक') || lowerMessage.includes('dainik') || lowerMessage.includes('daily') || lowerMessage.includes('मासिक') || lowerMessage.includes('masik') || lowerMessage.includes('maasik') || lowerMessage.includes('monthly') || lowerMessage.includes('साप्ताहिक') || lowerMessage.includes('saptahik') || lowerMessage.includes('weekly') || lowerMessage.includes('daily wage') || lowerMessage.includes('monthly salary') || lowerMessage.includes('weekly pay') || lowerMessage.includes('overtime') || lowerMessage.includes('over time') || lowerMessage.includes('deduction') || lowerMessage.includes('deductions') || lowerMessage.includes('deducted') || lowerMessage.includes('कटौती') || lowerMessage.includes('katauti') || lowerMessage.includes('katoti') || lowerMessage.includes('ओवरटाइम') || lowerMessage.includes('overtime') || lowerMessage.includes('extra time') || lowerMessage.includes('check') || lowerMessage.includes('checking') || lowerMessage.includes('checked') || lowerMessage.includes('verify') || lowerMessage.includes('verifying') || lowerMessage.includes('verified') || lowerMessage.includes('audit') || lowerMessage.includes('auditing') || lowerMessage.includes('audited') || lowerMessage.includes('जांच') || lowerMessage.includes('jaanch') || lowerMessage.includes('janch') || lowerMessage.includes('देखना') || lowerMessage.includes('dekhna') || lowerMessage.includes('dekho')) {
            suggestedActions.push({ label: '💰 Go to Payslip Auditor', path: 'payslip' });
          }
          // Attendance detection - extensive keywords in English, Hindi, and Hinglish (all tenses)
          if (lowerMessage.includes('attendance') || lowerMessage.includes('attend') || lowerMessage.includes('attended') || lowerMessage.includes('attending') || lowerMessage.includes('present') || lowerMessage.includes('presence') || lowerMessage.includes('absent') || lowerMessage.includes('absence') || lowerMessage.includes('mark') || lowerMessage.includes('marked') || lowerMessage.includes('marking') || lowerMessage.includes('check-in') || lowerMessage.includes('check in') || lowerMessage.includes('checkin') || lowerMessage.includes('checked in') || lowerMessage.includes('checking in') || lowerMessage.includes('punch') || lowerMessage.includes('punched') || lowerMessage.includes('punching') || lowerMessage.includes('register') || lowerMessage.includes('registered') || lowerMessage.includes('registering') || lowerMessage.includes('हाजिरी') || lowerMessage.includes('hajiri') || lowerMessage.includes('haajiri') || lowerMessage.includes('haziri') || lowerMessage.includes('उपस्थिति') || lowerMessage.includes('upasthiti') || lowerMessage.includes('upasthit') || lowerMessage.includes('हाज़िरी') || lowerMessage.includes('hazri') || lowerMessage.includes('उपस्थित') || lowerMessage.includes('upasthit') || lowerMessage.includes('upsthit') || lowerMessage.includes('अनुपस्थित') || lowerMessage.includes('anupasthit') || lowerMessage.includes('anupsthit') || lowerMessage.includes('गैरहाजिर') || lowerMessage.includes('gairhajir') || lowerMessage.includes('gair hajir') || lowerMessage.includes('मार्क') || lowerMessage.includes('mark') || lowerMessage.includes('चेक-इन') || lowerMessage.includes('check in') || lowerMessage.includes('checkin') || lowerMessage.includes('पंच') || lowerMessage.includes('punch') || lowerMessage.includes('रजिस्टर') || lowerMessage.includes('register') || lowerMessage.includes('दर्ज') || lowerMessage.includes('darj') || lowerMessage.includes('darz') || lowerMessage.includes('हाजरी') || lowerMessage.includes('hajri') || lowerMessage.includes('haazri') || lowerMessage.includes('मौजूद') || lowerMessage.includes('maujud') || lowerMessage.includes('mojud') || lowerMessage.includes('मौजूदगी') || lowerMessage.includes('maujudgi') || lowerMessage.includes('गैरहाजिर') || lowerMessage.includes('gair haazir') || lowerMessage.includes('totp') || lowerMessage.includes('code') || lowerMessage.includes('otp')) {
            suggestedActions.push({ label: '✅ Go to Attendance', path: 'attendance' });
          }
          // Ledger/Payment detection - extensive keywords in English, Hindi, and Hinglish (all tenses)
          if (lowerMessage.includes('payment') || lowerMessage.includes('payments') || lowerMessage.includes('paid') || lowerMessage.includes('paying') || lowerMessage.includes('ledger') || lowerMessage.includes('khata') || lowerMessage.includes('khaata') || lowerMessage.includes('account') || lowerMessage.includes('accounts') || lowerMessage.includes('accounting') || lowerMessage.includes('transaction') || lowerMessage.includes('transactions') || lowerMessage.includes('transact') || lowerMessage.includes('record') || lowerMessage.includes('records') || lowerMessage.includes('recorded') || lowerMessage.includes('recording') || lowerMessage.includes('history') || lowerMessage.includes('balance') || lowerMessage.includes('balances') || lowerMessage.includes('due') || lowerMessage.includes('dues') || lowerMessage.includes('pending') || lowerMessage.includes('खाता') || lowerMessage.includes('khata') || lowerMessage.includes('khaata') || lowerMessage.includes('भुगतान') || lowerMessage.includes('bhugtan') || lowerMessage.includes('bhugatan') || lowerMessage.includes('लेजर') || lowerMessage.includes('ledger') || lowerMessage.includes('लेखा') || lowerMessage.includes('lekha') || lowerMessage.includes('lekhaa') || lowerMessage.includes('हिसाब') || lowerMessage.includes('hisab') || lowerMessage.includes('hisaab') || lowerMessage.includes('किताब') || lowerMessage.includes('kitab') || lowerMessage.includes('kitaab') || lowerMessage.includes('बही') || lowerMessage.includes('bahi') || lowerMessage.includes('bahee') || lowerMessage.includes('लेन-देन') || lowerMessage.includes('len den') || lowerMessage.includes('lenden') || lowerMessage.includes('लेनदेन') || lowerMessage.includes('lendan') || lowerMessage.includes('रिकॉर्ड') || lowerMessage.includes('record') || lowerMessage.includes('रेकॉर्ड') || lowerMessage.includes('इतिहास') || lowerMessage.includes('itihas') || lowerMessage.includes('itihass') || lowerMessage.includes('बैलेंस') || lowerMessage.includes('balance') || lowerMessage.includes('शेष') || lowerMessage.includes('shesh') || lowerMessage.includes('बकाया') || lowerMessage.includes('bakaya') || lowerMessage.includes('bakaaya') || lowerMessage.includes('बाकी') || lowerMessage.includes('baki') || lowerMessage.includes('baaki') || lowerMessage.includes('देय') || lowerMessage.includes('dey') || lowerMessage.includes('deya') || lowerMessage.includes('e-khata') || lowerMessage.includes('ekhata') || lowerMessage.includes('ई-खाता') || lowerMessage.includes('e khata') || lowerMessage.includes('digital ledger') || lowerMessage.includes('digital') || lowerMessage.includes('डिजिटल') || lowerMessage.includes('digital') || lowerMessage.includes('money') || lowerMessage.includes('cash') || lowerMessage.includes('नकद') || lowerMessage.includes('nakad') || lowerMessage.includes('नकदी') || lowerMessage.includes('nakdi') || lowerMessage.includes('nakadi') || lowerMessage.includes('रकम') || lowerMessage.includes('rakam') || lowerMessage.includes('रक़म') || lowerMessage.includes('track') || lowerMessage.includes('tracking') || lowerMessage.includes('tracked') || lowerMessage.includes('ट्रैक') || lowerMessage.includes('track')) {
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
      console.log('🎯 Agentic mode enabled?', agenticMode);
      console.log('🎯 Number of suggested actions:', suggestedActions.length);
      console.log('🎯 onTabChange available?', !!onTabChange);
      setMessages(prev => [...prev, assistantMessage]);
      
      // AGENTIC MODE: Auto-execute first action if enabled
      if (agenticMode && suggestedActions.length > 0) {
        const firstAction = suggestedActions[0];
        console.log('🤖 Agentic mode: Auto-executing action:', firstAction);
        console.log('🤖 Action path:', firstAction.path);
        console.log('🤖 Action label:', firstAction.label);
        
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
          console.log('🔄 Calling onTabChange function...');
          setTimeout(() => {
            console.log('🔄 Executing onTabChange NOW');
            onTabChange(firstAction.path);
          }, 500); // Reduced to 0.5 seconds
        } else {
          console.error('❌ Cannot auto-switch: onTabChange=' + !!onTabChange + ', path=' + firstAction.path);
        }
        
        // Voice narration using AWS Polly (if available)
        if (voiceMode) {
          speakText(response);
        }
      } else {
        console.log('⚠️ Agentic mode not executing:', {
          agenticMode,
          actionsLength: suggestedActions.length
        });
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
          <h2>
            <img 
              src="/images/chatbot-avatar.png" 
              alt="AI"
              style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '50%', verticalAlign: 'middle', marginRight: '10px'}}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            ShramSetu AI Assistant
          </h2>
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
                        onClick={() => {
                          console.log('🔘 Action button clicked:', action);
                          console.log('🔘 onTabChange available?', !!onTabChange);
                          console.log('🔘 action.path:', action.path);
                          
                          // Store filters if provided
                          if (action.filters) {
                            sessionStorage.setItem('job_search_filters', JSON.stringify(action.filters));
                            console.log('💾 Stored filters:', action.filters);
                          }
                          // Navigate to tab using parent callback if available
                          if (onTabChange && action.path) {
                            console.log('🔄 Calling onTabChange with:', action.path);
                            onTabChange(action.path);
                          } else if (action.path) {
                            console.warn('⚠️ onTabChange not available, using fallback');
                            // Fallback: store the tab to switch to and reload
                            sessionStorage.setItem('switch_to_tab', action.path);
                            window.location.reload();
                          } else {
                            console.error('❌ No action.path provided');
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
              <div className="message__avatar">
                <img 
                  src="/images/chatbot-avatar.png" 
                  alt="AI Assistant"
                  style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '🤖';
                  }}
                />
              </div>
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
          
          {/* Invisible element for auto-scroll */}
          <div ref={messagesEndRef} />
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