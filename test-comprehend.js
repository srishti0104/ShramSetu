import { ComprehendClient, DetectSentimentCommand, DetectEntitiesCommand } from '@aws-sdk/client-comprehend';

const comprehend = new ComprehendClient({ region: 'ap-south-1' });

async function testComprehend() {
  console.log('🧠 Testing Amazon Comprehend (NLP & Sentiment Analysis)...\n');

  const testCases = [
    {
      name: 'Urgent Grievance (Hindi)',
      text: 'मुझे तीन महीने से वेतन नहीं मिला है। मेरे परिवार को खाना नहीं मिल रहा है।',
      language: 'hi'
    },
    {
      name: 'Positive Feedback (English)',
      text: 'The contractor paid me on time. Very happy with the work conditions.',
      language: 'en'
    },
    {
      name: 'Safety Concern (English)',
      text: 'No safety equipment provided at construction site. Very dangerous conditions.',
      language: 'en'
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Text: ${testCase.text}\n`);
    
    try {
      // Detect sentiment
      const sentimentParams = {
        Text: testCase.text,
        LanguageCode: testCase.language
      };

      const sentimentCommand = new DetectSentimentCommand(sentimentParams);
      const sentimentResponse = await comprehend.send(sentimentCommand);
      
      console.log('📊 Sentiment Analysis:');
      console.log(`   Overall: ${sentimentResponse.Sentiment}`);
      console.log(`   Positive: ${(sentimentResponse.SentimentScore.Positive * 100).toFixed(1)}%`);
      console.log(`   Negative: ${(sentimentResponse.SentimentScore.Negative * 100).toFixed(1)}%`);
      console.log(`   Neutral: ${(sentimentResponse.SentimentScore.Neutral * 100).toFixed(1)}%`);
      console.log(`   Mixed: ${(sentimentResponse.SentimentScore.Mixed * 100).toFixed(1)}%`);

      // Detect entities (only for English)
      if (testCase.language === 'en') {
        const entitiesParams = {
          Text: testCase.text,
          LanguageCode: testCase.language
        };

        const entitiesCommand = new DetectEntitiesCommand(entitiesParams);
        const entitiesResponse = await comprehend.send(entitiesCommand);
        
        if (entitiesResponse.Entities.length > 0) {
          console.log('\n🏷️  Detected Entities:');
          entitiesResponse.Entities.forEach(entity => {
            console.log(`   - ${entity.Text} (${entity.Type})`);
          });
        }
      }

      console.log('\n✅ Analysis completed!\n');
      console.log('─'.repeat(60) + '\n');
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 All tests completed!');
  console.log('💡 Use Case: Automatically detect urgent grievances based on sentiment');
  console.log('💰 Cost: First 50,000 units free per month, then $0.0001 per unit');
}

testComprehend();
