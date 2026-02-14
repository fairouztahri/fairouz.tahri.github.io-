import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAdminStats, getAllBookings, getAllUsers, getCourts } from '../api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function AdminDashboard() {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [courts, setCourts] = useState({});
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    try {
      const [statsRes, bookingsRes, usersRes, courtsRes] = await Promise.all([
        getAdminStats(),
        getAllBookings(),
        getAllUsers(),
        getCourts()
      ]);
      
      setStats(statsRes.data);
      setBookings(bookingsRes.data);
      setUsers(usersRes.data);
      
      // Create courts map
      const courtsMap = {};
      courtsRes.data.forEach(court => {
        courtsMap[court.court_id] = court;
      });
      setCourts(courtsMap);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-bold mb-8" data-testid="admin-dashboard-title">
            {t('dashboard')} 📊
          </h1>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab('stats')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'stats'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                data-testid="stats-tab"
              >
                {i18n.language === 'ar' ? 'الإحصائيات' : 'Statistics'}
              </button>
              <button
                onClick={() => setActiveTab('bookings')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'bookings'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                data-testid="bookings-tab"
              >
                {t('manageBookings')}
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-3 font-medium ${
                  activeTab === 'users'
                    ? 'border-b-2 border-yellow-500 text-yellow-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                data-testid="users-tab"
              >
                {t('manageUsers')}
              </button>
            </div>
          </div>
          
          {/* Stats Tab */}
          {activeTab === 'stats' && stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-lg p-6" data-testid="total-bookings-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t('totalBookings')}</p>
                    <p className="text-3xl font-bold text-yellow-600">{stats.total_bookings}</p>
                  </div>
                  <div className="text-5xl">📝</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6" data-testid="total-revenue-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t('totalRevenue')}</p>
                    <p className="text-3xl font-bold text-green-600">{stats.total_revenue} AED</p>
                  </div>
                  <div className="text-5xl">💰</div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6" data-testid="total-users-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{t('totalUsers')}</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.total_users}</p>
                  </div>
                  <div className="text-5xl">👥</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="bookings-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('bookingId')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('court')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('date')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('time')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('price')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('status')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('paymentStatus')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => {
                      const court = courts[booking.court_id];
                      return (
                        <tr key={booking.booking_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {booking.booking_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {court ? (i18n.language === 'ar' ? court.name_ar : court.name_en) : booking.court_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {booking.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {booking.time_slot}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {booking.price} AED
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                              {t(booking.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.payment_status === 'paid' ? 'confirmed' : 'pending')}`}>
                              {t(booking.payment_status)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200" data-testid="users-table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('email')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {t('phone')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {i18n.language === 'ar' ? 'الدور' : 'Role'}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        {i18n.language === 'ar' ? 'تاريخ التسجيل' : 'Joined'}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.user_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.picture && (
                              <img
                                src={user.picture}
                                alt={user.name}
                                className="w-8 h-8 rounded-full mr-2"
                              />
                            )}
                            <span className="text-sm">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {user.phone || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default AdminDashboard;