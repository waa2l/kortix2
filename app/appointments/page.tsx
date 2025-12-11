'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface Clinic {
  id: string
  name: string
}

export default function AppointmentsPage() {
  const [formData, setFormData] = useState({
    patientName: '',
    nationalId: '',
    phone: '',
    clinic: '',
    date: '',
    time: '',
    shift: 'morning',
    reason: '',
  })
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Fetch Clinics
  useEffect(() => {
    const fetchClinics = async () => {
      const { data } = await supabase.from('clinics').select('id, name')
      if (data) setClinics(data)
    }
    fetchClinics()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.patientName || !formData.nationalId || !formData.phone || !formData.clinic || !formData.date || !formData.time || !formData.reason) {
        toast.error('يرجى ملء جميع الحقول المطلوبة')
        setLoading(false)
        return
      }

      // Get Center ID
      const { data: centers } = await supabase.from('centers').select('id').limit(1)
      const centerId = (centers as any)?.[0]?.id

      if (!centerId) {
        toast.error('خطأ في النظام: لا يوجد مركز معرف')
        setLoading(false)
        return
      }

      const { error } = await (supabase.from('appointments') as any).insert({
        center_id: centerId,
        clinic_id: formData.clinic,
        patient_name: formData.patientName,
        national_id: formData.nationalId,
        phone: formData.phone,
        appointment_date: formData.date,
        appointment_time: formData.time,
        visit_reason: formData.reason,
        shift: formData.shift,
        status: 'pending'
      })

      if (error) throw error

      toast.success('تم حجز الموعد بنجاح')
      setSubmitted(true)

      setTimeout(() => {
        setFormData({
          patientName: '',
          nationalId: '',
          phone: '',
          clinic: '',
          date: '',
          time: '',
          shift: 'morning',
          reason: '',
        })
        setSubmitted(false)
      }, 3000)
    } catch (err) {
      toast.error('حدث خطأ ما')
      console.error(err)
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
            <h2 className="text-2xl font-bold text-medical-900 mb-2">تم الحجز بنجاح</h2>
            <p className="text-medical-600 mb-6">سيتم التواصل معك قريباً لتأكيد الموعد</p>
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
          <h1 className="text-3xl font-bold text-medical-900">حجز موعد</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات الحجز</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Patient Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium">اسم المريض</label>
                <Input
                  type="text"
                  name="patientName"
                  placeholder="أدخل الاسم الرباعي"
                  value={formData.patientName}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* National ID */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الرقم القومي</label>
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
                <label className="text-sm font-medium">رقم الهاتف</label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="01xxxxxxxxx"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Clinic */}
              <div className="space-y-2">
                <label className="text-sm font-medium">العيادة</label>
                <Select
                  name="clinic"
                  value={formData.clinic}
                  onChange={handleChange}
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

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">التاريخ</label>
                <Input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Shift */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الشيفت</label>
                <Select
                  name="shift"
                  value={formData.shift}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="morning">صباحي (8 ص - 2 م)</option>
                  <option value="evening">مسائي (2 م - 8 م)</option>
                </Select>
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium">الوقت</label>
                <Input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <label className="text-sm font-medium">سبب الزيارة</label>
                <Input
                  type="text"
                  name="reason"
                  placeholder="أدخل سبب الزيارة"
                  value={formData.reason}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    جاري الحجز...
                  </>
                ) : (
                  'حجز الموعد'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-700">
              <strong>ملاحظة:</strong> سيتم التواصل معك عبر الهاتف أو البريد الإلكتروني لتأكيد الموعد
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
