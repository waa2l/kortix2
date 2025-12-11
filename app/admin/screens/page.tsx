'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Plus, Edit2, Trash2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

interface Screen {
  id: string
  screen_number: number
  password: string
  is_active: boolean
}

export default function ScreensPage() {
  const [screens, setScreens] = useState<Screen[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    number: '',
    password: '',
  })

  // Fetch Screens
  const fetchScreens = async () => {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .order('screen_number', { ascending: true })

      if (error) throw error
      if (data) setScreens(data)
    } catch (error) {
      console.error(error)
      toast.error('فشل جلب الشاشات')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { fetchScreens() }, [])

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

      // Get center_id
      const { data: centers } = await supabase.from('centers').select('id').limit(1)
      const centerId = (centers as any)?.[0]?.id

      if (!centerId) {
        toast.error('يجب إضافة مركز أولاً')
        return
      }

      const screenData = {
        screen_number: parseInt(formData.number),
        password: formData.password,
        center_id: centerId
      }

      if (editingId) {
        const { error } = await (supabase.from('screens') as any)
          .update(screenData)
          .eq('id', editingId)
        if (error) throw error
        toast.success('تم التحديث')
      } else {
        const { error } = await (supabase.from('screens') as any)
          .insert(screenData)
        if (error) throw error
        toast.success('تمت الإضافة')
      }

      setFormData({ number: '', password: '' })
      setShowForm(false)
      setEditingId(null)
      fetchScreens()

    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('هل تريد الحذف؟')) {
      try {
        const { error } = await supabase.from('screens').delete().eq('id', id)
        if (error) throw error
        setScreens(prev => prev.filter(s => s.id !== id))
        toast.success('تم الحذف')
      } catch (e) {
        toast.error('فشل الحذف')
      }
    }
  }

  const handleEdit = (screen: Screen) => {
    setFormData({
      number: screen.screen_number.toString(),
      password: screen.password,
    })
    setEditingId(screen.id)
    setShowForm(true)
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
        const { error } = await (supabase.from('screens') as any)
            .update({ is_active: !currentStatus })
            .eq('id', id)
        if (error) throw error
        
        // Optimistic update
        setScreens(prev => prev.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s))
        toast.success('تم تغيير الحالة')
    } catch(e) {
        toast.error('فشل تغيير الحالة')
    }
  }

  return (
    <div className="min-h-screen bg-medical-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">إدارة الشاشات</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2"><ArrowLeft className="w-4 h-4" /> العودة</Button>
          </Link>
        </div>

        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ number: '', password: '' }) }} className="mb-6 gap-2">
          <Plus className="w-4 h-4" /> إضافة شاشة
        </Button>

        {showForm && (
          <Card className="mb-6">
            <CardHeader><CardTitle>{editingId ? 'تعديل' : 'إضافة'}</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label>رقم الشاشة</label>
                    <Input type="number" name="number" value={formData.number} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <label>كلمة المرور</label>
                    <Input type="password" name="password" value={formData.password} onChange={handleChange} />
                  </div>
                </div>
                <Button type="submit" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'حفظ'}</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* تم استخدام loadingData هنا لإظهار مؤشر التحميل */}
        {loadingData ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {screens.map((screen) => (
              <Card key={screen.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>شاشة {screen.screen_number}</CardTitle>
                    <span className={`px-2 py-1 text-xs rounded-full ${screen.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {screen.is_active ? 'نشط' : 'معطل'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p>كلمة المرور: {screen.password}</p>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleToggleStatus(screen.id, screen.is_active)} variant="outline">
                      {screen.is_active ? 'تعطيل' : 'تفعيل'}
                    </Button>
                    <Button size="sm" onClick={() => handleEdit(screen)} variant="outline"><Edit2 className="w-4 h-4" /></Button>
                    <Button size="sm" onClick={() => handleDelete(screen.id)} variant="destructive"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
