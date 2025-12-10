'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Clinic {
  id: string
  name: string
  number: number
  screens: number[]
  password: string
}

export default function ClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>([
    { id: '1', name: 'طب الأسرة', number: 1, screens: [1, 2], password: '1234' },
    { id: '2', name: 'الأسنان', number: 2, screens: [2, 3], password: '2345' },
    { id: '3', name: 'العيون', number: 3, screens: [3, 4], password: '3456' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    screens: '',
    password: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.name || !formData.number || !formData.password) {
        toast.error('يرجى ملء جميع الحقول')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (editingId) {
        setClinics((prev) =>
          prev.map((clinic) =>
            clinic.id === editingId
              ? {
                  ...clinic,
                  name: formData.name,
                  number: parseInt(formData.number),
                  screens: formData.screens.split(',').map((s) => parseInt(s.trim())),
                  password: formData.password,
                }
              : clinic
          )
        )
        toast.success('تم تحديث العيادة بنجاح')
        setEditingId(null)
      } else {
        const newClinic: Clinic = {
          id: Date.now().toString(),
          name: formData.name,
          number: parseInt(formData.number),
          screens: formData.screens.split(',').map((s) => parseInt(s.trim())),
          password: formData.password,
        }
        setClinics((prev) => [...prev, newClinic])
        toast.success('تم إضافة العيادة بنجاح')
      }

      setFormData({ name: '', number: '', screens: '', password: '' })
      setShowForm(false)
    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (clinic: Clinic) => {
    setFormData({
      name: clinic.name,
      number: clinic.number.toString(),
      screens: clinic.screens.join(', '),
      password: clinic.password,
    })
    setEditingId(clinic.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل تريد حذف هذه العيادة؟')) {
      setClinics((prev) => prev.filter((clinic) => clinic.id !== id))
      toast.success('تم حذف العيادة بنجاح')
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

        {/* Clinics List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clinics.map((clinic) => (
            <Card key={clinic.id}>
              <CardHeader>
                <CardTitle>{clinic.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-medical-600">رقم العيادة</p>
                  <p className="font-bold text-medical-900">{clinic.number}</p>
                </div>
                <div>
                  <p className="text-sm text-medical-600">الشاشات</p>
                  <p className="font-bold text-medical-900">{clinic.screens.join(', ')}</p>
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
          ))}
        </div>
      </div>
    </div>
  )
}
