# دليل النشر على Vercel
# Vercel Deployment Guide

## خطوات النشر السريعة

### 1. إعداد GitHub

```bash
# تأكد من أن جميع الملفات مرفوعة
git add .
git commit -m "Medical Queue Management System - Ready for deployment"
git push origin main
```

### 2. ربط مع Vercel

1. اذهب إلى https://vercel.com
2. اضغط "New Project"
3. اختر مستودع GitHub الخاص بك
4. اضغط "Import"

### 3. إضافة متغيرات البيئة

في صفحة الإعدادات، أضف:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. النشر

اضغط "Deploy" وانتظر انتهاء النشر.

## التحديثات التلقائية

بعد الآن، كل push إلى `main` سيؤدي إلى نشر تلقائي.

## المراقبة والصيانة

### عرض السجلات
```
vercel logs
```

### إعادة النشر
```
vercel redeploy
```

### حذف النشر
```
vercel remove
```

## استكشاف الأخطاء

### خطأ: "Build failed"
- تحقق من أن جميع المتغيرات البيئية موجودة
- تحقق من أن الكود يعمل محلياً

### خطأ: "Database connection failed"
- تحقق من صحة مفاتيح Supabase
- تحقق من أن Supabase project نشط

### خطأ: "Static generation failed"
- تحقق من أن جميع الصور والملفات موجودة
- تحقق من أن الـ paths صحيحة

## الأداء

### تحسين الأداء
- استخدم CDN للملفات الثابتة
- فعّل الضغط (gzip)
- استخدم الـ caching

### مراقبة الأداء
- استخدم Vercel Analytics
- استخدم Google PageSpeed Insights
- استخدم Lighthouse

## الأمان

### نصائح الأمان
- لا تشارك مفاتيح API
- استخدم متغيرات البيئة
- فعّل HTTPS
- استخدم كلمات مرور قوية

## النسخ الاحتياطية

### عمل نسخة احتياطية من البيانات
```bash
# استخدام Supabase CLI
supabase db dump > backup.sql
```

### استعادة البيانات
```bash
# استخدام Supabase CLI
supabase db restore < backup.sql
```

## الدعم

للحصول على الدعم:
- https://vercel.com/support
- https://supabase.com/support
- support@medical-queue.com
