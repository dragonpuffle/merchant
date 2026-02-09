import WebApp from '@twa-dev/sdk';

export interface TelegramTheme {
  bgColor: string;
  textColor: string;
  hintColor: string;
  linkColor: string;
  buttonColor: string;
  buttonTextColor: string;
  secondaryBgColor: string;
}

export function initTelegramWebApp(): void {
  WebApp.ready();
  WebApp.expand();
}

export function getTelegramTheme(): TelegramTheme {
  return {
    bgColor: WebApp.themeParams.bg_color || '#ffffff',
    textColor: WebApp.themeParams.text_color || '#000000',
    hintColor: WebApp.themeParams.hint_color || '#999999',
    linkColor: WebApp.themeParams.link_color || '#2481cc',
    buttonColor: WebApp.themeParams.button_color || '#2481cc',
    buttonTextColor: WebApp.themeParams.button_text_color || '#ffffff',
    secondaryBgColor: WebApp.themeParams.secondary_bg_color || '#f1f1f1',
  };
}

export function applyTelegramTheme(): void {
  const theme = getTelegramTheme();
  const root = document.documentElement;

  root.style.setProperty('--tg-theme-bg-color', theme.bgColor);
  root.style.setProperty('--tg-theme-text-color', theme.textColor);
  root.style.setProperty('--tg-theme-hint-color', theme.hintColor);
  root.style.setProperty('--tg-theme-link-color', theme.linkColor);
  root.style.setProperty('--tg-theme-button-color', theme.buttonColor);
  root.style.setProperty('--tg-theme-button-text-color', theme.buttonTextColor);
  root.style.setProperty('--tg-theme-secondary-bg-color', theme.secondaryBgColor);

  // Set header color
  WebApp.setHeaderColor(theme.bgColor as `#${string}` | 'bg_color' | 'secondary_bg_color');

  // Apply theme class
  const colorScheme = WebApp.colorScheme;
  root.classList.remove('telegram-theme-light', 'telegram-theme-dark');
  root.classList.add(`telegram-theme-${colorScheme}`);
}

export function onThemeChange(callback: () => void): void {
  WebApp.onEvent('themeChanged', callback);
}

export function offThemeChange(callback: () => void): void {
  WebApp.offEvent('themeChanged', callback);
}

export function onViewportChange(callback: () => void): void {
  WebApp.onEvent('viewportChanged', callback);
}

export function offViewportChange(callback: () => void): void {
  WebApp.offEvent('viewportChanged', callback);
}

export function isTelegram(): boolean {
  return WebApp.initData !== '';
}

export function closeTelegram(): void {
  WebApp.close();
}

export function hapticFeedback(type: 'impact' | 'notification' | 'selection', style?: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'error' | 'success' | 'warning'): void {
  if (WebApp.HapticFeedback) {
    switch (type) {
      case 'impact':
        WebApp.HapticFeedback.impactOccurred((style as 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') || 'medium');
        break;
      case 'notification':
        WebApp.HapticFeedback.notificationOccurred((style as 'error' | 'success' | 'warning') || 'success');
        break;
      case 'selection':
        WebApp.HapticFeedback.selectionChanged();
        break;
    }
  }
}
