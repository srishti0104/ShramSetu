import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LANGUAGE_CONFIGS } from '../constants/languages';
import './LanguageSwitcher.css';

/**
 * LanguageSwitcher component for changing app language
 * @param {Object} props
 * @param {'dropdown'|'modal'|'inline'} [props.variant='dropdown'] - Display variant
 * @param {boolean} [props.showFlags=true] - Whether to show flag emojis
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {function} [props.onLanguageChange] - Callback when language changes
 */
function LanguageSwitcher({ 
  variant = 'dropdown', 
  showFlags = true, 
  className = '',
  onLanguageChange 
}) {
  const { language, setLanguage, isLoading, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguageConfig = LANGUAGE_CONFIGS[language];
  const languageOptions = Object.values(LANGUAGE_CONFIGS);

  /**
   * Handle language selection
   * @param {string} newLanguage - Selected language code
   */
  const handleLanguageSelect = async (newLanguage) => {
    if (newLanguage === language || isChanging) {
      setIsOpen(false);
      return;
    }

    try {
      setIsChanging(true);
      setIsOpen(false);

      const success = await setLanguage(newLanguage);
      
      if (success) {
        // Call callback if provided
        if (onLanguageChange) {
          onLanguageChange(newLanguage);
        }
      } else {
        console.error(`Failed to change language to: ${newLanguage}`);
      }
    } catch (error) {
      console.error('Language change error:', error);
    } finally {
      setIsChanging(false);
    }
  };

  /**
   * Render dropdown variant
   */
  const renderDropdown = () => (
    <div className={`language-switcher language-switcher--dropdown ${className}`}>
      <button
        className="language-switcher__trigger"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || isChanging}
        aria-label={t('common:labels.language')}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="language-switcher__current">
          {showFlags && (
            <span className="language-switcher__flag" aria-hidden="true">
              {currentLanguageConfig?.flag}
            </span>
          )}
          <span className="language-switcher__name">
            {t('common:labels.changeLanguage', 'Change Language')}
          </span>
        </span>
        <span 
          className={`language-switcher__arrow ${isOpen ? 'language-switcher__arrow--up' : ''}`}
          aria-hidden="true"
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="language-switcher__dropdown" role="listbox">
          {languageOptions.map((langConfig) => (
            <button
              key={langConfig.code}
              className={`language-switcher__option ${
                langConfig.code === language ? 'language-switcher__option--active' : ''
              }`}
              onClick={() => handleLanguageSelect(langConfig.code)}
              role="option"
              aria-selected={langConfig.code === language}
            >
              {showFlags && (
                <span className="language-switcher__flag" aria-hidden="true">
                  {langConfig.flag}
                </span>
              )}
              <span className="language-switcher__name">
                {langConfig.name}
              </span>
              <span className="language-switcher__native-name">
                {langConfig.nativeName}
              </span>
            </button>
          ))}
        </div>
      )}

      {(isLoading || isChanging) && (
        <div className="language-switcher__loading" aria-live="polite">
          {t('common:messages.loading')}
        </div>
      )}
    </div>
  );

  /**
   * Render inline variant
   */
  const renderInline = () => (
    <div className={`language-switcher language-switcher--inline ${className}`}>
      <div className="language-switcher__label">
        {t('common:labels.language')}:
      </div>
      <div className="language-switcher__options">
        {languageOptions.map((langConfig) => (
          <button
            key={langConfig.code}
            className={`language-switcher__option ${
              langConfig.code === language ? 'language-switcher__option--active' : ''
            }`}
            onClick={() => handleLanguageSelect(langConfig.code)}
            disabled={isLoading || isChanging}
            aria-pressed={langConfig.code === language}
          >
            {showFlags && (
              <span className="language-switcher__flag" aria-hidden="true">
                {langConfig.flag}
              </span>
            )}
            <span className="language-switcher__name">
              {langConfig.name}
            </span>
          </button>
        ))}
      </div>

      {(isLoading || isChanging) && (
        <div className="language-switcher__loading" aria-live="polite">
          {t('common:messages.loading')}
        </div>
      )}
    </div>
  );

  /**
   * Render sidebar variant
   */
  const renderSidebar = () => (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        aria-expanded={isOpen}
        disabled={isLoading || isChanging}
      >
        <div className="flex items-center space-x-2">
          {showFlags && (
            <span className="text-base">{currentLanguageConfig?.flag}</span>
          )}
          <span className="text-gray-700 truncate">{currentLanguageConfig?.name}</span>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {languageOptions.map((langConfig) => (
            <button
              key={langConfig.code}
              onClick={() => handleLanguageSelect(langConfig.code)}
              className={`w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                language === langConfig.code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
              }`}
            >
              {showFlags && (
                <span className="text-base">{langConfig.flag}</span>
              )}
              <span className="truncate">{langConfig.name}</span>
              {language === langConfig.code && (
                <svg className="w-4 h-4 text-primary-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}

      {(isLoading || isChanging) && (
        <div className="text-xs text-gray-500 mt-1" aria-live="polite">
          {t('common:messages.loading')}
        </div>
      )}
    </div>
  );
  const renderModal = () => (
    <div className={`language-switcher language-switcher--modal ${className}`}>
      <button
        className="language-switcher__trigger"
        onClick={() => setIsOpen(true)}
        disabled={isLoading || isChanging}
        aria-label={t('common:labels.language')}
      >
        {showFlags && (
          <span className="language-switcher__flag" aria-hidden="true">
            {currentLanguageConfig?.flag}
          </span>
        )}
        <span className="language-switcher__name">
          {t('common:labels.changeLanguage', 'Change Language')}
        </span>
      </button>

      {isOpen && (
        <div className="language-switcher__modal-overlay" onClick={() => setIsOpen(false)}>
          <div 
            className="language-switcher__modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="language-modal-title"
          >
            <div className="language-switcher__modal-header">
              <h3 id="language-modal-title">
                {t('onboarding:selectLanguage')}
              </h3>
              <button
                className="language-switcher__close"
                onClick={() => setIsOpen(false)}
                aria-label={t('common:buttons.close')}
              >
                ×
              </button>
            </div>
            
            <div className="language-switcher__modal-content">
              {languageOptions.map((langConfig) => (
                <button
                  key={langConfig.code}
                  className={`language-switcher__option ${
                    langConfig.code === language ? 'language-switcher__option--active' : ''
                  }`}
                  onClick={() => handleLanguageSelect(langConfig.code)}
                >
                  {showFlags && (
                    <span className="language-switcher__flag" aria-hidden="true">
                      {langConfig.flag}
                    </span>
                  )}
                  <div className="language-switcher__option-text">
                    <span className="language-switcher__name">
                      {langConfig.name}
                    </span>
                    <span className="language-switcher__native-name">
                      {langConfig.nativeName}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(isLoading || isChanging) && (
        <div className="language-switcher__loading" aria-live="polite">
          {t('common:messages.loading')}
        </div>
      )}
    </div>
  );

  // Close dropdown when clicking outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-switcher')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  // Render based on variant
  switch (variant) {
    case 'inline':
      return renderInline();
    case 'modal':
      return renderModal();
    case 'sidebar':
      return renderSidebar();
    case 'dropdown':
    default:
      return renderDropdown();
  }
}

export default LanguageSwitcher;