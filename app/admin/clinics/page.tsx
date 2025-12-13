'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import type { Clinic, ClinicInsert, ClinicUpdate } from '@/lib/supabase-types'

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    screens: '',
    password: '',
  })

  // 1. جلب البيانات من Supabase
  const fetchClinics = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('clinic_number', { ascending: true })

      if (error) throw error
      if (data) setClinics(data)
    } catch (error) {
      console.error('Error fetching clinics:', error)
      toast.error('فشل في جلب بيانات العيادات')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchClinics()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // 2. إضافة أو تعديل عيادة
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.number || !formData.password) {
        toast.error('يرجى ملء جميع الحقول')
        return
      }

      const screensArray = formData.screens
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter(n => !isNaN(n))
      
      const clinicNumber = parseInt(formData.number)

      if (editingId) {
        // تحديث
        const updateData: ClinicUpdate = {
          name: formData.name,
          clinic_number: clinicNumber,
          screen_ids: screensArray,
          password: formData.password,
        }

        // استخدام (as any) لتجاوز مشاكل النوع المعقدة مع Supabase Update
        const { error } = await (supabase.from('clinics') as any)
          .update(updateData)
          .eq('id', editingId)

        if (error) throw error
        toast.success('تم تحديث العيادة بنجاح')
      } else {
        // إضافة جديد
        const { data: centers } = await supabase
          .from('centers')
          .select('id')
          .limit(1)
          .single()

        if (!centers) {
          toast.error('لا يوجد مركز معرف في النظام. يرجى إنشاء مركز أولاً')
          return
        }

        // إضافة القيم الافتراضية المطلوبة واستخدام (as any) لتجاوز خطأ النوع في centers
        const insertData: ClinicInsert = {
          center_id: (centers as any).id,
          name: formData.name,
          clinic_number: clinicNumber,
          screen_ids: screensArray,
          password: formData.password,
          current_number: 0,
          is_active: true,
          last_call_time: null
        }

        const { error } = await (supabase.from('clinics') as any)
          .insert(insertData)

        if (error) throw error
        toast.success('تم إضافة العيادة بنجاح')
      }

      await fetchClinics()
      setFormData({ name: '', number: '', screens: '', password: '' })
      setShowForm(false)
      setEditingId(null)

    } catch (err: any) {
      console.error(err)
      toast.error(err.message || 'حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (clinic: Clinic) => {
    setFormData({
      name: clinic.name,
      number: clinic.clinic_number.toString(),
      screens: clinic.screen_ids.join(', '),
      password: clinic.password,
    })
    setEditingId(clinic.id)
    setShowForm(true)
  }

  // 3. حذف عيادة
  const handleDelete = async (id: string) => {
    if (confirm('هل تريد حذف هذه العيادة؟')) {
      try {
        const { error } = await supabase
          .from('clinics')
          .delete()
          .eq('id', id)

        if (error) throw error
        
        setClinics((prev) => prev.filter((clinic) => clinic.id !== id))
        toast.success('تم حذف العيادة بنجاح')
      } catch (error) {
        toast.error('فشل حذف العيادة')
      }
    }
  }

  return (
    <div className="min-h-screen bg-medical-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">إدارة العيادات</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Add Button */}
        <Button
          onClick={() => {
            setShowForm(!showForm)
            setEditingId(null)
            setFormData({ name: '', number: '', screens: '', password: '' })
          }}
          className="mb-6 gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة عيادة جديدة
        </Button>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'تعديل العيادة' : 'إضافة عيادة جديدة'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">اسم العيادة</label>
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم العيادة</label>
                    <Input
                      type="number"
                      name="number"
                      value={formData.number}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">أرقام الشاشات (مفصولة بفواصل)</label>
                    <Input
                      type="text"
                      name="screens"
                      placeholder="1, 2, 3"
                      value={formData.screens}
                      onChange={handleChange}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">كلمة المرور</label>
                    <Input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        جاري الحفظ...
                      </>
                    ) : (
                      'حفظ'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                      setFormData({ name: '', number: '', screens: '', password: '' })
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loadingData ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-medical-600" />
          </div>
        ) : (
          /* Clinics List */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clinics.length === 0 ? (
              <p className="text-center col-span-3 text-gray-500">لا توجد عيادات مضافة حالياً</p>
            ) : (
              clinics.map((clinic) => (
                <Card key={clinic.id}>
                  <CardHeader>
                    <CardTitle>{clinic.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-medical-600">رقم العيادة</p>
                      <p className="font-bold text-medical-900">{clinic.clinic_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-medical-600">الشاشات</p>
                      <p className="font-bold text-medical-900">
                        {clinic.screen_ids && clinic.screen_ids.length > 0 
                          ? clinic.screen_ids.join(', ') 
                          : 'لا يوجد'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-medical-600">الحالة</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        clinic.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {clinic.is_active ? 'نشط' : 'متوقف'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(clinic)}
                        className="flex-1 gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        تعديل
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(clinic.id)}
                        className="flex-1 gap-2 text-danger-600 hover:text-danger-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
