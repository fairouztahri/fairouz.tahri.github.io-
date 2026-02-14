import React from 'react';
import { useTranslation } from 'react-i18next';

function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Golden Touch</h3>
            <p className="text-gray-300">
              {t('heroDescription')}
            </p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">{t('contactUs')}</h3>
            <p className="text-gray-300">+971 54 401 9195</p>
            <p className="text-gray-300">29C6+HJ2, Khor Kalba</p>
            <p className="text-gray-300">Sharjah, UAE</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold mb-4">{t('openingHours')}</h3>
            <p className="text-gray-300">{t('everyday')}</p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; 2025 Golden Touch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;