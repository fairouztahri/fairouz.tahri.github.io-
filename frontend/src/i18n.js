import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Navigation
      home: 'Home',
      courts: 'Courts',
      myBookings: 'My Bookings',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      admin: 'Admin',
      
      // Hero Section
      heroTitle: 'Welcome to Golden Touch',
      heroSubtitle: 'Book Your Perfect Sports Experience',
      heroDescription: 'Professional padel and football courts with world-class facilities',
      bookNow: 'Book Now',
      
      // Courts
      padelCourt: 'Padel Court',
      footballCourt: 'Football Court',
      viewDetails: 'View Details',
      bookCourt: 'Book Court',
      
      // Pricing
      pricing: 'Pricing',
      morningSlot: 'Morning (8 AM - 4 PM)',
      eveningSlot: 'Evening (4 PM - 12 AM)',
      aedPerHour: 'AED per hour',
      
      // Booking
      selectDate: 'Select Date',
      selectTimeSlot: 'Select Time Slot',
      available: 'Available',
      booked: 'Booked',
      confirmBooking: 'Confirm Booking',
      proceedToPayment: 'Proceed to Payment',
      
      // Auth
      email: 'Email',
      phone: 'Phone Number',
      password: 'Password',
      name: 'Full Name',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      continueWithGoogle: 'Continue with Google',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",
      
      // Profile
      profile: 'Profile',
      myAccount: 'My Account',
      bookingHistory: 'Booking History',
      
      // Booking Details
      bookingId: 'Booking ID',
      court: 'Court',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      price: 'Price',
      status: 'Status',
      paymentStatus: 'Payment Status',
      cancel: 'Cancel',
      cancelBooking: 'Cancel Booking',
      
      // Status
      pending: 'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      paid: 'Paid',
      
      // Reviews
      reviews: 'Reviews',
      writeReview: 'Write a Review',
      rating: 'Rating',
      comment: 'Comment',
      submitReview: 'Submit Review',
      
      // Messages
      bookingSuccess: 'Booking created successfully!',
      paymentSuccess: 'Payment completed successfully!',
      bookingCancelled: 'Booking cancelled',
      error: 'An error occurred',
      loading: 'Loading...',
      
      // Footer
      contactUs: 'Contact Us',
      location: 'Location',
      openingHours: 'Opening Hours',
      everyday: 'Every day: 8 AM - 12 AM',
      
      // Admin
      dashboard: 'Dashboard',
      totalBookings: 'Total Bookings',
      totalRevenue: 'Total Revenue',
      totalUsers: 'Total Users',
      manageBookings: 'Manage Bookings',
      manageUsers: 'Manage Users',
      manageCourts: 'Manage Courts',
      
      // Misc
      or: 'or'
    }
  },
  ar: {
    translation: {
      // Navigation
      home: 'الرئيسية',
      courts: 'الملاعب',
      myBookings: 'حجوزاتي',
      login: 'تسجيل الدخول',
      register: 'إنشاء حساب',
      logout: 'تسجيل الخروج',
      admin: 'الإدارة',
      
      // Hero Section
      heroTitle: 'مرحباً بكم في اللمسة الذهبية',
      heroSubtitle: 'احجز تجربتك الرياضية المثالية',
      heroDescription: 'ملاعب احترافية للبادل وكرة القدم مع مرافق عالمية المستوى',
      bookNow: 'احجز الآن',
      
      // Courts
      padelCourt: 'ملعب البادل',
      footballCourt: 'ملعب كرة القدم',
      viewDetails: 'عرض التفاصيل',
      bookCourt: 'احجز الملعب',
      
      // Pricing
      pricing: 'الأسعار',
      morningSlot: 'صباحاً (8 ص - 4 م)',
      eveningSlot: 'مساءً (4 م - 12 م)',
      aedPerHour: 'درهم للساعة',
      
      // Booking
      selectDate: 'اختر التاريخ',
      selectTimeSlot: 'اختر الوقت',
      available: 'متاح',
      booked: 'محجوز',
      confirmBooking: 'تأكيد الحجز',
      proceedToPayment: 'المتابعة للدفع',
      
      // Auth
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      password: 'كلمة المرور',
      name: 'الاسم الكامل',
      signIn: 'تسجيل الدخول',
      signUp: 'إنشاء حساب',
      continueWithGoogle: 'المتابعة مع Google',
      alreadyHaveAccount: 'لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',
      
      // Profile
      profile: 'الملف الشخصي',
      myAccount: 'حسابي',
      bookingHistory: 'سجل الحجوزات',
      
      // Booking Details
      bookingId: 'رقم الحجز',
      court: 'الملعب',
      date: 'التاريخ',
      time: 'الوقت',
      duration: 'المدة',
      price: 'السعر',
      status: 'الحالة',
      paymentStatus: 'حالة الدفع',
      cancel: 'إلغاء',
      cancelBooking: 'إلغاء الحجز',
      
      // Status
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      cancelled: 'ملغى',
      paid: 'مدفوع',
      
      // Reviews
      reviews: 'التقييمات',
      writeReview: 'اكتب تقييم',
      rating: 'التقييم',
      comment: 'التعليق',
      submitReview: 'إرسال التقييم',
      
      // Messages
      bookingSuccess: 'تم إنشاء الحجز بنجاح!',
      paymentSuccess: 'تم الدفع بنجاح!',
      bookingCancelled: 'تم إلغاء الحجز',
      error: 'حدث خطأ',
      loading: 'جاري التحميل...',
      
      // Footer
      contactUs: 'اتصل بنا',
      location: 'الموقع',
      openingHours: 'ساعات العمل',
      everyday: 'يومياً: 8 صباحاً - 12 منتصف الليل',
      
      // Admin
      dashboard: 'لوحة التحكم',
      totalBookings: 'إجمالي الحجوزات',
      totalRevenue: 'إجمالي الإيرادات',
      totalUsers: 'إجمالي المستخدمين',
      manageBookings: 'إدارة الحجوزات',
      manageUsers: 'إدارة المستخدمين',
      manageCourts: 'إدارة الملاعب'
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;