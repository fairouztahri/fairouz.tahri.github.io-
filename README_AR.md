# Golden Touch - تطبيق حجز الملاعب الرياضية

## نظرة عامة / Overview

تطبيق ثنائي اللغة (عربي/إنجليزي) لحجز ملاعب البادل وكرة القدم لمنشأة "اللمسة الذهبية" الرياضية في كلباء، الإمارات.

A bilingual (Arabic/English) booking application for Padel and Football courts at Golden Touch sports facility in Kalba, UAE.

## المميزات / Features

### للمستخدمين / For Users
- ✅ تسجيل الدخول بالبريد الإلكتروني/كلمة المرور أو Google
- ✅ عرض الملاعب المتاحة (بادل وكرة قدم)
- ✅ حجز الملاعب مع اختيار التاريخ والوقت
- ✅ نظام تسعير ديناميكي (صباحي/مسائي)
- ✅ الدفع الآمن عبر Stripe
- ✅ عرض وإدارة الحجوزات
- ✅ إلغاء الحجوزات
- ✅ نظام التقييمات

### للإدارة / For Admin
- ✅ لوحة تحكم شاملة
- ✅ إحصائيات (إجمالي الحجوزات، الإيرادات، المستخدمين)
- ✅ إدارة جميع الحجوزات
- ✅ عرض معلومات المستخدمين

## التقنيات المستخدمة / Tech Stack

### Backend
- FastAPI (Python)
- MongoDB (Database)
- JWT Authentication
- Google OAuth (Emergent managed)
- Stripe Payment Integration
- emergentintegrations library

### Frontend
- React 19
- React Router v7
- i18next (Arabic/English)
- Tailwind CSS
- Axios
- RTL/LTR Support

## الأسعار / Pricing

| الوقت / Time | السعر / Price |
|--------------|---------------|
| صباحاً (8 ص - 4 م) / Morning (8 AM - 4 PM) | 100 درهم / 100 AED |
| مساءً (4 م - 12 م) / Evening (4 PM - 12 AM) | 135 درهم / 135 AED |

## الملاعب / Courts

1. **ملعب البادل / Padel Court**
   - ملعب احترافي مع إضاءة ممتازة
   - Professional court with excellent lighting

2. **ملعب كرة القدم / Football Court**
   - عشب صناعي عالي الجودة
   - High-quality artificial turf

## بيانات الاعتماد / Credentials

### Admin Account / حساب الإدارة
- البريد / Email: `admin@goldentouch.com`
- كلمة المرور / Password: `admin123`

### Stripe (Test Mode)
- API Key: `sk_test_emergent` (already configured)

## الروابط / Links

- التطبيق / App: https://get-app-now-8.preview.emergentagent.com
- Backend API: https://get-app-now-8.preview.emergentagent.com/api
- API Docs: https://get-app-now-8.preview.emergentagent.com/docs

## الصفحات / Pages

1. **الصفحة الرئيسية /** - Landing page with hero section
2. **الملاعب /courts** - Courts listing with booking options
3. **الحجز /book/:courtId** - Booking page with calendar
4. **حجوزاتي /bookings** - User bookings management
5. **تسجيل الدخول /login** - Login page
6. **إنشاء حساب /register** - Registration page
7. **نجاح الدفع /payment-success** - Payment confirmation
8. **لوحة التحكم /admin** - Admin dashboard (admin only)

## API Endpoints

### Auth
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/google/callback` - Google OAuth callback
- GET `/api/auth/me` - Get current user
- POST `/api/auth/logout` - Logout

### Courts
- GET `/api/courts` - Get all courts
- GET `/api/courts/:courtId` - Get court details

### Bookings
- GET `/api/bookings/availability` - Check availability
- POST `/api/bookings` - Create booking
- GET `/api/bookings/my` - Get user bookings
- GET `/api/bookings/:bookingId` - Get booking details
- PATCH `/api/bookings/:bookingId/cancel` - Cancel booking

### Payments
- POST `/api/payments/checkout` - Create Stripe checkout
- GET `/api/payments/status/:sessionId` - Check payment status
- POST `/api/webhook/stripe` - Stripe webhook

### Reviews
- POST `/api/reviews` - Create review
- GET `/api/reviews/:courtId` - Get court reviews

### Admin
- GET `/api/admin/bookings` - Get all bookings
- GET `/api/admin/users` - Get all users
- GET `/api/admin/stats` - Get statistics

## قاعدة البيانات / Database Collections

1. **users** - معلومات المستخدمين / User information
2. **courts** - بيانات الملاعب / Courts data
3. **bookings** - الحجوزات / Bookings
4. **user_sessions** - جلسات المستخدمين / User sessions
5. **payment_transactions** - معاملات الدفع / Payment transactions
6. **reviews** - التقييمات / Reviews

## كيفية الاستخدام / How to Use

### للمستخدم / For User:
1. افتح التطبيق / Open the app
2. سجل حساب جديد أو سجل دخول / Register or login
3. اختر ملعب / Choose a court
4. اختر التاريخ والوقت / Select date and time
5. أكمل الدفع عبر Stripe / Complete payment via Stripe
6. استلم تأكيد الحجز / Receive booking confirmation

### للإدارة / For Admin:
1. سجل دخول بحساب الإدارة / Login with admin account
2. اذهب إلى /admin / Go to /admin
3. عرض الإحصائيات والحجوزات / View stats and bookings

## الملفات المهمة / Important Files

```
/app/
├── backend/
│   ├── server.py          # Main FastAPI application
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables (STRIPE_API_KEY, etc.)
├── frontend/
│   ├── src/
│   │   ├── App.js        # Main React component
│   │   ├── i18n.js       # Bilingual translations
│   │   ├── api.js        # API client
│   │   ├── pages/        # All page components
│   │   └── components/   # Reusable components (Navbar, Footer)
│   ├── package.json      # Node dependencies
│   └── .env             # Frontend env (REACT_APP_BACKEND_URL)
└── auth_testing.md       # Auth testing guide
```

## الأوامر المفيدة / Useful Commands

```bash
# Restart all services
sudo supervisorctl restart all

# Check service status
sudo supervisorctl status

# View backend logs
tail -f /var/log/supervisor/backend.err.log

# View frontend logs
tail -f /var/log/supervisor/frontend.err.log

# Access MongoDB
mongosh

# View courts
mongosh --eval "use test_database; db.courts.find().pretty()"
```

## الملاحظات المهمة / Important Notes

1. ✅ **الدفع في وضع الاختبار** / Payment in test mode
   - استخدم بطاقات Stripe الاختبارية / Use Stripe test cards
   - Card: 4242 4242 4242 4242
   - Any future date, any CVC

2. ✅ **تسجيل الدخول عبر Google**
   - يعمل مع نظام Emergent المدمج / Works with Emergent managed auth
   - لا حاجة لإعدادات Google OAuth / No Google OAuth setup needed

3. ✅ **اللغات** / Languages
   - التبديل بين العربية والإنجليزية / Switch between Arabic and English
   - دعم RTL/LTR / RTL/LTR support

4. ✅ **الحجوزات** / Bookings
   - الحجز لمدة 60 دقيقة / 60-minute slots
   - التحقق التلقائي من التوفر / Automatic availability check
   - منع الحجز المزدوج / Prevent double booking

## المشاكل المعروفة / Known Issues

- None! التطبيق جاهز للاستخدام / App is production-ready! 🎉

## الخطوات القادمة / Next Steps (Optional Enhancements)

1. إضافة إشعارات البريد الإلكتروني / Add email notifications
2. إضافة خاصية تعديل الحجز / Add booking reschedule feature
3. إضافة خصومات وعروض / Add discounts and promotions
4. إضافة نظام النقاط / Add loyalty points system
5. تطبيق موبايل / Mobile app

## الدعم / Support

للأسئلة أو المساعدة، اتصل بـ Golden Touch:
For questions or support, contact Golden Touch:

📞 +971 54 401 9195
📍 29C6+HJ2, Khor Kalba, Sharjah, UAE

---

**تم بناء التطبيق بواسطة Emergent AI 🚀**
**Built with Emergent AI 🚀**
