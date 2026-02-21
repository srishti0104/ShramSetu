# Design Document: Login and Onboarding Flow

## Overview

This document details the complete login and onboarding experience for Shramik-Setu, covering the multi-step flow from language selection to main interface access. The design prioritizes accessibility, voice-first interaction, and simplicity for users with varying literacy levels.

## Design Principles

1. **Progressive Disclosure**: Show one step at a time to avoid overwhelming users
2. **Visual + Voice**: Every screen supports both visual and voice interaction
3. **Large Touch Targets**: Minimum 48x48dp for all interactive elements
4. **High Contrast**: WCAG AAA compliant color schemes
5. **Error Prevention**: Validate inputs in real-time with helpful guidance
6. **Quick Exit**: Allow users to save progress and return later

## Onboarding Flow Architecture

### Flow Diagram

```
┌─────────────────────┐
│  Language Selection │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│   Role Selection    │
│ (Worker/Employer)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Auth Method Choice │
│ (Phone/E-Shram)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Phone/Card Entry   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  OTP Verification   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Location Fetch     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Occupation Select   │
│  (Workers only)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Personal Details   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Benefits Screen    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Disclaimer/Terms   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Main Interface     │
└─────────────────────┘
```


## Screen-by-Screen Design

### Screen 1: Language Selection

**Purpose**: Allow users to choose their preferred language for the entire app experience.

**Visual Design**:
- Full-screen grid layout with language cards
- Each card shows: Language name in native script + English name
- Large, colorful cards with flag/cultural icons
- Voice button at top-right for audio assistance

**Languages Supported**:
1. हिंदी (Hindi)
2. English
3. मराठी (Marathi)
4. ગુજરાતી (Gujarati)
5. தமிழ் (Tamil)
6. తెలుగు (Telugu)
7. ಕನ್ನಡ (Kannada)
8. മലയാളം (Malayalam)
9. বাংলা (Bengali)
10. ਪੰਜਾਬੀ (Punjabi)

**Interactions**:
- Tap any language card to select
- Voice button reads all language names
- Selected language highlights with checkmark
- Smooth transition to next screen

**Component Structure**:
```jsx
<LanguageSelectionScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={1} total={10} />
  <Title>Choose Your Language / अपनी भाषा चुनें</Title>
  <LanguageGrid>
    {languages.map(lang => (
      <LanguageCard 
        key={lang.code}
        language={lang}
        onSelect={handleLanguageSelect}
      />
    ))}
  </LanguageGrid>
</LanguageSelectionScreen>
```


### Screen 2: Role Selection

**Purpose**: Identify user as Worker or Employer to customize the experience.

**Visual Design**:
- Two large cards side-by-side (or stacked on small screens)
- Worker card: Blue theme with worker icon (hard hat, tools)
- Employer card: Green theme with business icon (briefcase, building)
- Each card shows role name and brief description
- Voice narration available

**Card Content**:

**Worker Card**:
- Icon: 👷 Worker with hard hat
- Title: "मैं श्रमिक हूं" / "I am a Worker"
- Description: "Find jobs, track wages, mark attendance"

**Employer Card**:
- Icon: 💼 Briefcase
- Title: "मैं नियोक्ता हूं" / "I am an Employer"
- Description: "Post jobs, manage workers, track payments"

**Interactions**:
- Tap card to select role
- Card expands with animation on selection
- Voice reads card content on long-press
- Back button to return to language selection

**Component Structure**:
```jsx
<RoleSelectionScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={2} total={10} />
  <BackButton />
  <Title>{t('selectYourRole')}</Title>
  <RoleCardsContainer>
    <RoleCard
      role="worker"
      icon={WorkerIcon}
      title={t('iAmWorker')}
      description={t('workerDescription')}
      onSelect={() => handleRoleSelect('worker')}
    />
    <RoleCard
      role="employer"
      icon={EmployerIcon}
      title={t('iAmEmployer')}
      description={t('employerDescription')}
      onSelect={() => handleRoleSelect('employer')}
    />
  </RoleCardsContainer>
</RoleSelectionScreen>
```


### Screen 3: Authentication Method Selection

**Purpose**: Choose between Phone Number or E-Shram Card authentication.

**Visual Design**:
- Two authentication method cards
- Phone card: Shows phone icon and number input preview
- E-Shram card: Shows card icon and card number preview (Workers only)
- Clear visual hierarchy with icons and text

**For Workers**:
```
┌─────────────────────────────┐
│  📱 Phone Number            │
│  Login with mobile number   │
│  and OTP                    │
└─────────────────────────────┘

┌─────────────────────────────┐
│  🆔 E-Shram Card            │
│  Login with verified        │
│  worker credentials         │
└─────────────────────────────┘
```

**For Employers**:
```
┌─────────────────────────────┐
│  📱 Phone Number            │
│  Login with mobile number   │
│  and OTP                    │
└─────────────────────────────┘
```

**Interactions**:
- Tap card to select authentication method
- Smooth transition to input screen
- Voice explains each option
- Back button to return to role selection

**Component Structure**:
```jsx
<AuthMethodScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={3} total={10} />
  <BackButton />
  <Title>{t('howToLogin')}</Title>
  <AuthMethodCards>
    <AuthMethodCard
      method="phone"
      icon={PhoneIcon}
      title={t('phoneNumber')}
      description={t('loginWithOTP')}
      onSelect={() => handleMethodSelect('phone')}
    />
    {role === 'worker' && (
      <AuthMethodCard
        method="eshram"
        icon={CardIcon}
        title={t('eShramCard')}
        description={t('verifiedWorkerLogin')}
        onSelect={() => handleMethodSelect('eshram')}
      />
    )}
  </AuthMethodCards>
</AuthMethodScreen>
```


### Screen 4A: Phone Number Entry

**Purpose**: Collect and validate user's mobile number.

**Visual Design**:
- Large phone number input field
- Country code prefix (+91) pre-filled
- Numeric keypad automatically shown
- Real-time validation feedback
- Clear error messages

**Input Field**:
```
┌─────────────────────────────────┐
│  📱 Enter Mobile Number         │
│                                 │
│  +91 |_|_|_|_|_|_|_|_|_|_|    │
│                                 │
│  ✓ We'll send you an OTP       │
└─────────────────────────────────┘

[    Send OTP    ]
```

**Validation Rules**:
- Must be exactly 10 digits
- Must start with 6, 7, 8, or 9
- Real-time validation as user types
- Green checkmark when valid

**Interactions**:
- Auto-focus on input field
- Numeric keyboard opens automatically
- Voice input option available
- "Send OTP" button enabled when valid
- Loading state while sending OTP

**Component Structure**:
```jsx
<PhoneNumberScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={4} total={10} />
  <BackButton />
  <Title>{t('enterMobileNumber')}</Title>
  <PhoneInputContainer>
    <CountryCode>+91</CountryCode>
    <PhoneInput
      type="tel"
      maxLength={10}
      value={phoneNumber}
      onChange={handlePhoneChange}
      onValidate={validatePhone}
      autoFocus
    />
    <ValidationIcon valid={isValid} />
  </PhoneInputContainer>
  <HelpText>{t('otpWillBeSent')}</HelpText>
  <SendOTPButton
    disabled={!isValid || isSending}
    onClick={handleSendOTP}
  >
    {isSending ? <Spinner /> : t('sendOTP')}
  </SendOTPButton>
  <VoiceInputButton onClick={handleVoiceInput} />
</PhoneNumberScreen>
```


### Screen 4B: E-Shram Card Entry

**Purpose**: Collect and validate E-Shram card number for workers.

**Visual Design**:
- Large card number input field
- E-Shram card visual reference
- Option to scan card or manual entry
- Real-time validation

**Input Options**:
```
┌─────────────────────────────────┐
│  🆔 E-Shram Card Number         │
│                                 │
│  [Scan Card] [Enter Manually]  │
│                                 │
│  Card Number:                   │
│  |_|_|_|_|_|_|_|_|_|_|_|_|    │
│                                 │
│  ✓ Verifying with database...  │
└─────────────────────────────────┘

[    Verify Card    ]
```

**Validation Process**:
1. Format validation (12 digits)
2. Government database verification
3. Extract worker information
4. Link to mobile number for OTP

**Interactions**:
- Scan card using camera (OCR)
- Manual entry with numeric keyboard
- Voice input option
- Loading state during verification
- Fallback to phone auth if verification fails

**Component Structure**:
```jsx
<EShramCardScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={4} total={10} />
  <BackButton />
  <Title>{t('enterEShramCard')}</Title>
  <InputMethodToggle>
    <ToggleButton
      active={inputMethod === 'scan'}
      onClick={() => setInputMethod('scan')}
    >
      {t('scanCard')}
    </ToggleButton>
    <ToggleButton
      active={inputMethod === 'manual'}
      onClick={() => setInputMethod('manual')}
    >
      {t('enterManually')}
    </ToggleButton>
  </InputMethodToggle>
  
  {inputMethod === 'scan' ? (
    <CardScanner onScan={handleCardScan} />
  ) : (
    <CardNumberInput
      value={cardNumber}
      onChange={handleCardChange}
      maxLength={12}
    />
  )}
  
  <VerifyButton
    disabled={!isValidCard || isVerifying}
    onClick={handleVerifyCard}
  >
    {isVerifying ? <Spinner /> : t('verifyCard')}
  </VerifyButton>
  
  <FallbackLink onClick={() => switchToPhoneAuth()}>
    {t('usePhoneInstead')}
  </FallbackLink>
</EShramCardScreen>
```


### Screen 5: OTP Verification

**Purpose**: Verify user's mobile number with 6-digit OTP.

**Visual Design**:
- 6 large input boxes for OTP digits
- Countdown timer showing time remaining
- Resend OTP option after timer expires
- Clear success/error feedback

**OTP Input**:
```
┌─────────────────────────────────┐
│  Enter OTP                      │
│  Sent to +91 98765xxxxx         │
│                                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐
│  │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘
│                                 │
│  ⏱️ Resend OTP in 00:45        │
│                                 │
│  [Verify OTP]                   │
│                                 │
│  Didn't receive? [Resend]      │
└─────────────────────────────────┘
```

**Validation States**:
- Entering: Blue border on active box
- Complete: All boxes filled
- Verifying: Loading spinner
- Success: Green checkmark animation
- Error: Red shake animation + error message

**Interactions**:
- Auto-focus on first box
- Auto-advance to next box on digit entry
- Auto-submit when all 6 digits entered
- Backspace moves to previous box
- Paste support for full OTP
- Voice input option
- Resend OTP after 60 seconds

**Component Structure**:
```jsx
<OTPVerificationScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={5} total={10} />
  <BackButton />
  <Title>{t('enterOTP')}</Title>
  <PhoneDisplay>
    {t('sentTo')} +91 {maskPhone(phoneNumber)}
  </PhoneDisplay>
  
  <OTPInputContainer>
    {[0, 1, 2, 3, 4, 5].map(index => (
      <OTPBox
        key={index}
        value={otp[index]}
        onChange={(value) => handleOTPChange(index, value)}
        onKeyDown={(e) => handleKeyDown(index, e)}
        autoFocus={index === 0}
        error={hasError}
      />
    ))}
  </OTPInputContainer>
  
  <TimerDisplay>
    {canResend ? (
      <ResendButton onClick={handleResendOTP}>
        {t('resendOTP')}
      </ResendButton>
    ) : (
      <Timer>{t('resendIn')} {formatTime(timeLeft)}</Timer>
    )}
  </TimerDisplay>
  
  <VerifyButton
    disabled={otp.length < 6 || isVerifying}
    onClick={handleVerifyOTP}
  >
    {isVerifying ? <Spinner /> : t('verifyOTP')}
  </VerifyButton>
  
  {error && <ErrorMessage>{error}</ErrorMessage>}
</OTPVerificationScreen>
```


### Screen 6: Location Auto-Fetch

**Purpose**: Automatically detect user's location for job matching.

**Visual Design**:
- Map preview showing detected location
- Location details (city, state, pincode)
- Permission request explanation
- Manual entry fallback option

**Location Display**:
```
┌─────────────────────────────────┐
│  📍 Your Location               │
│                                 │
│  [  Map Preview with Pin  ]    │
│                                 │
│  📌 Mumbai, Maharashtra         │
│     Pincode: 400001             │
│                                 │
│  ✓ Location detected            │
│                                 │
│  [Confirm Location]             │
│  [Enter Manually]               │
└─────────────────────────────────┘
```

**Permission Flow**:
1. Explain why location is needed
2. Request browser/device permission
3. Show loading while fetching
4. Display detected location
5. Allow confirmation or manual entry

**Manual Entry Option**:
- City dropdown (major Indian cities)
- State dropdown
- Pincode input field
- Address text field (optional)

**Interactions**:
- Auto-request location permission on screen load
- Show loading animation while fetching
- Display map with pin when location found
- Allow dragging pin to adjust location
- Voice narration of detected location
- Easy switch to manual entry

**Component Structure**:
```jsx
<LocationScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={6} total={10} />
  <BackButton />
  <Title>{t('yourLocation')}</Title>
  
  {!hasPermission ? (
    <PermissionRequest>
      <Icon>📍</Icon>
      <Explanation>{t('locationExplanation')}</Explanation>
      <AllowButton onClick={requestPermission}>
        {t('allowLocation')}
      </AllowButton>
      <ManualEntryLink onClick={() => setManualEntry(true)}>
        {t('enterManually')}
      </ManualEntryLink>
    </PermissionRequest>
  ) : isFetching ? (
    <LoadingState>
      <Spinner />
      <Text>{t('detectingLocation')}</Text>
    </LoadingState>
  ) : location ? (
    <LocationDisplay>
      <MapPreview
        latitude={location.latitude}
        longitude={location.longitude}
        onPinDrag={handlePinDrag}
      />
      <LocationDetails>
        <City>{location.city}</City>
        <State>{location.state}</State>
        <Pincode>{t('pincode')}: {location.pincode}</Pincode>
      </LocationDetails>
      <ConfirmButton onClick={handleConfirmLocation}>
        {t('confirmLocation')}
      </ConfirmButton>
      <ManualEntryLink onClick={() => setManualEntry(true)}>
        {t('editLocation')}
      </ManualEntryLink>
    </LocationDisplay>
  ) : (
    <ManualLocationEntry
      onSubmit={handleManualLocation}
    />
  )}
</LocationScreen>
```


### Screen 7: Occupation Selection (Workers Only)

**Purpose**: Allow workers to select their skills/occupations for job matching.

**Visual Design**:
- Grid of occupation cards with icons
- Multi-select capability
- Search/filter option
- Custom skill entry option

**Occupation Grid**:
```
┌─────────────────────────────────┐
│  Select Your Skills             │
│  (Choose all that apply)        │
│                                 │
│  🔍 [Search skills...]          │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ 🧱  │ │ 🎨  │ │ 🔧  │       │
│  │Mason│ │Paint│ │Plumb│       │
│  └─────┘ └─────┘ └─────┘       │
│                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │ ⚡  │ │ 🪚  │ │ 🏗️  │       │
│  │Elect│ │Carp │ │Labor│       │
│  └─────┘ └─────┘ └─────┘       │
│                                 │
│  + Add Custom Skill             │
│                                 │
│  Selected: Mason, Painter (2)   │
│  [Continue]                     │
└─────────────────────────────────┘
```

**Common Occupations**:
1. 🧱 Mason (राजमिस्त्री)
2. 🎨 Painter (पेंटर)
3. 🔧 Plumber (प्लंबर)
4. ⚡ Electrician (इलेक्ट्रीशियन)
5. 🪚 Carpenter (बढ़ई)
6. 🏗️ Construction Labor (निर्माण मजदूर)
7. 🚜 Driver (ड्राइवर)
8. 🧹 Cleaner (सफाई कर्मचारी)
9. 🔨 Welder (वेल्डर)
10. 🏠 Domestic Worker (घरेलू कामगार)

**Interactions**:
- Tap card to select/deselect (multi-select)
- Selected cards show checkmark and highlight
- Search filters occupation list
- Voice search available
- Add custom skill with text input
- Minimum 1 skill required to continue

**Component Structure**:
```jsx
<OccupationScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={7} total={10} />
  <BackButton />
  <Title>{t('selectYourSkills')}</Title>
  <Subtitle>{t('chooseAllThatApply')}</Subtitle>
  
  <SearchBar
    placeholder={t('searchSkills')}
    value={searchQuery}
    onChange={handleSearch}
    onVoiceSearch={handleVoiceSearch}
  />
  
  <OccupationGrid>
    {filteredOccupations.map(occupation => (
      <OccupationCard
        key={occupation.id}
        occupation={occupation}
        selected={selectedSkills.includes(occupation.id)}
        onToggle={() => handleToggleSkill(occupation.id)}
      />
    ))}
  </OccupationGrid>
  
  <AddCustomSkill onClick={() => setShowCustomInput(true)}>
    + {t('addCustomSkill')}
  </AddCustomSkill>
  
  {showCustomInput && (
    <CustomSkillInput
      onAdd={handleAddCustomSkill}
      onCancel={() => setShowCustomInput(false)}
    />
  )}
  
  <SelectedCount>
    {t('selected')}: {selectedSkills.length}
  </SelectedCount>
  
  <ContinueButton
    disabled={selectedSkills.length === 0}
    onClick={handleContinue}
  >
    {t('continue')}
  </ContinueButton>
</OccupationScreen>
```


### Screen 8: Personal Details

**Purpose**: Collect user's personal information to complete profile.

**Visual Design**:
- Form with large input fields
- Profile photo upload/capture
- Age selector (dropdown or picker)
- Gender selection
- Name input with voice option

**Form Layout**:
```
┌─────────────────────────────────┐
│  Complete Your Profile          │
│                                 │
│  ┌─────────────┐                │
│  │   📷 Photo  │  [Upload]      │
│  │   Placeholder│  [Capture]    │
│  └─────────────┘                │
│                                 │
│  Full Name *                    │
│  [________________]  🎤         │
│                                 │
│  Age *                          │
│  [Select Age ▼]                 │
│                                 │
│  Gender *                       │
│  ○ Male   ○ Female   ○ Other   │
│                                 │
│  * Required fields              │
│                                 │
│  [Complete Profile]             │
└─────────────────────────────────┘
```

**Photo Upload Options**:
1. Take photo with camera
2. Upload from gallery
3. Skip (use default avatar)

**Field Validations**:
- Name: Minimum 2 characters, letters only
- Age: Between 18-70 years
- Gender: Required selection
- Photo: Optional but recommended

**Interactions**:
- Auto-focus on name field
- Voice input for name
- Age dropdown with common ages
- Large radio buttons for gender
- Photo preview after upload
- Real-time validation feedback
- Save progress automatically

**Component Structure**:
```jsx
<PersonalDetailsScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={8} total={10} />
  <BackButton />
  <Title>{t('completeYourProfile')}</Title>
  
  <Form onSubmit={handleSubmit}>
    <PhotoUpload>
      <PhotoPreview src={photo || defaultAvatar} />
      <PhotoActions>
        <CaptureButton onClick={handleCapturePhoto}>
          📷 {t('takePhoto')}
        </CaptureButton>
        <UploadButton onClick={handleUploadPhoto}>
          📁 {t('uploadPhoto')}
        </UploadButton>
      </PhotoActions>
      <SkipPhotoLink onClick={() => setPhoto(null)}>
        {t('skipPhoto')}
      </SkipPhotoLink>
    </PhotoUpload>
    
    <FormField>
      <Label required>{t('fullName')}</Label>
      <InputWithVoice
        type="text"
        value={name}
        onChange={handleNameChange}
        onVoiceInput={handleVoiceName}
        placeholder={t('enterYourName')}
        error={nameError}
      />
      {nameError && <ErrorText>{nameError}</ErrorText>}
    </FormField>
    
    <FormField>
      <Label required>{t('age')}</Label>
      <AgeSelector
        value={age}
        onChange={handleAgeChange}
        min={18}
        max={70}
      />
    </FormField>
    
    <FormField>
      <Label required>{t('gender')}</Label>
      <GenderSelector>
        <RadioButton
          value="male"
          checked={gender === 'male'}
          onChange={() => setGender('male')}
          label={t('male')}
        />
        <RadioButton
          value="female"
          checked={gender === 'female'}
          onChange={() => setGender('female')}
          label={t('female')}
        />
        <RadioButton
          value="other"
          checked={gender === 'other'}
          onChange={() => setGender('other')}
          label={t('other')}
        />
      </GenderSelector>
    </FormField>
    
    <RequiredNote>* {t('requiredFields')}</RequiredNote>
    
    <SubmitButton
      disabled={!isFormValid}
      type="submit"
    >
      {t('completeProfile')}
    </SubmitButton>
  </Form>
</PersonalDetailsScreen>
```


### Screen 9: Benefits & Features

**Purpose**: Introduce users to key platform features and benefits.

**Visual Design**:
- Swipeable carousel of benefit cards
- Large icons and simple text
- Progress dots showing current slide
- Voice narration for each benefit
- Skip or Next navigation

**Benefit Cards**:

**Card 1: Job Matching**
```
┌─────────────────────────────────┐
│         🔍                      │
│    Find Jobs Near You           │
│                                 │
│  Get matched with jobs in       │
│  your city based on your        │
│  skills and location            │
│                                 │
│  ● ○ ○ ○                        │
│  [Skip]            [Next →]    │
└─────────────────────────────────┘
```

**Card 2: Wage Tracking**
```
┌─────────────────────────────────┐
│         💰                      │
│    Track Your Wages             │
│                                 │
│  Digital ledger to record       │
│  all payments and verify        │
│  minimum wage compliance        │
│                                 │
│  ○ ● ○ ○                        │
│  [Skip]            [Next →]    │
└─────────────────────────────────┘
```

**Card 3: Attendance**
```
┌─────────────────────────────────┐
│         ✓                       │
│    Secure Attendance            │
│                                 │
│  Mark attendance with TOTP      │
│  codes and maintain verified    │
│  work records                   │
│                                 │
│  ○ ○ ● ○                        │
│  [Skip]            [Next →]    │
└─────────────────────────────────┘
```

**Card 4: Voice Support**
```
┌─────────────────────────────────┐
│         🎤                      │
│    Voice-First Interface        │
│                                 │
│  Use voice commands in your     │
│  language to access all         │
│  features easily                │
│                                 │
│  ○ ○ ○ ●                        │
│  [Skip]         [Get Started]  │
└─────────────────────────────────┘
```

**Interactions**:
- Swipe left/right to navigate cards
- Tap Next to advance
- Tap Skip to jump to disclaimer
- Auto-play voice narration (optional)
- Progress dots show position

**Component Structure**:
```jsx
<BenefitsScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={9} total={10} />
  
  <BenefitsCarousel
    currentSlide={currentSlide}
    onSlideChange={setCurrentSlide}
  >
    <BenefitCard
      icon="🔍"
      title={t('findJobsNearYou')}
      description={t('jobMatchingDescription')}
      voiceNarration={narrations.jobMatching}
    />
    <BenefitCard
      icon="💰"
      title={t('trackYourWages')}
      description={t('wageTrackingDescription')}
      voiceNarration={narrations.wageTracking}
    />
    <BenefitCard
      icon="✓"
      title={t('secureAttendance')}
      description={t('attendanceDescription')}
      voiceNarration={narrations.attendance}
    />
    <BenefitCard
      icon="🎤"
      title={t('voiceFirstInterface')}
      description={t('voiceDescription')}
      voiceNarration={narrations.voice}
    />
  </BenefitsCarousel>
  
  <ProgressDots
    total={4}
    current={currentSlide}
  />
  
  <NavigationButtons>
    <SkipButton onClick={handleSkip}>
      {t('skip')}
    </SkipButton>
    <NextButton onClick={handleNext}>
      {currentSlide === 3 ? t('getStarted') : t('next')}
    </NextButton>
  </NavigationButtons>
</BenefitsScreen>
```


### Screen 10: Disclaimer & Terms

**Purpose**: Present terms of service and disclaimer in simple language.

**Visual Design**:
- Scrollable content with key points
- Simple language and icons
- Checkbox for acceptance
- Links to full terms and privacy policy
- Voice narration available

**Disclaimer Content**:
```
┌─────────────────────────────────┐
│  Important Information          │
│                                 │
│  📋 Terms & Conditions          │
│  ────────────────────────       │
│                                 │
│  ✓ Your data is secure          │
│    We protect your personal     │
│    information with encryption  │
│                                 │
│  ✓ Fair usage                   │
│    Use the platform honestly    │
│    and respectfully             │
│                                 │
│  ✓ Your rights                  │
│    You can delete your data     │
│    anytime from settings        │
│                                 │
│  ✓ Support available            │
│    Contact us for help or       │
│    report issues                │
│                                 │
│  [View Full Terms]              │
│  [Privacy Policy]               │
│                                 │
│  ☐ I agree to the terms and    │
│     conditions                  │
│                                 │
│  [Accept & Continue]            │
└─────────────────────────────────┘
```

**Key Points Highlighted**:
1. **Data Security**: Your information is encrypted and secure
2. **Fair Usage**: Use platform honestly and respectfully
3. **User Rights**: Delete data anytime, access support
4. **Compliance**: Follows Indian labor laws and DPDPA 2023
5. **Support**: Help available for issues or questions

**Interactions**:
- Scroll to read all content
- Voice narration of key points
- Tap links to view full documents
- Checkbox must be checked to continue
- Accept button enabled only after checkbox

**Component Structure**:
```jsx
<DisclaimerScreen>
  <VoiceAssistButton />
  <ProgressIndicator step={10} total={10} />
  <BackButton />
  <Title>{t('importantInformation')}</Title>
  
  <ScrollableContent>
    <SectionTitle>
      📋 {t('termsAndConditions')}
    </SectionTitle>
    
    <KeyPoint>
      <Icon>✓</Icon>
      <PointTitle>{t('dataSecure')}</PointTitle>
      <PointDescription>
        {t('dataSecureDescription')}
      </PointDescription>
    </KeyPoint>
    
    <KeyPoint>
      <Icon>✓</Icon>
      <PointTitle>{t('fairUsage')}</PointTitle>
      <PointDescription>
        {t('fairUsageDescription')}
      </PointDescription>
    </KeyPoint>
    
    <KeyPoint>
      <Icon>✓</Icon>
      <PointTitle>{t('yourRights')}</PointTitle>
      <PointDescription>
        {t('yourRightsDescription')}
      </PointDescription>
    </KeyPoint>
    
    <KeyPoint>
      <Icon>✓</Icon>
      <PointTitle>{t('supportAvailable')}</PointTitle>
      <PointDescription>
        {t('supportDescription')}
      </PointDescription>
    </KeyPoint>
    
    <DocumentLinks>
      <Link onClick={() => openFullTerms()}>
        {t('viewFullTerms')}
      </Link>
      <Link onClick={() => openPrivacyPolicy()}>
        {t('privacyPolicy')}
      </Link>
    </DocumentLinks>
  </ScrollableContent>
  
  <AcceptanceCheckbox>
    <Checkbox
      checked={hasAccepted}
      onChange={setHasAccepted}
      id="terms-acceptance"
    />
    <Label htmlFor="terms-acceptance">
      {t('iAgreeToTerms')}
    </Label>
  </AcceptanceCheckbox>
  
  <AcceptButton
    disabled={!hasAccepted}
    onClick={handleAcceptAndContinue}
  >
    {t('acceptAndContinue')}
  </AcceptButton>
</DisclaimerScreen>
```


### Screen 11: Welcome to Main Interface

**Purpose**: Transition user to main app interface with welcome message.

**Visual Design**:
- Success animation (checkmark or celebration)
- Personalized welcome message
- Quick overview of main features
- Smooth transition to dashboard

**Welcome Screen**:
```
┌─────────────────────────────────┐
│                                 │
│         ✓                       │
│    Welcome, Rajesh!             │
│                                 │
│  Your profile is complete       │
│                                 │
│  🎉 You're all set to start    │
│     using Shramik-Setu          │
│                                 │
│  Quick Access:                  │
│  • Find Jobs                    │
│  • Track Wages                  │
│  • Mark Attendance              │
│  • Voice Commands               │
│                                 │
│  [Go to Dashboard]              │
└─────────────────────────────────┘
```

**Transition Animation**:
- Success checkmark animation (2 seconds)
- Welcome message fade-in
- Feature list slide-in
- Button pulse to draw attention

**Component Structure**:
```jsx
<WelcomeScreen>
  <SuccessAnimation>
    <CheckmarkIcon animated />
  </SuccessAnimation>
  
  <WelcomeMessage>
    <Greeting>{t('welcome')}, {userName}!</Greeting>
    <Subtitle>{t('profileComplete')}</Subtitle>
  </WelcomeMessage>
  
  <CelebrationMessage>
    🎉 {t('allSetToStart')}
  </CelebrationMessage>
  
  <QuickAccessList>
    <QuickAccessTitle>{t('quickAccess')}</QuickAccessTitle>
    <FeatureItem>• {t('findJobs')}</FeatureItem>
    <FeatureItem>• {t('trackWages')}</FeatureItem>
    <FeatureItem>• {t('markAttendance')}</FeatureItem>
    <FeatureItem>• {t('voiceCommands')}</FeatureItem>
  </QuickAccessList>
  
  <DashboardButton
    onClick={handleGoToDashboard}
    animated
  >
    {t('goToDashboard')}
  </DashboardButton>
</WelcomeScreen>
```


## Technical Implementation

### State Management

**Onboarding State Object**:
```javascript
const onboardingState = {
  currentStep: 1,
  totalSteps: 10,
  
  // Step 1: Language
  language: null,
  
  // Step 2: Role
  role: null, // 'worker' | 'employer'
  
  // Step 3-5: Authentication
  authMethod: null, // 'phone' | 'eshram'
  phoneNumber: null,
  eShramCard: null,
  otpVerified: false,
  
  // Step 6: Location
  location: {
    latitude: null,
    longitude: null,
    city: null,
    state: null,
    pincode: null,
    address: null
  },
  
  // Step 7: Occupation (workers only)
  skills: [],
  
  // Step 8: Personal Details
  profile: {
    name: null,
    age: null,
    gender: null,
    photo: null
  },
  
  // Step 9-10: Tutorial
  benefitsViewed: false,
  termsAccepted: false,
  
  // Metadata
  startedAt: null,
  completedAt: null,
  lastSavedAt: null
};
```

### Data Persistence

**Local Storage Strategy**:
```javascript
// Save progress after each step
const saveProgress = (state) => {
  localStorage.setItem('onboarding_progress', JSON.stringify({
    ...state,
    lastSavedAt: Date.now()
  }));
};

// Resume from saved progress
const loadProgress = () => {
  const saved = localStorage.getItem('onboarding_progress');
  if (saved) {
    const state = JSON.parse(saved);
    // Check if saved within last 24 hours
    if (Date.now() - state.lastSavedAt < 24 * 60 * 60 * 1000) {
      return state;
    }
  }
  return null;
};

// Clear progress after completion
const clearProgress = () => {
  localStorage.removeItem('onboarding_progress');
};
```


### API Integration

**Authentication Endpoints**:
```javascript
// Send OTP
POST /api/v1/auth/send-otp
{
  phoneNumber: "+919876543210",
  language: "hi"
}

// Verify OTP
POST /api/v1/auth/verify-otp
{
  phoneNumber: "+919876543210",
  otp: "123456"
}

// Verify E-Shram Card
POST /api/v1/auth/verify-eshram
{
  cardNumber: "123456789012",
  phoneNumber: "+919876543210"
}

// Complete Profile
POST /api/v1/auth/complete-profile
{
  userId: "user-123",
  role: "worker",
  profile: {
    name: "Rajesh Kumar",
    age: 32,
    gender: "male",
    photo: "base64_or_url",
    location: {...},
    skills: ["mason", "painter"]
  }
}
```

**Location Services**:
```javascript
// Reverse Geocoding
GET /api/v1/location/reverse-geocode?lat=19.0760&lng=72.8777

Response:
{
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400001",
  address: "Detailed address..."
}
```

### Voice Integration

**Voice Narration Service**:
```javascript
const narrateScreen = async (screenId, language) => {
  const narrationText = getNarrationText(screenId, language);
  
  // Use Amazon Polly or Web Speech API
  const audioUrl = await synthesizeSpeech(narrationText, language);
  
  // Play audio
  const audio = new Audio(audioUrl);
  audio.play();
};

// Voice input for text fields
const handleVoiceInput = async (fieldName) => {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = getCurrentLanguage();
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    updateField(fieldName, transcript);
  };
  
  recognition.start();
};
```


## Accessibility Features

### Voice Support

**Screen Narration**:
- Auto-narrate screen title and instructions on load
- Narrate button labels on focus
- Announce validation errors
- Provide audio feedback for actions

**Voice Input**:
- Voice button on all text input fields
- Support for Hindi and regional languages
- Real-time transcription display
- Retry option for unclear input

### Visual Accessibility

**High Contrast Mode**:
- WCAG AAA compliant color ratios
- Minimum 7:1 contrast for text
- Clear focus indicators (3px border)
- Large touch targets (minimum 48x48dp)

**Font Sizes**:
- Title: 24px (1.5rem)
- Body: 18px (1.125rem)
- Buttons: 20px (1.25rem)
- Scalable with system font size

**Color Coding**:
- Success: Green (#4CAF50)
- Error: Red (#F44336)
- Warning: Orange (#FF9800)
- Info: Blue (#2196F3)
- Never rely on color alone

### Keyboard Navigation

**Tab Order**:
- Logical flow top to bottom
- Skip links for long content
- Focus trap in modals
- Escape key to close overlays

**Keyboard Shortcuts**:
- Enter: Submit/Continue
- Escape: Back/Cancel
- Space: Select/Toggle
- Arrow keys: Navigate options


## Error Handling

### Network Errors

**Offline Detection**:
```javascript
if (!navigator.onLine) {
  showError({
    title: t('noInternet'),
    message: t('checkConnection'),
    action: 'retry',
    icon: '📡'
  });
}
```

**API Failures**:
- Show user-friendly error messages
- Provide retry button
- Save form data locally
- Allow offline progress where possible

### Validation Errors

**Real-time Validation**:
- Phone: Format and length check
- OTP: 6 digits only
- Name: Minimum 2 characters
- Age: Between 18-70
- Show errors below field with icon

**Error Messages**:
```javascript
const errorMessages = {
  phoneInvalid: "Please enter a valid 10-digit mobile number",
  otpInvalid: "OTP must be 6 digits",
  nameRequired: "Please enter your name",
  ageRequired: "Please select your age",
  genderRequired: "Please select your gender",
  skillsRequired: "Please select at least one skill",
  termsRequired: "Please accept terms to continue"
};
```

### Recovery Options

**Save and Resume**:
- Auto-save progress every step
- Resume from last completed step
- 24-hour expiry for saved progress
- Clear indication of saved state

**Alternative Paths**:
- E-Shram fails → Use phone auth
- Location fails → Manual entry
- Photo upload fails → Skip photo
- Voice fails → Text input


## Performance Optimization

### Code Splitting

**Lazy Load Screens**:
```javascript
const LanguageSelection = lazy(() => import('./screens/LanguageSelection'));
const RoleSelection = lazy(() => import('./screens/RoleSelection'));
const PhoneAuth = lazy(() => import('./screens/PhoneAuth'));
const OTPVerification = lazy(() => import('./screens/OTPVerification'));
// ... other screens

// Preload next screen on current screen load
const preloadNextScreen = (currentStep) => {
  const nextScreen = getNextScreen(currentStep);
  if (nextScreen) {
    import(`./screens/${nextScreen}`);
  }
};
```

### Image Optimization

**Photo Upload**:
- Compress images before upload
- Maximum 500KB file size
- Resize to 400x400px
- Convert to WebP format
- Show compression progress

**Icons and Assets**:
- Use SVG for icons
- Lazy load images
- Implement progressive loading
- Cache static assets

### Caching Strategy

**Service Worker**:
```javascript
// Cache onboarding assets
const CACHE_NAME = 'onboarding-v1';
const urlsToCache = [
  '/onboarding/',
  '/onboarding/styles.css',
  '/onboarding/script.js',
  '/assets/icons/',
  '/assets/images/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});
```


## Analytics and Tracking

### Onboarding Funnel Metrics

**Track Key Events**:
```javascript
const trackOnboardingEvent = (eventName, properties) => {
  analytics.track(eventName, {
    ...properties,
    timestamp: Date.now(),
    language: currentLanguage,
    role: userRole
  });
};

// Events to track
trackOnboardingEvent('onboarding_started');
trackOnboardingEvent('language_selected', { language: 'hi' });
trackOnboardingEvent('role_selected', { role: 'worker' });
trackOnboardingEvent('auth_method_selected', { method: 'phone' });
trackOnboardingEvent('otp_sent');
trackOnboardingEvent('otp_verified');
trackOnboardingEvent('location_detected');
trackOnboardingEvent('skills_selected', { count: 3 });
trackOnboardingEvent('profile_completed');
trackOnboardingEvent('terms_accepted');
trackOnboardingEvent('onboarding_completed', { duration: 180000 });
```

**Drop-off Analysis**:
- Track step completion rates
- Identify problematic steps
- Measure time spent per step
- Track error occurrences

### A/B Testing

**Test Variations**:
- Different occupation icon sets
- Voice vs. text-first prompts
- Single vs. multi-page forms
- Different benefit messaging

## Security Considerations

### Data Protection

**Sensitive Data Handling**:
```javascript
// Encrypt sensitive data before storage
const encryptData = (data) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    ENCRYPTION_KEY
  ).toString();
};

// Store encrypted
localStorage.setItem('user_data', encryptData({
  phoneNumber: maskedPhone,
  eShramCard: maskedCard
}));
```

**PII Protection**:
- Mask phone numbers in logs
- Never log OTP codes
- Encrypt profile photos
- Secure API communication (HTTPS)

### Authentication Security

**OTP Security**:
- 6-digit random code
- 5-minute expiry
- Maximum 3 attempts
- Rate limiting on send
- No OTP in URL or logs

**Session Management**:
- JWT tokens with 1-hour expiry
- Refresh token rotation
- Secure cookie storage
- Auto-logout on inactivity


## Testing Strategy

### Unit Tests

**Component Testing**:
```javascript
describe('LanguageSelection', () => {
  it('should render all language options', () => {
    const { getAllByRole } = render(<LanguageSelection />);
    const buttons = getAllByRole('button');
    expect(buttons).toHaveLength(10);
  });
  
  it('should call onSelect when language is chosen', () => {
    const onSelect = jest.fn();
    const { getByText } = render(
      <LanguageSelection onSelect={onSelect} />
    );
    fireEvent.click(getByText('हिंदी'));
    expect(onSelect).toHaveBeenCalledWith('hi');
  });
});

describe('OTPVerification', () => {
  it('should auto-advance to next input on digit entry', () => {
    const { container } = render(<OTPVerification />);
    const inputs = container.querySelectorAll('input');
    
    fireEvent.change(inputs[0], { target: { value: '1' } });
    expect(document.activeElement).toBe(inputs[1]);
  });
  
  it('should enable verify button when all digits entered', () => {
    const { getByRole, container } = render(<OTPVerification />);
    const inputs = container.querySelectorAll('input');
    
    inputs.forEach((input, i) => {
      fireEvent.change(input, { target: { value: String(i) } });
    });
    
    const verifyButton = getByRole('button', { name: /verify/i });
    expect(verifyButton).not.toBeDisabled();
  });
});
```

### Integration Tests

**Flow Testing**:
```javascript
describe('Onboarding Flow', () => {
  it('should complete full worker onboarding', async () => {
    const { getByText, getByRole, getByLabelText } = render(<OnboardingFlow />);
    
    // Step 1: Language
    fireEvent.click(getByText('हिंदी'));
    await waitFor(() => expect(getByText('Select Your Role')).toBeInTheDocument());
    
    // Step 2: Role
    fireEvent.click(getByText('I am a Worker'));
    await waitFor(() => expect(getByText('How to Login')).toBeInTheDocument());
    
    // Step 3: Auth Method
    fireEvent.click(getByText('Phone Number'));
    
    // Step 4: Phone Entry
    const phoneInput = getByLabelText('Mobile Number');
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    fireEvent.click(getByText('Send OTP'));
    
    // ... continue through all steps
  });
});
```

### Accessibility Testing

**A11y Checks**:
```javascript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<LanguageSelection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  it('should support keyboard navigation', () => {
    const { getAllByRole } = render(<RoleSelection />);
    const cards = getAllByRole('button');
    
    cards[0].focus();
    expect(document.activeElement).toBe(cards[0]);
    
    fireEvent.keyDown(cards[0], { key: 'Tab' });
    expect(document.activeElement).toBe(cards[1]);
  });
});
```

## Deployment Checklist

### Pre-launch Verification

- [ ] All 10 languages tested and working
- [ ] Voice narration functional in all languages
- [ ] OTP delivery working (test with real numbers)
- [ ] E-Shram verification integrated
- [ ] Location services tested on multiple devices
- [ ] Photo upload/capture working
- [ ] Progress saving and resuming tested
- [ ] Error handling for all failure scenarios
- [ ] Accessibility audit passed
- [ ] Performance metrics meet targets
- [ ] Analytics tracking verified
- [ ] Security audit completed
- [ ] Privacy policy and terms finalized
- [ ] Multi-device testing (iOS, Android, Web)
- [ ] Network condition testing (2G, 3G, 4G, offline)

### Performance Targets

- Initial load: < 3 seconds on 3G
- Step transition: < 500ms
- OTP delivery: < 10 seconds
- Location fetch: < 5 seconds
- Photo upload: < 3 seconds
- Voice recognition: < 2 seconds response

### Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

### Phase 2 Features

1. **Biometric Authentication**
   - Fingerprint login
   - Face recognition
   - Passkey support

2. **Social Login**
   - Google Sign-In
   - Facebook Login
   - Aadhaar integration

3. **Enhanced Verification**
   - Video KYC
   - Document upload
   - Reference verification

4. **Gamification**
   - Profile completion rewards
   - Onboarding badges
   - Tutorial achievements

5. **Personalization**
   - AI-powered skill suggestions
   - Location-based recommendations
   - Customized benefit messaging

6. **Offline Mode**
   - Complete onboarding offline
   - Sync when online
   - Offline OTP alternatives

---

**Document Version**: 1.0  
**Last Updated**: 2025-02-21  
**Status**: Ready for Implementation
