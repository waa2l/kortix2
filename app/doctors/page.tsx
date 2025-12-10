'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DoctorsPage() {
  const [step, setStep] = useState<'login' | 'dashboard'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        setError('البريد الإلكتروني وكلمة المرور مطلوبة')
        return
      }

      // Mock authentication
      await new Promise((resolve) => setTimeout(resolve, 1000))

      localStorage.setItem('doctorSession', JSON.stringify({ email, timestamp: Date.now() }))
      toast.success('تم تسجيل الدخول بنجاح')
      setStep('dashboard')
    } catch (err) {
      setError('فشل تسجيل الدخول')
      toast.error('فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>تسجيل دخول الأطباء</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="doctor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري التحميل...
                    </>
                  ) : (
                    'تسجيل الدخول'
                  )}
                </Button>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-medium mb-1">بيانات التجربة:</p>
                  <p>البريد: doctor@example.com</p>
                  <p>كلمة المرور: password123</p>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center mt-6">
            <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              ← العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">صفحة الطبيب</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Doctor Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-medical-600">الاسم</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-medical-900">د. أحمد محمد</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-medical-600">التخصص</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-medical-900">طب الأسرة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-medical-600">الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-success-600">نشط</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button variant="default" className="flex-1 md:flex-none">
            الملف الشخصي
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            الحضور والانصراف
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            طلبات الإجازات
          </Button>
          <Button variant="outline" className="flex-1 md:flex-none">
            الاستشارات
          </Button>
        </div>

        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>البيانات الشخصية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-medical-600 mb-1">رقم الطبيب</p>
                <p className="text-lg font-bold text-medical-900">DOC001</p>
              </div>
              <div>
                <p className="text-sm text-medical-600 mb-1">رقم الهاتف</p>
                <p className="text-lg font-bold text-medical-900">01012345678</p>
              </div>
              <div>
                <p className="text-sm text-medical-600 mb-1">الرقم القومي</p>
                <p className="text-lg font-bold text-medical-900">29001011234567</p>
              </div>
              <div>
                <p className="text-sm text-medical-600 mb-1">العيادة</p>
                <p className="text-lg font-bold text-medical-900">طب الأسرة</p>
              </div>
              <div>
                <p className="text-sm text-medical-600 mb-1">الشيفت</p>
                <p className="text-lg font-bold text-medical-900">صباحي</p>
              </div>
              <div>
                <p className="text-sm text-medical-600 mb-1">أيام العمل</p>
                <p className="text-lg font-bold text-medical-900">السبت - الخميس</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>رصيد الإجازات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 mb-2">الإجازات الاعتيادية</p>
                <p className="text-3xl font-bold text-blue-900">20</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-2">الإجازات العارضة</p>
                <p className="text-3xl font-bold text-green-900">3</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 mb-2">أيام الغياب</p>
                <p className="text-3xl font-bold text-orange-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
