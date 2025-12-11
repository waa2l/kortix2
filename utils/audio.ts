// utils/audio.ts

const AUDIO_PATH = process.env.NEXT_PUBLIC_AUDIO_PATH || '/audio'

export interface AudioFile {
  name: string
  path: string
  duration?: number
}

// Audio file paths
export const audioFiles = {
  ding: `${AUDIO_PATH}/ding.mp3`,
  emergency: `${AUDIO_PATH}/emergency.mp3`, // تم إضافة ملف الطوارئ
  getPatientNumber: (num: number) => `${AUDIO_PATH}/${num}.mp3`,
  getClinicName: (clinicId: number) => `${AUDIO_PATH}/clinic${clinicId}.mp3`,
  getInstantMessage: (id: number) => `${AUDIO_PATH}/instant${id}.mp3`,
}

// ... (باقي الكلاس AudioQueue كما هو) ...
export class AudioQueue {
  private queue: AudioFile[] = []
  private isPlaying = false
  private currentAudio: HTMLAudioElement | null = null

  addToQueue(file: AudioFile): void {
    this.queue.push(file)
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  addMultipleToQueue(files: AudioFile[]): void {
    this.queue.push(...files)
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  private playNext(): void {
    if (this.queue.length === 0) {
      this.isPlaying = false
      return
    }

    this.isPlaying = true
    const audioFile = this.queue.shift()

    if (!audioFile) return

    this.currentAudio = new Audio(audioFile.path)
    this.currentAudio.onended = () => {
      this.playNext()
    }
    this.currentAudio.onerror = () => {
      console.error(`Failed to play audio: ${audioFile.path}`)
      this.playNext()
    }

    this.currentAudio.play().catch((error) => {
      console.error('Audio playback error:', error)
      this.playNext()
    })
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
    }
    this.queue = []
    this.isPlaying = false
  }
}

// Singleton instance
let audioQueueInstance: AudioQueue | null = null

export function getAudioQueue(): AudioQueue {
  if (!audioQueueInstance) {
    audioQueueInstance = new AudioQueue()
  }
  return audioQueueInstance
}

export async function playPatientCallAnnouncement(
  patientNumber: number,
  clinicId: number
): Promise<void> {
  const queue = getAudioQueue()
  const files: AudioFile[] = [
    { name: 'ding', path: audioFiles.ding },
    { name: 'patient_number', path: audioFiles.getPatientNumber(patientNumber) },
    { name: 'clinic_name', path: audioFiles.getClinicName(clinicId) },
  ]
  queue.addMultipleToQueue(files)
}

// دالة جديدة لتشغيل الطوارئ
export async function playEmergencyAlert(): Promise<void> {
  const queue = getAudioQueue()
  queue.stop() // إيقاف أي صوت حالي
  const files: AudioFile[] = [
    { name: 'emergency', path: audioFiles.emergency },
    { name: 'emergency', path: audioFiles.emergency }, // تكرار للتنبيه
  ]
  queue.addMultipleToQueue(files)
}
