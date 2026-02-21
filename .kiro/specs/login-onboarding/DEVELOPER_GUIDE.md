# Developer Guide - Login & Onboarding Flow

## Overview

Comprehensive guide for developers working on the Shramik-Setu Login & Onboarding Flow.

---

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Git
- Code editor (VS Code recommended)
- Basic knowledge of React, JavaScript, CSS

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/shramsetu.git
cd shramsetu/ShramSetu

# Install dependencies
npm install

# Start development server
npm start

# Open browser
# http://localhost:3000
```

---

## Project Structure

```
ShramSetu/
├── public/                    # Static files
├── src/
│   ├── components/
│   │   ├── common/           # Reusable components
│   │   │   └── VoiceInput.jsx
│   │   └── onboarding/       # Onboarding flow
│   │       ├── OnboardingFlow.jsx
│   │       ├── shared/       # Shared onboarding components
│   │       └── screens/      # Individual screens
│   ├── contexts/             # React contexts
│   │   └── OnboardingContext.jsx
│   ├── hooks/                # Custom hooks
│   │   └── useVoiceNarration.js
│   ├── services/             # API and services
│   │   ├── api/
│   │   └── voice/
│   ├── utils/                # Utility functions
│   ├── App.jsx               # Main app component
│   └── index.js              # Entry point
├── .env                      # Environment variables
├── package.json              # Dependencies
└── README.md                 # Project readme
```

---

## Architecture

### Component Hierarchy

```
App
└── OnboardingFlow
    ├── OnboardingProvider (Context)
    └── Screen Components
        ├── LanguageSelection
        ├── RoleSelection
        ├── AuthMethodSelection
        ├── PhoneNumberEntry
        ├── OTPVerification
        ├── LocationFetch
        ├── OccupationSelection
        ├── PersonalDetails
        ├── BenefitsScreen
        └── DisclaimerScreen
```

### Data Flow

```
User Action → Component → Context → localStorage
                ↓
            API Call → Backend
                ↓
            Response → Context → Component → UI Update
```

---

## Core Concepts

### 1. State Management

All onboarding state is managed through `OnboardingContext`:

```javascript
import { useOnboarding } from '../../contexts/OnboardingContext';

function MyComponent() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  
  // Access state
  const language = state.language;
  const role = state.role;
  
  // Update state
  updateState({ myData: 'value' });
  
  // Navigate
  nextStep();
  previousStep();
}
```

### 2. Screen Navigation

Screens are rendered based on `currentStep`:

```javascript
// OnboardingFlow.jsx
const renderScreen = () => {
  switch (state.currentStep) {
    case 1: return <LanguageSelection />;
    case 2: return <RoleSelection />;
    // ... other cases
  }
};
```

### 3. Progress Persistence

Progress is automatically saved to localStorage:

```javascript
// Saved on every state update
localStorage.setItem('onboarding_progress', JSON.stringify(state));

// Loaded on mount
const saved = localStorage.getItem('onboarding_progress');

// Expires after 24 hours
if (Date.now() - state.lastSavedAt > 24 * 60 * 60 * 1000) {
  // Clear expired progress
}
```

---

## Adding a New Screen

### Step 1: Create Component

```javascript
// src/components/onboarding/screens/MyNewScreen.jsx
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceAssistButton from '../shared/VoiceAssistButton';
import BackButton from '../shared/BackButton';
import './MyNewScreen.css';

export default function MyNewScreen() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  
  const handleSubmit = () => {
    updateState({ myData: 'value' });
    nextStep();
  };
  
  return (
    <div className="my-new-screen">
      <VoiceAssistButton />
      <ProgressIndicator step={11} total={11} />
      <BackButton onClick={previousStep} />
      
      <div className="my-new-screen__content">
        <h1>My New Screen</h1>
        {/* Screen content */}
        <button onClick={handleSubmit}>Continue</button>
      </div>
    </div>
  );
}
```

### Step 2: Create Styles

```css
/* src/components/onboarding/screens/MyNewScreen.css */
.my-new-screen {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.my-new-screen__content {
  max-width: 600px;
  margin: 80px auto 0;
  padding: 20px;
}
```

### Step 3: Add to Flow

```javascript
// src/components/onboarding/OnboardingFlow.jsx
import MyNewScreen from './screens/MyNewScreen';

const renderScreen = () => {
  switch (state.currentStep) {
    // ... existing cases
    case 11:
      return <MyNewScreen />;
    default:
      return <LanguageSelection />;
  }
};
```

### Step 4: Update Context (if needed)

```javascript
// src/contexts/OnboardingContext.jsx
const initialState = {
  // ... existing state
  myNewData: null,
  totalSteps: 11  // Update total
};
```

---

## Working with APIs

### Making API Calls

```javascript
import authAPI from '../../services/api/authAPI';
import { APIError } from '../../services/api/apiClient';

async function handleSendOTP() {
  try {
    setLoading(true);
    setError(null);
    
    const result = await authAPI.sendOTP(phoneNumber, language);
    
    if (result.success) {
      updateState({ sessionId: result.sessionId });
      nextStep();
    }
  } catch (err) {
    if (err instanceof APIError) {
      setError(err.message);
    } else {
      setError('An error occurred. Please try again.');
    }
  } finally {
    setLoading(false);
  }
}
```

### Adding New API Endpoint

```javascript
// src/services/api/myAPI.js
import apiClient from './apiClient';

class MyAPI {
  async myMethod(data) {
    try {
      const response = await apiClient.post('/my-endpoint', data);
      return { success: true, data: response };
    } catch (error) {
      console.error('[MOCK] My method error:', error);
      // Return mock response for development
      return { success: true, data: 'mock data' };
    }
  }
}

const myAPI = new MyAPI();
export default myAPI;
```

---

## Voice Integration

### Adding Voice Narration

```javascript
import { useVoiceNarration } from '../../hooks/useVoiceNarration';

function MyComponent() {
  const { state } = useOnboarding();
  const language = state.language || 'en';
  
  // Auto-narrate on mount
  useVoiceNarration(
    'Welcome to my screen',
    language,
    { autoPlay: true }
  );
  
  return <div>Content</div>;
}
```

### Adding Voice Input

```javascript
import VoiceInput from '../../components/common/VoiceInput';

function MyForm() {
  const [name, setName] = useState('');
  
  return (
    <VoiceInput
      value={name}
      onChange={setName}
      language="hi"
      placeholder="Enter your name"
    />
  );
}
```

### Adding Voice Feedback

```javascript
import voiceFeedback from '../../utils/voiceFeedback';

function MyComponent() {
  const handleSuccess = () => {
    voiceFeedback.success('hi');
    // or
    voiceFeedback.custom('Custom message', 'hi');
  };
  
  return <button onClick={handleSuccess}>Submit</button>;
}
```

---

## Styling Guidelines

### BEM Naming Convention

```css
/* Block */
.my-component { }

/* Element */
.my-component__header { }
.my-component__content { }

/* Modifier */
.my-component--active { }
.my-component__button--disabled { }
```

### Responsive Design

```css
/* Mobile first */
.my-component {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .my-component {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .my-component {
    padding: 32px;
  }
}
```

### Accessibility

```css
/* High contrast mode */
@media (prefers-contrast: high) {
  .my-component {
    border: 3px solid #000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .my-component {
    transition: none;
    animation: none;
  }
}
```

---

## Testing

### Unit Tests

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('My Component')).toBeInTheDocument();
  });
  
  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<MyComponent onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Tests

```javascript
describe('Onboarding Flow', () => {
  it('completes full flow', async () => {
    const { getByText, getByRole } = render(<OnboardingFlow />);
    
    // Step 1: Language
    fireEvent.click(getByText('हिंदी'));
    await waitFor(() => expect(getByText('Select Your Role')).toBeInTheDocument());
    
    // Step 2: Role
    fireEvent.click(getByText('I am a Worker'));
    // ... continue through all steps
  });
});
```

---

## Debugging

### Common Issues

**Issue**: State not updating
```javascript
// Wrong
state.myData = 'value';

// Correct
updateState({ myData: 'value' });
```

**Issue**: Voice not working
```javascript
// Check browser support
if (voiceService.isSynthesisSupported()) {
  voiceService.speak(text, language);
} else {
  console.log('Voice not supported');
}
```

**Issue**: API calls failing
```javascript
// Check mock mode
console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);

// Check network tab in browser DevTools
// Look for [MOCK] prefix in console logs
```

### Debug Tools

```javascript
// Log state changes
useEffect(() => {
  console.log('State updated:', state);
}, [state]);

// Log API calls
apiClient.request = new Proxy(apiClient.request, {
  apply(target, thisArg, args) {
    console.log('API Call:', args);
    return target.apply(thisArg, args);
  }
});
```

---

## Best Practices

### 1. Component Design

- Keep components small and focused
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Follow single responsibility principle

### 2. State Management

- Use context for global state
- Use local state for component-specific data
- Avoid prop drilling
- Keep state minimal and normalized

### 3. Performance

- Use React.memo for expensive components
- Implement code splitting with lazy loading
- Optimize images and assets
- Minimize re-renders

### 4. Accessibility

- Always include ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain proper heading hierarchy

### 5. Error Handling

- Always handle API errors
- Provide user-friendly error messages
- Implement retry mechanisms
- Log errors for debugging

---

## Code Review Checklist

- [ ] Code follows project conventions
- [ ] Components are properly documented
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Accessibility features included
- [ ] Responsive design verified
- [ ] Tests written and passing
- [ ] No console errors or warnings
- [ ] Performance is acceptable
- [ ] Code is DRY (Don't Repeat Yourself)

---

## Resources

### Documentation
- [React Documentation](https://react.dev)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Tools
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## Getting Help

### Internal Resources
- Check documentation in `.kiro/specs/login-onboarding/`
- Review code comments and JSDoc
- Ask team members
- Check project wiki

### External Resources
- Stack Overflow
- React community forums
- GitHub issues
- MDN Web Docs

---

**Document Version**: 1.0  
**Last Updated**: 2025-02-21  
**Maintained By**: Development Team

