"use client";

import { useTranslation } from '@/lib/i18n/useTranslation';

export default function LanguageDemo() {
  const { language, setLanguage, t } = useTranslation();

  return (
    <div className="p-4 border rounded-lg bg-gray-100 dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-4">Language Demo</h3>
      
      <div className="mb-4">
        <p className="mb-2">Current Language: <strong>{language.toUpperCase()}</strong></p>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1 rounded ${language === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('tr')}
            className={`px-3 py-1 rounded ${language === 'tr' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Türkçe
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <p><strong>Navigation:</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>Home: {t('navigation.home')}</li>
          <li>Products: {t('navigation.products')}</li>
          <li>Career: {t('navigation.career')}</li>
          <li>Contact: {t('navigation.contact')}</li>
        </ul>

        <p className="mt-4"><strong>Homepage:</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>Hero Title: {t('homepage.hero_title')}</li>
          <li>About Button: {t('homepage.about_button')}</li>
        </ul>

        <p className="mt-4"><strong>Common:</strong></p>
        <ul className="list-disc list-inside ml-4">
          <li>Search: {t('common.search')}</li>
          <li>Loading: {t('common.loading')}</li>
        </ul>
      </div>
    </div>
  );
}
