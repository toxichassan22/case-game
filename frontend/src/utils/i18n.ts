/**
 * Internationalization (i18n) System
 * Translation management with fallback
 */

export type Language = 'en' | 'ar' | 'fr' | 'es' | 'de' | 'ja' | 'ko' | 'zh';

export interface Translation {
  [key: string]: string | Translation;
}

export interface Translations {
  [lang: string]: Translation;
}

// Default translations
const defaultTranslations: Translations = {
  en: {
    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.logout': 'Logout',
    'auth.guest': 'Continue as Guest',
    'auth.playerName': 'Player Name',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    
    // Game
    'game.title': 'Investigation Game',
    'game.start': 'Start Game',
    'game.pause': 'Pause',
    'game.resume': 'Resume',
    'game.case': 'Case',
    'game.evidence': 'Evidence',
    'game.suspects': 'Suspects',
    'game.timeline': 'Timeline',
    
    // UI
    'ui.search': 'Search...',
    'ui.loading': 'Loading...',
    'ui.error': 'Error',
    'ui.success': 'Success',
    'ui.cancel': 'Cancel',
    'ui.confirm': 'Confirm',
    'ui.save': 'Save',
    'ui.delete': 'Delete',
    'ui.edit': 'Edit',
    'ui.next': 'Next',
    'ui.previous': 'Previous',
    'ui.close': 'Close',
    
    // Navigation
    'nav.home': 'Home',
    'nav.cases': 'Cases',
    'nav.settings': 'Settings',
    'nav.profile': 'Profile',
    'nav.help': 'Help',
    
    // Messages
    'msg.welcome': 'Welcome to the Investigation Game',
    'msg.noCases': 'No cases available',
    'msg.noEvidence': 'No evidence collected yet',
    'msg.gameOver': 'Game Over',
    'msg.congratulations': 'Congratulations!',
    'msg.tryAgain': 'Try Again',
  },
  ar: {
    'auth.login': 'تسجيل الدخول',
    'auth.register': 'تسجيل',
    'auth.logout': 'تسجيل الخروج',
    'auth.guest': 'المتابعة كضيف',
    'auth.playerName': 'اسم اللاعب',
    'auth.password': 'كلمة المرور',
    'auth.confirmPassword': 'تأكيد كلمة المرور',
    
    'game.title': 'لعبة التحقيق',
    'game.start': 'ابدأ اللعبة',
    'game.pause': 'إيقاف مؤقت',
    'game.resume': 'استئناف',
    'game.case': 'القضية',
    'game.evidence': 'الأدلة',
    'game.suspects': 'المشتبه بهم',
    'game.timeline': 'الجدول الزمني',
    
    'ui.search': 'بحث...',
    'ui.loading': 'جاري التحميل...',
    'ui.error': 'خطأ',
    'ui.success': 'نجاح',
    'ui.cancel': 'إلغاء',
    'ui.confirm': 'تأكيد',
    'ui.save': 'حفظ',
    'ui.delete': 'حذف',
    'ui.edit': 'تعديل',
    'ui.next': 'التالي',
    'ui.previous': 'السابق',
    'ui.close': 'إغلاق',
    
    'nav.home': 'الرئيسية',
    'nav.cases': 'القضايا',
    'nav.settings': 'الإعدادات',
    'nav.profile': 'الملف الشخصي',
    'nav.help': 'مساعدة',
  },
  fr: {
    'auth.login': 'Connexion',
    'auth.register': 'Inscription',
    'auth.logout': 'Déconnexion',
    'auth.guest': 'Continuer en tant qu\'invité',
    'auth.playerName': 'Nom du joueur',
    'auth.password': 'Mot de passe',
    
    'game.title': 'Jeu d\'enquête',
    'game.start': 'Commencer',
    'game.pause': 'Pause',
    'game.resume': 'Reprendre',
    'game.case': 'Affaire',
    'game.evidence': 'Preuves',
    'game.suspects': 'Suspects',
  },
  es: {
    'auth.login': 'Iniciar sesión',
    'auth.register': 'Registrarse',
    'auth.logout': 'Cerrar sesión',
    'auth.guest': 'Continuar como invitado',
    
    'game.title': 'Juego de investigación',
    'game.start': 'Comenzar',
    'game.pause': 'Pausa',
    'game.resume': 'Reanudar',
    'game.case': 'Caso',
    'game.evidence': 'Evidencia',
    'game.suspects': 'Sospechosos',
  },
};

export class I18nService {
  private currentLanguage: Language = 'en';
  private translations: Translations = defaultTranslations;
  private customTranslations: Translations = {};

  constructor() {
    // Load saved language preference
    const saved = localStorage.getItem('preferred-language');
    if (saved && this.isValidLanguage(saved)) {
      this.currentLanguage = saved;
    }
  }

  /**
   * Set current language
   */
  setLanguage(lang: Language) {
    this.currentLanguage = lang;
    localStorage.setItem('preferred-language', lang);
  }

  /**
   * Get current language
   */
  getLanguage(): Language {
    return this.currentLanguage;
  }

  /**
   * Translate a key
   */
  t(key: string, params?: Record<string, string>): string {
    let translation = this.getNestedTranslation(key);
    
    // Replace parameters
    if (params && translation) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation || key;
  }

  /**
   * Get nested translation
   */
  private getNestedTranslation(key: string): string {
    const keys = key.split('.');
    let current: any = this.translations[this.currentLanguage] || this.translations['en'];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        return key; // Return key if translation not found
      }
    }

    return typeof current === 'string' ? current : key;
  }

  /**
   * Add custom translations
   */
  addTranslations(lang: Language, translations: Translation) {
    this.customTranslations[lang] = {
      ...this.customTranslations[lang],
      ...translations,
    };
    
    this.translations[lang] = {
      ...this.translations[lang],
      ...this.customTranslations[lang],
    };
  }

  /**
   * Check if language is valid
   */
  private isValidLanguage(lang: string): lang is Language {
    return ['en', 'ar', 'fr', 'es', 'de', 'ja', 'ko', 'zh'].includes(lang);
  }

  /**
   * Get available languages
   */
  getAvailableLanguages(): Language[] {
    return Object.keys(this.translations) as Language[];
  }

  /**
   * Check if RTL language
   */
  isRTL(): boolean {
    return ['ar'].includes(this.currentLanguage);
  }
}

// Singleton instance
export const i18n = new I18nService();

// React hook
import { useState, useEffect } from 'react';

export function useTranslation() {
  const [language, setLanguageState] = useState<Language>(i18n.getLanguage());

  useEffect(() => {
    // Language state is managed by i18n service
    return () => {
      // Cleanup
    };
  }, []);

  const t = (key: string, params?: Record<string, string>) => {
    return i18n.t(key, params);
  };

  const setLanguage = (lang: Language) => {
    i18n.setLanguage(lang);
    setLanguageState(lang);
  };

  return { t, language, setLanguage, isRTL: i18n.isRTL() };
}
