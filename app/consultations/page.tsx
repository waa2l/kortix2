'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ConsultationsPage() {
  const [step, setStep] = useState<'register' | 'consult'>('register')
  const [formData, setFormData] = useState({
    fullName: '',
    nationalId: '',
    phone: '',
    gender: '',
    familyMembers: '',
    chronicDiseases: [] as string[],
    isPregnant: false,
    isBreastfeeding: false,
    previousSurgeries: '',
    drugAllergies: '',
    currentMedications: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const chronicDiseaseOptions = [
    'السكري',
    'ارتفاع ضغط الدم',
    'الأورام',
    'أمراض الكبد',
    'أمراض الكلى',
    'أخرى',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleDiseaseChange = (disease: string) => {
    setFormData((prev) => ({
      ...prev,
      chronicDiseases: prev.chronicDiseases.includes(disease)
        ? prev.chronicDiseases.filter((d) => d !== disease)
        : [...prev.chronicDiseases, disease],
    }))
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.fullName || !formData.nationalId || !formData.phone || !formData.gender) {
        toast.error('يرجى ملء جميع الحقول المطلوبة')
        return
      }

      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('تم التسجيل بنجاح')
      setStep('consult')
    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleConsultation = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock submission
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success('تم إرسال الاستشارة بنجاح')
      setSubmitted(true)

      setTimeout(() => {
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-success-500">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-success-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-medical-900 mb-2">تم الإرسال بنجاح</h2>
            <p className="text-medical-600 mb-6">سيتم الرد على استشارتك قريباً من قبل الطبيب المختص</p>
            <Link href="/">
              <Button className="w-full">العودة للصفحة الرئيسية</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">الاستشارات الطبية</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {step === 'register' ? (
          // Registration Form
          <Card>
            <CardHeader>
              <CardTitle>التسجيل الأول</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الرباعي (50 حرف)</label>
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="أدخل الاسم الرباعي"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={50}
                  />
                </div>

                {/* National ID */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الرقم القومي (14 رقم)</label>
                  <Input
                    type="text"
                    name="nationalId"
                    placeholder="14 رقم"
                    value={formData.nationalId}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={14}
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف (11 رقم)</label>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="01xxxxxxxxx"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    maxLength={11}
                  />
                </div>

                {/* Gender */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">النوع</label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">-- اختر --</option>
                    <option value="male">ذكر</option>
                    <option value="female">أنثى</option>
                    <option value="child">طفل</option>
                  </Select>
                </div>

                {/* Family Members */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">عدد أفراد الأسرة (0-10)</label>
                  <Input
                    type="number"
                    name="familyMembers"
                    placeholder="0"
                    value={formData.familyMembers}
                    onChange={handleChange}
                    disabled={loading}
                    min="0"
                    max="10"
                  />
                </div>

                {/* Chronic Diseases */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الأمراض المزمنة</label>
                  <div className="space-y-2">
                    {chronicDiseaseOptions.map((disease) => (
                      <label key={disease} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.chronicDiseases.includes(disease)}
                          onChange={() => handleDiseaseChange(disease)}
                          disabled={loading}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{disease}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Pregnancy */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isPregnant"
                    checked={formData.isPregnant}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">وجود حمل</span>
                </label>

                {/* Breastfeeding */}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isBreastfeeding"
                    checked={formData.isBreastfeeding}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">وجود رضاعة</span>
                </label>

                {/* Previous Surgeries */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">عمليات سابقة</label>
                  <Textarea
                    name="previousSurgeries"
                    placeholder="أدخل تفاصيل العمليات السابقة"
                    value={formData.previousSurgeries}
                    onChange={handleChange}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                {/* Drug Allergies */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">حساسية من أدوية</label>
                  <Textarea
                    name="drugAllergies"
                    placeholder="أدخل الأدوية التي تسبب حساسية"
                    value={formData.drugAllergies}
                    onChange={handleChange}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                {/* Current Medications */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الأدوية الحالية</label>
                  <Textarea
                    name="currentMedications"
                    placeholder="أدخل الأدوية التي تتناولها حالياً"
                    value={formData.currentMedications}
                    onChange={handleChange}
                    disabled={loading}
                    rows={3}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري التسجيل...
                    </>
                  ) : (
                    'التسجيل والمتابعة'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          // Consultation Form
          <Card>
            <CardHeader>
              <CardTitle>تقديم استشارة طبية</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConsultation} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم الهاتف</label>
                  <Input
                    type="tel"
                    placeholder="01xxxxxxxxx"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">البريد الإلكتروني</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">التخصص المطلوب</label>
                  <Select disabled={loading}>
                    <option>-- اختر التخصص --</option>
                    <option>طب الأسرة</option>
                    <option>الأسنان</option>
                    <option>العيون</option>
                    <option>الجلدية</option>
                    <option>الأطفال</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">نص الشكوى</label>
                  <Textarea
                    placeholder="أدخل شكواك بالتفصيل"
                    disabled={loading}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">الأعراض الحالية</label>
                  <Textarea
                    placeholder="أدخل الأعراض التي تشعر بها"
                    disabled={loading}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الوزن (كجم)</label>
                    <Input type="number" placeholder="0" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الطول (سم)</label>
                    <Input type="number" placeholder="0" disabled={loading} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ضغط الدم</label>
                    <Input placeholder="120/80" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">درجة الحرارة</label>
                    <Input type="number" placeholder="37" disabled={loading} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">النبض</label>
                    <Input type="number" placeholder="0" disabled={loading} />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      جاري الإرسال...
                    </>
                  ) : (
                    'إرسال الاستشارة'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
