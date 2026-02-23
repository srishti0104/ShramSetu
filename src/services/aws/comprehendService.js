/**
 * Amazon Comprehend Service
 * 
 * Handles sentiment analysis and text analysis for grievances
 */

import { ComprehendClient, DetectSentimentCommand, DetectEntitiesCommand, DetectKeyPhrasesCommand } from '@aws-sdk/client-comprehend';

class ComprehendService {
  constructor() {
    this.client = new ComprehendClient({
      region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });
  }

  /**
   * Analyze sentiment of text
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code ('en' or 'hi')
   * @returns {Promise<Object>} Sentiment analysis result
   */
  async analyzeSentiment(text, languageCode = 'en') {
    try {
      const command = new DetectSentimentCommand({
        Text: text,
        LanguageCode: languageCode
      });

      const response = await this.client.send(command);

      console.log('✅ Sentiment analysis complete:', response.Sentiment);

      return {
        sentiment: response.Sentiment, // POSITIVE, NEGATIVE, NEUTRAL, MIXED
        scores: {
          positive: response.SentimentScore.Positive,
          negative: response.SentimentScore.Negative,
          neutral: response.SentimentScore.Neutral,
          mixed: response.SentimentScore.Mixed
        },
        dominantScore: Math.max(
          response.SentimentScore.Positive,
          response.SentimentScore.Negative,
          response.SentimentScore.Neutral,
          response.SentimentScore.Mixed
        )
      };
    } catch (error) {
      console.error('❌ Sentiment analysis error:', error);
      throw new Error(`Failed to analyze sentiment: ${error.message}`);
    }
  }

  /**
   * Detect entities in text (people, places, organizations, etc.)
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Entities detection result
   */
  async detectEntities(text, languageCode = 'en') {
    try {
      const command = new DetectEntitiesCommand({
        Text: text,
        LanguageCode: languageCode
      });

      const response = await this.client.send(command);

      const entities = response.Entities.map(entity => ({
        text: entity.Text,
        type: entity.Type, // PERSON, LOCATION, ORGANIZATION, etc.
        score: entity.Score
      }));

      console.log('✅ Entities detected:', entities.length);

      return {
        entities,
        count: entities.length
      };
    } catch (error) {
      console.error('❌ Entity detection error:', error);
      throw new Error(`Failed to detect entities: ${error.message}`);
    }
  }

  /**
   * Extract key phrases from text
   * @param {string} text - Text to analyze
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Key phrases result
   */
  async extractKeyPhrases(text, languageCode = 'en') {
    try {
      const command = new DetectKeyPhrasesCommand({
        Text: text,
        LanguageCode: languageCode
      });

      const response = await this.client.send(command);

      const keyPhrases = response.KeyPhrases.map(phrase => ({
        text: phrase.Text,
        score: phrase.Score
      })).sort((a, b) => b.score - a.score); // Sort by relevance

      console.log('✅ Key phrases extracted:', keyPhrases.length);

      return {
        keyPhrases,
        count: keyPhrases.length
      };
    } catch (error) {
      console.error('❌ Key phrase extraction error:', error);
      throw new Error(`Failed to extract key phrases: ${error.message}`);
    }
  }

  /**
   * Comprehensive analysis of grievance text
   * @param {string} text - Grievance text
   * @param {string} languageCode - Language code
   * @returns {Promise<Object>} Complete analysis result
   */
  async analyzeGrievance(text, languageCode = 'en') {
    try {
      console.log('🔍 Starting comprehensive grievance analysis...');

      // Run all analyses in parallel
      const [sentiment, entities, keyPhrases] = await Promise.all([
        this.analyzeSentiment(text, languageCode),
        this.detectEntities(text, languageCode),
        this.extractKeyPhrases(text, languageCode)
      ]);

      // Calculate urgency score based on sentiment
      const urgencyScore = this.calculateUrgencyScore(sentiment, keyPhrases);

      // Categorize grievance
      const category = this.categorizeGrievance(keyPhrases, entities);

      console.log('✅ Grievance analysis complete');

      return {
        sentiment,
        entities,
        keyPhrases: keyPhrases.keyPhrases.slice(0, 5), // Top 5 key phrases
        urgencyScore,
        category,
        summary: {
          sentiment: sentiment.sentiment,
          urgency: urgencyScore >= 0.7 ? 'HIGH' : urgencyScore >= 0.4 ? 'MEDIUM' : 'LOW',
          category: category,
          keyIssues: keyPhrases.keyPhrases.slice(0, 3).map(p => p.text)
        }
      };
    } catch (error) {
      console.error('❌ Grievance analysis error:', error);
      throw new Error(`Failed to analyze grievance: ${error.message}`);
    }
  }

  /**
   * Calculate urgency score based on sentiment and key phrases
   * @param {Object} sentiment - Sentiment analysis result
   * @param {Object} keyPhrases - Key phrases result
   * @returns {number} Urgency score (0-1)
   */
  calculateUrgencyScore(sentiment, keyPhrases) {
    // Base score from negative sentiment
    let score = sentiment.scores.negative;

    // Increase score if urgent keywords are present
    const urgentKeywords = ['urgent', 'emergency', 'danger', 'unsafe', 'accident', 'injury', 'critical'];
    const hasUrgentKeyword = keyPhrases.keyPhrases.some(phrase =>
      urgentKeywords.some(keyword => phrase.text.toLowerCase().includes(keyword))
    );

    if (hasUrgentKeyword) {
      score = Math.min(score + 0.3, 1.0);
    }

    return score;
  }

  /**
   * Categorize grievance based on content
   * @param {Object} keyPhrases - Key phrases result
   * @param {Object} entities - Entities result
   * @returns {string} Grievance category
   */
  categorizeGrievance(keyPhrases, entities) {
    const text = keyPhrases.keyPhrases.map(p => p.text.toLowerCase()).join(' ');

    // Safety-related keywords
    if (text.includes('safety') || text.includes('accident') || text.includes('injury') || text.includes('unsafe')) {
      return 'SAFETY';
    }

    // Payment-related keywords
    if (text.includes('payment') || text.includes('salary') || text.includes('wage') || text.includes('money')) {
      return 'PAYMENT';
    }

    // Harassment-related keywords
    if (text.includes('harassment') || text.includes('abuse') || text.includes('discrimination')) {
      return 'HARASSMENT';
    }

    // Working conditions
    if (text.includes('condition') || text.includes('environment') || text.includes('facility')) {
      return 'WORKING_CONDITIONS';
    }

    return 'OTHER';
  }

  /**
   * Get supported languages for Comprehend
   * @returns {Array} List of supported language codes
   */
  getSupportedLanguages() {
    return [
      { code: 'en', name: 'English' },
      { code: 'hi', name: 'Hindi' }
    ];
  }
}

export default new ComprehendService();
