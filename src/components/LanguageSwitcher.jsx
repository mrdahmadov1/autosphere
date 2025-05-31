import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300 ${
          i18n.language === 'en'
            ? 'bg-accent text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300 ${
          i18n.language === 'ru'
            ? 'bg-accent text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        RU
      </button>
      <button
        onClick={() => changeLanguage('az')}
        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300 ${
          i18n.language === 'az'
            ? 'bg-accent text-white'
            : 'bg-white/10 text-white hover:bg-white/20'
        }`}
      >
        AZ
      </button>
    </div>
  );
};

export default LanguageSwitcher;
