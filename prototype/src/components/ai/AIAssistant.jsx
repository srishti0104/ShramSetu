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

export default function AIAssistant({ onTabChange, contextPage, contextPrompt, onSpeakingChange, onStopSpeakingCallback }) {
  console.log('🤖 AIAssistant rendering, onTabChange:', typeof onTabChange);
  console.log('📍 Context page:', contextPage);
  
  // Set initial message based on context
  const getInitialMessage = () => {
    if (contextPrompt) {
      return `नमस्ते! ${contextPrompt}`;
    }
    return 'नमस्ते! मैं श्रम सेतु AI असिस्टेंट हूं। मैं आपकी नौकरी की सलाह, पेस्लिप विश्लेषण, शिकायतों और मजदूर अधिकारों में मदद कर सकता हूं।\n\nHello! I am ShramSetu AI Assistant. I can help you with job advice, payslip analysis, grievances, and worker rights. How can I assist you today?';
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
        content: '💡 त्वरित सुझाव: बस बताएं कि आपको क्या चाहिए!\n💡 Quick tip: Just say what you need!\n\n• "मिस्त्री की नौकरी" / "mason job" - मैं निर्माण की नौकरियां ढूंढूंगा\n• "वेतन की समस्या" / "salary problem" - मैं आपकी पेस्लिप चेक करूंगा\n• "शिकायत" / "complaint" - मैं शिकायत लिखने में मदद करूंगा',
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
  const [voiceProcessing, setVoiceProcessing] = useState(false); // Prevent duplicate voice processing
  
  // Ref for chat messages container to enable auto-scroll
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
    sessionStorage.setItem('ai_chat_history', JSON.stringify(messages));
  }, [messages]);
  
  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [messages, isLoading]);

  // Cleanup speech synthesis when component unmounts or voice mode changes
  useEffect(() => {
    return () => {
      // Cleanup function to stop any ongoing speech
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
    // Reset voice processing when voice mode changes
    if (!voiceMode) {
      setVoiceProcessing(false);
    }
  }, [voiceMode]);

  // Helper function to extract job details from message
  const extractJobDetails = (message) => {
    const lowerMessage = message.toLowerCase();
    const details = {};
    
    // COMPREHENSIVE JOB KEYWORD MAPPING - All job categories with extensive synonyms
    // Maps to ALL available categories for complete automation
    const jobTypes = {
      // PAINTING - all variations (CHECK FIRST to avoid "paint" matching before "painting")
      'painting': { category: 'painting', skill: 'Painter' },
      'paintings': { category: 'painting', skill: 'Painter' },
      'painter': { category: 'painting', skill: 'Painter' },
      'painters': { category: 'painting', skill: 'Painter' },
      'पेंटिंग': { category: 'painting', skill: 'Painter' },
      'पेंटर': { category: 'painting', skill: 'Painter' },
      'पेंटिंग वाला': { category: 'painting', skill: 'Painter' },
      'रंगाई': { category: 'painting', skill: 'Painter' },
      'रंगाई पुताई': { category: 'painting', skill: 'Painter' },
      'whitewash': { category: 'painting', skill: 'Painter' },
      'white wash': { category: 'painting', skill: 'Painter' },
      'सफेदी': { category: 'painting', skill: 'Painter' },
      'चूना': { category: 'painting', skill: 'Painter' },
      'painted': { category: 'painting', skill: 'Painter' },
      'paints': { category: 'painting', skill: 'Painter' },
      'paint': { category: 'painting', skill: 'Painter' },
      'रंगना': { category: 'painting', skill: 'Painter' },
      'रंग': { category: 'painting', skill: 'Painter' },
      'रंग रोगन': { category: 'painting', skill: 'Painter' },
      'wall painting': { category: 'painting', skill: 'Painter' },
      'wall painter': { category: 'painting', skill: 'Painter' },
      'walls': { category: 'painting', skill: 'Painter' },
      'wall': { category: 'painting', skill: 'Painter' },
      'दीवार': { category: 'painting', skill: 'Painter' },
      'दीवार रंगना': { category: 'painting', skill: 'Painter' },
      'color': { category: 'painting', skill: 'Painter' },
      'colour': { category: 'painting', skill: 'Painter' },
      'colors': { category: 'painting', skill: 'Painter' },
      'colours': { category: 'painting', skill: 'Painter' },
      'decorator': { category: 'painting', skill: 'Painter' },
      'decoration': { category: 'painting', skill: 'Painter' },
      'सजावट': { category: 'painting', skill: 'Painter' },
      'interior': { category: 'painting', skill: 'Painter' },
      'exterior': { category: 'painting', skill: 'Painter' },
      'house painting': { category: 'painting', skill: 'Painter' },
      'home painting': { category: 'painting', skill: 'Painter' },
      'घर रंगना': { category: 'painting', skill: 'Painter' },
      'brush': { category: 'painting', skill: 'Painter' },
      'ब्रश': { category: 'painting', skill: 'Painter' },
      'roller': { category: 'painting', skill: 'Painter' },
      'रोलर': { category: 'painting', skill: 'Painter' },
      
      // CONSTRUCTION - all variations
      'construction': { category: 'construction', skill: 'Construction' },
      'constructing': { category: 'construction', skill: 'Construction' },
      'construct': { category: 'construction', skill: 'Construction' },
      'construction work': { category: 'construction', skill: 'Construction' },
      'construction worker': { category: 'construction', skill: 'Construction' },
      'राजमिस्त्री': { category: 'construction', skill: 'Mason' },
      'राज मिस्त्री': { category: 'construction', skill: 'Mason' },
      'मिस्त्री': { category: 'construction', skill: 'Mason' },
      'मिस्री': { category: 'construction', skill: 'Mason' },
      'मिस्तरी': { category: 'construction', skill: 'Mason' },
      'masonry': { category: 'construction', skill: 'Mason' },
      'masonry work': { category: 'construction', skill: 'Mason' },
      'masons': { category: 'construction', skill: 'Mason' },
      'mason': { category: 'construction', skill: 'Mason' },
      'निर्माण': { category: 'construction', skill: 'Construction' },
      'निर्माण कार्य': { category: 'construction', skill: 'Construction' },
      'builders': { category: 'construction', skill: 'Builder' },
      'builder': { category: 'construction', skill: 'Builder' },
      'building': { category: 'construction', skill: 'Builder' },
      'building work': { category: 'construction', skill: 'Builder' },
      'build': { category: 'construction', skill: 'Builder' },
      'बिल्डर': { category: 'construction', skill: 'Builder' },
      'बिल्डिंग': { category: 'construction', skill: 'Builder' },
      'cement': { category: 'construction', skill: 'Mason' },
      'cement work': { category: 'construction', skill: 'Mason' },
      'सीमेंट': { category: 'construction', skill: 'Mason' },
      'सीमेंट का काम': { category: 'construction', skill: 'Mason' },
      'ईंट': { category: 'construction', skill: 'Mason' },
      'ईंट का काम': { category: 'construction', skill: 'Mason' },
      'brick': { category: 'construction', skill: 'Mason' },
      'bricks': { category: 'construction', skill: 'Mason' },
      'brick work': { category: 'construction', skill: 'Mason' },
      'brick laying': { category: 'construction', skill: 'Mason' },
      'bricklaying': { category: 'construction', skill: 'Mason' },
      'labor': { category: 'construction', skill: 'Construction' },
      'labour': { category: 'construction', skill: 'Construction' },
      'मजदूर': { category: 'construction', skill: 'Construction' },
      'मजदूरी': { category: 'construction', skill: 'Construction' },
      'site work': { category: 'construction', skill: 'Construction' },
      'साइट': { category: 'construction', skill: 'Construction' },
      'साइट का काम': { category: 'construction', skill: 'Construction' },
      'concrete': { category: 'construction', skill: 'Mason' },
      'कंक्रीट': { category: 'construction', skill: 'Mason' },
      'plastering': { category: 'construction', skill: 'Mason' },
      'plaster': { category: 'construction', skill: 'Mason' },
      'प्लास्टर': { category: 'construction', skill: 'Mason' },
      'पुताई': { category: 'construction', skill: 'Mason' },
      'flooring': { category: 'construction', skill: 'Mason' },
      'फर्श': { category: 'construction', skill: 'Mason' },
      'tiles': { category: 'construction', skill: 'Mason' },
      'टाइल्स': { category: 'construction', skill: 'Mason' },
      'civil work': { category: 'construction', skill: 'Construction' },
      'civil': { category: 'construction', skill: 'Construction' },
      
      // PLUMBING - all variations
      'plumbing': { category: 'plumbing', skill: 'Plumber' },
      'plumbing work': { category: 'plumbing', skill: 'Plumber' },
      'plumbers': { category: 'plumbing', skill: 'Plumber' },
      'plumber': { category: 'plumbing', skill: 'Plumber' },
      'plumb': { category: 'plumbing', skill: 'Plumber' },
      'प्लंबर': { category: 'plumbing', skill: 'Plumber' },
      'प्लम्बर': { category: 'plumbing', skill: 'Plumber' },
      'प्लंबिंग': { category: 'plumbing', skill: 'Plumber' },
      'नल मिस्त्री': { category: 'plumbing', skill: 'Plumber' },
      'नल मिस्री': { category: 'plumbing', skill: 'Plumber' },
      'पाइप मिस्त्री': { category: 'plumbing', skill: 'Plumber' },
      'drainage': { category: 'plumbing', skill: 'Plumber' },
      'drainage work': { category: 'plumbing', skill: 'Plumber' },
      'pipes': { category: 'plumbing', skill: 'Plumber' },
      'pipe': { category: 'plumbing', skill: 'Plumber' },
      'pipe work': { category: 'plumbing', skill: 'Plumber' },
      'pipe fitting': { category: 'plumbing', skill: 'Plumber' },
      'पाइप': { category: 'plumbing', skill: 'Plumber' },
      'पाइप का काम': { category: 'plumbing', skill: 'Plumber' },
      'water': { category: 'plumbing', skill: 'Plumber' },
      'water supply': { category: 'plumbing', skill: 'Plumber' },
      'पानी': { category: 'plumbing', skill: 'Plumber' },
      'पानी का काम': { category: 'plumbing', skill: 'Plumber' },
      'नाली': { category: 'plumbing', skill: 'Plumber' },
      'नाली का काम': { category: 'plumbing', skill: 'Plumber' },
      'tap': { category: 'plumbing', skill: 'Plumber' },
      'taps': { category: 'plumbing', skill: 'Plumber' },
      'tap fitting': { category: 'plumbing', skill: 'Plumber' },
      'leak': { category: 'plumbing', skill: 'Plumber' },
      'leakage': { category: 'plumbing', skill: 'Plumber' },
      'लीकेज': { category: 'plumbing', skill: 'Plumber' },
      'नल': { category: 'plumbing', skill: 'Plumber' },
      'नल लगाना': { category: 'plumbing', skill: 'Plumber' },
      'bathroom': { category: 'plumbing', skill: 'Plumber' },
      'बाथरूम': { category: 'plumbing', skill: 'Plumber' },
      'toilet': { category: 'plumbing', skill: 'Plumber' },
      'टॉयलेट': { category: 'plumbing', skill: 'Plumber' },
      'sanitary': { category: 'plumbing', skill: 'Plumber' },
      'सैनिटरी': { category: 'plumbing', skill: 'Plumber' },
      'washbasin': { category: 'plumbing', skill: 'Plumber' },
      'basin': { category: 'plumbing', skill: 'Plumber' },
      'बेसिन': { category: 'plumbing', skill: 'Plumber' },
      'geyser': { category: 'plumbing', skill: 'Plumber' },
      'गीजर': { category: 'plumbing', skill: 'Plumber' },
      'tank': { category: 'plumbing', skill: 'Plumber' },
      'टंकी': { category: 'plumbing', skill: 'Plumber' },
      
      // ELECTRICAL - all variations
      'बिजली मिस्त्री': { category: 'electrical', skill: 'Electrician' },
      'बिजली मिस्री': { category: 'electrical', skill: 'Electrician' },
      'इलेक्ट्रीशियन': { category: 'electrical', skill: 'Electrician' },
      'इलेक्ट्रिशियन': { category: 'electrical', skill: 'Electrician' },
      'electricians': { category: 'electrical', skill: 'Electrician' },
      'electrician': { category: 'electrical', skill: 'Electrician' },
      'electrical': { category: 'electrical', skill: 'Electrician' },
      'electrical work': { category: 'electrical', skill: 'Electrician' },
      'electricity': { category: 'electrical', skill: 'Electrician' },
      'electric': { category: 'electrical', skill: 'Electrician' },
      'electric work': { category: 'electrical', skill: 'Electrician' },
      'wiring': { category: 'electrical', skill: 'Electrician' },
      'wiring work': { category: 'electrical', skill: 'Electrician' },
      'house wiring': { category: 'electrical', skill: 'Electrician' },
      'बिजली': { category: 'electrical', skill: 'Electrician' },
      'बिजली का काम': { category: 'electrical', skill: 'Electrician' },
      'वायरिंग': { category: 'electrical', skill: 'Electrician' },
      'तारों का काम': { category: 'electrical', skill: 'Electrician' },
      'lights': { category: 'electrical', skill: 'Electrician' },
      'light': { category: 'electrical', skill: 'Electrician' },
      'light fitting': { category: 'electrical', skill: 'Electrician' },
      'बत्ती': { category: 'electrical', skill: 'Electrician' },
      'लाइट': { category: 'electrical', skill: 'Electrician' },
      'लाइट लगाना': { category: 'electrical', skill: 'Electrician' },
      'switch': { category: 'electrical', skill: 'Electrician' },
      'switches': { category: 'electrical', skill: 'Electrician' },
      'स्विच': { category: 'electrical', skill: 'Electrician' },
      'स्विच बोर्ड': { category: 'electrical', skill: 'Electrician' },
      'wire': { category: 'electrical', skill: 'Electrician' },
      'wires': { category: 'electrical', skill: 'Electrician' },
      'तार': { category: 'electrical', skill: 'Electrician' },
      'तारें': { category: 'electrical', skill: 'Electrician' },
      'fan': { category: 'electrical', skill: 'Electrician' },
      'fans': { category: 'electrical', skill: 'Electrician' },
      'fan fitting': { category: 'electrical', skill: 'Electrician' },
      'पंखा': { category: 'electrical', skill: 'Electrician' },
      'पंखा लगाना': { category: 'electrical', skill: 'Electrician' },
      'socket': { category: 'electrical', skill: 'Electrician' },
      'sockets': { category: 'electrical', skill: 'Electrician' },
      'सॉकेट': { category: 'electrical', skill: 'Electrician' },
      'plug': { category: 'electrical', skill: 'Electrician' },
      'प्लग': { category: 'electrical', skill: 'Electrician' },
      'meter': { category: 'electrical', skill: 'Electrician' },
      'मीटर': { category: 'electrical', skill: 'Electrician' },
      'board': { category: 'electrical', skill: 'Electrician' },
      'बोर्ड': { category: 'electrical', skill: 'Electrician' },
      'mcb': { category: 'electrical', skill: 'Electrician' },
      'एमसीबी': { category: 'electrical', skill: 'Electrician' },
      'inverter': { category: 'electrical', skill: 'Electrician' },
      'इन्वर्टर': { category: 'electrical', skill: 'Electrician' },
      'ups': { category: 'electrical', skill: 'Electrician' },
      'यूपीएस': { category: 'electrical', skill: 'Electrician' },
      
      // CARPENTRY - all variations
      'carpenters': { category: 'carpentry', skill: 'Carpenter' },
      'carpenter': { category: 'carpentry', skill: 'Carpenter' },
      'carpentry': { category: 'carpentry', skill: 'Carpenter' },
      'carpentry work': { category: 'carpentry', skill: 'Carpenter' },
      'बढ़ई': { category: 'carpentry', skill: 'Carpenter' },
      'बढ़ईगिरी': { category: 'carpentry', skill: 'Carpenter' },
      'बढ़ई का काम': { category: 'carpentry', skill: 'Carpenter' },
      'furniture': { category: 'carpentry', skill: 'Carpenter' },
      'furniture work': { category: 'carpentry', skill: 'Carpenter' },
      'furniture making': { category: 'carpentry', skill: 'Carpenter' },
      'फर्नीचर': { category: 'carpentry', skill: 'Carpenter' },
      'फर्नीचर बनाना': { category: 'carpentry', skill: 'Carpenter' },
      'woodwork': { category: 'carpentry', skill: 'Carpenter' },
      'wood work': { category: 'carpentry', skill: 'Carpenter' },
      'wooden': { category: 'carpentry', skill: 'Carpenter' },
      'wooden work': { category: 'carpentry', skill: 'Carpenter' },
      'लकड़ी': { category: 'carpentry', skill: 'Carpenter' },
      'लकड़ी का काम': { category: 'carpentry', skill: 'Carpenter' },
      'दरवाजा': { category: 'carpentry', skill: 'Carpenter' },
      'दरवाजे': { category: 'carpentry', skill: 'Carpenter' },
      'दरवाजा बनाना': { category: 'carpentry', skill: 'Carpenter' },
      'अलमारी': { category: 'carpentry', skill: 'Carpenter' },
      'अलमारी बनाना': { category: 'carpentry', skill: 'Carpenter' },
      'खिड़की': { category: 'carpentry', skill: 'Carpenter' },
      'खिड़कियां': { category: 'carpentry', skill: 'Carpenter' },
      'cabinet': { category: 'carpentry', skill: 'Carpenter' },
      'cabinets': { category: 'carpentry', skill: 'Carpenter' },
      'cabinet making': { category: 'carpentry', skill: 'Carpenter' },
      'कैबिनेट': { category: 'carpentry', skill: 'Carpenter' },
      'window': { category: 'carpentry', skill: 'Carpenter' },
      'windows': { category: 'carpentry', skill: 'Carpenter' },
      'window frame': { category: 'carpentry', skill: 'Carpenter' },
      'doors': { category: 'carpentry', skill: 'Carpenter' },
      'door': { category: 'carpentry', skill: 'Carpenter' },
      'door frame': { category: 'carpentry', skill: 'Carpenter' },
      'wood': { category: 'carpentry', skill: 'Carpenter' },
      'wooden furniture': { category: 'carpentry', skill: 'Carpenter' },
      'table': { category: 'carpentry', skill: 'Carpenter' },
      'tables': { category: 'carpentry', skill: 'Carpenter' },
      'मेज': { category: 'carpentry', skill: 'Carpenter' },
      'chair': { category: 'carpentry', skill: 'Carpenter' },
      'chairs': { category: 'carpentry', skill: 'Carpenter' },
      'कुर्सी': { category: 'carpentry', skill: 'Carpenter' },
      'bed': { category: 'carpentry', skill: 'Carpenter' },
      'beds': { category: 'carpentry', skill: 'Carpenter' },
      'बिस्तर': { category: 'carpentry', skill: 'Carpenter' },
      'पलंग': { category: 'carpentry', skill: 'Carpenter' },
      'shelf': { category: 'carpentry', skill: 'Carpenter' },
      'shelves': { category: 'carpentry', skill: 'Carpenter' },
      'शेल्फ': { category: 'carpentry', skill: 'Carpenter' },
      'रैक': { category: 'carpentry', skill: 'Carpenter' },
      'wardrobe': { category: 'carpentry', skill: 'Carpenter' },
      'वार्डरोब': { category: 'carpentry', skill: 'Carpenter' },
      'kitchen': { category: 'carpentry', skill: 'Carpenter' },
      'kitchen cabinet': { category: 'carpentry', skill: 'Carpenter' },
      'रसोई': { category: 'carpentry', skill: 'Carpenter' },
      'modular': { category: 'carpentry', skill: 'Carpenter' },
      'मॉड्यूलर': { category: 'carpentry', skill: 'Carpenter' },
      
      // WELDING - all variations
      'welding': { category: 'welding', skill: 'Welder' },
      'welder': { category: 'welding', skill: 'Welder' },
      'welders': { category: 'welding', skill: 'Welder' },
      'weld': { category: 'welding', skill: 'Welder' },
      'welded': { category: 'welding', skill: 'Welder' },
      'वेल्डिंग': { category: 'welding', skill: 'Welder' },
      'वेल्डर': { category: 'welding', skill: 'Welder' },
      'वेल्डिंग वाला': { category: 'welding', skill: 'Welder' },
      'जोड़ना': { category: 'welding', skill: 'Welder' },
      'जोड़ाई': { category: 'welding', skill: 'Welder' },
      'धातु जोड़ना': { category: 'welding', skill: 'Welder' },
      'arc welding': { category: 'welding', skill: 'Welder' },
      'gas welding': { category: 'welding', skill: 'Welder' },
      'tig welding': { category: 'welding', skill: 'Welder' },
      'mig welding': { category: 'welding', skill: 'Welder' },
      'आर्क वेल्डिंग': { category: 'welding', skill: 'Welder' },
      'गैस वेल्डिंग': { category: 'welding', skill: 'Welder' },
      'metal': { category: 'welding', skill: 'Welder' },
      'metals': { category: 'welding', skill: 'Welder' },
      'धातु': { category: 'welding', skill: 'Welder' },
      'लोहा': { category: 'welding', skill: 'Welder' },
      'स्टील': { category: 'welding', skill: 'Welder' },
      'steel': { category: 'welding', skill: 'Welder' },
      'iron': { category: 'welding', skill: 'Welder' },
      'fabrication': { category: 'welding', skill: 'Welder' },
      'फैब्रिकेशन': { category: 'welding', skill: 'Welder' },
      'cutting': { category: 'welding', skill: 'Welder' },
      'कटिंग': { category: 'welding', skill: 'Welder' },
      'torch': { category: 'welding', skill: 'Welder' },
      'टॉर्च': { category: 'welding', skill: 'Welder' },
      
      // DELIVERY - all variations
      'delivery': { category: 'delivery', skill: 'Delivery' },
      'delivery boy': { category: 'delivery', skill: 'Delivery' },
      'delivery man': { category: 'delivery', skill: 'Delivery' },
      'delivery person': { category: 'delivery', skill: 'Delivery' },
      'डिलीवरी': { category: 'delivery', skill: 'Delivery' },
      'डिलीवरी बॉय': { category: 'delivery', skill: 'Delivery' },
      'डिलीवरी वाला': { category: 'delivery', skill: 'Delivery' },
      'सप्लाई': { category: 'delivery', skill: 'Delivery' },
      'supply': { category: 'delivery', skill: 'Delivery' },
      'courier': { category: 'delivery', skill: 'Delivery' },
      'कूरियर': { category: 'delivery', skill: 'Delivery' },
      'bike': { category: 'delivery', skill: 'Delivery' },
      'बाइक': { category: 'delivery', skill: 'Delivery' },
      'motorcycle': { category: 'delivery', skill: 'Delivery' },
      'मोटरसाइकिल': { category: 'delivery', skill: 'Delivery' },
      'scooter': { category: 'delivery', skill: 'Delivery' },
      'स्कूटर': { category: 'delivery', skill: 'Delivery' },
      'food delivery': { category: 'delivery', skill: 'Delivery' },
      'खाना डिलीवरी': { category: 'delivery', skill: 'Delivery' },
      'package': { category: 'delivery', skill: 'Delivery' },
      'पैकेज': { category: 'delivery', skill: 'Delivery' },
      'parcel': { category: 'delivery', skill: 'Delivery' },
      'पार्सल': { category: 'delivery', skill: 'Delivery' },
      'logistics': { category: 'delivery', skill: 'Delivery' },
      'लॉजिस्टिक्स': { category: 'delivery', skill: 'Delivery' },
      'transport': { category: 'delivery', skill: 'Delivery' },
      'ट्रांसपोर्ट': { category: 'delivery', skill: 'Delivery' },
      'driver': { category: 'delivery', skill: 'Driver' },
      'ड्राइवर': { category: 'delivery', skill: 'Driver' },
      'driving': { category: 'delivery', skill: 'Driver' },
      'ड्राइविंग': { category: 'delivery', skill: 'Driver' },
      
      // SECURITY - all variations
      'security': { category: 'security', skill: 'Security' },
      'security guard': { category: 'security', skill: 'Security' },
      'guard': { category: 'security', skill: 'Security' },
      'सिक्योरिटी': { category: 'security', skill: 'Security' },
      'सिक्योरिटी गार्ड': { category: 'security', skill: 'Security' },
      'गार्ड': { category: 'security', skill: 'Security' },
      'चौकीदार': { category: 'security', skill: 'Security' },
      'रक्षक': { category: 'security', skill: 'Security' },
      'watchman': { category: 'security', skill: 'Security' },
      'वॉचमैन': { category: 'security', skill: 'Security' },
      'night guard': { category: 'security', skill: 'Security' },
      'रात का गार्ड': { category: 'security', skill: 'Security' },
      'bouncer': { category: 'security', skill: 'Security' },
      'बाउंसर': { category: 'security', skill: 'Security' },
      'patrol': { category: 'security', skill: 'Security' },
      'पेट्रोल': { category: 'security', skill: 'Security' },
      'surveillance': { category: 'security', skill: 'Security' },
      'निगरानी': { category: 'security', skill: 'Security' },
      'cctv': { category: 'security', skill: 'Security' },
      'सीसीटीवी': { category: 'security', skill: 'Security' },
      'monitoring': { category: 'security', skill: 'Security' },
      'मॉनिटरिंग': { category: 'security', skill: 'Security' },
      
      // HOUSEKEEPING - all variations
      'housekeeping': { category: 'housekeeping', skill: 'Housekeeper' },
      'housekeeper': { category: 'housekeeping', skill: 'Housekeeper' },
      'cleaning': { category: 'housekeeping', skill: 'Cleaner' },
      'cleaner': { category: 'housekeeping', skill: 'Cleaner' },
      'cleaners': { category: 'housekeeping', skill: 'Cleaner' },
      'clean': { category: 'housekeeping', skill: 'Cleaner' },
      'cleaned': { category: 'housekeeping', skill: 'Cleaner' },
      'हाउसकीपिंग': { category: 'housekeeping', skill: 'Housekeeper' },
      'सफाई': { category: 'housekeeping', skill: 'Cleaner' },
      'सफाई वाला': { category: 'housekeeping', skill: 'Cleaner' },
      'सफाई वाली': { category: 'housekeeping', skill: 'Cleaner' },
      'झाड़ू': { category: 'housekeeping', skill: 'Cleaner' },
      'पोछा': { category: 'housekeeping', skill: 'Cleaner' },
      'धुलाई': { category: 'housekeeping', skill: 'Cleaner' },
      'मेड': { category: 'housekeeping', skill: 'Housekeeper' },
      'maid': { category: 'housekeeping', skill: 'Housekeeper' },
      'domestic': { category: 'housekeeping', skill: 'Housekeeper' },
      'घरेलू': { category: 'housekeeping', skill: 'Housekeeper' },
      'janitor': { category: 'housekeeping', skill: 'Cleaner' },
      'जैनिटर': { category: 'housekeeping', skill: 'Cleaner' },
      'sweeper': { category: 'housekeeping', skill: 'Cleaner' },
      'स्वीपर': { category: 'housekeeping', skill: 'Cleaner' },
      'mopping': { category: 'housekeeping', skill: 'Cleaner' },
      'मॉपिंग': { category: 'housekeeping', skill: 'Cleaner' },
      'dusting': { category: 'housekeeping', skill: 'Cleaner' },
      'डस्टिंग': { category: 'housekeeping', skill: 'Cleaner' },
      'vacuum': { category: 'housekeeping', skill: 'Cleaner' },
      'वैक्यूम': { category: 'housekeeping', skill: 'Cleaner' },
      
      // MANUFACTURING - all variations
      'manufacturing': { category: 'manufacturing', skill: 'Factory Worker' },
      'factory': { category: 'manufacturing', skill: 'Factory Worker' },
      'factory worker': { category: 'manufacturing', skill: 'Factory Worker' },
      'production': { category: 'manufacturing', skill: 'Production Worker' },
      'मैन्युफैक्चरिंग': { category: 'manufacturing', skill: 'Factory Worker' },
      'फैक्ट्री': { category: 'manufacturing', skill: 'Factory Worker' },
      'कारखाना': { category: 'manufacturing', skill: 'Factory Worker' },
      'उत्पादन': { category: 'manufacturing', skill: 'Production Worker' },
      'प्रोडक्शन': { category: 'manufacturing', skill: 'Production Worker' },
      'assembly': { category: 'manufacturing', skill: 'Assembly Worker' },
      'असेंबली': { category: 'manufacturing', skill: 'Assembly Worker' },
      'machine': { category: 'manufacturing', skill: 'Machine Operator' },
      'machines': { category: 'manufacturing', skill: 'Machine Operator' },
      'मशीन': { category: 'manufacturing', skill: 'Machine Operator' },
      'operator': { category: 'manufacturing', skill: 'Machine Operator' },
      'ऑपरेटर': { category: 'manufacturing', skill: 'Machine Operator' },
      'textile': { category: 'manufacturing', skill: 'Textile Worker' },
      'टेक्सटाइल': { category: 'manufacturing', skill: 'Textile Worker' },
      'garment': { category: 'manufacturing', skill: 'Garment Worker' },
      'गारमेंट': { category: 'manufacturing', skill: 'Garment Worker' },
      'sewing': { category: 'manufacturing', skill: 'Tailor' },
      'सिलाई': { category: 'manufacturing', skill: 'Tailor' },
      'tailor': { category: 'manufacturing', skill: 'Tailor' },
      'दर्जी': { category: 'manufacturing', skill: 'Tailor' },
      'packaging': { category: 'manufacturing', skill: 'Packer' },
      'पैकेजिंग': { category: 'manufacturing', skill: 'Packer' },
      'packing': { category: 'manufacturing', skill: 'Packer' },
      'पैकिंग': { category: 'manufacturing', skill: 'Packer' },
      'quality': { category: 'manufacturing', skill: 'Quality Inspector' },
      'क्वालिटी': { category: 'manufacturing', skill: 'Quality Inspector' },
      'inspection': { category: 'manufacturing', skill: 'Quality Inspector' },
      'इंस्पेक्शन': { category: 'manufacturing', skill: 'Quality Inspector' }
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
    { id: 'payslip', label: '💰 पेस्लिप विश्लेषण / Analyze Payslip', prompt: 'मेरी पेस्लिप समझने और वेतन सही है या नहीं चेक करने में मदद करें / Help me understand my payslip and check if my wages are correct' },
    { 
      id: 'jobs', 
      label: '🔍 नौकरी खोजें / Find Jobs', 
      prompt: 'find me a job', // Simple prompt that triggers general job search (no filters)
      directAction: true // Flag to indicate this should directly switch tabs without AI processing
    },
    { id: 'grievance', label: '📝 शिकायत लिखें / Write Grievance', prompt: 'मेरी कार्यक्षेत्र में समस्या है और औपचारिक शिकायत लिखने में मदद चाहिए / I have a workplace issue and need help writing a formal complaint' },
    { id: 'rights', label: '⚖️ मजदूर अधिकार / Worker Rights', prompt: 'भारत में मजदूर के रूप में मेरे क्या अधिकार हैं? / What are my rights as a worker in India?' },
    { id: 'skills', label: '🎓 कौशल विकास / Skill Development', prompt: 'बेहतर नौकरी पाने के लिए मैं अपने कौशल कैसे सुधार सकता हूं? / How can I improve my skills to get better jobs?' },
    { id: 'contract', label: '📄 कॉन्ट्रैक्ट समीक्षा / Review Contract', prompt: 'मेरे पास नौकरी का ऑफर है। क्या आप कॉन्ट्रैक्ट की समीक्षा में मदद कर सकते हैं? / I have a job offer. Can you help me review the contract?' }
  ];

  // Enhanced Voice Recognition Setup with Multi-Language Support
      const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('आवाज पहचान आपके ब्राउज़र में समर्थित नहीं है। कृपया Chrome या Edge का उपयोग करें।');
      return;
    }

    // Prevent starting if already listening or processing
    if (isListening || voiceProcessing) {
      console.log('🎤 Voice recognition already active, skipping');
      return;
    }

    // CRITICAL: Stop any existing speech before starting recognition
    stopSpeaking();
    
    // Reset processing flag at start
    setVoiceProcessing(false);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Enhanced settings for better Hindi/English mixed speech recognition
    recognition.lang = 'hi-IN'; // Hindi (India) - primary language for better Hindi word recognition
    recognition.interimResults = true; // Enable interim results for better feedback
    recognition.maxAlternatives = 5; // Get more alternatives for better accuracy
    recognition.continuous = false; // Single utterance mode
    
    // Enhanced audio processing settings (if supported)
    if (recognition.audioTrack) {
      recognition.audioTrack.echoCancellation = true;
      recognition.audioTrack.noiseSuppression = true;
      recognition.audioTrack.autoGainControl = true;
    }

    let finalTranscript = '';
    let interimTranscript = '';
    let fallbackUsed = false; // Flag to prevent double sending

    recognition.onstart = () => {
      setIsListening(true);
      finalTranscript = '';
      interimTranscript = '';
      console.log('🎤 Enhanced voice recognition started (Hindi mode)');
    };

    recognition.onresult = (event) => {
      interimTranscript = '';
      
      // Process all results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      // Show interim results in input field for better UX
      const displayText = finalTranscript + interimTranscript;
      setInputMessage(displayText);
      
      console.log('🎤 Final:', finalTranscript);
      console.log('🎤 Interim:', interimTranscript);
      
      // Log all alternatives for debugging
      if (event.results[event.results.length - 1].isFinal) {
        const alternatives = Array.from(event.results[event.results.length - 1]).map(r => ({
          transcript: r.transcript,
          confidence: r.confidence
        }));
        console.log('🎤 All alternatives with confidence:', alternatives);
        
        // Try fallback to English if Hindi confidence is low
        if (alternatives[0].confidence < 0.6) { // Lowered threshold for better recognition
          console.log('🎤 Low confidence, trying English fallback...');
          fallbackUsed = true; // Mark that fallback is being used
          tryEnglishFallback(finalTranscript);
          return;
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('🎤 Voice recognition error:', event.error);
      setIsListening(false);
      
      // Provide more helpful error messages in Hindi
      let errorMessage = 'आवाज पहचान में त्रुटि: ';
      switch (event.error) {
        case 'network':
          errorMessage += 'नेटवर्क कनेक्शन की समस्या। कृपया अपना इंटरनेट चेक करें।';
          break;
        case 'not-allowed':
          errorMessage += 'माइक्रोफोन की अनुमति नहीं मिली। कृपया माइक्रोफोन की अनुमति दें।';
          break;
        case 'no-speech':
          errorMessage += 'कोई आवाज नहीं सुनाई दी। कृपया स्पष्ट रूप से बोलें।';
          break;
        case 'audio-capture':
          errorMessage += 'माइक्रोफोन नहीं मिला। कृपया अपना माइक्रोफोन चेक करें।';
          break;
        default:
          errorMessage += event.error;
      }
      alert(errorMessage);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Voice recognition ended');
      
      // Auto-send the final message if we have content and not already processing and fallback wasn't used
      if (finalTranscript.trim() && !voiceProcessing && !fallbackUsed) {
        setVoiceProcessing(true);
        console.log('🎤 Sending final transcript:', finalTranscript);
        handleSendMessage(finalTranscript.trim());
        // Reset processing flag after a delay
        setTimeout(() => setVoiceProcessing(false), 1000);
      }
    };

    recognition.start();
  };

  // Fallback function to try English recognition if Hindi fails
  const tryEnglishFallback = (hindiTranscript) => {
    console.log('🎤 Trying English fallback recognition...');
    
    // Prevent duplicate processing
    if (voiceProcessing) {
      console.log('🎤 Voice already processing, skipping fallback');
      return;
    }
    
    // Just use the Hindi result directly - no need for additional English recognition
    // This simplifies the logic and prevents multiple calls
    if (!voiceProcessing && hindiTranscript.trim()) {
      setVoiceProcessing(true);
      console.log('🎤 Using Hindi transcript from fallback:', hindiTranscript);
      setInputMessage(hindiTranscript);
      handleSendMessage(hindiTranscript);
      setTimeout(() => setVoiceProcessing(false), 1000);
    }
  };

  // Text-to-Speech for AI responses using AWS Polly (Hindi Priority) - SINGLE VOICE ONLY
  const speakText = async (text) => {
    try {
      // CRITICAL: Stop any existing speech first to prevent double voices
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      
      // Stop any ongoing speech synthesis immediately
      setIsSpeaking(false);
      
      // Small delay to ensure cleanup
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // FILTER OUT EMOJIS - Remove all emoji characters before speaking
      const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]/gu, '');
      
      console.log('🔊 Original text:', text.substring(0, 50));
      console.log('🔊 Text without emojis:', textWithoutEmojis.substring(0, 50));
      
      setIsSpeaking(true);
      console.log('🔊 Speaking with AWS Polly (Hindi):', textWithoutEmojis);
      
      await pollyService.speak(textWithoutEmojis, 'hi-IN', {
        rate: 0.8, // Slower for Hindi clarity
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
          // Fallback to browser TTS with Hindi
          fallbackToWebSpeech(textWithoutEmojis);
        }
      });
    } catch (error) {
      console.error('🔊 Speech error:', error);
      setIsSpeaking(false);
      // Fallback to browser TTS with Hindi - filter emojis first
      const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]/gu, '');
      fallbackToWebSpeech(textWithoutEmojis);
    }
  };

  // Fallback to browser Web Speech API with Hindi priority - SINGLE VOICE ONLY
  const fallbackToWebSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Text-to-speech not supported');
      return;
    }

    // CRITICAL: Cancel any existing speech to prevent double voices
    window.speechSynthesis.cancel();
    
    // Additional delay to ensure complete cancellation
    setTimeout(() => {
      // Filter emojis from text before speaking
      const textWithoutEmojis = text.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F000}-\u{1F02F}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F100}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{2B55}]|[\u{231A}-\u{231B}]|[\u{23E9}-\u{23EC}]|[\u{23F0}]|[\u{23F3}]|[\u{25FD}-\u{25FE}]|[\u{2614}-\u{2615}]|[\u{2648}-\u{2653}]|[\u{267F}]|[\u{2693}]|[\u{26A1}]|[\u{26AA}-\u{26AB}]|[\u{26BD}-\u{26BE}]|[\u{26C4}-\u{26C5}]|[\u{26CE}]|[\u{26D4}]|[\u{26EA}]|[\u{26F2}-\u{26F3}]|[\u{26F5}]|[\u{26FA}]|[\u{26FD}]|[\u{2705}]|[\u{270A}-\u{270B}]|[\u{2728}]|[\u{274C}]|[\u{274E}]|[\u{2753}-\u{2755}]|[\u{2757}]|[\u{2795}-\u{2797}]|[\u{27B0}]|[\u{27BF}]|[\u{2B1B}-\u{2B1C}]/gu, '');
      const utterance = new SpeechSynthesisUtterance(textWithoutEmojis);
      utterance.lang = 'hi-IN'; // Hindi (India) as primary
      utterance.rate = 0.8; // Slower for Hindi clarity
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }, 200); // Delay to ensure previous speech is fully stopped
  };

  // Stop speaking function - Enhanced cleanup
  const stopSpeaking = () => {
    console.log('🔇 Stopping all speech synthesis...');
    
    // Stop AWS Polly
    if (pollyService && pollyService.stop) {
      pollyService.stop();
    }
    
    // Stop browser TTS as fallback - multiple attempts for reliability
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // Additional cleanup attempts
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
          
          // CRITICAL: Check grievance FIRST to avoid false positives with job detection
          // Grievance detection - extensive keywords (including Roman Hindi)
          const isGrievanceIntent = lowerMessage.includes('grievance') || lowerMessage.includes('complaint') || lowerMessage.includes('complain') || lowerMessage.includes('शिकायत') || lowerMessage.includes('shikayat') || lowerMessage.includes('shikaayat') || lowerMessage.includes('dispute') || lowerMessage.includes('conflict') || lowerMessage.includes('harassment') || lowerMessage.includes('unfair') || lowerMessage.includes('injustice') || lowerMessage.includes('wrong') || lowerMessage.includes('abuse') || lowerMessage.includes('exploitation') || lowerMessage.includes('परेशानी') || lowerMessage.includes('pareshani') || lowerMessage.includes('दिक्कत') || lowerMessage.includes('dikkat') || lowerMessage.includes('विवाद') || lowerMessage.includes('vivad') || lowerMessage.includes('झगड़ा') || lowerMessage.includes('jhagda') || lowerMessage.includes('उत्पीड़न') || lowerMessage.includes('utpidan') || lowerMessage.includes('अन्याय') || lowerMessage.includes('anyay') || lowerMessage.includes('गलत') || lowerMessage.includes('galat') || lowerMessage.includes('शोषण') || lowerMessage.includes('shoshan') || lowerMessage.includes('धोखा') || lowerMessage.includes('dhokha') || lowerMessage.includes('ठगी') || lowerMessage.includes('thagi') || lowerMessage.includes('अत्याचार') || lowerMessage.includes('atyachar') || lowerMessage.includes('दुर्व्यवहार') || lowerMessage.includes('durvyavahar') || lowerMessage.includes('मारपीट') || lowerMessage.includes('marpeet') || lowerMessage.includes('गाली') || lowerMessage.includes('gali') || lowerMessage.includes('gaali') || lowerMessage.includes('अपमान') || lowerMessage.includes('apman') || lowerMessage.includes('भेदभाव') || lowerMessage.includes('bhedbhav') || lowerMessage.includes('discrimination') || lowerMessage.includes('violence') || lowerMessage.includes('threat') || lowerMessage.includes('unsafe') || lowerMessage.includes('danger') || lowerMessage.includes('खतरा') || lowerMessage.includes('khatra') || lowerMessage.includes('असुरक्षित') || lowerMessage.includes('asurakshit') || lowerMessage.includes('धमकी') || lowerMessage.includes('dhamki');
          
          if (isGrievanceIntent) {
            console.log('✅ Detected grievance intent');
            suggestedActions.push({ label: '📝 Go to Grievance Form', path: 'grievance' });
          }
          
          // Jobs detection - extensive keywords in English, Hindi, and Hinglish (all tenses)
          // IMPORTANT: Skip job detection if this is a grievance intent
          if (!isGrievanceIntent && (lowerMessage.includes('job') || lowerMessage.includes('jobs') || lowerMessage.includes('work') || lowerMessage.includes('working') || lowerMessage.includes('worked') || lowerMessage.includes('employment') || lowerMessage.includes('employ') || lowerMessage.includes('employed') || lowerMessage.includes('नौकरी') || lowerMessage.includes('naukri') || lowerMessage.includes('nokri') || lowerMessage.includes('काम') || lowerMessage.includes('kaam') || lowerMessage.includes('kam') || lowerMessage.includes('रोजगार') || lowerMessage.includes('rojgar') || lowerMessage.includes('rozgar') || lowerMessage.includes('धंधा') || lowerMessage.includes('dhanda') || lowerMessage.includes('dhandha') || lowerMessage.includes('construction') || lowerMessage.includes('plumbing') || lowerMessage.includes('electrical') || lowerMessage.includes('painting') || lowerMessage.includes('carpentry') || lowerMessage.includes('mason') || lowerMessage.includes('plumber') || lowerMessage.includes('electrician') || lowerMessage.includes('painter') || lowerMessage.includes('carpenter') || lowerMessage.includes('मिस्त्री') || lowerMessage.includes('mistri') || lowerMessage.includes('mistry') || lowerMessage.includes('राजमिस्त्री') || lowerMessage.includes('rajmistri') || lowerMessage.includes('प्लंबर') || lowerMessage.includes('plumber') || lowerMessage.includes('बिजली') || lowerMessage.includes('bijli') || lowerMessage.includes('bijlee') || lowerMessage.includes('पेंटर') || lowerMessage.includes('painter') || lowerMessage.includes('pentar') || lowerMessage.includes('बढ़ई') || lowerMessage.includes('badhai') || lowerMessage.includes('barhai') || lowerMessage.includes('निर्माण') || lowerMessage.includes('nirman') || lowerMessage.includes('nirmaan') || lowerMessage.includes('कारीगर') || lowerMessage.includes('karigar') || lowerMessage.includes('kaarigar') || lowerMessage.includes('मजदूर') || lowerMessage.includes('majdur') || lowerMessage.includes('mazdoor') || lowerMessage.includes('majdoor') || lowerMessage.includes('श्रमिक') || lowerMessage.includes('shramik') || lowerMessage.includes('कामगार') || lowerMessage.includes('kamgar') || lowerMessage.includes('kaamgaar') || lowerMessage.includes('vacancy') || lowerMessage.includes('vacancies') || lowerMessage.includes('hiring') || lowerMessage.includes('hire') || lowerMessage.includes('hired') || lowerMessage.includes('recruit') || lowerMessage.includes('recruiting') || lowerMessage.includes('recruitment') || lowerMessage.includes('position') || lowerMessage.includes('positions') || lowerMessage.includes('opening') || lowerMessage.includes('openings') || lowerMessage.includes('opportunity') || lowerMessage.includes('opportunities') || lowerMessage.includes('भर्ती') || lowerMessage.includes('bharti') || lowerMessage.includes('bharati') || lowerMessage.includes('रिक्ति') || lowerMessage.includes('rikti') || lowerMessage.includes('रिक्त') || lowerMessage.includes('rikt') || lowerMessage.includes('अवसर') || lowerMessage.includes('avsar') || lowerMessage.includes('मौका') || lowerMessage.includes('mauka') || lowerMessage.includes('mouka') || lowerMessage.includes('find') || lowerMessage.includes('finding') || lowerMessage.includes('found') || lowerMessage.includes('search') || lowerMessage.includes('searching') || lowerMessage.includes('searched') || lowerMessage.includes('looking') || lowerMessage.includes('look') || lowerMessage.includes('need') || lowerMessage.includes('needed') || lowerMessage.includes('needing') || lowerMessage.includes('want') || lowerMessage.includes('wanted') || lowerMessage.includes('wanting') || lowerMessage.includes('ढूंढ') || lowerMessage.includes('dhundh') || lowerMessage.includes('dhund') || lowerMessage.includes('खोज') || lowerMessage.includes('khoj') || lowerMessage.includes('तलाश') || lowerMessage.includes('talash') || lowerMessage.includes('talaash') || lowerMessage.includes('चाहिए') || lowerMessage.includes('chahiye') || lowerMessage.includes('chahie') || lowerMessage.includes('चाहता') || lowerMessage.includes('chahta') || lowerMessage.includes('चाहती') || lowerMessage.includes('chahti'))) {
            // Extract job details from message
            const jobDetails = extractJobDetails(message);
            console.log('📋 Extracted job details:', jobDetails);
            
            // CRITICAL: Check if user specified a specific job type/category
            // Only apply filters if user explicitly mentions a job type (painter, mason, etc.)
            const hasSpecificJobType = jobDetails.jobType && jobDetails.skills;
            console.log('✅ Has specific job type:', hasSpecificJobType);
            
            if (hasSpecificJobType) {
              // User specified a job type - apply filters
              const filterData = {
                category: jobDetails.jobType.toLowerCase(),
                searchQuery: jobDetails.skills || '',
                location: jobDetails.location || '',
                enableLocation: true, // Always enable location
                scrollToCategory: jobDetails.jobType.toLowerCase()
              };
              
              sessionStorage.setItem('job_search_filters', JSON.stringify(filterData));
              console.log('💾 Stored filters for specific job type:', filterData);
              
              suggestedActions.push({ 
                label: `🎯 Find ${jobDetails.skills} Jobs${jobDetails.location ? ` in ${jobDetails.location}` : ' Near You'}`, 
                path: 'home',
                filters: filterData,
                autoActions: {
                  enableLocation: true,
                  scrollToCategory: jobDetails.jobType.toLowerCase(),
                  focusOnResults: true
                }
              });
            } else {
              // General job search - NO filters, just enable location
              const filterData = {
                category: null, // No category filter
                searchQuery: '', // No search query
                location: '', // No location filter
                enableLocation: true, // Enable real location
                scrollToCategory: null // No scrolling
              };
              
              sessionStorage.setItem('job_search_filters', JSON.stringify(filterData));
              console.log('💾 General job search - location enabled, no filters:', filterData);
              
              suggestedActions.push({ 
                label: '🔍 Find Jobs Near You', 
                path: 'home',
                filters: filterData,
                autoActions: {
                  enableLocation: true,
                  scrollToCategory: null,
                  focusOnResults: true
                }
              });
            }
            
            console.log('🎯 Suggested actions:', suggestedActions);
          }
          
          // Payslip detection - extensive keywords in English, Hindi, and Hinglish (all tenses)
          // Only trigger if NOT a grievance (to avoid "underpayment" triggering payslip)
          if (!isGrievanceIntent && (lowerMessage.includes('payslip') || lowerMessage.includes('pay slip') || lowerMessage.includes('salary') || lowerMessage.includes('salaries') || lowerMessage.includes('wage') || lowerMessage.includes('wages') || lowerMessage.includes('pay') || lowerMessage.includes('paid') || lowerMessage.includes('paying') || lowerMessage.includes('payment') || lowerMessage.includes('payments') || lowerMessage.includes('earning') || lowerMessage.includes('earnings') || lowerMessage.includes('earned') || lowerMessage.includes('income') || lowerMessage.includes('वेतन') || lowerMessage.includes('vetan') || lowerMessage.includes('wetan') || lowerMessage.includes('तनख्वाह') || lowerMessage.includes('tankhwah') || lowerMessage.includes('tankhwa') || lowerMessage.includes('tankhuah') || lowerMessage.includes('पगार') || lowerMessage.includes('pagaar') || lowerMessage.includes('pagar') || lowerMessage.includes('मजदूरी') || lowerMessage.includes('majduri') || lowerMessage.includes('mazdoori') || lowerMessage.includes('majdoori') || lowerMessage.includes('वेतनपत्र') || lowerMessage.includes('vetan patra') || lowerMessage.includes('पेस्लिप') || lowerMessage.includes('payslip') || lowerMessage.includes('peslip') || lowerMessage.includes('आय') || lowerMessage.includes('aay') || lowerMessage.includes('aaye') || lowerMessage.includes('कमाई') || lowerMessage.includes('kamai') || lowerMessage.includes('kamaayi') || lowerMessage.includes('kamayi') || lowerMessage.includes('भुगतान') || lowerMessage.includes('bhugtan') || lowerMessage.includes('bhugatan') || lowerMessage.includes('पैसा') || lowerMessage.includes('paisa') || lowerMessage.includes('paise') || lowerMessage.includes('पैसे') || lowerMessage.includes('रुपया') || lowerMessage.includes('rupaya') || lowerMessage.includes('rupya') || lowerMessage.includes('रुपये') || lowerMessage.includes('rupaye') || lowerMessage.includes('rupye') || lowerMessage.includes('पारिश्रमिक') || lowerMessage.includes('parishramik') || lowerMessage.includes('दैनिक') || lowerMessage.includes('dainik') || lowerMessage.includes('daily') || lowerMessage.includes('मासिक') || lowerMessage.includes('masik') || lowerMessage.includes('maasik') || lowerMessage.includes('monthly') || lowerMessage.includes('साप्ताहिक') || lowerMessage.includes('saptahik') || lowerMessage.includes('weekly') || lowerMessage.includes('daily wage') || lowerMessage.includes('monthly salary') || lowerMessage.includes('weekly pay') || lowerMessage.includes('overtime') || lowerMessage.includes('over time') || lowerMessage.includes('deduction') || lowerMessage.includes('deductions') || lowerMessage.includes('deducted') || lowerMessage.includes('कटौती') || lowerMessage.includes('katauti') || lowerMessage.includes('katoti') || lowerMessage.includes('ओवरटाइम') || lowerMessage.includes('overtime') || lowerMessage.includes('extra time') || lowerMessage.includes('check') || lowerMessage.includes('checking') || lowerMessage.includes('checked') || lowerMessage.includes('verify') || lowerMessage.includes('verifying') || lowerMessage.includes('verified') || lowerMessage.includes('audit') || lowerMessage.includes('auditing') || lowerMessage.includes('audited') || lowerMessage.includes('जांच') || lowerMessage.includes('jaanch') || lowerMessage.includes('janch') || lowerMessage.includes('देखना') || lowerMessage.includes('dekhna') || lowerMessage.includes('dekho'))) {
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
        
        // Store auto-actions for enhanced automation
        if (firstAction.autoActions) {
          sessionStorage.setItem('job_search_auto_actions', JSON.stringify(firstAction.autoActions));
          console.log('🤖 Auto-stored auto-actions:', firstAction.autoActions);
        }
        
        if (onTabChange && firstAction.path) {
          console.log('🔄 Auto-switching to tab:', firstAction.path);
          console.log('🔄 Calling onTabChange function...');
          setTimeout(() => {
            console.log('🔄 Executing onTabChange NOW');
            onTabChange(firstAction.path);
            
            // Execute auto-actions after tab switch
            if (firstAction.autoActions) {
              setTimeout(() => {
                // Auto-enable location
                if (firstAction.autoActions.enableLocation) {
                  console.log('📍 Auto-enabling location...');
                  window.dispatchEvent(new CustomEvent('enableLocation'));
                }
                
                // Auto-scroll to category
                if (firstAction.autoActions.scrollToCategory) {
                  console.log('📜 Auto-scrolling to category:', firstAction.autoActions.scrollToCategory);
                  window.dispatchEvent(new CustomEvent('scrollToCategory', {
                    detail: { category: firstAction.autoActions.scrollToCategory }
                  }));
                }
              }, 1500); // Wait for tab to fully load
            }
          }, 500); // Reduced to 0.5 seconds
        } else {
          console.error('❌ Cannot auto-switch: onTabChange=' + !!onTabChange + ', path=' + firstAction.path);
        }
        
        // Voice narration using AWS Polly (if available) - SINGLE VOICE ONLY
        if (voiceMode) {
          // CRITICAL: Stop any existing speech before starting new speech
          stopSpeaking();
          setTimeout(() => {
            speakText(response);
          }, 500); // Increased delay to ensure complete cleanup
        }
      } else {
        console.log('⚠️ Agentic mode not executing:', {
          agenticMode,
          actionsLength: suggestedActions.length
        });
        
        // Still provide voice response even if no actions
        if (voiceMode) {
          // CRITICAL: Stop any existing speech before starting new speech
          stopSpeaking();
          setTimeout(() => {
            speakText(response);
          }, 500); // Increased delay for consistency
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
    // Check if this is a direct action (like "Find Jobs" button)
    if (action.directAction && action.id === 'jobs') {
      console.log('🔍 Direct action: Find Jobs - switching to home tab with location enabled');
      
      // Clear any existing filters and enable location only
      const filterData = {
        category: null,
        searchQuery: '',
        location: '',
        enableLocation: true,
        scrollToCategory: null
      };
      
      sessionStorage.setItem('job_search_filters', JSON.stringify(filterData));
      console.log('💾 Cleared filters, location enabled:', filterData);
      
      // Stop any ongoing speech
      stopSpeaking();
      
      // Directly switch to home tab
      if (onTabChange) {
        setTimeout(() => {
          onTabChange('home');
          
          // Trigger location enable after tab switch
          setTimeout(() => {
            console.log('📍 Auto-enabling location...');
            window.dispatchEvent(new CustomEvent('enableLocation'));
          }, 1000);
        }, 100);
      }
      
      return; // Don't send message to AI
    }
    
    // For other quick actions, send message to AI as usual
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
                          
                          // Stop any ongoing speech before navigation
                          stopSpeaking();
                          
                          // Store filters if provided
                          if (action.filters) {
                            sessionStorage.setItem('job_search_filters', JSON.stringify(action.filters));
                            console.log('💾 Stored filters:', action.filters);
                          }
                          
                          // Store auto-actions for the target component
                          if (action.autoActions) {
                            sessionStorage.setItem('job_search_auto_actions', JSON.stringify(action.autoActions));
                            console.log('🤖 Stored auto-actions:', action.autoActions);
                          }
                          
                          // Navigate to tab using parent callback if available
                          if (onTabChange && action.path) {
                            console.log('🔄 Calling onTabChange with:', action.path);
                            
                            // Smooth tab transition with slight delay
                            setTimeout(() => {
                              onTabChange(action.path);
                              
                              // Additional delay for auto-actions after tab switch
                              if (action.autoActions) {
                                setTimeout(() => {
                                  // Trigger location enable if requested
                                  if (action.autoActions.enableLocation) {
                                    console.log('📍 Auto-enabling location...');
                                    // Dispatch custom event for location enabling
                                    window.dispatchEvent(new CustomEvent('enableLocation'));
                                  }
                                  
                                  // Trigger scroll to category if requested
                                  if (action.autoActions.scrollToCategory) {
                                    console.log('📜 Auto-scrolling to category:', action.autoActions.scrollToCategory);
                                    // Dispatch custom event for scrolling
                                    window.dispatchEvent(new CustomEvent('scrollToCategory', {
                                      detail: { category: action.autoActions.scrollToCategory }
                                    }));
                                  }
                                }, 1000); // Wait for tab to fully load
                              }
                            }, 100);
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
                  disabled={isLoading || isListening || voiceProcessing}
                  className={`voice-record-btn ${isListening ? 'listening' : ''} ${voiceProcessing ? 'processing' : ''}`}
                >
                  {voiceProcessing ? '⏳ Processing...' : 
                   isListening ? '🎤 Listening...' : 
                   '🎤 Tap to Speak'}
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
                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="voice-stop-btn"
                    title="Stop voice output"
                  >
                    🔇 Stop
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}