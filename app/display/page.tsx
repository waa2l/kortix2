'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import {
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { toArabicNumbers, formatArabicTime } from '@/utils/arabic'
import { QRCodeCanvas } from 'qrcode.react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase'
import { playPatientCallAnnouncement, playEmergencyAlert } from '@/utils/audio'

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
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [newsTicker, setNewsTicker] = useState('أهلا وسهلا بكم في المركز الطبي')
  const displayRef = useRef<HTMLDivElement>(null)
  
  // Notification State
  const [notification, setNotification] = useState<{
    message: string
    type: 'info' | 'emergency'
    show: boolean
  } | null>(null)

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Data Fetching & Realtime
  useEffect(() => {
    const fetchData = async () => {
      // Clinics
      const { data: clinicsData } = await supabase
        .from('clinics')
        .select('*')
        .order('clinic_number', { ascending: true })
      if (clinicsData) setClinics(clinicsData as any)

      // Ticker
      const { data: centerData } = await supabase
        .from('centers')
        .select('news_ticker')
        .limit(1)
        .single()
      const center = centerData as any
      if (center?.news_ticker) setNewsTicker(center.news_ticker)
    }
    fetchData()

    const channel = supabase.channel('display_realtime')
      // 1. Listen for Clinic Updates (Numbers)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'clinics' }, (payload) => {
          const updatedClinic = payload.new as Clinic
          setClinics((prev) => prev.map((c) => c.id === updatedClinic.id ? updatedClinic : c))

          // Trigger Sound on Change
          const oldClinic = payload.old as Partial<Clinic>
          if (updatedClinic.current_number !== oldClinic.current_number && updatedClinic.current_number > 0) {
             if (!isMuted) {
                playPatientCallAnnouncement(updatedClinic.current_number, updatedClinic.clinic_number)
                  .catch(err => console.error(err))
             }
             // Show pop-up
             setNotification({
                message: `عيادة ${updatedClinic.name}: عميل رقم ${toArabicNumbers(updatedClinic.current_number)}`,
                type: 'info',
                show: true
             })
             setTimeout(() => setNotification(null), 5000)
          }
      })
      // 2. Listen for Queue Calls (Specifically Emergency)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'queue_calls' }, (payload) => {
          const newCall = payload.new as any
          if (newCall.is_emergency) {
             // Play Emergency Sound
             if (!isMuted) {
                playEmergencyAlert().catch(err => console.error(err))
             }
             // Show Red Alert
             setNotification({
                message: `⚠️ تنبيه طوارئ: يرجى إخلاء الممرات فوراً`,
                type: 'emergency',
                show: true
             })
             setTimeout(() => setNotification(null), 10000)
          }
      })
      // 3. Listen for Ticker Updates
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'centers' }, (payload) => {
          const newCenter = payload.new as any
          if (newCenter.news_ticker) setNewsTicker(newCenter.news_ticker)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [isMuted])

  // Fullscreen handlers
  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      displayRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div ref={displayRef} className="min-h-screen bg-slate-900 text-white overflow-hidden flex flex-col font-cairo" style={{ zoom: `${zoom}%` }}>
      
      {/* 1. Header (Top Bar) */}
      <div className="h-16 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-6 shadow-md z-20">
        <div className="flex items-center gap-6">
            <h1 className="text-2xl font-bold text-primary-400">المركز الطبي المتقدم</h1>
            <div className="h-6 w-px bg-slate-700"></div>
            <p className="text-xl text-slate-300 font-mono" dir="ltr">
                {currentTime.toLocaleTimeString('ar-EG')}
            </p>
        </div>
        
        <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
            <Select value={selectedScreen} onChange={(e) => setSelectedScreen(e.target.value)} className="bg-slate-800 border-none h-8 w-24">
                {[1, 2, 3].map(n => <option key={n} value={n}>{toArabicNumbers(n)}</option>)}
            </Select>
            <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.min(z + 10, 150))}><ZoomIn className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={() => setZoom(z => Math.max(z - 10, 50))}><ZoomOut className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" onClick={handleFullscreen}>{isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}</Button>
            <Button size="icon" variant="ghost" onClick={() => setIsMuted(!isMuted)} className={isMuted ? 'text-red-500' : ''}>
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
        </div>
      </div>

      {/* 2. Main Layout (Split View) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* RIGHT SIDE: Clinics Grid (50%) */}
        <div className="w-1/2 p-4 overflow-y-auto bg-slate-900/50">
            {clinics.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-500">جاري الاتصال بالنظام...</div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 auto-rows-fr">
                    {clinics.map((clinic) => (
                        <div key={clinic.id} 
                             className={`relative overflow-hidden rounded-xl border border-slate-700 p-6 flex flex-col items-center justify-center transition-all duration-500 ${
                                clinic.is_active 
                                ? 'bg-gradient-to-br from-slate-800 to-slate-900 shadow-lg' 
                                : 'bg-slate-900/30 opacity-60 grayscale'
                             } ${notification?.message.includes(clinic.name) ? 'ring-2 ring-primary-500 scale-[1.02]' : ''}`}>
                            
                            <div className="text-slate-400 text-lg mb-2 font-medium">{clinic.name}</div>
                            <div className={`text-7xl font-bold mb-4 tracking-tighter ${clinic.is_active ? 'text-white' : 'text-slate-600'}`}>
                                {toArabicNumbers(clinic.current_number)}
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm">
                                <span className={`w-2 h-2 rounded-full ${clinic.is_active ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                                <span className="text-slate-400">
                                    {clinic.is_active ? 'متاح' : 'مغلق'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* LEFT SIDE: Media & Info (50%) */}
        <div className="w-1/2 flex flex-col border-r border-slate-800 bg-black">
            {/* Video Area (Expanded) */}
            <div className="flex-1 relative bg-black flex items-center justify-center group">
                {/* Placeholder for Video Player */}
                <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-4xl">🎥</span>
                    </div>
                    <p className="text-slate-500">منطقة تشغيل الفيديو التوعوي</p>
                </div>
            </div>

            {/* Bottom Info Area */}
            <div className="h-48 bg-slate-900 border-t border-slate-800 p-6 flex items-center justify-between">
                {/* Doctor Cards Carousel (Placeholder) */}
                <div className="flex-1 flex gap-4 overflow-hidden">
                    <div className="bg-slate-800 rounded-lg p-4 flex items-center gap-4 min-w-[250px]">
                        <div className="w-12 h-12 rounded-full bg-slate-700"></div>
                        <div>
                            <p className="font-bold text-sm">د. أحمد محمد</p>
                            <p className="text-xs text-slate-400">استشاري قلب</p>
                        </div>
                    </div>
                    {/* More cards... */}
                </div>

                {/* QR Code */}
                <div className="ml-6 bg-white p-2 rounded-lg shrink-0">
                    <QRCodeCanvas value="https://medical-queue.com/client" size={100} />
                </div>
            </div>
        </div>

      </div>

      {/* 3. Footer (Ticker) */}
      <div className="h-12 bg-primary-900 text-white flex items-center overflow-hidden relative z-30">
        <div className="absolute right-0 top-0 bottom-0 bg-primary-800 px-4 flex items-center z-10 font-bold text-sm shadow-lg">
            أخبار المركز
        </div>
        <div className="animate-scroll-rtl whitespace-nowrap text-lg px-4 w-full">
            {newsTicker}
        </div>
      </div>

      {/* 4. Notification Overlay */}
      {notification?.show && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full shadow-2xl z-50 flex items-center gap-4 animate-bounce-slow ${
            notification.type === 'emergency' ? 'bg-red-600 text-white' : 'bg-primary-600 text-white'
        }`}>
            <span className="text-2xl">{notification.type === 'emergency' ? '🚨' : '🔔'}</span>
            <span className="text-xl font-bold">{notification.message}</span>
        </div>
      )}

    </div>
  )
}
