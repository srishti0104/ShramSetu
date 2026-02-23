/**
 * Voice Response Component
 * 
 * @fileoverview Audio playback component for voice assistant responses
 */

import { useState, useRef, useEffect } from 'react';
import './VoiceResponse.css';

/**
 * Voice Response Component
 * @param {Object} props
 * @param {string} props.text - Response text
 * @param {string} [props.audioUrl] - Audio URL for playback
 * @param {boolean} [props.autoPlay] - Whether to auto-play audio
 * @param {boolean} [props.isLoading] - Whether audio is loading
 * @param {string} [props.error] - Error message
 * @param {string} [props.className] - Additional CSS classes
 */
export default function VoiceResponse({
  text,
  audioUrl,
  autoPlay = false,
  isLoading = false,
  error = '',
  className = ''
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      
      if (autoPlay) {
        playAudio();
      }
    }
  }, [audioUrl, autoPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setIsPlaying(false);
      console.error('Audio playback error');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  /**
   * Play audio
   */
  const playAudio = async () => {
    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Failed to play audio:', err);
      }
    }
  };

  /**
   * Pause audio
   */
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  /**
   * Toggle play/pause
   */
  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  /**
   * Seek to position
   * @param {React.MouseEvent<HTMLDivElement>} e
   */
  const handleSeek = (e) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  /**
   * Format time as MM:SS
   * @param {number} seconds
   * @returns {string}
   */
  const formatTime = (seconds) => {
    if (!isFinite(seconds)) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`voice-response ${className}`}>
      <p className="voice-response__text">{text}</p>

      {error && (
        <div className="voice-response__error" role="alert">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="voice-response__loading">
          <div className="voice-response__spinner" aria-label="Loading audio..."></div>
          <span>Generating audio response...</span>
        </div>
      )}

      {audioUrl && !isLoading && !error && (
        <div className="voice-response__audio-player">
          <audio ref={audioRef} preload="metadata" />

          <button
            type="button"
            onClick={togglePlayPause}
            className="voice-response__play-button"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <div className="voice-response__progress-container">
            <div
              className="voice-response__progress-bar"
              onClick={handleSeek}
              role="slider"
              aria-label="Audio progress"
              aria-valuemin={0}
              aria-valuemax={duration}
              aria-valuenow={currentTime}
              tabIndex={0}
            >
              <div
                className="voice-response__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="voice-response__time">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

