'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  LayoutDashboard,
  Monitor,
  Gamepad2,
  Users,
  Printer,
  Calendar,
  Stethoscope,
  MessageSquare,
  Info,
  ArrowLeft,
} from 'lucide-react'

export default function Home() {
  const menuItems = [
    {
      title: 'لوحة التحكم',
      description: 'إدارة المركز والعيادات والأطباء',
      href: '/admin',
      icon: LayoutDashboard,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'شاشة العرض',
      description: 'عرض الأرقام والإعلانات على الشاشات',
      href: '/display',
      icon: Monitor,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'لوحة التحكم بالعيادة',
      description: 'التحكم بنداء المرضى والعمليات',
      href: '/control',
      icon: Gamepad2,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'صفحة العميل',
      description: 'متابعة الرقم والتنبيهات',
      href: '/client',
      icon: Users,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'الطباعة',
      description: 'طباعة تذاكر المرضى',
      href: '/print',
      icon: Printer,
      color: 'from-red-500 to-red-600',
    },
    {
      title: 'حجز موعد',
      description: 'حجز مواعيد الزيارات',
      href: '/appointments',
      icon: Calendar,
      color: 'from-indigo-500 to-indigo-600',
    },
    {
      title: 'الأطباء',
      description: 'بيانات الأطباء والحضور والإجازات',
      href: '/doctors',
      icon: Stethoscope,
      color: 'from-cyan-500 to-cyan-600',
    },
    {
      title: 'الاستشارات',
      description: 'الاستشارات الطبية والتسجيل',
      href: '/consultations',
      icon: MessageSquare,
      color: 'from-pink-500 to-pink-600',
    },
    {
      title: 'عن البرنامج',
      description: 'معلومات عن النظام والإصدار',
      href: '/about',
      icon: Info,
      color: 'from-gray-500 to-gray-600',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 via-blue-50 to-medical-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-medical-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-medical-900">نظام إدارة الطوابير الطبية</h1>
                <p className="text-sm text-medical-600">Medical Queue Management System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-lg">
            <h2 className="text-3xl font-bold mb-4">أهلا وسهلا بك</h2>
            <p className="text-lg text-primary-100 mb-6">
              نظام متقدم لإدارة طوابير المراكز الطبية مع دعم كامل للغة العربية والإعلانات الصوتية والتحديثات الفورية
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                className="bg-white text-primary-600 hover:bg-primary-50"
              >
                <Link href="/admin">
                  الدخول للإدارة
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white text-white hover:bg-white/10"
              >
                <Link href="/display">
                  شاشة العرض
                  <ArrowLeft className="w-4 h-4 mr-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                  <div className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-medical-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-medical-600 text-sm">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">🔊</div>
            <h3 className="font-bold text-lg mb-2">إعلانات صوتية</h3>
            <p className="text-medical-600 text-sm">
              نظام إعلانات صوتية متقدم مع دعم كامل للغة العربية
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-bold text-lg mb-2">تحديثات فورية</h3>
            <p className="text-medical-600 text-sm">
              تحديثات فورية للطوابير والإعلانات عبر Realtime
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md">
            <div className="text-3xl mb-3">📱</div>
            <h3 className="font-bold text-lg mb-2">واجهة سهلة</h3>
            <p className="text-medical-600 text-sm">
              واجهة مستخدم حديثة وسهلة الاستخدام على جميع الأجهزة
            </p>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-md">
          <h3 className="text-2xl font-bold mb-6 text-medical-900">روابط سريعة</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/admin" className="flex flex-col items-center gap-2">
                <LayoutDashboard className="w-6 h-6" />
                <span>الإدارة</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/display" className="flex flex-col items-center gap-2">
                <Monitor className="w-6 h-6" />
                <span>العرض</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/control" className="flex flex-col items-center gap-2">
                <Gamepad2 className="w-6 h-6" />
                <span>التحكم</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4">
              <Link href="/client" className="flex flex-col items-center gap-2">
                <Users className="w-6 h-6" />
                <span>العميل</span>
              </Link>
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-medical-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">عن النظام</h4>
              <p className="text-medical-300 text-sm">
                نظام متقدم لإدارة طوابير المراكز الطبية مع دعم كامل للغة العربية
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">الإصدار</h4>
              <p className="text-medical-300 text-sm">v1.0.0</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">التواصل</h4>
              <p className="text-medical-300 text-sm">support@medical-queue.com</p>
            </div>
          </div>
          <div className="border-t border-medical-800 pt-8 text-center text-medical-400 text-sm">
            <p>&copy; 2024 نظام إدارة الطوابير الطبية. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
