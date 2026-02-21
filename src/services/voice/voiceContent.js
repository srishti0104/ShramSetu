/**
 * Voice Content
 * 
 * @fileoverview Multi-language content for voice narration
 */

/**
 * Screen narration content in all supported languages
 */
export const VOICE_CONTENT = {
  // Language Selection Screen
  languageSelection: {
    title: {
      en: 'Choose your preferred language',
      hi: 'अपनी पसंदीदा भाषा चुनें',
      mr: 'तुमची पसंतीची भाषा निवडा',
      gu: 'તમારી પસંદગીની ભાષા પસંદ કરો',
      ta: 'உங்கள் விருப்பமான மொழியைத் தேர்ந்தெடுக்கவும்',
      te: 'మీ ఇష్టమైన భాషను ఎంచుకోండి',
      kn: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      ml: 'നിങ്ങളുടെ ഇഷ്ടമുള്ള ഭാഷ തിരഞ്ഞെടുക്കുക',
      bn: 'আপনার পছন্দের ভাষা নির্বাচন করুন',
      pa: 'ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਚੁਣੋ'
    }
  },

  // Role Selection Screen
  roleSelection: {
    title: {
      en: 'Select your role. Are you a worker or an employer?',
      hi: 'अपनी भूमिका चुनें। क्या आप श्रमिक हैं या नियोक्ता?',
      mr: 'तुमची भूमिका निवडा. तुम्ही कामगार आहात की नियोक्ता?',
      gu: 'તમારી ભૂમિકા પસંદ કરો. તમે કામદાર છો કે નોકરીદાતા?',
      ta: 'உங்கள் பாத்திரத்தைத் தேர்ந்தெடுக்கவும். நீங்கள் தொழிலாளியா அல்லது முதலாளியா?',
      te: 'మీ పాత్రను ఎంచుకోండి. మీరు కార్మికులా లేదా యజమానా?',
      kn: 'ನಿಮ್ಮ ಪಾತ್ರವನ್ನು ಆಯ್ಕೆಮಾಡಿ. ನೀವು ಕಾರ್ಮಿಕರೇ ಅಥವಾ ಉದ್ಯೋಗದಾತರೇ?',
      ml: 'നിങ്ങളുടെ പങ്ക് തിരഞ്ഞെടുക്കുക. നിങ്ങൾ തൊഴിലാളിയാണോ തൊഴിലുടമയാണോ?',
      bn: 'আপনার ভূমিকা নির্বাচন করুন। আপনি কি শ্রমিক নাকি নিয়োগকর্তা?',
      pa: 'ਆਪਣੀ ਭੂਮਿਕਾ ਚੁਣੋ। ਕੀ ਤੁਸੀਂ ਮਜ਼ਦੂਰ ਹੋ ਜਾਂ ਮਾਲਕ?'
    },
    worker: {
      en: 'Worker. Find jobs, track wages, mark attendance',
      hi: 'श्रमिक। नौकरियां खोजें, मजदूरी ट्रैक करें, उपस्थिति चिह्नित करें'
    },
    employer: {
      en: 'Employer. Post jobs, manage workers, track payments',
      hi: 'नियोक्ता। नौकरियां पोस्ट करें, श्रमिकों का प्रबंधन करें, भुगतान ट्रैक करें'
    }
  },

  // Auth Method Selection
  authMethod: {
    title: {
      en: 'How would you like to login?',
      hi: 'आप कैसे लॉगिन करना चाहेंगे?'
    },
    phone: {
      en: 'Login with phone number and OTP',
      hi: 'फोन नंबर और OTP से लॉगिन करें'
    },
    eshram: {
      en: 'Login with E-Shram card',
      hi: 'ई-श्रम कार्ड से लॉगिन करें'
    }
  },

  // Phone Number Entry
  phoneEntry: {
    title: {
      en: 'Enter your 10-digit mobile number',
      hi: 'अपना 10 अंकों का मोबाइल नंबर दर्ज करें'
    },
    help: {
      en: 'We will send you an OTP for verification',
      hi: 'हम आपको सत्यापन के लिए एक OTP भेजेंगे'
    }
  },

  // OTP Verification
  otpVerification: {
    title: {
      en: 'Enter the 6-digit OTP sent to your mobile',
      hi: 'अपने मोबाइल पर भेजा गया 6 अंकों का OTP दर्ज करें'
    }
  },

  // Location
  location: {
    title: {
      en: 'We need your location to find jobs near you',
      hi: 'आपके पास नौकरियां खोजने के लिए हमें आपके स्थान की आवश्यकता है'
    },
    detected: {
      en: 'Location detected successfully',
      hi: 'स्थान सफलतापूर्वक पता चला'
    }
  },

  // Occupation Selection
  occupation: {
    title: {
      en: 'Select your skills. Choose all that apply',
      hi: 'अपने कौशल चुनें। सभी लागू विकल्प चुनें'
    }
  },

  // Personal Details
  personalDetails: {
    title: {
      en: 'Complete your profile with name, age, and gender',
      hi: 'नाम, उम्र और लिंग के साथ अपनी प्रोफ़ाइल पूरी करें'
    }
  },

  // Benefits
  benefits: {
    title: {
      en: 'Discover the benefits of Shramik Setu',
      hi: 'श्रमिक सेतु के लाभों की खोज करें'
    },
    jobMatching: {
      en: 'Find jobs near you based on your skills and location',
      hi: 'अपने कौशल और स्थान के आधार पर अपने पास नौकरियां खोजें'
    },
    wageTracking: {
      en: 'Track your wages with digital ledger',
      hi: 'डिजिटल खाता के साथ अपनी मजदूरी ट्रैक करें'
    },
    attendance: {
      en: 'Mark attendance securely with TOTP codes',
      hi: 'TOTP कोड के साथ सुरक्षित रूप से उपस्थिति चिह्नित करें'
    },
    voice: {
      en: 'Use voice commands in your language',
      hi: 'अपनी भाषा में आवाज कमांड का उपयोग करें'
    }
  },

  // Disclaimer
  disclaimer: {
    title: {
      en: 'Important information about terms and conditions',
      hi: 'नियम और शर्तों के बारे में महत्वपूर्ण जानकारी'
    }
  }
};

/**
 * Get voice content for a screen
 * @param {string} screen - Screen name
 * @param {string} key - Content key
 * @param {string} language - Language code
 * @returns {string} Voice content
 */
export function getVoiceContent(screen, key, language = 'en') {
  return VOICE_CONTENT[screen]?.[key]?.[language] || '';
}

/**
 * Get all voice content for a screen
 * @param {string} screen - Screen name
 * @param {string} language - Language code
 * @returns {Object} All voice content for the screen
 */
export function getScreenVoiceContent(screen, language = 'en') {
  const screenContent = VOICE_CONTENT[screen];
  if (!screenContent) return {};

  const result = {};
  for (const key in screenContent) {
    result[key] = screenContent[key][language] || screenContent[key]['en'] || '';
  }
  return result;
}

export default VOICE_CONTENT;
