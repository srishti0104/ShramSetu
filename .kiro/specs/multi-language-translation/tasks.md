# Implementation Plan: Multi-Language Translation System

## Overview

Implement a comprehensive i18n system for ShramSetu supporting 10 Indian languages with proper font rendering, language persistence, and lazy loading. The implementation uses react-i18next for translation management and a custom LanguageProvider for state management.

## Tasks

- [x] 1. Set up i18n infrastructure and configuration
  - [x] 1.1 Install dependencies and create i18n configuration
    - Install react-i18next and i18next packages
    - Create `/src/utils/i18n.js` with i18n initialization logic
    - Configure supported languages, namespaces, and fallback behavior
    - _Requirements: 2.1, 2.4, 5.4_

  - [x] 1.2 Create language configuration constants
    - Create `/src/constants/languages.js` with LANGUAGE_CONFIGS object
    - Define all 10 languages with code, name, nativeName, flag, font, and direction
    - _Requirements: 2.1, 4.2, 4.3_

- [-] 2. Create translation files for all languages
  - [x] 2.1 Create English translation file structure
    - Create `/src/locales/en/translation.json` with all namespaces
    - Define common namespace with buttons, labels, messages, and errors
    - Define feature-specific namespaces: onboarding, dashboard, jobs, attendance, ledger, payslip, grievance, rating, sync
    - _Requirements: 2.4, 2.5_

  - [ ] 2.2 Create Hindi translation file
    - Create `/src/locales/hi/translation.json` with Hindi translations
    - Mirror English file structure with translated content
    - _Requirements: 2.1, 2.3_

  - [x] 2.3 Create translation files for remaining 8 languages
    - Create translation files for Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Bengali, and Punjabi
    - Ensure all files match English structure
    - _Requirements: 2.1, 2.3_

- [x] 3. Implement LanguageProvider and context
  - [x] 3.1 Create LanguageContext with state management
    - Create `/src/contexts/LanguageContext.jsx`
    - Implement LanguageProvider component with language state
    - Initialize i18n on mount and load saved language from localStorage
    - Provide language, setLanguage, t function, and isLoading state
    - _Requirements: 1.3, 1.4, 2.2, 6.1_

  - [x] 3.2 Implement language switching logic
    - Create setLanguage function with lazy loading support
    - Check if translation already loaded, otherwise dynamically import
    - Update i18n instance with new language
    - Persist to localStorage and trigger re-render
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 6.2, 6.3, 6.4_

  - [ ]* 3.3 Write property test for language persistence
    - **Property 1: Language Persistence Round Trip**
    - **Validates: Requirements 1.1, 1.3, 3.4**

  - [x] 3.4 Create custom useTranslation hook
    - Create `/src/hooks/useTranslation.js`
    - Export hook that accesses LanguageContext
    - Return t function, language, and setLanguage
    - _Requirements: 2.2, 2.3_

  - [ ]* 3.5 Write property test for translation key lookup
    - **Property 4: Translation Key Lookup**
    - **Validates: Requirements 2.3**

- [x] 4. Implement language persistence utilities
  - [x] 4.1 Create persistLanguage utility function
    - Create `/src/utils/languageManager.js`
    - Implement persistLanguage function to save to localStorage
    - Update OnboardingContext if it exists
    - _Requirements: 1.1, 1.2, 3.4_

  - [x] 4.2 Create loadSavedLanguage utility function
    - Implement loadSavedLanguage to retrieve from localStorage
    - Return default 'en' if no preference exists
    - _Requirements: 1.3, 1.4_

  - [ ]* 4.3 Write property test for onboarding context sync
    - **Property 2: Onboarding Context Synchronization**
    - **Validates: Requirements 1.2**

- [x] 5. Implement font loading system
  - [x] 5.1 Create font loader utility
    - Create `/src/utils/fontLoader.js`
    - Implement loadFonts function that loads font based on language code
    - Apply font to document root with font-display: swap
    - Handle font loading errors with fallback and logging
    - _Requirements: 4.1, 4.4, 4.5_

  - [x] 5.2 Integrate font loading into LanguageProvider
    - Call loadFonts when language changes
    - Call loadFonts on initial mount with saved language
    - _Requirements: 4.1, 1.5_

  - [ ]* 5.3 Write property test for font loading
    - **Property 7: Font Loading and Application**
    - **Validates: Requirements 4.1, 4.4**

- [x] 6. Create LanguageSwitcher component
  - [x] 6.1 Implement LanguageSwitcher UI component
    - Create `/src/components/LanguageSwitcher.jsx`
    - Display all 10 languages with native names and flags
    - Support dropdown variant for compact display
    - Handle language selection and trigger setLanguage
    - Show loading state during language switch
    - _Requirements: 3.1, 3.2_

  - [x] 6.2 Style LanguageSwitcher component
    - Create `/src/components/LanguageSwitcher.css`
    - Ensure responsive design and accessibility
    - Support flexible layouts for text length variations
    - _Requirements: 7.1, 7.2, 7.3_

- [-] 7. Integrate translation system into existing components
  - [x] 7.1 Wrap App with LanguageProvider
    - Update `/src/App.jsx` to wrap content with LanguageProvider
    - Ensure LanguageProvider is above all components that need translations
    - _Requirements: 2.2_

  - [x] 7.2 Update onboarding flow with language persistence
    - Update language selection step in onboarding to call persistLanguage
    - Ensure OnboardingContext state is updated with selected language
    - _Requirements: 1.1, 1.2_

  - [x] 7.3 Add LanguageSwitcher to dashboard/settings
    - Place LanguageSwitcher component in appropriate location (header or settings)
    - Ensure it's accessible post-onboarding
    - _Requirements: 3.1_

  - [x] 7.4 Implement English fallback logic
    - Configure i18n with English as fallback language
    - Add missing translation warning logging
    - Test fallback behavior with missing keys
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 7.5 Write property test for English fallback
    - **Property 8: English Fallback for Missing Keys**
    - **Validates: Requirements 5.1**

  - [x] 7.6 Apply text direction and regional script styling
    - Update CSS to respect direction property from language config
    - Add appropriate line-height and letter-spacing for regional scripts
    - Ensure flexible layouts adapt to text length variations
    - _Requirements: 7.3, 7.4, 7.5_

  - [ ]* 7.7 Write property test for parameter interpolation
    - **Property 5: Parameter Interpolation**
    - **Validates: Requirements 2.5**

- [x] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Translation files for all 10 languages should mirror the English structure exactly
- Font loading is critical for regional script readability
- Lazy loading ensures only selected language files are loaded, improving performance
- English fallback ensures app remains functional even with missing translations
- Property tests validate universal correctness properties across all languages
