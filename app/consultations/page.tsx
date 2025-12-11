'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  ChevronUp,
  ChevronDown,
  RotateCcw,
  AlertTriangle,
  Phone,
  ArrowRight,
  LogOut,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { toArabicNumbers } from '@/utils/arabic'
import toast from 'react-hot-toast'

export default function ControlPage() {
  const router = useRouter()
  const [step, setStep] = useState<'clinic-select' | 'control'>('clinic-select')
  const [selectedClinic, setSelectedClinic] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentNumber, setCurrentNumber] = useState(0)
  const [specificNumber, setSpecificNumber] = useState('')

  // Mock clinics
  const clinics = [
    { id: '1', name: 'طب الأسرة', password: '1234' },
    { id: '2', name: 'الأسنان', password: '2345' },
    { id: '3', name: 'العيون', password: '3456' },
    { id: '4', name: 'الجلدية', password: '4567' },
    { id: '5', name: 'الأطفال', password: '5678' },
  ]

  const handleClinicSelect = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Mock authentication
      const clinic = clinics.find((c) => c.id === selectedClinic)
      if (!clinic) {
        setError('العيادة غير موجودة')
        return
      }

      if (password !== clinic.password) {
        setError('كلمة المرور غير صحيحة')
        return
      }

      setStep('control')
      toast.success('تم تسجيل الدخول بنجاح')
    } catch (err) {
      setError('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleNextPatient = () => {
    const newNumber = currentNumber + 1
    setCurrentNumber(newNumber)
    toast.success(`تم استدعاء العميل رقم ${toArabicNumbers(newNumber)}`)
    // TODO: Play audio announcement
  }

  const handlePreviousPatient = () => {
    if (currentNumber > 0) {
      const newNumber = currentNumber - 1
      setCurrentNumber(newNumber)
      toast.success(`تم استدعاء العميل رقم ${toArabicNumbers(newNumber)}`)
    }
  }

  const handleCallSpecific = () => {
    if (specificNumber) {
      const num = parseInt(specificNumber)
      setCurrentNumber(num)
      toast.success(`تم استدعاء العميل رقم ${toArabicNumbers(num)}`)
      setSpecificNumber('')
    }
  }

  const handleReset = () => {
    if (confirm('هل تريد تصفير العيادة؟')) {
      setCurrentNumber(0)
      toast.success('تم تصفير العيادة')
    }
  }

  const handleEmergency = () => {
    toast.error('تنبيه طوارئ: تم إرسال نداء طوارئ')
  }

  const handleLogout = () => {
    setStep('clinic-select')
    setSelectedClinic('')
    setPassword('')
    setCurrentNumber(0)
    toast.success('تم تسجيل الخروج')
  }

  if (step === 'clinic-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-primary-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>لوحة التحكم بالعيادة</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClinicSelect} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-700 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر العيادة</label>
                  <Select
                    value={selectedClinic}
                    onChange={(e) => setSelectedClinic(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- اختر العيادة --</option>
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <Input
                    type="password"
                    placeholder="أدخل كلمة المرور"
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
                    'دخول'
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push('/')}
                >
                  العودة
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const clinic = clinics.find((c) => c.id === selectedClinic)

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-medical-900">{clinic?.name}</h1>
            <p className="text-medical-600">الرقم الحالي: {toArabicNumbers(currentNumber)}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </Button>
        </div>

        {/* Current Number Display */}
        <Card className="mb-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white border-0">
          <CardContent className="pt-8">
            <div className="text-center">
              <p className="text-lg text-primary-100 mb-2">الرقم الحالي</p>
              <p className="text-7xl font-bold">{toArabicNumbers(currentNumber)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Control Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Button
            onClick={handleNextPatient}
            className="h-24 text-lg gap-2 bg-success-500 hover:bg-success-600"
          >
            <ChevronUp className="w-6 h-6" />
            العميل التالي
          </Button>

          <Button
            onClick={handlePreviousPatient}
            variant="outline"
            className="h-24 text-lg gap-2"
          >
            <ChevronDown className="w-6 h-6" />
            العميل السابق
          </Button>

          <Button
            onClick={handleReset}
            variant="outline"
            className="h-24 text-lg gap-2"
          >
            <RotateCcw className="w-6 h-6" />
            تصفير
          </Button>

          <Button
            onClick={handleEmergency}
            className="h-24 text-lg gap-2 bg-danger-500 hover:bg-danger-600 md:col-span-2"
          >
            <AlertTriangle className="w-6 h-6" />
            تنبيه طوارئ
          </Button>

          <Button
            variant="outline"
            className="h-24 text-lg gap-2"
          >
            <Phone className="w-6 h-6" />
            تنبيه طبيب
          </Button>
        </div>

        {/* Specific Patient Call */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>استدعاء عميل معين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="أدخل رقم العميل"
                value={specificNumber}
                onChange={(e) => setSpecificNumber(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleCallSpecific}
                className="gap-2"
              >
                <Phone className="w-4 h-4" />
                استدعاء
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-16 text-base gap-2"
          >
            <ArrowRight className="w-5 h-5" />
            تحويل إلى عيادة أخرى
          </Button>

          <Button
            variant="outline"
            className="h-16 text-base gap-2"
          >
            <AlertTriangle className="w-5 h-5" />
            إيقاف العيادة
          </Button>
        </div>
      </div>
    </div>
  )
}
