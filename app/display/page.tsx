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
import { toArabicNumbers, formatArabicDateTime } from '@/utils/arabic'
import { QRCodeCanvas } from 'qrcode.react'
import toast from 'react-hot-toast'

export default function DisplayPage() {
  const [selectedScreen, setSelectedScreen] = useState('1')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [notification, setNotification] = useState<{
    message: string
    timestamp: string
    show: boolean
  } | null>(null)
  const displayRef = useRef<HTMLDivElement>(null)

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Mock clinic data
  const clinics = [
    { id: 1, name: 'طب الأسرة', currentNumber: 25, lastCall: '08:45', status: 'active' },
    { id: 2, name: 'الأسنان', currentNumber: 12, lastCall: '08:40', status: 'active' },
    { id: 3, name: 'العيون', currentNumber: 8, lastCall: '08:35', status: 'inactive' },
    { id: 4, name: 'الجلدية', currentNumber: 15, lastCall: '08:42', status: 'active' },
    { id: 5, name: 'الأطفال', currentNumber: 20, lastCall: '08:38', status: 'active' },
  ]

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

  // Simulate notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotification({
        message: `على العميل رقم ${toArabicNumbers(44)} التوجه إلى عيادة طب الأسرة`,
        timestamp: formatArabicDateTime(new Date()),
        show: true,
      })

      // Auto hide after 5 seconds
      setTimeout(() => {
        setNotification((prev) => prev ? { ...prev, show: false } : null)
      }, 5000)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

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
            className="text-white hover:bg-medical-800"
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
          <div className="grid grid-cols-2 gap-4 h-full">
            {clinics.map((clinic) => (
              <div
                key={clinic.id}
                className={`rounded-2xl p-6 transition-all duration-300 ${
                  clinic.status === 'active'
                    ? 'bg-gradient-to-br from-primary-600 to-primary-700 shadow-2xl'
                    : 'bg-medical-700 opacity-50'
                } ${notification?.show ? 'animate-pulse' : ''}`}
              >
                <div className="text-center">
                  <p className="text-lg text-primary-100 mb-2">{clinic.name}</p>
                  <p className="text-6xl font-bold text-white mb-4">
                    {toArabicNumbers(clinic.currentNumber)}
                  </p>
                  <p className="text-sm text-primary-100">
                    آخر نداء: {clinic.lastCall}
                  </p>
                  <p className="text-xs text-primary-200 mt-2">
                    {clinic.status === 'active' ? '🟢 نشطة' : '🔴 متوقفة'}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
        <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-success-500 to-success-600 text-white p-4 shadow-lg animate-slide-in-down">
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
      <div className="fixed bottom-0 left-0 right-0 bg-medical-950 border-t-4 border-primary-500 overflow-hidden h-16 flex items-center">
        <div className="animate-scroll-rtl whitespace-nowrap text-xl font-bold text-primary-400 px-4">
          أهلا وسهلا بكم في المركز الطبي المتقدم • نرجو الانتظار بهدوء • شكراً لتعاونكم معنا
        </div>
      </div>
    </div>
  )
}
