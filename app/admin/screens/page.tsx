'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Screen {
  id: string
  number: number
  password: string
  isActive: boolean
}

export default function ScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([
    { id: '1', number: 1, password: 'screen1', isActive: true },
    { id: '2', number: 2, password: 'screen2', isActive: true },
    { id: '3', number: 3, password: 'screen3', isActive: true },
    { id: '4', number: 4, password: 'screen4', isActive: false },
    { id: '5', number: 5, password: 'screen5', isActive: true },
  ])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    number: '',
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
      if (!formData.number || !formData.password) {
        toast.error('يرجى ملء جميع الحقول')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      if (editingId) {
        setScreens((prev) =>
          prev.map((screen) =>
            screen.id === editingId
              ? {
                  ...screen,
                  number: parseInt(formData.number),
                  password: formData.password,
                }
              : screen
          )
        )
        toast.success('تم تحديث الشاشة بنجاح')
        setEditingId(null)
      } else {
        const newScreen: Screen = {
          id: Date.now().toString(),
          number: parseInt(formData.number),
          password: formData.password,
          isActive: true,
        }
        setScreens((prev) => [...prev, newScreen])
        toast.success('تم إضافة الشاشة بنجاح')
      }

      setFormData({ number: '', password: '' })
      setShowForm(false)
    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (screen: Screen) => {
    setFormData({
      number: screen.number.toString(),
      password: screen.password,
    })
    setEditingId(screen.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل تريد حذف هذه الشاشة؟')) {
      setScreens((prev) => prev.filter((screen) => screen.id !== id))
      toast.success('تم حذف الشاشة بنجاح')
    }
  }

  const handleToggleStatus = (id: string) => {
    setScreens((prev) =>
      prev.map((screen) =>
        screen.id === id ? { ...screen, isActive: !screen.isActive } : screen
      )
    )
    toast.success('تم تحديث حالة الشاشة')
  }

  return (
    <div className="min-h-screen bg-medical-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">إدارة الشاشات</h1>
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
            setFormData({ number: '', password: '' })
          }}
          className="mb-6 gap-2"
        >
          <Plus className="w-4 h-4" />
          إضافة شاشة جديدة
        </Button>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{editingId ? 'تعديل الشاشة' : 'إضافة شاشة جديدة'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">رقم الشاشة</label>
                    <Input
                      type="number"
                      name="number"
                      value={formData.number}
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
                      setFormData({ number: '', password: '' })
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Screens Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => (
            <Card key={screen.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>شاشة {screen.number}</CardTitle>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      screen.isActive
                        ? 'bg-success-100 text-success-700'
                        : 'bg-medical-200 text-medical-700'
                    }`}
                  >
                    {screen.isActive ? '🟢 نشطة' : '🔴 معطلة'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-medical-600">كلمة المرور</p>
                  <p className="font-mono text-sm text-medical-900">{screen.password}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={screen.isActive ? 'outline' : 'default'}
                    onClick={() => handleToggleStatus(screen.id)}
                    className="flex-1"
                  >
                    {screen.isActive ? 'إيقاف' : 'تفعيل'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(screen)}
                    className="gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(screen.id)}
                    className="gap-2 text-danger-600"
                  >
                    <Trash2 className="w-4 h-4" />
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
