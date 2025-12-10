'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Upload, Download, Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface Doctor {
  id: string
  number: string
  name: string
  phone: string
  nationalId: string
  specialty: string
  clinic: string
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      id: '1',
      number: 'DOC001',
      name: 'د. أحمد محمد',
      phone: '01012345678',
      nationalId: '29001011234567',
      specialty: 'طب الأسرة',
      clinic: 'طب الأسرة',
    },
    {
      id: '2',
      number: 'DOC002',
      name: 'د. فاطمة علي',
      phone: '01098765432',
      nationalId: '29001021234567',
      specialty: 'الأسنان',
      clinic: 'الأسنان',
    },
  ])
  const [showForm, setShowForm] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      toast.success('تم رفع الملف بنجاح')
    }
  }

  const handleDownload = () => {
    toast.success('جاري تحميل البيانات...')
  }

  const handleDelete = (id: string) => {
    if (confirm('هل تريد حذف هذا الطبيب؟')) {
      setDoctors((prev) => prev.filter((doctor) => doctor.id !== id))
      toast.success('تم حذف الطبيب بنجاح')
    }
  }

  return (
    <div className="min-h-screen bg-medical-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">إدارة الأطباء</h1>
          <Link href="/admin/dashboard">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            إضافة طبيب
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            تحميل البيانات
          </Button>
          <label>
            <Button variant="outline" className="gap-2" asChild>
              <span>
                <Upload className="w-4 h-4" />
                رفع البيانات
              </span>
            </Button>
            <input
              type="file"
              accept=".csv,.xlsx"
              onChange={handleUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Doctors Table */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الأطباء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right py-3 px-4 font-bold">الرقم</th>
                    <th className="text-right py-3 px-4 font-bold">الاسم</th>
                    <th className="text-right py-3 px-4 font-bold">التخصص</th>
                    <th className="text-right py-3 px-4 font-bold">الهاتف</th>
                    <th className="text-right py-3 px-4 font-bold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {doctors.map((doctor) => (
                    <tr key={doctor.id} className="border-b hover:bg-medical-50">
                      <td className="py-3 px-4">{doctor.number}</td>
                      <td className="py-3 px-4">{doctor.name}</td>
                      <td className="py-3 px-4">{doctor.specialty}</td>
                      <td className="py-3 px-4">{doctor.phone}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="gap-1">
                            <Edit2 className="w-3 h-3" />
                            تعديل
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(doctor.id)}
                            className="gap-1 text-danger-600"
                          >
                            <Trash2 className="w-3 h-3" />
                            حذف
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Attendance & Requests */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>الحضور والانصراف</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medical-600 mb-4">
                إدارة بيانات الحضور والانصراف للأطباء
              </p>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="w-4 h-4" />
                رفع بيانات الحضور
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>طلبات الأطباء</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-medical-600 mb-4">
                إدارة طلبات الإجازات والتصاريح
              </p>
              <Button variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                عرض الطلبات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
