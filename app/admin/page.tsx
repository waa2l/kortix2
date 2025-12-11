'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [centerId, setCenterId] = useState<string | null>(null)
  
  const [settings, setSettings] = useState({
    centerName: '',
    newsTicker: '',
    tickerSpeed: 30,
    alertDuration: 5,
    speechSpeed: 1.0,
  })

  // Fetch Settings (First Center)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('centers').select('*').limit(1).single()
        
        if (data) {
          setCenterId(data.id)
          setSettings({
            centerName: data.name,
            newsTicker: data.news_ticker || '',
            tickerSpeed: data.ticker_speed || 30,
            alertDuration: data.alert_duration || 5,
            speechSpeed: data.speech_speed || 1.0
          })
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }
    fetchSettings()
  }, [])

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
      const dataToUpdate = {
        name: settings.centerName,
        news_ticker: settings.newsTicker,
        ticker_speed: settings.tickerSpeed,
        alert_duration: settings.alertDuration,
        speech_speed: settings.speechSpeed
      }

      let error;
      
      if (centerId) {
        // Update existing
        const result = await (supabase.from('centers') as any).update(dataToUpdate).eq('id', centerId)
        error = result.error
      } else {
        // Insert new (First time setup)
        const result = await (supabase.from('centers') as any).insert(dataToUpdate)
        error = result.error
      }

      if (error) throw error
      toast.success('تم حفظ الإعدادات بنجاح')
    } catch (err) {
      toast.error('حدث خطأ أثناء الحفظ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-medical-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">الإعدادات العامة</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader><CardTitle>اسم المركز</CardTitle></CardHeader>
            <CardContent>
              <Input type="text" name="centerName" value={settings.centerName} onChange={handleChange} disabled={loading} placeholder="اسم المركز الطبي" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>الشريط الإخباري</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">محتوى الشريط</label>
                <Textarea name="newsTicker" value={settings.newsTicker} onChange={handleChange} disabled={loading} rows={4} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">سرعة الشريط (ثانية)</label>
                <Input type="number" name="tickerSpeed" value={settings.tickerSpeed} onChange={handleChange} disabled={loading} min="5" max="60" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>إعدادات التنبيهات ونطق الصوت</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">مدة عرض التنبيه (ثانية)</label>
                <Input type="number" name="alertDuration" value={settings.alertDuration} onChange={handleChange} disabled={loading} min="1" max="30" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">سرعة النطق</label>
                <Input type="number" name="speechSpeed" value={settings.speechSpeed} onChange={handleChange} disabled={loading} min="0.5" max="2" step="0.1" />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> حفظ الإعدادات</>}
          </Button>
        </form>
      </div>
    </div>
  )
}
