import { useEffect, useRef } from 'react'

type SoundType = 'correct' | 'wrong' | 'achievement'

export function useSoundEffects(enabled: boolean) {
  const audioContextRef = useRef<AudioContext | null>(null)

  useEffect(() => {
    return () => {
      void audioContextRef.current?.close()
    }
  }, [])

  return (sound: SoundType) => {
    if (!enabled || typeof window === 'undefined') {
      return
    }

    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) {
      return
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx()
    }

    const context = audioContextRef.current
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.connect(gain)
    gain.connect(context.destination)

    const now = context.currentTime
    const config =
      sound === 'correct'
        ? { frequency: 660, duration: 0.12 }
        : sound === 'wrong'
          ? { frequency: 220, duration: 0.15 }
          : { frequency: 880, duration: 0.24 }

    oscillator.type = sound === 'wrong' ? 'sawtooth' : 'triangle'
    oscillator.frequency.setValueAtTime(config.frequency, now)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + config.duration)

    oscillator.start(now)
    oscillator.stop(now + config.duration)
  }
}
