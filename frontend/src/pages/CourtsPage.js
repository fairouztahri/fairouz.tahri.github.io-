import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCourts } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function CourtsPage() {
  const { t, i18n } = useTranslation();
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadCourts();
  }, []);
  
  const loadCourts = async () => {
    try {
      const response = await getCourts();
      setCourts(response.data);
    } catch (error) {
      console.error('Error loading courts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl">{t('loading')}</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-center mb-8" data-testid="courts-title">
            {t('courts')}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {courts.map((court) => (
              <div key={court.court_id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition" data-testid="court-card">
                <img
                  src={court.image_url}
                  alt={i18n.language === 'ar' ? court.name_ar : court.name_en}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h2 className="text-2xl font-bold mb-2">
                    {i18n.language === 'ar' ? court.name_ar : court.name_en}
                    {court.type === 'padel' ? ' 🎾' : ' ⚽'}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {i18n.language === 'ar' ? court.description_ar : court.description_en}
                  </p>
                  
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('morningSlot')}</span>
                      <span className="text-2xl font-bold text-yellow-600">100 AED</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">{t('eveningSlot')}</span>
                      <span className="text-2xl font-bold text-yellow-600">135 AED</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/book/${court.court_id}`}
                    className="block w-full bg-yellow-500 text-white text-center py-3 rounded-lg hover:bg-yellow-600 font-medium"
                    data-testid={`book-court-${court.court_id}`}
                  >
                    {t('bookCourt')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default CourtsPage;