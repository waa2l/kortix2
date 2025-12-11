'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import {
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Monitor,
  Volume2,
  VolumeX,
} from 'lucide-react'
// تم حذف formatArabicDateTime من الاستيراد
import { toArabicNumbers, formatArabicTime } from '@/utils/arabic'
import { QRCodeCanvas } from 'qrcode.react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { playPatientCallAnnouncement } from '@/utils/audio'

// تعريف واجهة العيادة بناءً على قاعدة البيانات
interface Clinic {
  id: string
  name: string
  clinic_number: number
  current_number: number
  is_active: boolean
  last_call_time: string | null
}

export default function DisplayPage() {
  const [selectedScreen, setSelectedScreen] = useState('1')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  
  // States for DB data
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [newsTicker, setNewsTicker] = useState('أهلا وسهلا بكم في المركز الطبي')
  
  const [notification, setNotification] = useState<{
    message: string
    timestamp: string
    show: boolean
  } | null>(null)
  
  const displayRef = useRef<HTMLDivElement>(null)

  // Update time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Data & Subscribe to Realtime
  useEffect(() => {
    const fetchData = async () => {
      // 1. Fetch Clinics
      const { data: clinicsData } = await supabase
        .from('clinics')
        .select('*')
        .order('clinic_number', { ascending: true })
      
      if (clinicsData) {
        setClinics(clinicsData)
      }

      // 2. Fetch News Ticker (from first center)
      const { data: centerData } = await supabase
        .from('centers')
        .select('news_ticker')
        .limit(1)
        .single()
      
      if (centerData?.news_ticker) {
        setNewsTicker(centerData.news_ticker)
      }
    }

    fetchData()

    // 3. Realtime Subscription
    const channel = supabase
      .channel('display_channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clinics' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updatedClinic = payload.new as Clinic
            
            // تحديث القائمة
            setClinics((prev) => 
              prev.map((c) => c.id === updatedClinic.id ? updatedClinic : c)
            )

            // تشغيل الصوت وإظهار إشعار عند تغيير الرقم
            const oldClinic = payload.old as Partial<Clinic>
            if (updatedClinic.current_number !== oldClinic.current_number && updatedClinic.current_number > 0) {
              
              // إظهار إشعار
              setNotification({
                message: `العميل رقم ${toArabicNumbers(updatedClinic.current_number)} - ${updatedClinic.name}`,
                timestamp: formatArabicTime(new Date()),
                show: true
              })

              // إخفاء الإشعار بعد 5 ثواني
              setTimeout(() => setNotification(null), 5000)

              // تشغيل الصوت (إذا لم يكن مكتوم الصوت)
              if (!isMuted) {
                playPatientCallAnnouncement(updatedClinic.current_number, updatedClinic.clinic_number)
                  .catch(err => console.error("Audio play failed", err))
              }
            }
          }
        }
      )
      .on(
        'postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'centers' },
        (payload) => {
          if (payload.new.news_ticker) {
            setNewsTicker(payload.new.news_ticker)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isMuted])

  const handleFullscreen = async () => {
    if (!document.fullscreenElement) {
      displayRef.current?.requestFullscreen().catch(() => {
        toast.error('لا يمكن تفعيل ملء الشاشة')
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50))
  }

  return (
    <div
      ref={displayRef}
      className="min-h-screen bg-gradient-to-br from-medical-900 via-medical-800 to-medical-900 text-white"
      style={{ zoom: `${zoom}%` }}
    >
      {/* Header Bar */}
      <div className="bg-medical-950 border-b-4 border-primary-500 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="text-2xl font-bold">المركز الطبي المتقدم</div>
          <div className="text-lg text-medical-300">
            {currentTime.toLocaleTimeString('ar-EG')} | {currentTime.toLocaleDateString('ar-EG')}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={selectedScreen}
            onChange={(e) => setSelectedScreen(e.target.value)}
            className="bg-medical-800 border-medical-700 text-white"
          >
            {[1, 2, 3, 4, 5].map((screen) => (
              <option key={screen} value={screen.toString()}>
                شاشة {toArabicNumbers(screen)}
              </option>
            ))}
          </Select>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleFullscreen}
            className="text-white hover:bg-medical-800"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomIn}
            className="text-white hover:bg-medical-800"
          >
            <ZoomIn className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={handleZoomOut}
            className="text-white hover:bg-medical-800"
          >
            <ZoomOut className="w-5 h-5" />
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className={`hover:bg-medical-800 ${isMuted ? 'text-red-400' : 'text-white'}`}
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Left Side - Video Player */}
        <div className="w-1/4 bg-black p-4 border-l-4 border-primary-500">
          <div className="bg-medical-800 rounded-lg overflow-hidden h-full flex items-center justify-center">
            <div className="text-center">
              <Monitor className="w-16 h-16 mx-auto mb-4 text-primary-400" />
              <p className="text-medical-300">مشغل الفيديوهات</p>
              <p className="text-sm text-medical-500 mt-2">فيديوهات توعية طبية</p>
            </div>
          </div>
        </div>

        {/* Center - Clinic Cards */}
        <div className="flex-1 p-6 overflow-y-auto">
          {clinics.length === 0 ? (
             <div className="flex items-center justify-center h-full text-medical-400">
                جار تحميل العيادات...
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 h-full content-start">
                {clinics.map((clinic) => (
                <div
                    key={clinic.id}
                    className={`rounded-2xl p-6 transition-all duration-300 ${
                    clinic.is_active
                        ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-2xl'
                        : 'bg-medical-700 opacity-50'
                    } ${notification?.message.includes(clinic.name) ? 'animate-pulse ring-4 ring-yellow-400' : ''}`}
                >
                    <div className="text-center">
                    <p className="text-lg text-primary-100 mb-2">{clinic.name}</p>
                    <p className="text-6xl font-bold text-white mb-4">
                        {toArabicNumbers(clinic.current_number)}
                    </p>
                    <p className="text-sm text-primary-100">
                        آخر نداء: {clinic.last_call_time ? formatArabicTime(new Date(clinic.last_call_time)) : '--:--'}
                    </p>
                    <p className="text-xs text-primary-200 mt-2">
                        {clinic.is_active ? '🟢 نشطة' : '🔴 متوقفة'}
                    </p>
                    </div>
                </div>
                ))}
            </div>
          )}
        </div>

        {/* Right Side - QR Code & Doctor Photos */}
        <div className="w-1/4 bg-medical-800 p-4 border-r-4 border-primary-500 flex flex-col gap-4">
          {/* QR Code */}
          <Card className="bg-white p-4 rounded-lg flex-1 flex flex-col items-center justify-center">
            <p className="text-medical-900 font-bold mb-3 text-sm">ادخل من هنا</p>
            <QRCodeCanvas
              value="https://medical-queue.example.com/client"
              size={150}
              level="H"
              includeMargin={true}
            />
            <p className="text-xs text-medical-600 mt-3 text-center">
              امسح الكود للدخول إلى صفحة العميل
            </p>
          </Card>

          {/* Doctor Photos Carousel */}
          <Card className="bg-medical-700 p-4 rounded-lg flex-1 flex flex-col items-center justify-center">
            <div className="w-full h-full bg-medical-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <p className="text-medical-300 mb-2">صور الأطباء</p>
                <p className="text-sm text-medical-400">تدوير تلقائي كل 10 ثوان</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Notification Bar */}
      {notification?.show && (
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-success-500 to-success-600 text-white p-4 shadow-lg animate-slide-in-down z-50">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-lg font-bold">{notification.message}</p>
              <p className="text-sm text-success-100">{notification.timestamp}</p>
            </div>
            <button
              onClick={() => setNotification((prev) => prev ? { ...prev, show: false } : null)}
              className="text-white hover:text-success-100"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* News Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-medical-950 border-t-4 border-primary-500 overflow-hidden h-16 flex items-center z-40">
        <div className="animate-scroll-rtl whitespace-nowrap text-xl font-bold text-primary-400 px-4">
          {newsTicker}
        </div>
      </div>
    </div>
  )
}
