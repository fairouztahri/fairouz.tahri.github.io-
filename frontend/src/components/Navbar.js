import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getMe, logout } from '../api';

function Navbar() {
  const { t, i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const response = await getMe();
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <nav className="bg-gradient-to-r from-yellow-500 to-yellow-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 rtl:space-x-reverse">
              <span className="text-2xl">⚽</span>
              <span className="text-xl font-bold text-white">Golden Touch</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4 rtl:space-x-reverse">
            <Link to="/" className="text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
              {t('home')}
            </Link>
            <Link to="/courts" className="text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
              {t('courts')}
            </Link>
            
            {user ? (
              <>
                <Link to="/bookings" className="text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
                  {t('myBookings')}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
                    {t('admin')}
                  </Link>
                )}
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  {user.picture && (
                    <img src={user.picture} alt={user.name} className="w-8 h-8 rounded-full" />
                  )}
                  <span className="text-white">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 font-medium"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
                  {t('login')}
                </Link>
                <Link to="/register" className="bg-white text-yellow-600 px-4 py-2 rounded-md hover:bg-yellow-50 font-medium">
                  {t('register')}
                </Link>
              </>
            )}
            
            <button
              onClick={toggleLanguage}
              className="bg-yellow-700 text-white px-3 py-2 rounded-md hover:bg-yellow-800 font-medium"
            >
              {i18n.language === 'ar' ? 'EN' : 'AR'}
            </button>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-yellow-600">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
              {t('home')}
            </Link>
            <Link to="/courts" className="block text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
              {t('courts')}
            </Link>
            
            {user ? (
              <>
                <Link to="/bookings" className="block text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
                  {t('myBookings')}
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="block text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
                    {t('admin')}
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium"
                >
                  {t('logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
                  {t('login')}
                </Link>
                <Link to="/register" className="block text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium">
                  {t('register')}
                </Link>
              </>
            )}
            
            <button
              onClick={toggleLanguage}
              className="block w-full text-left text-white hover:text-yellow-100 px-3 py-2 rounded-md font-medium"
            >
              {i18n.language === 'ar' ? 'English' : 'العربية'}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;