/**
 * Polly Demo Component
 * 
 * @fileoverview Demo component to test AWS Polly integration
 */

import { useState } from 'react';
import voiceService from '../../services/voice/voiceService';
import './PollyDemo.css';

export default function PollyDemo() {
  const [text, setText] = useState('नमस्ते, मुझे मुंबई में काम चाहिए');
  const [language, setLanguage] = useState('hi');
  const [isPlaying, setIsPlaying] = useState(false);
  const [usePolly, setUsePolly] = useState(true);
  const [error, setError] = useState(null);

  const sampleTexts = {
    hi: [
      'नमस्ते, मुझे मुंबई में काम चाहिए',
      'आपकी उपस्थिति दर्ज कर ली गई है',
      'आपका वेतन खाते में जमा कर दिया गया है'
    ],
    en: [
      'Welcome to Shram Setu',
      'Your attendance has been recorded',
      'Your payment has been processed'
    ]
  };

  const handleSpeak = async () => {
    try {
      setError(null);
      setIsPlaying(true);

      // Enable/disable AWS Polly
      if (usePolly) {
        voiceService.enableAWSPolly();
      } else {
        voiceService.disableAWSServices();
      }

      await voiceService.speak(text, language, {
        onEnd: () => {
          setIsPlaying(false);
        },
        onError: (err) => {
          setError(err.message);
          setIsPlaying(false);
        }
      });
    } catch (err) {
      setError(err.message);
      setIsPlaying(false);
    }
  };

  const handleStop = () => {
    voiceService.stop();
    setIsPlaying(false);
  };

  return (
    <div className="polly-demo">
      <div className="polly-demo__header">
        <h2>🎤 AWS Polly Voice Demo</h2>
        <p>Test text-to-speech with Amazon Polly</p>
      </div>

      <div className="polly-demo__controls">
        <div className="polly-demo__toggle">
          <label>
            <input
              type="checkbox"
              checked={usePolly}
              onChange={(e) => setUsePolly(e.target.checked)}
            />
            Use AWS Polly (uncheck for Web Speech API)
          </label>
        </div>

        <div className="polly-demo__language">
          <label>Language:</label>
          <select 
            value={language} 
            onChange={(e) => {
              setLanguage(e.target.value);
              setText(sampleTexts[e.target.value][0]);
            }}
          >
            <option value="hi">Hindi (हिंदी)</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="polly-demo__samples">
          <label>Sample Texts:</label>
          <div className="polly-demo__sample-buttons">
            {sampleTexts[language].map((sample, index) => (
              <button
                key={index}
                onClick={() => setText(sample)}
                className="polly-demo__sample-btn"
              >
                Sample {index + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="polly-demo__input">
          <label>Text to speak:</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="Enter text to speak..."
          />
        </div>

        <div className="polly-demo__actions">
          <button
            onClick={handleSpeak}
            disabled={isPlaying || !text}
            className="polly-demo__btn polly-demo__btn--primary"
          >
            {isPlaying ? '🔊 Speaking...' : '▶️ Speak'}
          </button>
          
          <button
            onClick={handleStop}
            disabled={!isPlaying}
            className="polly-demo__btn polly-demo__btn--secondary"
          >
            ⏹️ Stop
          </button>
        </div>

        {error && (
          <div className="polly-demo__error">
            ❌ Error: {error}
          </div>
        )}

        {isPlaying && (
          <div className="polly-demo__status">
            <div className="polly-demo__pulse" />
            <span>Playing with {usePolly ? 'AWS Polly' : 'Web Speech API'}...</span>
          </div>
        )}
      </div>

      <div className="polly-demo__info">
        <h3>ℹ️ Information</h3>
        <ul>
          <li><strong>AWS Polly:</strong> High-quality neural voices, works offline after caching</li>
          <li><strong>Web Speech API:</strong> Browser-based, no AWS costs, requires internet</li>
          <li><strong>Hindi Voice:</strong> Aditi (standard engine)</li>
          <li><strong>English Voice:</strong> Kajal (neural engine)</li>
          <li><strong>Cost:</strong> ~$0.000016 per request (basically free!)</li>
        </ul>
      </div>
    </div>
  );
}
