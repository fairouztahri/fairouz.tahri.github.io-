import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCourt, getAvailability, createBooking, createCheckout } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function BookingPage() {
  const { courtId } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [court, setCourt] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    loadCourt();
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  }, [courtId]);
  
  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate, courtId]);
  
  const loadCourt = async () => {
    try {
      const response = await getCourt(courtId);
      setCourt(response.data);
    } catch (error) {
      console.error('Error loading court:', error);
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };
  
  const loadAvailability = async () => {
    try {
      const response = await getAvailability(courtId, selectedDate);
      setSlots(response.data.slots);
    } catch (error) {
      console.error('Error loading availability:', error);
    }
  };
  
  const handleBooking = async () => {
    if (!selectedSlot) {
      setError(i18n.language === 'ar' ? 'الرجاء اختيار وقت' : 'Please select a time slot');
      return;
    }
    
    setBookingLoading(true);
    setError('');
    
    try {
      // Create booking
      const bookingResponse = await createBooking({
        court_id: courtId,
        date: selectedDate,
        time_slot: selectedSlot.time_slot
      });
      
      const booking = bookingResponse.data;
      
      // Create checkout session
      const checkoutResponse = await createCheckout({
        booking_id: booking.booking_id,
        origin_url: window.location.origin
      });
      
      // Redirect to Stripe
      window.location.href = checkoutResponse.data.url;
    } catch (err) {
      setError(err.response?.data?.detail || t('error'));
      setBookingLoading(false);
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
  
  if (!court) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-xl">{t('error')}</div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <img
                src={court.image_url}
                alt={i18n.language === 'ar' ? court.name_ar : court.name_en}
                className="w-full h-64 object-cover rounded-lg"
              />
              <h1 className="text-3xl font-bold mt-4" data-testid="booking-court-name">
                {i18n.language === 'ar' ? court.name_ar : court.name_en}
              </h1>
              <p className="text-gray-600 mt-2">
                {i18n.language === 'ar' ? court.description_ar : court.description_en}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" data-testid="booking-error">
                {error}
              </div>
            )}
            
            {/* Date Selection */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                {t('selectDate')}
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                data-testid="date-picker"
              />
            </div>
            
            {/* Time Slots */}
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                {t('selectTimeSlot')}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot.time_slot}
                    onClick={() => slot.is_available && setSelectedSlot(slot)}
                    disabled={!slot.is_available}
                    className={`p-3 rounded-lg border-2 text-center transition ${
                      !slot.is_available
                        ? 'bg-gray-100 text-gray-400 border-gray-300 cursor-not-allowed'
                        : selectedSlot?.time_slot === slot.time_slot
                        ? 'bg-yellow-500 text-white border-yellow-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-yellow-500'
                    }`}
                    data-testid={`time-slot-${slot.time_slot}`}
                  >
                    <div className="font-bold">{slot.time_slot}</div>
                    <div className="text-sm">{slot.price} AED</div>
                    <div className="text-xs">
                      {slot.is_available ? t('available') : t('booked')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Pricing Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-bold mb-2">{t('pricing')}</h3>
              <div className="space-y-1 text-sm">
                <p>{t('morningSlot')}: <span className="font-bold">100 AED</span></p>
                <p>{t('eveningSlot')}: <span className="font-bold">135 AED</span></p>
              </div>
            </div>
            
            {/* Booking Summary */}
            {selectedSlot && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold mb-2">
                  {i18n.language === 'ar' ? 'ملخص الحجز' : 'Booking Summary'}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('court')}:</span>
                    <span className="font-medium">{i18n.language === 'ar' ? court.name_ar : court.name_en}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('date')}:</span>
                    <span className="font-medium">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('time')}:</span>
                    <span className="font-medium">{selectedSlot.time_slot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('duration')}:</span>
                    <span className="font-medium">60 {i18n.language === 'ar' ? 'دقيقة' : 'minutes'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                    <span>{t('price')}:</span>
                    <span className="text-yellow-600">{selectedSlot.price} AED</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Confirm Button */}
            <button
              onClick={handleBooking}
              disabled={!selectedSlot || bookingLoading}
              className="w-full bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
              data-testid="confirm-booking-button"
            >
              {bookingLoading ? t('loading') : t('proceedToPayment')}
            </button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default BookingPage;