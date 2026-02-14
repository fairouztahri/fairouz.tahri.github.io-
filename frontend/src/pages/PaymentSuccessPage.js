import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getPaymentStatus } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function PaymentSuccessPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('checking');
  const [paymentInfo, setPaymentInfo] = useState(null);
  const sessionId = searchParams.get('session_id');
  
  useEffect(() => {
    if (!sessionId) {
      navigate('/bookings');
      return;
    }
    
    checkPaymentStatus();
  }, [sessionId]);
  
  const checkPaymentStatus = async () => {
    let attempts = 0;
    const maxAttempts = 5;
    const pollInterval = 2000;
    
    const poll = async () => {
      if (attempts >= maxAttempts) {
        setStatus('timeout');
        return;
      }
      
      try {
        const response = await getPaymentStatus(sessionId);
        setPaymentInfo(response.data);
        
        if (response.data.payment_status === 'paid') {
          setStatus('success');
        } else if (response.data.status === 'expired') {
          setStatus('expired');
        } else {
          attempts++;
          setTimeout(poll, pollInterval);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        setStatus('error');
      }
    };
    
    poll();
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow flex items-center justify-center bg-gray-50 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {status === 'checking' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">{t('loading')}</h2>
              <p className="text-gray-600">
                {i18n.language === 'ar' ? 'جاري التحقق من الدفع...' : 'Verifying payment...'}
              </p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-2xl font-bold mb-2 text-green-600" data-testid="payment-success-message">
                {t('paymentSuccess')}
              </h2>
              <p className="text-gray-600 mb-6">
                {i18n.language === 'ar' 
                  ? 'تم تأكيد حجزك بنجاح!'
                  : 'Your booking has been confirmed successfully!'
                }
              </p>
              {paymentInfo && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <p className="text-sm">
                    <span className="font-medium">{t('price')}:</span> {paymentInfo.amount_total / 100} {paymentInfo.currency.toUpperCase()}
                  </p>
                </div>
              )}
              <button
                onClick={() => navigate('/bookings')}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-medium"
                data-testid="view-bookings-button"
              >
                {t('myBookings')}
              </button>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold mb-2 text-red-600">{t('error')}</h2>
              <p className="text-gray-600 mb-6">
                {i18n.language === 'ar'
                  ? 'حدث خطأ في معالجة الدفع'
                  : 'An error occurred while processing payment'
                }
              </p>
              <button
                onClick={() => navigate('/courts')}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-medium"
              >
                {i18n.language === 'ar' ? 'العودة للملاعب' : 'Back to Courts'}
              </button>
            </>
          )}
          
          {status === 'expired' && (
            <>
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-2xl font-bold mb-2 text-orange-600">
                {i18n.language === 'ar' ? 'انتهت صلاحية الجلسة' : 'Session Expired'}
              </h2>
              <p className="text-gray-600 mb-6">
                {i18n.language === 'ar'
                  ? 'انتهت صلاحية جلسة الدفع. يرجى المحاولة مرة أخرى.'
                  : 'Payment session expired. Please try again.'
                }
              </p>
              <button
                onClick={() => navigate('/courts')}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-medium"
              >
                {i18n.language === 'ar' ? 'العودة للملاعب' : 'Back to Courts'}
              </button>
            </>
          )}
          
          {status === 'timeout' && (
            <>
              <div className="text-6xl mb-4">⏱️</div>
              <h2 className="text-2xl font-bold mb-2 text-orange-600">
                {i18n.language === 'ar' ? 'تحقق من حجزك' : 'Check Your Booking'}
              </h2>
              <p className="text-gray-600 mb-6">
                {i18n.language === 'ar'
                  ? 'يرجى التحقق من حجزك في صفحة حجوزاتي'
                  : 'Please check your booking in My Bookings page'
                }
              </p>
              <button
                onClick={() => navigate('/bookings')}
                className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-medium"
              >
                {t('myBookings')}
              </button>
            </>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default PaymentSuccessPage;