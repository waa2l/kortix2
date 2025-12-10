'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Send, AlertTriangle, Loader2 } from 'lucide-react'
import { toArabicNumbers } from '@/utils/arabic'
import toast from 'react-hot-toast'

export default function AnnouncementsPage() {
  const [loading, setLoading] = useState(false)
  const [announcementType, setAnnouncementType] = useState('patient-call')
  const [selectedClinic, setSelectedClinic] = useState('')
  const [patientNumber, setPatientNumber] = useState('')
  const [textMessage, setTextMessage] = useState('')
  const [selectedAudio, setSelectedAudio] = useState('')

  const clinics = [
    { id: '1', name: 'طب الأسرة' },
    { id: '2', name: 'الأسنان' },
    { id: '3', name: 'العيون' },
    { id: '4', name: 'الجلدية' },
    { id: '5', name: 'الأطفال' },
  ]

  const audioFiles = [
    { id: 'instant1', name: 'أهلا وسهلا بكم في المركز الطبي' },
    { id: 'instant2', name: 'رجاء الانتظار بهدوء' },
    { id: 'instant3', name: 'شكراً لتعاونكم معنا' },
  ]

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!selectedClinic) {
        toast.error('يرجى اختيار عيادة')
        return
      }

      await new Promise((resolve) => setTimeout(resolve, 1000))

      let message = ''
      switch (announcementType) {
        case 'patient-call':
          if (!patientNumber) {
            toast.error('يرجى إدخال رقم العميل')
            return
          }
          message = `تم استدعاء العميل رقم ${toArabicNumbers(parseInt(patientNumber))} في ${clinics.find((c) => c.id === selectedClinic)?.name}`
          break
        case 'emergency':
          message = `تنبيه طوارئ في ${clinics.find((c) => c.id === selectedClinic)?.name}`
          break
        case 'text-alert':
          if (!textMessage) {
            toast.error('يرجى إدخال النص')
            return
          }
          message = `تنبيه نصي: ${textMessage}`
          break
        case 'audio-broadcast':
          if (!selectedAudio) {
            toast.error('يرجى اختيار ملف صوتي')
            return
          }
          message = `تم بث الملف الصوتي: ${audioFiles.find((a) => a.id === selectedAudio)?.name}`
          break
      }

      toast.success(message)

      // Reset form
      setPatientNumber('')
      setTextMessage('')
      setSelectedAudio('')
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
          <h1 className="text-3xl font-bold text-medical-900">إعدادات النداء</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Announcement Form */}
        <Card>
          <CardHeader>
            <CardTitle>إرسال نداء أو إعلان</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSendAnnouncement} className="space-y-6">
              {/* Clinic Selection */}
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

              {/* Announcement Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">نوع النداء</label>
                <Select
                  value={announcementType}
                  onChange={(e) => setAnnouncementType(e.target.value)}
                  disabled={loading}
                >
                  <option value="patient-call">نداء عميل معين</option>
                  <option value="emergency">تنبيه طوارئ</option>
                  <option value="text-alert">تنبيه نصي</option>
                  <option value="audio-broadcast">بث ملف صوتي</option>
                </Select>
              </div>

              {/* Patient Number */}
              {announcementType === 'patient-call' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">رقم العميل</label>
                  <Input
                    type="number"
                    placeholder="أدخل رقم العميل"
                    value={patientNumber}
                    onChange={(e) => setPatientNumber(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Text Message */}
              {announcementType === 'text-alert' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">النص</label>
                  <Textarea
                    placeholder="أدخل النص المراد عرضه"
                    value={textMessage}
                    onChange={(e) => setTextMessage(e.target.value)}
                    disabled={loading}
                    rows={4}
                  />
                </div>
              )}

              {/* Audio File Selection */}
              {announcementType === 'audio-broadcast' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">اختر الملف الصوتي</label>
                  <Select
                    value={selectedAudio}
                    onChange={(e) => setSelectedAudio(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">-- اختر ملف صوتي --</option>
                    {audioFiles.map((audio) => (
                      <option key={audio.id} value={audio.id}>
                        {audio.name}
                      </option>
                    ))}
                  </Select>
                </div>
              )}

              {/* Emergency Warning */}
              {announcementType === 'emergency' && (
                <div className="p-4 bg-danger-50 border border-danger-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-danger-700">تنبيه طوارئ</p>
                    <p className="text-sm text-danger-600">سيتم إرسال نداء طوارئ فوري إلى جميع الشاشات</p>
                  </div>
                </div>
              )}

              {/* Send Button */}
              <Button type="submit" className="w-full gap-2" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    إرسال النداء
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تصفير جميع العيادات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medical-600 mb-4">
                سيتم إعادة تعيين الرقم الحالي إلى صفر في جميع العيادات
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  if (confirm('هل تريد تصفير جميع العيادات؟')) {
                    toast.success('تم تصفير جميع العيادات')
                  }
                }}
              >
                تصفير الآن
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">تسجيل صوت جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medical-600 mb-4">
                سجل رسالة صوتية جديدة (حد أقصى 10 ثوان)
              </p>
              <Button variant="outline" className="w-full">
                بدء التسجيل
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
