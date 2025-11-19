# إعداد Firebase للمشروع

## الخطوات المطلوبة:

### 1. إنشاء ملف `.env`
انسخ ملف `.env.example` إلى `.env` واملأه بالبيانات الحقيقية من Firebase Console:

```env
VITE_FIREBASE_API_KEY=AIzaSyBCIwsSjPNW72yKMqPf9rkM5lvz10GzwdE
VITE_FIREBASE_AUTH_DOMAIN=cutetap-ce6ae.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cutetap-ce6ae
VITE_FIREBASE_STORAGE_BUCKET=cutetap-ce6ae.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=561049694912
VITE_FIREBASE_APP_ID=1:561049694912:web:9a46adacf2cbb7e4863325
VITE_FIREBASE_MEASUREMENT_ID=G-0W1QRQDFB4
```

### 2. تفعيل Firestore Database
1. اذهب إلى [Firebase Console](https://console.firebase.google.com/)
2. اختر مشروعك
3. اذهب إلى **Firestore Database**
4. اضغط على **Create Database**
5. اختر **Start in test mode** (للبداية)
6. اختر موقع قاعدة البيانات

### 3. تطبيق قواعد الأمان
1. في Firebase Console، اذهب إلى **Firestore Database** > **Rules**
2. انسخ محتوى ملف `firestore.rules` والصقه في القواعد
3. اضغط **Publish**

⚠️ **تحذير مهم**: القواعد الحالية تسمح بالوصول الكامل للجميع (للاختبار فقط). 
للاستخدام في الإنتاج، يجب:
- تفعيل Firebase Authentication
- تحديث القواعد لتقييد الوصول بناءً على المستخدمين المسجلين

### 4. تفعيل Authentication (اختياري)
إذا كنت تريد استخدام Firebase Authentication:
1. اذهب إلى **Authentication** في Firebase Console
2. اضغط **Get Started**
3. فعّل **Email/Password** provider

### 5. تشغيل المشروع
```bash
npm install
npm run dev
```

## ملاحظات:
- ملف `.env` يجب أن يكون في `.gitignore` ولا يتم رفعه إلى Git
- البيانات الحساسة يجب أن تبقى سرية
- في الإنتاج، استخدم Firebase Hosting أو Netlify مع متغيرات البيئة

