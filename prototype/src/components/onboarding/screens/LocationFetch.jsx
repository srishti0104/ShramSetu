/**
 * Location Fetch Screen
 * 
 * @fileoverview Screen for auto-fetching user location or manual entry
 */

import { useState, useEffect } from 'react';
import { useOnboarding } from '../../../contexts/OnboardingContext';
import ProgressIndicator from '../shared/ProgressIndicator';
import VoiceInteraction from '../shared/VoiceInteraction';
import BackButton from '../shared/BackButton';
import './LocationFetch.css';

/**
 * Location Fetch Screen Component
 */
export default function LocationFetch() {
  const { state, updateState, nextStep, previousStep } = useOnboarding();
  const [hasPermission, setHasPermission] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [location, setLocation] = useState(state.location);
  const [manualEntry, setManualEntry] = useState(false);
  const [error, setError] = useState('');

  const isHindi = state.language === 'hi';

  /**
   * Narration text for this screen
   */
  const narrationText = isHindi
    ? 'अपना स्थान साझा करें।'
    : 'Share your location.';

  /**
   * Request location permission
   */
  const requestPermission = async () => {
    setIsFetching(true);
    setError('');

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation not supported');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              {
                headers: {
                  'Accept-Language': 'en'
                }
              }
            );
            
            if (!response.ok) {
              throw new Error('Reverse geocoding failed');
            }
            
            const data = await response.json();
            console.log('📍 Reverse geocoding result:', data);
            
            // Extract location details from OpenStreetMap response
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.county || 'Unknown City';
            const state = address.state || 'Unknown State';
            const pincode = address.postcode || '';
            
            const realLocation = {
              latitude,
              longitude,
              city,
              state,
              pincode,
              address: `${city}, ${state}`
            };

            console.log('✅ Real location detected:', realLocation);
            setLocation(realLocation);
            setHasPermission(true);
            setIsFetching(false);
          } catch (geocodeError) {
            console.error('Reverse geocoding error:', geocodeError);
            // Fallback: Use coordinates only
            const fallbackLocation = {
              latitude,
              longitude,
              city: `Lat: ${latitude.toFixed(4)}`,
              state: `Lon: ${longitude.toFixed(4)}`,
              pincode: '',
              address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            };
            
            setLocation(fallbackLocation);
            setHasPermission(true);
            setIsFetching(false);
            setError(isHindi 
              ? '⚠️ स्थान का नाम प्राप्त नहीं हो सका, लेकिन निर्देशांक सहेजे गए' 
              : '⚠️ Could not get location name, but coordinates saved');
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(isHindi 
            ? 'स्थान प्राप्त करने में विफल। कृपया मैन्युअल रूप से दर्ज करें।' 
            : 'Failed to get location. Please enter manually.');
          setIsFetching(false);
          setManualEntry(true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } catch (err) {
      setError(isHindi 
        ? 'स्थान सेवा उपलब्ध नहीं है' 
        : 'Location service not available');
      setIsFetching(false);
      setManualEntry(true);
    }
  };

  /**
   * Handle confirm location
   */
  const handleConfirmLocation = () => {
    updateState({ location });
    nextStep();
  };

  return (
    <div className="location-fetch">
      <VoiceInteraction
        narrationText={narrationText}
        language={state.language || 'en'}
        showMicrophone={false}
      />
      <BackButton onClick={previousStep} />
      
      <ProgressIndicator 
        step={state.currentStep} 
        total={state.totalSteps} 
      />

      <div className="location-fetch__content">
        <h1 className="location-fetch__title">
          {isHindi ? 'आपका स्थान' : 'Your Location'}
        </h1>

        {!hasPermission && !manualEntry ? (
          <div className="location-fetch__permission">
            <div className="location-fetch__icon">📍</div>
            <p className="location-fetch__explanation">
              {isHindi 
                ? 'आपके पास नौकरियां खोजने के लिए हमें आपके स्थान की आवश्यकता है' 
                : 'We need your location to find jobs near you'}
            </p>
            
            <div className="location-fetch__options">
              <p className="location-fetch__options-title">
                {isHindi ? 'स्थान कैसे प्रदान करें:' : 'Choose how to provide location:'}
              </p>
              
              <button
                type="button"
                onClick={requestPermission}
                disabled={isFetching}
                className="location-fetch__button location-fetch__button--primary"
              >
                {isFetching ? (
                  <>
                    <span className="spinner"></span>
                    {isHindi ? 'स्थान प्राप्त कर रहे हैं...' : 'Getting location...'}
                  </>
                ) : (
                  <>
                    <span className="location-fetch__button-icon">📍</span>
                    {isHindi ? 'वास्तविक स्थान का उपयोग करें (GPS)' : 'Use Real Location (GPS)'}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setManualEntry(true)}
                className="location-fetch__button location-fetch__button--secondary"
              >
                <span className="location-fetch__button-icon">✏️</span>
                {isHindi ? 'मैन्युअल रूप से दर्ज करें' : 'Enter Manually'}
              </button>
            </div>
          </div>
        ) : isFetching ? (
          <div className="location-fetch__loading">
            <span className="spinner-large"></span>
            <p>{isHindi ? 'स्थान का पता लगा रहे हैं...' : 'Detecting location...'}</p>
          </div>
        ) : location && !manualEntry ? (
          <div className="location-fetch__display">
            <div className="location-fetch__map-placeholder">
              📍 {isHindi ? 'मानचित्र पूर्वावलोकन' : 'Map Preview'}
            </div>
            <div className="location-fetch__details">
              <h2>{location.city}</h2>
              <p>{location.state}</p>
              <p>{isHindi ? 'पिनकोड' : 'Pincode'}: {location.pincode}</p>
            </div>
            <button
              type="button"
              onClick={handleConfirmLocation}
              className="location-fetch__button"
            >
              {isHindi ? 'स्थान की पुष्टि करें' : 'Confirm Location'}
            </button>
            <button
              type="button"
              onClick={() => setManualEntry(true)}
              className="location-fetch__manual-link"
            >
              {isHindi ? 'स्थान संपादित करें' : 'Edit Location'}
            </button>
          </div>
        ) : (
          <ManualLocationEntry
            isHindi={isHindi}
            onSubmit={(loc) => {
              setLocation(loc);
              setManualEntry(false);
              handleConfirmLocation();
            }}
          />
        )}

        {error && (
          <p className="location-fetch__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Manual Location Entry Component
 */
function ManualLocationEntry({ isHindi, onSubmit }) {
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      latitude: null,
      longitude: null,
      city,
      state,
      pincode,
      address: `${city}, ${state}`
    });
  };

  return (
    <form onSubmit={handleSubmit} className="manual-location-entry">
      <div className="form-field">
        <label htmlFor="city">
          {isHindi ? 'शहर' : 'City'} *
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          placeholder={isHindi ? 'मुंबई' : 'Mumbai'}
        />
      </div>

      <div className="form-field">
        <label htmlFor="state">
          {isHindi ? 'राज्य' : 'State'} *
        </label>
        <input
          id="state"
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
          placeholder={isHindi ? 'महाराष्ट्र' : 'Maharashtra'}
        />
      </div>

      <div className="form-field">
        <label htmlFor="pincode">
          {isHindi ? 'पिनकोड' : 'Pincode'} *
        </label>
        <input
          id="pincode"
          type="tel"
          inputMode="numeric"
          maxLength={6}
          value={pincode}
          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
          required
          placeholder="400001"
        />
      </div>

      <button type="submit" className="location-fetch__button">
        {isHindi ? 'जारी रखें' : 'Continue'}
      </button>
    </form>
  );
}
