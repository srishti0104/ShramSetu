/**
 * Test script to list all available Gemini models
 */

// Read API key from .env
import { config } from 'dotenv';
config();

const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ VITE_GEMINI_API_KEY not found in .env file');
  process.exit(1);
}

console.log('🔑 API Key found:', GEMINI_API_KEY.substring(0, 10) + '...');
console.log('📋 Fetching available models...\n');

// List models
const listModelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

fetch(listModelsUrl)
  .then(response => response.json())
  .then(data => {
    if (data.error) {
      console.error('❌ Error:', data.error.message);
      return;
    }

    console.log('✅ Available Models:\n');
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model, index) => {
        console.log(`${index + 1}. ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description}`);
        console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`);
        console.log('');
      });

      // Find models that support generateContent
      const contentModels = data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );

      console.log('\n🎯 Models that support generateContent (for chat):');
      contentModels.forEach(model => {
        const modelId = model.name.replace('models/', '');
        console.log(`   - ${modelId}`);
      });

      if (contentModels.length > 0) {
        const recommendedModel = contentModels[0].name.replace('models/', '');
        console.log(`\n✨ Recommended model: ${recommendedModel}`);
      }
    } else {
      console.log('No models found.');
    }
  })
  .catch(error => {
    console.error('❌ Fetch error:', error.message);
  });
