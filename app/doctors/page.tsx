'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface DoctorData {
  id: string
  name: string
  doctor_number: string
  specialty: string
  annual_leave_balance: number
  emergency_leave_balance: number
  absence_days: number
  work_status: string
  clinic: {
    name: string
  } | null
}

export default function DoctorsPage() {
  const [step, setStep] = useState<'login' | 'dashboard'>('login')
  const [doctorNumber, setDoctorNumber] = useState('')
  const [nationalId, setNationalId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null)

  // Check session on load
  useEffect(() => {
    const session = localStorage.getItem('doctorSession')
    if (session) {
      const { id } = JSON.parse(session)
      fetchDoctorData(id)
    }
  }, [])

  const fetchDoctorData = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*, clinic:clinics(name)')
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Fix types casting for joined table
      const doctor = data as any
      setDoctorData({
        ...doctor,
        clinic: doctor.clinic // Supabase joins return object or array
      })
      setStep('dashboard')
    } catch (err) {
      console.error(err)
      localStorage.removeItem('doctorSession')
      setStep('login')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!doctorNumber || !nationalId) {
        setError('يرجى إدخال كود الطبيب والرقم القومي')
        setLoading(false)
        return
      }

      // Verify credentials against doctors table
      const { data, error } = await supabase
        .from('doctors')
        .select('id')
        .eq('doctor_number', doctorNumber)
        .eq('national_id', nationalId)
        .single()

      if (error || !data) {
        setError('بيانات الدخول غير صحيحة')
        setLoading(false)
        return
      }

      localStorage.setItem('doctorSession', JSON.stringify({ id: data.id, timestamp: Date.now() }))
      toast.success('تم تسجيل الدخول بنجاح')
      fetchDoctorData(data.id)
      
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال')
      toast.error('فشل تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('doctorSession')
    setStep('login')
    setDoctorNumber('')
    setNationalId('')
    setDoctorData(null)
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
                  <label className="text-sm font-medium">كود الطبيب</label>
                  <Input
                    type="text"
                    placeholder="DOC001"
                    value={doctorNumber}
                    onChange={(e) => setDoctorNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الرقم القومي (كلمة المرور)</label>
                  <Input
                    type="password"
                    placeholder="الرقم القومي"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
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
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            تسجيل خروج
          </Button>
        </div>

        {/* Doctor Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-medical-600">الاسم</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-medical-900">{doctorData?.name}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-medical-600">التخصص</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-medical-900">{doctorData?.specialty}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-medical-600">الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-xl font-bold ${doctorData?.work_status === 'active' ? 'text-success-600' : 'text-orange-600'}`}>
                {doctorData?.work_status === 'active' ? 'نشط' : doctorData?.work_status}
              </p>
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
                <p className="text-lg font-bold text-medical-900">{doctorData?.doctor_number}</p>
              </div>
              <div>
                <p className="text-sm text-medical-600 mb-1">العيادة</p>
                <p className="text-lg font-bold text-medical-900">{doctorData?.clinic?.name || 'غير محدد'}</p>
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
                <p className="text-3xl font-bold text-blue-900">{doctorData?.annual_leave_balance || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 mb-2">الإجازات العارضة</p>
                <p className="text-3xl font-bold text-green-900">{doctorData?.emergency_leave_balance || 0}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-600 mb-2">أيام الغياب</p>
                <p className="text-3xl font-bold text-orange-900">{doctorData?.absence_days || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
