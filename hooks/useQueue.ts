import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/supabase'

type Clinic = Database['public']['Tables']['clinics']['Row']
type QueueCall = Database['public']['Tables']['queue_calls']['Row']

export function useQueue(clinicId: string) {
  const [clinic, setClinic] = useState<Clinic | null>(null)
  const [queueCalls, setQueueCalls] = useState<QueueCall[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch clinic data
  useEffect(() => {
    const fetchClinic = async () => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('clinics')
          .select('*')
          .eq('id', clinicId)
          .single()

        if (err) throw err
        setClinic(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch clinic')
      } finally {
        setLoading(false)
      }
    }

    if (clinicId) {
      fetchClinic()
    }
  }, [clinicId])

  // Subscribe to realtime updates
  useEffect(() => {
    if (!clinicId) return

    const channel = supabase
      .channel(`clinic:${clinicId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clinics',
          filter: `id=eq.${clinicId}`,
        },
        (payload) => {
          if (payload.new) {
            setClinic(payload.new as Clinic)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_calls',
          filter: `clinic_id=eq.${clinicId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setQueueCalls((prev) => [...prev, payload.new as QueueCall])
          } else if (payload.eventType === 'UPDATE') {
            setQueueCalls((prev) =>
              prev.map((call) =>
                call.id === (payload.new as QueueCall).id
                  ? (payload.new as QueueCall)
                  : call
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setQueueCalls((prev) =>
              prev.filter((call) => call.id !== (payload.old as QueueCall).id)
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [clinicId])

  // Call next patient
  const callNextPatient = useCallback(async () => {
    if (!clinic) return

    try {
      const nextNumber = clinic.current_number + 1

      // Update clinic current number
      const { error: updateErr } = await supabase
        .from('clinics')
        .update({ current_number: nextNumber })
        .eq('id', clinicId)

      if (updateErr) throw updateErr

      // Create queue call record
      const { error: callErr } = await supabase
        .from('queue_calls')
        .insert({
          clinic_id: clinicId,
          patient_number: nextNumber,
          status: 'called',
        })

      if (callErr) throw callErr
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to call next patient')
    }
  }, [clinic, clinicId])

  // Call previous patient
  const callPreviousPatient = useCallback(async () => {
    if (!clinic || clinic.current_number <= 0) return

    try {
      const previousNumber = clinic.current_number - 1

      const { error: updateErr } = await supabase
        .from('clinics')
        .update({ current_number: previousNumber })
        .eq('id', clinicId)

      if (updateErr) throw updateErr
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to call previous patient')
    }
  }, [clinic, clinicId])

  // Call specific patient
  const callSpecificPatient = useCallback(
    async (patientNumber: number) => {
      try {
        const { error: updateErr } = await supabase
          .from('clinics')
          .update({ current_number: patientNumber })
          .eq('id', clinicId)

        if (updateErr) throw updateErr

        const { error: callErr } = await supabase
          .from('queue_calls')
          .insert({
            clinic_id: clinicId,
            patient_number: patientNumber,
            status: 'called',
          })

        if (callErr) throw callErr
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to call patient')
      }
    },
    [clinicId]
  )

  // Reset clinic queue
  const resetQueue = useCallback(async () => {
    try {
      const { error: updateErr } = await supabase
        .from('clinics')
        .update({ current_number: 0 })
        .eq('id', clinicId)

      if (updateErr) throw updateErr
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset queue')
    }
  }, [clinicId])

  // Toggle clinic status
  const toggleClinicStatus = useCallback(async () => {
    if (!clinic) return

    try {
      const { error: updateErr } = await supabase
        .from('clinics')
        .update({ is_active: !clinic.is_active })
        .eq('id', clinicId)

      if (updateErr) throw updateErr
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle clinic status')
    }
  }, [clinic, clinicId])

  // Emergency call
  const emergencyCall = useCallback(
    async (patientNumber: number) => {
      try {
        const { error: callErr } = await supabase
          .from('queue_calls')
          .insert({
            clinic_id: clinicId,
            patient_number: patientNumber,
            is_emergency: true,
            status: 'called',
          })

        if (callErr) throw callErr
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send emergency call')
      }
    },
    [clinicId]
  )

  // Transfer patient
  const transferPatient = useCallback(
    async (patientNumber: number, toClinicId: string) => {
      try {
        const { error: updateErr } = await supabase
          .from('queue_calls')
          .update({
            transferred_to_clinic_id: toClinicId,
            status: 'transferred',
          })
          .eq('clinic_id', clinicId)
          .eq('patient_number', patientNumber)

        if (updateErr) throw updateErr
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to transfer patient')
      }
    },
    [clinicId]
  )

  return {
    clinic,
    queueCalls,
    loading,
    error,
    callNextPatient,
    callPreviousPatient,
    callSpecificPatient,
    resetQueue,
    toggleClinicStatus,
    emergencyCall,
    transferPatient,
  }
}
