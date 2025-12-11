'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Settings,
  Stethoscope,
  Megaphone,
  Users,
  Monitor,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminDashboard() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  useEffect(() => {
    // Check if admin is logged in
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.push('/admin')
      return
    }
    const { email } = JSON.parse(session)
    setAdminEmail(email)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminSession')
    toast.success('تم تسجيل الخروج')
    router.push('/admin')
  }

  const menuItems = [
    {
      title: 'الإعدادات العامة',
      description: 'إعدادات المركز والشاشات',
      href: '/admin/settings',
      icon: Settings,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'إدارة العيادات',
      description: 'إضافة وتعديل وحذف العيادات',
      href: '/admin/clinics',
      icon: Stethoscope,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'إدارة الأطباء',
      description: 'بيانات الأطباء والحضور والإجازات',
      href: '/admin/doctors',
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'إعدادات النداء',
      description: 'نداء المرضى والإعلانات الصوتية',
      href: '/admin/announcements',
      icon: Megaphone,
      color: 'from-orange-500 to-orange-600',
    },
    {
      title: 'إدارة الشاشات',
      description: 'إضافة وتعديل الشاشات',
      href: '/admin/screens',
      icon: Monitor,
      color: 'from-red-500 to-red-600',
    },
  ]

  return (
    <div className="min-h-screen bg-medical-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-medical-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-medical-100 rounded-lg"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div>
              <h1 className="text-2xl font-bold text-medical-900">لوحة التحكم</h1>
              <p className="text-sm text-medical-600">{adminEmail}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            تسجيل الخروج
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="w-64 bg-white border-l border-medical-200 p-6 hidden md:block">
            <nav className="space-y-2">
              <Link href="/admin/dashboard">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
                </Button>
              </Link>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.title}
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-medical-900 mb-2">أهلا وسهلا</h2>
            <p className="text-medical-600">اختر من القائمة أدناه لإدارة المركز الطبي</p>
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <Card className="h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden group">
                    <div className={`h-2 bg-gradient-to-r ${item.color}`} />
                    <CardHeader>
                      <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-medical-600">إجمالي العيادات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-medical-900">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-medical-600">إجمالي الأطباء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-medical-900">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-medical-600">الشاشات النشطة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-medical-900">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-medical-600">المواعيد اليوم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-medical-900">0</div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
