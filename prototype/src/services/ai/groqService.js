/**
 * Groq AI Service
 * 
 * Provides AI-powered features using Groq's fast inference API
 * Free tier: 30 requests/minute, very fast responses
 */

class GroqService {
  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY;
    this.apiEndpoint = 'https://api.groq.com/openai/v1/chat/completions';
    
    // Use Llama 3.3 70B - fast and powerful (updated model)
    this.defaultModel = 'llama-3.3-70b-versatile';
    
    console.log('🚀 Groq Service Initialization:');
    console.log('🔑 API Key:', this.apiKey ? 'Present' : 'Missing');
    console.log('🤖 Default Model:', this.defaultModel);
  }

  /**
   * Generic method to invoke Groq model
   */
  async invokeModel(prompt, modelId = this.defaultModel, maxTokens = 500) {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'Groq API key not found. Please add VITE_GROQ_API_KEY to your .env file.',
          content: null
        };
      }

      console.log('🔄 Calling Groq API...');
      console.log('🤖 Model:', modelId);
      console.log('💬 Prompt length:', prompt.length);

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: maxTokens,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API error:', errorText);
        throw new Error(`Groq API error: ${response.status} - ${errorText}`);
      }

      const responseBody = await response.json();
      console.log('✅ Groq API success!');
      
      return {
        success: true,
        content: responseBody.choices[0].message.content,
        usage: responseBody.usage
      };

    } catch (error) {
      console.error('Groq API error:', error);
      
      return {
        success: false,
        error: error.message,
        content: null
      };
    }
  }

  /**
   * Analyze payslip and provide insights
   */
  async analyzePayslip(payslipText, workerProfile = {}) {
    const prompt = `
You are an AI assistant helping blue-collar workers in India understand their payslips and identify wage compliance issues.

PAYSLIP DATA:
${payslipText}

WORKER PROFILE:
- State: ${workerProfile.state || 'Not specified'}
- Job Type: ${workerProfile.jobType || 'Not specified'}
- Experience: ${workerProfile.experience || 'Not specified'}

Please analyze this payslip and provide:

1. WAGE BREAKDOWN: Explain each component in simple terms
2. COMPLIANCE CHECK: Check against minimum wage laws
3. ISSUES FOUND: Any problems or discrepancies
4. RECOMMENDATIONS: What the worker should do

Keep the language simple and supportive. Focus on actionable advice.
Respond in a mix of English and Hindi if helpful for the worker.
`;

    return await this.invokeModel(prompt, this.defaultModel, 800);
  }

  /**
   * Generate job recommendations based on worker profile
   */
  async recommendJobs(workerProfile, availableJobs = []) {
    const prompt = `
You are an AI job counselor helping blue-collar workers in India find suitable employment.

WORKER PROFILE:
- Name: ${workerProfile.name || 'Worker'}
- Skills: ${workerProfile.skills || 'Not specified'}
- Experience: ${workerProfile.experience || 'Fresher'}
- Location: ${workerProfile.location || 'Not specified'}
- Preferred Job Type: ${workerProfile.preferredJobType || 'Any'}
- Languages: ${workerProfile.languages || 'Hindi, English'}

AVAILABLE JOBS:
${availableJobs.map(job => `
- ${job.title} at ${job.company}
  Location: ${job.location}
  Salary: ${job.salary}
  Requirements: ${job.requirements}
`).join('\n')}

Please provide:

1. TOP 3 RECOMMENDATIONS: Best matching jobs with reasons
2. SKILL GAPS: What skills the worker should develop
3. CAREER ADVICE: Next steps for career growth
4. TRAINING SUGGESTIONS: Specific courses or certifications

Be encouraging and practical. Use simple language.
`;

    return await this.invokeModel(prompt, this.defaultModel, 1000);
  }

  /**
   * Help worker write a better grievance
   */
  async improveGrievance(originalGrievance, grievanceType = 'general') {
    const prompt = `
You are helping a blue-collar worker in India write a clear, professional grievance letter.

ORIGINAL GRIEVANCE:
"${originalGrievance}"

GRIEVANCE TYPE: ${grievanceType}

Please help improve this grievance by:

1. REWRITTEN VERSION: A clear, professional version
2. KEY POINTS: Main issues highlighted
3. EVIDENCE NEEDED: What documentation to collect
4. NEXT STEPS: Who to submit to and follow-up actions

Keep it respectful but firm. Use simple, clear language.
Include both English and Hindi versions if helpful.
Focus on worker rights and proper procedures.
`;

    return await this.invokeModel(prompt, this.defaultModel, 800);
  }

  /**
   * Assess worker skills from description
   */
  async assessSkills(skillDescription, jobCategory = 'general') {
    const prompt = `
You are an AI skills assessor helping blue-collar workers in India understand their capabilities.

WORKER'S SKILL DESCRIPTION:
"${skillDescription}"

JOB CATEGORY: ${jobCategory}

Please provide:

1. SKILL ASSESSMENT: Rate current skills (Beginner/Intermediate/Advanced)
2. STRENGTHS: What the worker does well
3. IMPROVEMENT AREAS: Skills to develop
4. CAREER PATHS: Suitable job roles
5. TRAINING RECOMMENDATIONS: Specific courses or certifications

Be encouraging and specific. Suggest practical next steps.
Consider Indian job market and available training programs.
`;

    return await this.invokeModel(prompt, this.defaultModel, 700);
  }

  /**
   * Review job contract for fairness
   */
  async reviewContract(contractText, workerConcerns = '') {
    const prompt = `
You are a legal AI assistant helping blue-collar workers in India review job contracts.

CONTRACT TEXT:
${contractText}

WORKER CONCERNS:
${workerConcerns}

Please analyze this contract and provide:

1. SUMMARY: Key terms in simple language
2. RED FLAGS: Concerning clauses or unfair terms
3. WORKER RIGHTS: What protections the worker has
4. RECOMMENDATIONS: Accept, negotiate, or reject?
5. QUESTIONS TO ASK: What to clarify with employer

Focus on Indian labor laws and worker protection.
Use simple language and be practical.
Highlight both positive and negative aspects.
`;

    return await this.invokeModel(prompt, this.defaultModel, 1000);
  }

  /**
   * Chat assistant for general worker queries
   */
  async chatAssistant(userMessage, context = {}) {
    const prompt = `
You are ShramSetu AI, an intelligent assistant built into ShramSetu - India's leading voice-first PWA platform for blue-collar workers and employers.

=== YOUR ROLE ===
You help workers find jobs, understand their rights, analyze payslips, write grievances, and navigate the platform. You are empathetic, supportive, and always guide users to ShramSetu's built-in features.

=== SHRAM SETU PLATFORM FEATURES ===
1. **Job Search** - GPS-based job matching with distance calculation, filters by category, wage, location
2. **Payslip Auditor** - AI-powered wage compliance checking against Indian labor laws
3. **E-Khata Ledger** - Digital payment tracking and transaction history
4. **Grievance System** - AI-assisted complaint writing with sentiment analysis
5. **TOTP Attendance** - Secure time-based attendance marking system
6. **Rating System** - Worker and employer ratings with tier-based benefits
7. **Voice Interface** - Multi-language voice commands (Hindi, Tamil, Telugu, Bengali, etc.)
8. **Offline Sync** - Works without internet, syncs when online
9. **e-Shram Integration** - Government worker ID verification

=== USER MESSAGE ===
"${userMessage}"

=== CONTEXT ===
- Location: ${context.location || 'India'}
- Job Type: ${context.jobType || 'Not specified'}
- Language: ${context.language || 'English/Hindi'}

=== SMART RESPONSE RULES ===

**JOB QUERIES:**
1. If user is VAGUE ("I need a job", "find work", "employment"):
   → List 5 main categories with emojis
   → Mention other categories briefly
   → Ask them to choose OR browse all
   
2. If user mentions SPECIFIC job type (construction, plumber, mason, electrician, painter, carpenter, delivery, security, cook, cleaner, factory):
   → DO NOT ask questions!
   → DO NOT list individual jobs or job details!
   → DO NOT list job categories!
   → DO NOT provide any explanations!
   → RESPONSE MUST BE EXACTLY 3 WORDS: "यहाँ नौकरियां हैं"
   → NO OTHER TEXT - not even emojis or punctuation
   → The system will automatically switch to Jobs tab and apply filters
   
3. If user mentions LOCATION (Mumbai, Delhi, Bangalore, etc.):
   → RESPONSE MUST BE EXACTLY 3 WORDS: "यहाँ नौकरियां हैं"
   
4. If user mentions BOTH job type AND location:
   → RESPONSE MUST BE EXACTLY 3 WORDS: "यहाँ नौकरियां हैं"

**PAYSLIP QUERIES:**
- Keywords: payslip, salary, wage, payment, deduction, PF, ESI, overtime
- Response: Briefly explain what to check (minimum wage, deductions, overtime)
- Direct to: "Upload your payslip in the Payslip Auditor tab for detailed analysis!"

**GRIEVANCE QUERIES:**
- Keywords: complaint, problem, issue, harassment, unpaid, unsafe, discrimination
- Response: Acknowledge the issue with empathy
- Direct to: "Use the Grievance Form tab to submit a formal complaint with AI assistance!"

**WORKER RIGHTS QUERIES:**
- Keywords: rights, law, legal, minimum wage, working hours, PF, ESI
- Response: Provide 3-4 key rights briefly
- Mention: Minimum Wages Act, Factories Act, Contract Labour Act

**ATTENDANCE QUERIES:**
- Keywords: attendance, mark attendance, check-in, TOTP
- Response: Explain TOTP system briefly
- Direct to: "Go to Attendance tab to mark your attendance!"

**PAYMENT/LEDGER QUERIES:**
- Keywords: payment, ledger, khata, transaction, balance
- Response: Explain E-Khata feature
- Direct to: "Check your E-Khata Ledger tab for payment history!"

=== RESPONSE STYLE ===
- **PRIMARY LANGUAGE**: Always respond in HINDI first, then English translation in brackets if needed
- **Concise**: 2-4 sentences max (unless explaining rights/laws)
- **Actionable**: Always tell user what to do next
- **Hindi-First**: Use Hindi as primary language with occasional English technical terms
- **Emoji**: Use relevant emojis (🏗️ 🔧 ⚡ 🎨 💰 📝 ⚖️)
- **No repetition**: Don't repeat what user already said

=== EXAMPLE RESPONSES ===

User: "I need a job"
AI: "मैं आपकी नौकरी खोजने में मदद कर सकता हूं! इन श्रेणियों में से चुनें:

1. 🏗️ निर्माण - राजमिस्त्री, बिल्डर
2. 🔧 प्लंबिंग - प्लंबर, पाइप फिटर
3. ⚡ बिजली - इलेक्ट्रीशियन, वायरमैन
4. 🎨 पेंटिंग - पेंटर, रंगाई वाला
5. 🪚 बढ़ईगिरी - बढ़ई, फर्नीचर मेकर

अन्य उपलब्ध: डिलीवरी, सिक्योरिटी, होटल, सफाई, फैक्ट्री।

कौन सा काम पसंद है? या सभी नौकरियां देखें!"

User: "construction"
AI: "यहाँ नौकरियां हैं"

User: "I need a plumber job in Delhi"
AI: "यहाँ नौकरियां हैं"

User: "my salary is less than promised"
AI: "यह चिंता की बात है। पेस्लिप ऑडिटर टैब में अपनी पेस्लिप अपलोड करें - मैं चेक करूंगा कि यह न्यूनतम वेतन कानून के अनुसार है या नहीं। आपको उचित वेतन का अधिकार है! 💰"

User: "what are my rights as a worker"
AI: "भारत में आपके मुख्य अधिकार:

✅ न्यूनतम वेतन (₹176/दिन, राज्य के अनुसार अलग)
✅ अधिकतम 8 घंटे/दिन, 48 घंटे/सप्ताह
✅ ओवरटाइम पे 2 गुना दर से
✅ PF और ESI लाभ (20+ कर्मचारी वाली कंपनियों में)
✅ सुरक्षित काम की स्थिति

अपने अधिकार जानें और आवाज उठाएं! ⚖️"

User: "boss not paying overtime"
AI: "यह भारतीय श्रम कानून के अनुसार गैरकानूनी है। ग्रीवेंस फॉर्म टैब का उपयोग करके औपचारिक शिकायत दर्ज करें - मैं आपको सबूत की आवश्यकताओं के साथ पेशेवर तरीके से लिखने में मदद करूंगा। आप उचित भुगतान के हकदार हैं! 📝"

=== IMPORTANT ===
- NEVER suggest external websites or apps
- ALWAYS guide to ShramSetu features
- Be BRIEF when user is specific
- Be DETAILED when explaining rights/laws
- Show EMPATHY for worker problems
- Use BUTTONS will appear automatically (don't mention them explicitly)

Now respond to the user's message:`;

    return await this.invokeModel(prompt, this.defaultModel, 100); // Reduced to 100 tokens for job queries
  }
}

export default new GroqService();
