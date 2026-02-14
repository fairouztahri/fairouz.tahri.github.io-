import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function HomePage() {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-4" data-testid="hero-title">
            {t('heroTitle')}
          </h1>
          <p className="text-2xl mb-2">{t('heroSubtitle')}</p>
          <p className="text-xl mb-8 text-yellow-100">{t('heroDescription')}</p>
          <Link
            to="/courts"
            className="inline-block bg-white text-yellow-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-50 transition"
            data-testid="book-now-btn"
          >
            {t('bookNow')} ⚽
          </Link>
        </div>
      </div>
      
      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Padel Court */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800"
                alt="Padel Court"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {i18n.language === 'ar' ? 'ملعب البادل' : 'Padel Court'} 🎾
                </h3>
                <p className="text-gray-600 mb-4">
                  {i18n.language === 'ar' 
                    ? 'ملعب بادل احترافي مع إضاءة ممتازة وأرضية عالية الجودة'
                    : 'Professional padel court with excellent lighting and high-quality flooring'
                  }
                </p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">{t('morningSlot')}</p>
                  <p className="text-2xl font-bold text-yellow-600">100 {t('aedPerHour')}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">{t('eveningSlot')}</p>
                  <p className="text-2xl font-bold text-yellow-600">135 {t('aedPerHour')}</p>
                </div>
                <Link
                  to="/courts"
                  className="block w-full bg-yellow-500 text-white text-center py-2 rounded-lg hover:bg-yellow-600 font-medium"
                >
                  {t('bookNow')}
                </Link>
              </div>
            </div>
            
            {/* Football Court */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
              <img
                src="https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800"
                alt="Football Court"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {i18n.language === 'ar' ? 'ملعب كرة القدم' : 'Football Court'} ⚽
                </h3>
                <p className="text-gray-600 mb-4">
                  {i18n.language === 'ar'
                    ? 'ملعب كرة قدم بمعايير احترافية مع عشب صناعي عالي الجودة'
                    : 'Professional football court with high-quality artificial turf'
                  }
                </p>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">{t('morningSlot')}</p>
                  <p className="text-2xl font-bold text-yellow-600">100 {t('aedPerHour')}</p>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-500">{t('eveningSlot')}</p>
                  <p className="text-2xl font-bold text-yellow-600">135 {t('aedPerHour')}</p>
                </div>
                <Link
                  to="/courts"
                  className="block w-full bg-yellow-500 text-white text-center py-2 rounded-lg hover:bg-yellow-600 font-medium"
                >
                  {t('bookNow')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Why Choose Us */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            {i18n.language === 'ar' ? 'لماذا تختار اللمسة الذهبية؟' : 'Why Choose Golden Touch?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">
                {i18n.language === 'ar' ? 'ملاعب احترافية' : 'Professional Courts'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar' 
                  ? 'ملاعب بمعايير عالمية وصيانة دورية'
                  : 'World-class courts with regular maintenance'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">💳</div>
              <h3 className="text-xl font-bold mb-2">
                {i18n.language === 'ar' ? 'دفع آمن وسهل' : 'Easy & Secure Payment'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar'
                  ? 'نظام دفع إلكتروني آمن وموثوق'
                  : 'Secure online payment system'
                }
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">⏰</div>
              <h3 className="text-xl font-bold mb-2">
                {i18n.language === 'ar' ? 'حجز فوري' : 'Instant Booking'}
              </h3>
              <p className="text-gray-600">
                {i18n.language === 'ar'
                  ? 'احجز ملعبك في ثوانٍ معدودة'
                  : 'Book your court in seconds'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default HomePage;