/**
 * Benefits Screen
 * 
 * @fileoverview Introduces users to key platform features and benefits
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceAssistButton from '../shared/VoiceAssistButton';
import './BenefitsScreen.css';

/**
 * Benefit cards data
 */
const BENEFITS = [
  {
    id: 1,
    icon: '🔍',
    titleEn: 'Find Jobs Near You',
    titleHi: 'अपने पास नौकरियां खोजें',
    descriptionEn: 'Get matched with jobs in your city based on your skills and location',
    descriptionHi: 'अपने कौशल और स्थान के आधार पर अपने शहर में नौकरियां प्राप्त करें'
  },
  {
    id: 2,
    icon: '💰',
    titleEn: 'Track Your Wages',
    titleHi: 'अपनी मजदूरी ट्रैक करें',
    descriptionEn: 'Digital ledger to record all payments and verify minimum wage compliance',
    descriptionHi: 'सभी भुगतानों को रिकॉर्ड करने और न्यूनतम मजदूरी अनुपालन सत्यापित करने के लिए डिजिटल खाता'
  },
  {
    id: 3,
    icon: '✓',
    titleEn: 'Secure Attendance',
    titleHi: 'सुरक्षित उपस्थिति',
    descriptionEn: 'Mark attendance with TOTP codes and maintain verified work records',
    descriptionHi: 'TOTP कोड के साथ उपस्थिति चिह्नित करें और सत्यापित कार्य रिकॉर्ड बनाए रखें'
  },
  {
    id: 4,
    icon: '🎤',
    titleEn: 'Voice-First Interface',
    titleHi: 'आवाज-प्रथम इंटरफ़ेस',
    descriptionEn: 'Use voice commands in your language to access all features easily',
    descriptionHi: 'सभी सुविधाओं तक आसानी से पहुंचने के लिए अपनी भाषा में आवाज कमांड का उपयोग करें'
  }
];

/**
 * Benefits Screen Component
 */
export default function BenefitsScreen() {
  const { state, updateState, nextStep } = useOnboarding();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const isHindi = state.language === 'hi';
  const isLastSlide = currentSlide === BENEFITS.length - 1;

  /**
   * Handle next slide
   */
  const handleNext = () => {
    if (isLastSlide) {
      updateState({ benefitsViewed: true });
      nextStep();
    } else {
      setCurrentSlide(prev => Math.min(prev + 1, BENEFITS.length - 1));
    }
  };

  /**
   * Handle skip
   */
  const handleSkip = () => {
    updateState({ benefitsViewed: true });
    nextStep();
  };

  /**
   * Handle touch start
   */
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  /**
   * Handle touch move
   */
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  /**
   * Handle touch end (swipe detection)
   */
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentSlide < BENEFITS.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  /**
   * Voice narration on slide change
   */
  useEffect(() => {
    const benefit = BENEFITS[currentSlide];
    const title = isHindi ? benefit.titleHi : benefit.titleEn;
    console.log(`[MOCK] Voice narration: ${title}`);
  }, [currentSlide, isHindi]);

  return (
    <div className="benefits-screen">
      <VoiceAssistButton />
      <ProgressIndicator step={9} total={10} />

      <div className="benefits-screen__content">
        {/* Carousel */}
        <div
          className="benefits-carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="benefits-carousel__track"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`
            }}
          >
            {BENEFITS.map(benefit => (
              <div key={benefit.id} className="benefit-card">
                <div className="benefit-card__icon">{benefit.icon}</div>
                <h2 className="benefit-card__title">
                  {isHindi ? benefit.titleHi : benefit.titleEn}
                </h2>
                <p className="benefit-card__description">
                  {isHindi ? benefit.descriptionHi : benefit.descriptionEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Dots */}
        <div className="benefits-screen__dots">
          {BENEFITS.map((_, index) => (
            <button
              key={index}
              className={`benefits-screen__dot ${
                index === currentSlide ? 'benefits-screen__dot--active' : ''
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="benefits-screen__navigation">
          <button
            className="benefits-screen__skip"
            onClick={handleSkip}
          >
            {isHindi ? 'छोड़ें' : 'Skip'}
          </button>
          <button
            className="benefits-screen__next"
            onClick={handleNext}
          >
            {isLastSlide 
              ? (isHindi ? 'शुरू करें' : 'Get Started')
              : (isHindi ? 'अगला →' : 'Next →')
            }
          </button>
        </div>
      </div>
    </div>
  );
}
