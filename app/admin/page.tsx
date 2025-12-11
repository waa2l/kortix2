'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // TODO: Implement actual authentication
      // For now, using mock authentication
      if (email && password.length >= 4) {
        // Store admin session
        localStorage.setItem('adminSession', JSON.stringify({ email, timestamp: Date.now() }))
        toast.success('تم تسجيل الدخول بنجاح')
        router.push('/admin/dashboard')
      } else {
        setError('البريد الإلكتروني وكلمة المرور مطلوبة')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل تسجيل الدخول')
      toast.error('فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-medical-900">لوحة التحكم</h1>
          <p className="text-medical-600 mt-2">نظام إدارة الطوابير الطبية</p>
        </div>

        {/* Login Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>تسجيل الدخول</CardTitle>
            <CardDescription>أدخل بيانات المسؤول للدخول إلى لوحة التحكم</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-3 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-900">البريد الإلكتروني</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medical-400" />
                  <Input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-medical-900">كلمة المرور</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-medical-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري التحميل...
                  </>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>

              {/* Demo Credentials */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-medium mb-1">بيانات التجربة:</p>
                <p>البريد: admin@example.com</p>
                <p>كلمة المرور: password123</p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            ← العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  )
}
