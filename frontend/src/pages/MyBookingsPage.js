import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getMyBookings, cancelBooking, getCourts } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function MyBookingsPage() {
  const { t, i18n } = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [courts, setCourts] = useState({});
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [bookingsRes, courtsRes] = await Promise.all([
        getMyBookings(),
        getCourts()
      ]);
      
      setBookings(bookingsRes.data);
      
      // Create courts map
      const courtsMap = {};
      courtsRes.data.forEach(court => {
        courtsMap[court.court_id] = court;
      });
      setCourts(courtsMap);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = async (bookingId) => {
    if (!window.confirm(i18n.language === 'ar' ? 'هل أنت متأكد من إلغاء الحجز؟' : 'Are you sure you want to cancel this booking?')) {
      return;
    }
    
    setCancellingId(bookingId);
    try {
      await cancelBooking(bookingId);
      // Reload bookings
      await loadData();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(t('error'));
    } finally {
      setCancellingId(null);
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
          <h1 className="text-4xl font-bold mb-8" data-testid="my-bookings-title">
            {t('myBookings')}
          </h1>
          
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <p className="text-xl text-gray-600">
                {i18n.language === 'ar' ? 'لا توجد حجوزات' : 'No bookings yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const court = courts[booking.court_id];
                return (
                  <div key={booking.booking_id} className="bg-white rounded-lg shadow-lg p-6" data-testid="booking-card">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">
                          {court ? (i18n.language === 'ar' ? court.name_ar : court.name_en) : booking.court_id}
                          {court?.type === 'padel' ? ' 🎾' : ' ⚽'}
                        </h3>
                        <div className="space-y-1 text-sm">
                          <p><span className="font-medium">{t('bookingId')}:</span> {booking.booking_id}</p>
                          <p><span className="font-medium">{t('date')}:</span> {booking.date}</p>
                          <p><span className="font-medium">{t('time')}:</span> {booking.time_slot}</p>
                          <p><span className="font-medium">{t('duration')}:</span> {booking.duration} {i18n.language === 'ar' ? 'دقيقة' : 'minutes'}</p>
                          <p><span className="font-medium">{t('price')}:</span> {booking.price} AED</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between">
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">{t('status')}: </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {t(booking.status)}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm font-medium">{t('paymentStatus')}: </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.payment_status === 'paid' ? 'confirmed' : 'pending')}`}>
                              {t(booking.payment_status)}
                            </span>
                          </div>
                        </div>
                        
                        {booking.status !== 'cancelled' && booking.payment_status !== 'paid' && (
                          <button
                            onClick={() => handleCancel(booking.booking_id)}
                            disabled={cancellingId === booking.booking_id}
                            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50"
                            data-testid={`cancel-booking-${booking.booking_id}`}
                          >
                            {cancellingId === booking.booking_id ? t('loading') : t('cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default MyBookingsPage;