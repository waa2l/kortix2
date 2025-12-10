'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Printer, Loader2 } from 'lucide-react'
import { toArabicNumbers, formatArabicDate } from '@/utils/arabic'
import toast from 'react-hot-toast'

export default function PrintPage() {
  const [selectedClinic, setSelectedClinic] = useState('')
  const [fromNumber, setFromNumber] = useState('')
  const [toNumber, setToNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  const clinics = [
    { id: '1', name: 'طب الأسرة' },
    { id: '2', name: 'الأسنان' },
    { id: '3', name: 'العيون' },
    { id: '4', name: 'الجلدية' },
    { id: '5', name: 'الأطفال' },
  ]

  const handlePrint = async () => {
    if (!selectedClinic || !fromNumber || !toNumber) {
      toast.error('يرجى ملء جميع الحقول')
      return
    }

    const from = parseInt(fromNumber)
    const to = parseInt(toNumber)

    if (from > to) {
      toast.error('الرقم الأول يجب أن يكون أصغر من الرقم الثاني')
      return
    }

    setLoading(true)

    try {
      // Wait a moment for rendering
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Trigger print dialog
      window.print()

      toast.success('تم فتح نافذة الطباعة')
    } catch (err) {
      toast.error('حدث خطأ ما')
    } finally {
      setLoading(false)
    }
  }

  const from = parseInt(fromNumber) || 0
  const to = parseInt(toNumber) || 0
  const clinic = clinics.find((c) => c.id === selectedClinic)

  // Generate ticket numbers for preview
  const ticketNumbers = []
  if (from > 0 && to > 0 && from <= to) {
    for (let i = from; i <= to; i++) {
      ticketNumbers.push(i)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-50 to-medical-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-medical-900">طباعة التذاكر</h1>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Control Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>إعدادات الطباعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Clinic Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">العيادة</label>
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

              {/* From Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">من رقم</label>
                <Input
                  type="number"
                  placeholder="1"
                  value={fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                  disabled={loading}
                  min="1"
                />
              </div>

              {/* To Number */}
              <div className="space-y-2">
                <label className="text-sm font-medium">إلى رقم</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={toNumber}
                  onChange={(e) => setToNumber(e.target.value)}
                  disabled={loading}
                  min="1"
                />
              </div>

              {/* Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p>
                  <strong>عدد التذاكر:</strong> {ticketNumbers.length}
                </p>
              </div>

              {/* Print Button */}
              <Button
                onClick={handlePrint}
                className="w-full gap-2"
                disabled={loading || ticketNumbers.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جاري التحضير...
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    طباعة
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>معاينة الطباعة</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  ref={printRef}
                  className="bg-white p-8"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '16px',
                  }}
                >
                  {ticketNumbers.map((num) => (
                    <div
                      key={num}
                      className="border-2 border-medical-300 p-4 text-center"
                      style={{
                        width: '5cm',
                        height: '5cm',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <p className="text-xs text-medical-600 mb-1">المركز الطبي</p>
                      <p className="text-2xl font-bold text-medical-900 mb-2">
                        {toArabicNumbers(num)}
                      </p>
                      <p className="text-xs text-medical-600">
                        {formatArabicDate(new Date())}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
