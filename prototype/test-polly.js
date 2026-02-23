import { PollyClient, SynthesizeSpeechCommand } from '@aws-sdk/client-polly';
import fs from 'fs';

const polly = new PollyClient({ region: 'ap-south-1' });

async function testPolly() {
  console.log('🎤 Testing Amazon Polly (Text-to-Speech)...\n');

  const testCases = [
    {
      name: 'Hindi - Job Search',
      text: 'नमस्ते, मुझे मुंबई में काम चाहिए',
      voiceId: 'Aditi',
      languageCode: 'hi-IN',
      engine: 'standard',
      filename: 'test-hindi-job.mp3'
    },
    {
      name: 'Hindi - Attendance',
      text: 'आपकी उपस्थिति दर्ज कर ली गई है',
      voiceId: 'Aditi',
      languageCode: 'hi-IN',
      engine: 'standard',
      filename: 'test-hindi-attendance.mp3'
    },
    {
      name: 'English - Welcome',
      text: 'Welcome to Shram Setu. Your attendance has been recorded.',
      voiceId: 'Kajal',
      languageCode: 'en-IN',
      engine: 'neural',
      filename: 'test-english-welcome.mp3'
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Text: ${testCase.text}`);
    
    const params = {
      Text: testCase.text,
      OutputFormat: 'mp3',
      VoiceId: testCase.voiceId,
      LanguageCode: testCase.languageCode,
      Engine: testCase.engine
    };

    try {
      const command = new SynthesizeSpeechCommand(params);
      const response = await polly.send(command);
      
      // Save audio to file
      const audioStream = response.AudioStream;
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      fs.writeFileSync(testCase.filename, audioBuffer);
      
      console.log(`✅ Success! Audio saved to ${testCase.filename}`);
      console.log(`   Voice: ${testCase.voiceId} (${testCase.languageCode})`);
      console.log(`   Size: ${(audioBuffer.length / 1024).toFixed(2)} KB\n`);
    } catch (error) {
      console.error(`❌ Error: ${error.message}\n`);
    }
  }

  console.log('🎉 All tests completed!');
  console.log('📁 Play the MP3 files to hear the voices.');
  console.log('💰 Cost: ~$0.000048 (basically free!)');
}

testPolly();
