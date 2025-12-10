'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Code2, Users, Zap, Globe } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">عن البرنامج</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Main Info */}
        <Card className="mb-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="pt-8">
            <h2 className="text-3xl font-bold mb-4">نظام إدارة الطوابير الطبية</h2>
            <p className="text-lg text-primary-100 mb-4">
              نظام متقدم وشامل لإدارة طوابير المراكز الطبية مع دعم كامل للغة العربية والإعلانات الصوتية والتحديثات الفورية
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-primary-200 text-sm">الإصدار</p>
                <p className="text-2xl font-bold">1.0.0</p>
              </div>
              <div>
                <p className="text-primary-200 text-sm">سنة الإطلاق</p>
                <p className="text-2xl font-bold">2024</p>
              </div>
              <div>
                <p className="text-primary-200 text-sm">اللغة</p>
                <p className="text-2xl font-bold">العربية</p>
              </div>
              <div>
                <p className="text-primary-200 text-sm">الحالة</p>
                <p className="text-2xl font-bold">نشط</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-medical-900 mb-4">المميزات الرئيسية</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Globe className="w-6 h-6 text-primary-500" />
                  <CardTitle>دعم اللغة العربية</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-medical-600">
                  واجهة عربية 100% مع دعم كامل للكتابة من اليمين إلى اليسار (RTL)
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Zap className="w-6 h-6 text-primary-500" />
                  <CardTitle>تحديثات فورية</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-medical-600">
                  تحديثات فورية للطوابير والإعلانات عبر تقنية Realtime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Code2 className="w-6 h-6 text-primary-500" />
                  <CardTitle>إعلانات صوتية</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-medical-600">
                  نظام إعلانات صوتية متقدم مع دعم كامل للغة العربية
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-primary-500" />
                  <CardTitle>إدارة متقدمة</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-medical-600">
                  لوحة تحكم شاملة لإدارة المركز والعيادات والأطباء والمرضى
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Technology Stack */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>التقنيات المستخدمة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-medical-50 rounded-lg">
                <p className="font-bold text-medical-900">Next.js 14</p>
                <p className="text-sm text-medical-600">إطار عمل React حديث</p>
              </div>
              <div className="p-4 bg-medical-50 rounded-lg">
                <p className="font-bold text-medical-900">TypeScript</p>
                <p className="text-sm text-medical-600">لغة برمجة آمنة</p>
              </div>
              <div className="p-4 bg-medical-50 rounded-lg">
                <p className="font-bold text-medical-900">Tailwind CSS</p>
                <p className="text-sm text-medical-600">تصميم حديث وسريع</p>
              </div>
              <div className="p-4 bg-medical-50 rounded-lg">
                <p className="font-bold text-medical-900">Supabase</p>
                <p className="text-sm text-medical-600">قاعدة بيانات وتحديثات فورية</p>
              </div>
              <div className="p-4 bg-medical-50 rounded-lg">
                <p className="font-bold text-medical-900">PostgreSQL</p>
                <p className="text-sm text-medical-600">قاعدة بيانات قوية</p>
              </div>
              <div className="p-4 bg-medical-50 rounded-lg">
                <p className="font-bold text-medical-900">Vercel</p>
                <p className="text-sm text-medical-600">نشر وتوزيع سريع</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pages */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>الصفحات المتاحة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">1.</span>
                <div>
                  <p className="font-bold text-medical-900">الصفحة الرئيسية</p>
                  <p className="text-sm text-medical-600">قائمة بجميع الخدمات والصفحات</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">2.</span>
                <div>
                  <p className="font-bold text-medical-900">لوحة التحكم</p>
                  <p className="text-sm text-medical-600">إدارة المركز والعيادات والأطباء</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">3.</span>
                <div>
                  <p className="font-bold text-medical-900">شاشة العرض</p>
                  <p className="text-sm text-medical-600">عرض الأرقام والإعلانات على الشاشات</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">4.</span>
                <div>
                  <p className="font-bold text-medical-900">لوحة التحكم بالعيادة</p>
                  <p className="text-sm text-medical-600">التحكم بنداء المرضى والعمليات</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">5.</span>
                <div>
                  <p className="font-bold text-medical-900">صفحة العميل</p>
                  <p className="text-sm text-medical-600">متابعة الرقم والتنبيهات</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">6.</span>
                <div>
                  <p className="font-bold text-medical-900">حجز المواعيد</p>
                  <p className="text-sm text-medical-600">حجز مواعيد الزيارات</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">7.</span>
                <div>
                  <p className="font-bold text-medical-900">الطباعة</p>
                  <p className="text-sm text-medical-600">طباعة التذاكر والتقارير</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">8.</span>
                <div>
                  <p className="font-bold text-medical-900">صفحات الأطباء</p>
                  <p className="text-sm text-medical-600">بيانات الأطباء والحضور والإجازات</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">9.</span>
                <div>
                  <p className="font-bold text-medical-900">الاستشارات الطبية</p>
                  <p className="text-sm text-medical-600">الاستشارات والتسجيل</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-primary-500 font-bold">10.</span>
                <div>
                  <p className="font-bold text-medical-900">عن البرنامج</p>
                  <p className="text-sm text-medical-600">معلومات عن النظام والإصدار</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>الدعم والمساعدة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-medical-700 mb-4">
              للحصول على الدعم أو الإبلاغ عن مشاكل، يرجى التواصل معنا:
            </p>
            <div className="space-y-2">
              <p className="text-medical-700">
                <strong>البريد الإلكتروني:</strong> support@medical-queue.com
              </p>
              <p className="text-medical-700">
                <strong>الموقع:</strong> https://medical-queue.example.com
              </p>
              <p className="text-medical-700">
                <strong>الهاتف:</strong> +20 XXX XXX XXXX
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 text-center text-medical-600">
          <p>&copy; 2024 نظام إدارة الطوابير الطبية. جميع الحقوق محفوظة.</p>
          <p className="text-sm mt-2">تم التطوير بواسطة فريق متخصص في الحلول الطبية</p>
        </div>
      </div>
    </div>
  )
}
