import { useState } from 'react';
import type { AppSettings } from '../types';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onBack: () => void;
}

export default function Settings({ settings, onSettingsChange, onBack }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleToggle = (key: keyof AppSettings) => {
    const newSettings = {
      ...localSettings,
      [key]: !localSettings[key]
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    
    // Show toast notification
    const settingName = getSettingName(key);
    setToastMessage(`${settingName}: ${newSettings[key] ? 'Включено' : 'Выключено'}`);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 2000);
  };

  const handleLanguageChange = (language: 'ru' | 'en') => {
    const newSettings = {
      ...localSettings,
      language
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    
    setToastMessage(`Язык: ${language === 'ru' ? 'Русский' : 'English'}`);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 2000);
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    const newSettings = {
      ...localSettings,
      theme
    };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
    
    const themeName = getThemeName(theme);
    setToastMessage(`Тема: ${themeName}`);
    setShowNotificationToast(true);
    setTimeout(() => setShowNotificationToast(false), 2000);
  };

  const getSettingName = (key: keyof AppSettings): string => {
    const names: Record<string, string> = {
      notifications: 'Уведомления',
      soundEffects: 'Звуковые эффекты',
      autoPlayAudio: 'Автовоспроизведение аудио',
      language: 'Язык',
      theme: 'Тема'
    };
    return names[key] || key;
  };

  const getThemeName = (theme: string): string => {
    const names: Record<string, string> = {
      light: 'Светлая',
      dark: 'Темная',
      auto: 'Автоматическая'
    };
    return names[theme] || theme;
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-button" onClick={onBack}>
          ← Назад
        </button>
        <h1 className="settings-title">Настройки</h1>
      </div>

      <div className="settings-content">
        <div className="settings-section">
          <h2 className="section-title">Уведомления</h2>
          
          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Уведомления</div>
              <div className="setting-description">Получать уведомления о новых маршрутах</div>
            </div>
            <button
              className={`toggle-button ${localSettings.notifications ? 'active' : ''}`}
              onClick={() => handleToggle('notifications')}
              aria-label="Toggle notifications"
            >
              <div className="toggle-slider" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Звуковые эффекты</div>
              <div className="setting-description">Звуки при взаимодействии с приложением</div>
            </div>
            <button
              className={`toggle-button ${localSettings.soundEffects ? 'active' : ''}`}
              onClick={() => handleToggle('soundEffects')}
              aria-label="Toggle sound effects"
            >
              <div className="toggle-slider" />
            </button>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <div className="setting-label">Автовоспроизведение аудио</div>
              <div className="setting-description">Автоматически воспроизводить аудиогиды</div>
            </div>
            <button
              className={`toggle-button ${localSettings.autoPlayAudio ? 'active' : ''}`}
              onClick={() => handleToggle('autoPlayAudio')}
              aria-label="Toggle auto play audio"
            >
              <div className="toggle-slider" />
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Язык</h2>
          
          <div className="language-selector">
            <button
              className={`language-option ${localSettings.language === 'ru' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('ru')}
            >
              <span className="language-flag">🇷🇺s</span>
              <span className="language-name">Русский</span>
            </button>
            <button
              className={`language-option ${localSettings.language === 'en' ? 'active' : ''}`}
              onClick={() => handleLanguageChange('en')}
            >
              <span className="language-flag">eng</span>
              <span className="language-name">English</span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">Тема оформления</h2>
          
          <div className="theme-selector">
            <button
              className={`theme-option ${localSettings.theme === 'light' ? 'active' : ''}`}
              onClick={() => handleThemeChange('light')}
            >
              <span className="theme-icon">☀️</span>
              <span className="theme-name">Светлая</span>
            </button>
            <button
              className={`theme-option ${localSettings.theme === 'dark' ? 'active' : ''}`}
              onClick={() => handleThemeChange('dark')}
            >
              <span className="theme-icon">🌙</span>
              <span className="theme-name">Темная</span>
            </button>
            <button
              className={`theme-option ${localSettings.theme === 'auto' ? 'active' : ''}`}
              onClick={() => handleThemeChange('auto')}
            >
              <span className="theme-icon">🔄</span>
              <span className="theme-name">Авто</span>
            </button>
          </div>
        </div>

        <div className="settings-section">
          <h2 className="section-title">О приложении</h2>
          
          <div className="info-item">
            <div className="info-label">Версия</div>
            <div className="info-value">1.0.0</div>
          </div>
          
          <div className="info-item">
            <div className="info-label">Разработчик</div>
            <div className="info-value">ADDA</div>
          </div>
        </div>
      </div>

      {showNotificationToast && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
