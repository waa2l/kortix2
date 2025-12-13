'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Plus, Trash2, Loader2, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import type { Doctor, DoctorInsert, DoctorUpdate } from '@/lib/supabase-types'

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    doctor_number: '',
    phone: '',
    national_id: '',
    specialty: '',
    work_status: 'active'
  })

  // Fetch doctors
  const fetchDoctors = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setDoctors(data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
      toast.error('فشل جلب البيانات')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.doctor_number || !formData.national_id) {
        toast.error('الاسم ورقم الطبيب والرقم القومي مطلوبين')
        return
      }

      // Get center_id
      const { data: centers } = await supabase
        .from('centers')
        .select('id')
        .limit(1)
        .single()

      if (!centers) {
        toast.error('يجب إضافة مركز أولاً')
        return
      }

      if (editingId) {
        // تحديث
        const updateData: DoctorUpdate = {
          name: formData.name,
          doctor_number: formData.doctor_number,
          phone: formData.phone,
          national_id: formData.national_id,
          specialty: formData.specialty,
          work_status: formData.work_status as 'active' | 'inactive' | 'on_leave'
        }

        const { error } = await supabase
          .from('doctors')
          .update(updateData)
          .eq('id', editingId)

        if (error) throw error
        toast.success('تم تحديث الطبيب بنجاح')
      } else {
        // إضافة جديد
        const insertData: DoctorInsert = {
          center_id: centers.id,
          name: formData.name,
          doctor_number: formData.doctor_number,
          phone: formData.phone,
          national_id: formData.national_id,
          specialty: formData.specialty,
          work_status: formData.work_status as 'active' | 'inactive' | 'on_leave'
        }

        const { error } = await supabase
          .from('doctors')
          .insert(insertData)

        if (error) throw error
        toast.success('تم إضافة الطبيب بنجاح')
      }

      setFormData({ 
        name: '', 
        doctor_number: '', 
        phone: '', 
        national_id: '', 
        specialty: '',
        work_status: 'active'
      })
      setShowForm(false)
      setEditingId(null)
      fetchDoctors()

    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (doctor: Doctor) => {
    setFormData({
      name: doctor.name,
      doctor_number: doctor.doctor_number,
      phone: doctor.phone,
      national_id: doctor.national_id,
      specialty: doctor.specialty,
      work_status: doctor.work_status
    })
    setEditingId(doctor.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل تريد حذف هذا الطبيب؟')) {
      try {
        const { error } = await supabase
          .from('doctors')
          .delete()
          .eq('id', id)

        if (error) throw error
        
        setDoctors(prev => prev.filter(d => d.id !== id))
        toast.success('تم حذف الطبيب بنجاح')
      } catch (err) {
        toast.error('فشل الحذف')
      }
    }
  }

  return (
    <div className="min-h-screen bg-medical-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">إدارة الأطباء</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        <Button onClick={() => {
          setShowForm(!showForm)
          setEditingId(null)
          setFormData({ 
            name: '', 
            doctor_number: '', 
            phone: '', 
            national_id: '', 
            specialty: '',
            work_status: 'active'
          })
        }} className="mb-6 gap-2">
          <Plus className="w-4 h-4" />
          إضافة طبيب
        </Button>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'تعديل بيانات الطبيب' : 'بيانات الطبيب الجديد'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">اسم الطبيب</label>
                    <Input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الطبيب (الكود)</label>
                    <Input 
                      name="doctor_number" 
                      value={formData.doctor_number} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">التخصص</label>
                    <Input 
                      name="specialty" 
                      value={formData.specialty} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الرقم القومي</label>
                    <Input 
                      name="national_id" 
                      value={formData.national_id} 
                      onChange={handleChange} 
                      maxLength={14}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">الهاتف</label>
                    <Input 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">حالة العمل</label>
                    <Select 
                      name="work_status" 
                      value={formData.work_status} 
                      onChange={handleChange}
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                      <option value="on_leave">في إجازة</option>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false)
                      setEditingId(null)
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle>قائمة الأطباء</CardTitle></CardHeader>
          <CardContent>
            {loadingData ? (
               <div className="text-center p-4">
                 <Loader2 className="w-6 h-6 animate-spin mx-auto" />
               </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4 font-bold">الرقم</th>
                      <th className="text-right py-3 px-4 font-bold">الاسم</th>
                      <th className="text-right py-3 px-4 font-bold">التخصص</th>
                      <th className="text-right py-3 px-4 font-bold">الهاتف</th>
                      <th className="text-right py-3 px-4 font-bold">الحالة</th>
                      <th className="text-right py-3 px-4 font-bold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b hover:bg-medical-50">
                        <td className="py-3 px-4">{doctor.doctor_number}</td>
                        <td className="py-3 px-4">{doctor.name}</td>
                        <td className="py-3 px-4">{doctor.specialty}</td>
                        <td className="py-3 px-4">{doctor.phone}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            doctor.work_status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : doctor.work_status === 'on_leave'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {doctor.work_status === 'active' ? 'نشط' : doctor.work_status === 'on_leave' ? 'إجازة' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEdit(doctor)}
                            >
                              <Edit2 className="w-3 h-3" /> تعديل
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDelete(doctor.id)} 
                              className="text-danger-600"
                            >
                              <Trash2 className="w-3 h-3" /> حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
