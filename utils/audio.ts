// Audio management utilities

const AUDIO_PATH = process.env.NEXT_PUBLIC_AUDIO_PATH || '/audio'

export interface AudioFile {
  name: string
  path: string
  duration?: number
}

// Audio file paths
export const audioFiles = {
  ding: `${AUDIO_PATH}/ding.mp3`,
  getPatientNumber: (num: number) => `${AUDIO_PATH}/${num}.mp3`,
  getClinicName: (clinicId: number) => `${AUDIO_PATH}/clinic${clinicId}.mp3`,
  getInstantMessage: (id: number) => `${AUDIO_PATH}/instant${id}.mp3`,
}

// Audio queue management
export class AudioQueue {
  private queue: AudioFile[] = []
  private isPlaying = false
  private currentAudio: HTMLAudioElement | null = null

  /**
   * Add audio file to queue
   */
  addToQueue(file: AudioFile): void {
    this.queue.push(file)
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  /**
   * Add multiple audio files to queue
   */
  addMultipleToQueue(files: AudioFile[]): void {
    this.queue.push(...files)
    if (!this.isPlaying) {
      this.playNext()
    }
  }

  /**
   * Play next audio in queue
   */
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

  /**
   * Stop current audio and clear queue
   */
  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
    }
    this.queue = []
    this.isPlaying = false
  }

  /**
   * Pause current audio
   */
  pause(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
    }
    this.isPlaying = false
  }

  /**
   * Resume current audio
   */
  resume(): void {
    if (this.currentAudio) {
      this.currentAudio.play()
      this.isPlaying = true
    }
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.queue.length
  }

  /**
   * Check if currently playing
   */
  getIsPlaying(): boolean {
    return this.isPlaying
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

/**
 * Play announcement sequence for patient call
 * Example: Ding > Patient Number > Clinic Name
 */
export async function playPatientCallAnnouncement(
  patientNumber: number,
  clinicId: number,
  clinicName: string
): Promise<void> {
  const queue = getAudioQueue()

  const files: AudioFile[] = [
    { name: 'ding', path: audioFiles.ding },
    { name: 'patient_number', path: audioFiles.getPatientNumber(patientNumber) },
    { name: 'clinic_name', path: audioFiles.getClinicName(clinicId) },
  ]

  queue.addMultipleToQueue(files)
}

/**
 * Play instant message
 */
export async function playInstantMessage(messageId: number): Promise<void> {
  const queue = getAudioQueue()
  const files: AudioFile[] = [
    { name: 'ding', path: audioFiles.ding },
    { name: 'instant_message', path: audioFiles.getInstantMessage(messageId) },
  ]
  queue.addMultipleToQueue(files)
}

/**
 * Play emergency alert
 */
export async function playEmergencyAlert(): Promise<void> {
  const queue = getAudioQueue()
  // Play ding multiple times for emergency
  const files: AudioFile[] = [
    { name: 'ding', path: audioFiles.ding },
    { name: 'ding', path: audioFiles.ding },
    { name: 'ding', path: audioFiles.ding },
  ]
  queue.addMultipleToQueue(files)
}

/**
 * Record audio from microphone
 */
export async function recordAudio(durationMs: number = 10000): Promise<Blob | null> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mediaRecorder = new MediaRecorder(stream)
    const chunks: BlobPart[] = []

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data)
    }

    mediaRecorder.start()

    return new Promise((resolve) => {
      setTimeout(() => {
        mediaRecorder.stop()
        stream.getTracks().forEach((track) => track.stop())

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/mp3' })
          resolve(blob)
        }
      }, durationMs)
    })
  } catch (error) {
    console.error('Error recording audio:', error)
    return null
  }
}

/**
 * Upload recorded audio to server
 */
export async function uploadRecordedAudio(blob: Blob, filename: string): Promise<string | null> {
  try {
    const formData = new FormData()
    formData.append('file', blob, filename)

    const response = await fetch('/api/upload-audio', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    const data = await response.json()
    return data.url
  } catch (error) {
    console.error('Error uploading audio:', error)
    return null
  }
}

/**
 * Text to Speech using Web Speech API
 */
export async function speakText(
  text: string,
  lang: string = 'ar-SA',
  rate: number = 1.0
): Promise<void> {
  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = lang
    utterance.rate = rate
    utterance.onend = () => resolve()
    utterance.onerror = (event) => reject(event.error)

    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Stop text to speech
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel()
}

/**
 * Cache audio files for offline use
 */
export async function cacheAudioFiles(files: string[]): Promise<void> {
  if ('caches' in window) {
    try {
      const cache = await caches.open('audio-cache-v1')
      await cache.addAll(files)
    } catch (error) {
      console.error('Error caching audio files:', error)
    }
  }
}

/**
 * Preload audio files
 */
export async function preloadAudioFiles(files: string[]): Promise<void> {
  const audioElements = files.map((file) => {
    const audio = new Audio(file)
    audio.preload = 'auto'
    return audio
  })

  // Wait for all audio files to load
  await Promise.all(
    audioElements.map(
      (audio) =>
        new Promise<void>((resolve) => {
          audio.oncanplaythrough = () => resolve()
          audio.onerror = () => resolve() // Resolve even on error
        })
    )
  )
}
