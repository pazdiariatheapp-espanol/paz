// Hz Tone Generator for Healing Sounds
// Generates pure frequencies and binaural beats using Web Audio API

class HzToneGenerator {
  constructor() {
    this.audioContext = null
    this.oscillators = []
    this.gainNode = null
    this.isPlaying = false
    this.volume = 0.3
  }

  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      this.gainNode = this.audioContext.createGain()
      this.gainNode.connect(this.audioContext.destination)
      this.gainNode.gain.value = this.volume
    }
    // Resume if suspended (browser autoplay policy)
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume()
    }
  }

  setVolume(value) {
    this.volume = value
    if (this.gainNode) {
      this.gainNode.gain.value = value
    }
  }

  // Play a single pure frequency
  playFrequency(hz) {
    this.stop()
    this.init()

    const oscillator = this.audioContext.createOscillator()
    oscillator.type = 'sine'
    oscillator.frequency.value = hz
    oscillator.connect(this.gainNode)
    oscillator.start()

    this.oscillators.push(oscillator)
    this.isPlaying = true
  }

  // Play binaural beat (requires headphones for full effect)
  // Base frequency in left ear, base + beat frequency in right ear
  playBinauralBeat(baseHz, beatHz) {
    this.stop()
    this.init()

    // Create stereo panner for left channel
    const leftPanner = this.audioContext.createStereoPanner()
    leftPanner.pan.value = -1
    leftPanner.connect(this.gainNode)

    // Create stereo panner for right channel
    const rightPanner = this.audioContext.createStereoPanner()
    rightPanner.pan.value = 1
    rightPanner.connect(this.gainNode)

    // Left oscillator (base frequency)
    const leftOsc = this.audioContext.createOscillator()
    leftOsc.type = 'sine'
    leftOsc.frequency.value = baseHz
    leftOsc.connect(leftPanner)
    leftOsc.start()

    // Right oscillator (base + beat frequency)
    const rightOsc = this.audioContext.createOscillator()
    rightOsc.type = 'sine'
    rightOsc.frequency.value = baseHz + beatHz
    rightOsc.connect(rightPanner)
    rightOsc.start()

    this.oscillators.push(leftOsc, rightOsc)
    this.isPlaying = true
  }

  // Fade out and stop
  stop() {
    if (this.gainNode && this.isPlaying) {
      // Quick fade out to avoid clicks
      const now = this.audioContext.currentTime
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now)
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try {
            osc.stop()
            osc.disconnect()
          } catch (e) {
            // Already stopped
          }
        })
        this.oscillators = []
        if (this.gainNode) {
          this.gainNode.gain.value = this.volume
        }
      }, 500)
    }
    this.isPlaying = false
  }
}

// Singleton instance
export const hzGenerator = new HzToneGenerator()

// Healing frequencies data
export const HEALING_SOUNDS = {
  // Binaural Beats (requires headphones)
  binaural: {
    title: { en: 'Binaural Beats', es: 'Ritmos Binaurales' },
    subtitle: { en: 'Use headphones for best effect', es: 'Usa audífonos para mejor efecto' },
    sounds: [
      { id: 'delta', hz: 5, label: '5Hz', name: { en: 'Deep Meditation', es: 'Meditación Profunda' }, icon: '🧘', baseHz: 200 },
      { id: 'theta', hz: 9, label: '9Hz', name: { en: 'Deep Trance', es: 'Trance Profundo' }, icon: '🌀', baseHz: 200 },
      { id: 'alpha', hz: 11, label: '11Hz', name: { en: 'Concentration', es: 'Concentración' }, icon: '🎯', baseHz: 200 },
    ]
  },

  // Solfeggio Frequencies
  hertz: {
    title: { en: 'Healing Frequencies', es: 'Frecuencias Sanadoras' },
    subtitle: { en: 'Solfeggio & restoration tones', es: 'Tonos solfeggio y restauración' },
    sounds: [
      { id: 'restoration', hz: 74, label: '74Hz', name: { en: 'Restoration', es: 'Restauración' }, icon: '💚' },
      { id: 'winddown', hz: 132, label: '132Hz', name: { en: 'Winding Down', es: 'Relajación' }, icon: '🌙' },
      { id: 'harmony', hz: 144, label: '144Hz', name: { en: 'Harmony', es: 'Armonía' }, icon: '✨' },
      { id: 'grounding', hz: 432, label: '432Hz', name: { en: 'Grounding', es: 'Conexión a Tierra' }, icon: '🌍' },
    ]
  },

  // Chakra Frequencies
  chakra: {
    title: { en: 'Chakra Frequencies', es: 'Frecuencias de Chakras' },
    subtitle: { en: 'Balance your energy centers', es: 'Equilibra tus centros de energía' },
    sounds: [
      { id: 'root', hz: 396, label: '396Hz', name: { en: '1st - Root', es: '1° - Raíz' }, icon: '🔴', color: '#ef4444' },
      { id: 'sacral', hz: 417, label: '417Hz', name: { en: '2nd - Sacral', es: '2° - Sacro' }, icon: '🟠', color: '#f97316' },
      { id: 'solar', hz: 528, label: '528Hz', name: { en: '3rd - Solar Plexus', es: '3° - Plexo Solar' }, icon: '🟡', color: '#eab308' },
      { id: 'heart', hz: 639, label: '639Hz', name: { en: '4th - Heart', es: '4° - Corazón' }, icon: '💚', color: '#22c55e' },
      { id: 'throat', hz: 741, label: '741Hz', name: { en: '5th - Throat', es: '5° - Garganta' }, icon: '🔵', color: '#3b82f6' },
      { id: 'third_eye', hz: 852, label: '852Hz', name: { en: '6th - Third Eye', es: '6° - Tercer Ojo' }, icon: '💜', color: '#8b5cf6' },
      { id: 'crown', hz: 963, label: '963Hz', name: { en: '7th - Crown', es: '7° - Corona' }, icon: '⚪', color: '#a855f7' },
    ]
  },

  // Nature/ASMR sounds (URLs)
  nature: {
    title: { en: 'Nature & ASMR', es: 'Naturaleza y ASMR' },
    subtitle: { en: 'Relaxing ambient sounds', es: 'Sonidos ambientales relajantes' },
    sounds: [
      { id: 'rain', url: 'https://assets.mixkit.co/active_storage/sfx/1252/1252-preview.mp3', name: { en: 'Gentle Rain', es: 'Lluvia Suave' }, icon: '🌧️' },
      { id: 'waves', url: 'https://assets.mixkit.co/active_storage/sfx/189/189-preview.mp3', name: { en: 'Ocean Waves', es: 'Olas del Mar' }, icon: '🌊' },
      { id: 'fireplace', url: 'https://assets.mixkit.co/active_storage/sfx/2827/2827-preview.mp3', name: { en: 'Fireplace', es: 'Chimenea' }, icon: '🔥' },
      { id: 'crickets', url: 'https://assets.mixkit.co/active_storage/sfx/1251/1251-preview.mp3', name: { en: 'Night Crickets', es: 'Grillos Nocturnos' }, icon: '🦗' },
      { id: 'forest', url: 'https://assets.mixkit.co/active_storage/sfx/526/526-preview.mp3', name: { en: 'Forest Birds', es: 'Pájaros del Bosque' }, icon: '🌲' },
      { id: 'wind', url: 'https://assets.mixkit.co/active_storage/sfx/2432/2432-preview.mp3', name: { en: 'Gentle Wind', es: 'Viento Suave' }, icon: '💨' },
    ]
  }
}
