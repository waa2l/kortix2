'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    centerName: 'المركز الطبي المتقدم',
    newsTicker: 'أهلا وسهلا بكم في المركز الطبي • نرجو الانتظار بهدوء • شكراً لتعاونكم معنا',
    tickerSpeed: 30,
    alertDuration: 5,
    speechSpeed: 1.0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: name === 'tickerSpeed' || name === 'alertDuration' ? parseInt(value) : name === 'speechSpeed' ? parseFloat(value) : value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Mock save
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-medical-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">الإعدادات العامة</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Center Name */}
          <Card>
            <CardHeader>
              <CardTitle>اسم المركز</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="text"
                name="centerName"
                value={settings.centerName}
                onChange={handleChange}
                disabled={loading}
              />
            </CardContent>
          </Card>

          {/* News Ticker */}
          <Card>
            <CardHeader>
              <CardTitle>الشريط الإخباري</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">محتوى الشريط</label>
                <Textarea
                  name="newsTicker"
                  value={settings.newsTicker}
                  onChange={handleChange}
                  disabled={loading}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">سرعة الشريط (ثانية)</label>
                <Input
                  type="number"
                  name="tickerSpeed"
                  value={settings.tickerSpeed}
                  onChange={handleChange}
                  disabled={loading}
                  min="5"
                  max="60"
                />
              </div>
            </CardContent>
          </Card>

          {/* Alert Settings */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات التنبيهات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">مدة عرض التنبيه (ثانية)</label>
                <Input
                  type="number"
                  name="alertDuration"
                  value={settings.alertDuration}
                  onChange={handleChange}
                  disabled={loading}
                  min="1"
                  max="30"
                />
              </div>
            </CardContent>
          </Card>

          {/* Speech Settings */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النطق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <label className="text-sm font-medium">سرعة النطق</label>
                <Input
                  type="number"
                  name="speechSpeed"
                  value={settings.speechSpeed}
                  onChange={handleChange}
                  disabled={loading}
                  min="0.5"
                  max="2"
                  step="0.1"
                />
                <p className="text-xs text-medical-600">0.5 = بطيء، 1.0 = عادي، 2.0 = سريع</p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                حفظ الإعدادات
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
