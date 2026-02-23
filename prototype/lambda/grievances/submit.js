/**
 * Lambda Function: Submit Grievance
 * Handles voice-based grievance submission with AI-powered triage
 * 
 * Features:
 * - Audio upload to S3 with encryption
 * - Amazon Transcribe for speech-to-text
 * - Amazon Comprehend for sentiment analysis
 * - NLP-based keyword extraction
 * - Category classification
 * - Severity detection and auto-escalation
 * - Anonymous reporting support
 * - NGO notification via SNS
 * 
 * @param {Object} event - API Gateway event
 * @param {string} event.body.workerId - Worker submitting grievance
 * @param {string} event.body.audioData - Base64 encoded audio
 * @param {string} event.body.language - Audio language code
 * @param {boolean} event.body.anonymous - Anonymous submission flag
 * @param {Object} event.body.metadata - Additional context
 * @returns {Object} Grievance record with triage results
 */

const crypto = require('crypto');

// MOCK: In production, uncomment AWS SDK imports
// const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
// const { TranscribeClient, StartTranscriptionJobCommand, GetTranscriptionJobCommand } = require('@aws-sdk/client-transcribe');
// const { ComprehendClient, DetectSentimentCommand, DetectEntitiesCommand, DetectKeyPhrasesCommand } = require('@aws-sdk/client-comprehend');
// const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');
// const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
// const { KMSClient, EncryptCommand } = require('@aws-sdk/client-kms');
// const { marshall } = require('@aws-sdk/util-dynamodb');

// MOCK: Initialize clients
// const s3 = new S3Client({ region: process.env.AWS_REGION });
// const transcribe = new TranscribeClient({ region: process.env.AWS_REGION });
// const comprehend = new ComprehendClient({ region: process.env.AWS_REGION });
// const sns = new SNSClient({ region: process.env.AWS_REGION });
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });
// const kms = new KMSClient({ region: process.env.AWS_REGION });

// Grievance categories
const CATEGORIES = {
  safety: ['सुरक्षा / Safety', ['unsafe', 'danger', 'accident', 'injury', 'hazard']],
  harassment: ['उत्पीड़न / Harassment', ['harass', 'abuse', 'threat', 'intimidate', 'bully']],
  wage_theft: ['वेतन चोरी / Wage Theft', ['payment', 'wage', 'salary', 'money', 'unpaid']],
  discrimination: ['भेदभाव / Discrimination', ['discriminate', 'unfair', 'bias', 'prejudice']],
  working_conditions: ['कार्य स्थितियाँ / Working Conditions', ['condition', 'hours', 'overtime', 'rest']],
  other: ['अन्य / Other', []]
};

// Severity levels
const SEVERITY_KEYWORDS = {
  critical: ['emergency', 'urgent', 'immediate', 'danger', 'life', 'death', 'serious injury'],
  high: ['threat', 'violence', 'assault', 'harassment', 'unsafe'],
  medium: ['unfair', 'unpaid', 'delay', 'problem', 'issue'],
  low: ['question', 'concern', 'clarification', 'information']
};

/**
 * Upload audio to S3 with encryption
 */
async function uploadAudioToS3(audioData, grievanceId, language) {
  // MOCK: In production, upload to S3
  /*
  const buffer = Buffer.from(audioData, 'base64');
  const key = `grievances/${grievanceId}/audio_${Date.now()}.webm`;
  
  const params = {
    Bucket: process.env.GRIEVANCE_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: 'audio/webm',
    ServerSideEncryption: 'aws:kms',
    SSEKMSKeyId: process.env.KMS_KEY_ID,
    Metadata: {
      grievanceId,
      language,
      uploadedAt: new Date().toISOString()
    }
  };
  
  await s3.send(new PutObjectCommand(params));
  return `s3://${process.env.GRIEVANCE_BUCKET}/${key}`;
  */
  
  console.log('MOCK: Uploading audio to S3:', { grievanceId, language, size: audioData.length });
  return `s3://mock-bucket/grievances/${grievanceId}/audio.webm`;
}

/**
 * Transcribe audio using Amazon Transcribe
 */
async function transcribeAudio(audioS3Uri, language) {
  // MOCK: In production, use Amazon Transcribe
  /*
  const jobName = `grievance_${Date.now()}`;
  
  const startParams = {
    TranscriptionJobName: jobName,
    LanguageCode: language,
    MediaFormat: 'webm',
    Media: {
      MediaFileUri: audioS3Uri
    },
    OutputBucketName: process.env.TRANSCRIPTION_BUCKET
  };
  
  await transcribe.send(new StartTranscriptionJobCommand(startParams));
  
  // Poll for completion
  let status = 'IN_PROGRESS';
  let transcript = '';
  
  while (status === 'IN_PROGRESS') {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const getParams = { TranscriptionJobName: jobName };
    const result = await transcribe.send(new GetTranscriptionJobCommand(getParams));
    status = result.TranscriptionJob.TranscriptionJobStatus;
    
    if (status === 'COMPLETED') {
      const transcriptUri = result.TranscriptionJob.Transcript.TranscriptFileUri;
      const response = await fetch(transcriptUri);
      const data = await response.json();
      transcript = data.results.transcripts[0].transcript;
    }
  }
  
  return transcript;
  */
  
  // MOCK: Return sample transcript
  console.log('MOCK: Transcribing audio with Amazon Transcribe');
  const mockTranscripts = [
    'मुझे काम पर सुरक्षा उपकरण नहीं दिए गए हैं और यह बहुत खतरनाक है',
    'ठेकेदार ने मुझे पिछले महीने का वेतन नहीं दिया है',
    'काम की जगह पर उत्पीड़न हो रहा है और मुझे धमकी दी जा रही है'
  ];
  return mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
}

/**
 * Analyze sentiment using Amazon Comprehend
 */
async function analyzeSentiment(text, language) {
  // MOCK: In production, use Amazon Comprehend
  /*
  const params = {
    Text: text,
    LanguageCode: language === 'hi-IN' ? 'hi' : 'en'
  };
  
  const result = await comprehend.send(new DetectSentimentCommand(params));
  return {
    sentiment: result.Sentiment,
    scores: result.SentimentScore
  };
  */
  
  console.log('MOCK: Analyzing sentiment with Amazon Comprehend');
  return {
    sentiment: 'NEGATIVE',
    scores: {
      Positive: 0.05,
      Negative: 0.85,
      Neutral: 0.08,
      Mixed: 0.02
    }
  };
}

/**
 * Extract keywords and entities using Amazon Comprehend
 */
async function extractKeywords(text, language) {
  // MOCK: In production, use Amazon Comprehend
  /*
  const keyPhrasesParams = {
    Text: text,
    LanguageCode: language === 'hi-IN' ? 'hi' : 'en'
  };
  
  const entitiesParams = {
    Text: text,
    LanguageCode: language === 'hi-IN' ? 'hi' : 'en'
  };
  
  const [keyPhrasesResult, entitiesResult] = await Promise.all([
    comprehend.send(new DetectKeyPhrasesCommand(keyPhrasesParams)),
    comprehend.send(new DetectEntitiesCommand(entitiesParams))
  ]);
  
  return {
    keyPhrases: keyPhrasesResult.KeyPhrases.map(kp => kp.Text),
    entities: entitiesResult.Entities.map(e => ({
      text: e.Text,
      type: e.Type,
      score: e.Score
    }))
  };
  */
  
  console.log('MOCK: Extracting keywords with Amazon Comprehend');
  return {
    keyPhrases: ['सुरक्षा उपकरण', 'खतरनाक', 'काम पर'],
    entities: [
      { text: 'ठेकेदार', type: 'PERSON', score: 0.95 },
      { text: 'काम की जगह', type: 'LOCATION', score: 0.88 }
    ]
  };
}

/**
 * Classify grievance category
 */
function classifyCategory(text, keywords) {
  const textLower = text.toLowerCase();
  const allKeywords = keywords.keyPhrases.map(k => k.toLowerCase());
  
  let bestMatch = 'other';
  let maxScore = 0;
  
  for (const [category, [label, categoryKeywords]] of Object.entries(CATEGORIES)) {
    let score = 0;
    categoryKeywords.forEach(keyword => {
      if (textLower.includes(keyword) || allKeywords.some(k => k.includes(keyword))) {
        score++;
      }
    });
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = category;
    }
  }
  
  return {
    category: bestMatch,
    label: CATEGORIES[bestMatch][0],
    confidence: maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.3
  };
}

/**
 * Determine severity level
 */
function determineSeverity(text, sentiment) {
  const textLower = text.toLowerCase();
  
  // Check for critical keywords
  for (const keyword of SEVERITY_KEYWORDS.critical) {
    if (textLower.includes(keyword)) {
      return 'critical';
    }
  }
  
  // Check for high severity keywords
  for (const keyword of SEVERITY_KEYWORDS.high) {
    if (textLower.includes(keyword)) {
      return 'high';
    }
  }
  
  // Use sentiment as fallback
  if (sentiment.sentiment === 'NEGATIVE' && sentiment.scores.Negative > 0.8) {
    return 'high';
  }
  
  if (sentiment.sentiment === 'NEGATIVE' && sentiment.scores.Negative > 0.6) {
    return 'medium';
  }
  
  return 'low';
}

/**
 * Notify NGOs for serious violations
 */
async function notifyNGOs(grievance, severity) {
  if (severity === 'critical' || severity === 'high') {
    // MOCK: In production, send SNS notification
    /*
    const params = {
      TopicArn: process.env.NGO_NOTIFICATION_TOPIC,
      Subject: `Urgent Grievance: ${severity.toUpperCase()}`,
      Message: JSON.stringify({
        grievanceId: grievance.grievanceId,
        category: grievance.triage.category,
        severity: severity,
        timestamp: grievance.timestamp,
        anonymous: grievance.anonymous
      })
    };
    
    await sns.send(new PublishCommand(params));
    */
    
    console.log('MOCK: Sending SNS notification to NGOs:', {
      grievanceId: grievance.grievanceId,
      severity
    });
    
    return true;
  }
  
  return false;
}

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { workerId, audioData, language = 'hi-IN', anonymous = false, metadata = {} } = body;

    // Validate required fields
    if (!audioData) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: 'Missing required field: audioData'
        })
      };
    }

    // Generate grievance ID
    const grievanceId = `grv_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const timestamp = new Date().toISOString();

    // Step 1: Upload audio to S3
    const audioS3Uri = await uploadAudioToS3(audioData, grievanceId, language);

    // Step 2: Transcribe audio
    const transcript = await transcribeAudio(audioS3Uri, language);

    // Step 3: Analyze sentiment
    const sentiment = await analyzeSentiment(transcript, language);

    // Step 4: Extract keywords and entities
    const keywords = await extractKeywords(transcript, language);

    // Step 5: Classify category
    const classification = classifyCategory(transcript, keywords);

    // Step 6: Determine severity
    const severity = determineSeverity(transcript, sentiment);

    // Create grievance record
    const grievance = {
      grievanceId,
      workerId: anonymous ? null : workerId,
      anonymous,
      audioS3Uri,
      transcript,
      language,
      timestamp,
      status: 'submitted',
      triage: {
        category: classification.category,
        categoryLabel: classification.label,
        categoryConfidence: classification.confidence,
        severity,
        sentiment: sentiment.sentiment,
        sentimentScores: sentiment.scores,
        keywords: keywords.keyPhrases,
        entities: keywords.entities
      },
      metadata: {
        ...metadata,
        ipAddress: event.requestContext?.identity?.sourceIp || 'unknown',
        userAgent: event.headers?.['User-Agent'] || 'unknown'
      },
      ngoNotified: false
    };

    // Step 7: Notify NGOs if serious
    const notified = await notifyNGOs(grievance, severity);
    grievance.ngoNotified = notified;

    // MOCK: Store grievance in DynamoDB
    // In production, uncomment this:
    /*
    const putParams = {
      TableName: process.env.GRIEVANCES_TABLE,
      Item: marshall(grievance)
    };
    await dynamodb.send(new PutItemCommand(putParams));
    */

    console.log('MOCK: Storing grievance in DynamoDB:', grievance);

    return {
      statusCode: 201,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        grievance: {
          grievanceId: grievance.grievanceId,
          timestamp: grievance.timestamp,
          status: grievance.status,
          triage: {
            category: grievance.triage.categoryLabel,
            severity: grievance.triage.severity,
            ngoNotified: grievance.ngoNotified
          }
        },
        message: severity === 'critical' || severity === 'high' 
          ? 'आपकी शिकायत दर्ज की गई है और तुरंत संबोधित की जाएगी / Your grievance has been recorded and will be addressed immediately'
          : 'आपकी शिकायत दर्ज की गई है / Your grievance has been recorded'
      })
    };

  } catch (error) {
    console.error('Error submitting grievance:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Failed to submit grievance',
        message: error.message
      })
    };
  }
};

// Export for testing
exports.classifyCategory = classifyCategory;
exports.determineSeverity = determineSeverity;
exports.CATEGORIES = CATEGORIES;

