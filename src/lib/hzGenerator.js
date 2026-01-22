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

  playFrequency(hz) {
    // SAFETY FIX: Prevents "non-finite" crashes for buttons without hz numbers
    if (!hz || isNaN(hz)) {
      console.log("No frequency number provided, skipping tone.");
      return; 
    }

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

  playBinauralBeat(baseHz, beatHz) {
    this.stop()
    this.init()

    const leftPanner = this.audioContext.createStereoPanner()
    leftPanner.pan.value = -1
    leftPanner.connect(this.gainNode)

    const rightPanner = this.audioContext.createStereoPanner()
    rightPanner.pan.value = 1
    rightPanner.connect(this.gainNode)

    const leftOsc = this.audioContext.createOscillator()
    leftOsc.type = 'sine'
    leftOsc.frequency.value = baseHz
    leftOsc.connect(leftPanner)
    leftOsc.start()

    const rightOsc = this.audioContext.createOscillator()
    rightOsc.type = 'sine'
    rightOsc.frequency.value = baseHz + beatHz
    rightOsc.connect(rightPanner)
    rightOsc.start()

    this.oscillators.push(leftOsc, rightOsc)
    this.isPlaying = true
  }

  stop() {
    if (this.gainNode && this.isPlaying) {
      const now = this.audioContext.currentTime
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now)
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.5)

      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try {
            osc.stop()
            osc.disconnect()
          } catch (e) { }
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

export const hzGenerator = new HzToneGenerator()

export const HEALING_SOUNDS = {
  binaural: {
    title: { en: 'Binaural Beats', es: 'Ritmos Binaurales' },
    subtitle: { en: 'Use headphones for best effect', es: 'Usa audífonos para mejor efecto' },
    sounds: [
      { id: 'delta', hz: 5, label: '5Hz', name: { en: 'Deep Meditation', es: 'Meditación Profunda' }, icon: '🧘', baseHz: 200 },
      { id: 'theta', hz: 9, label: '9Hz', name: { en: 'Deep Trance', es: 'Trance Profundo' }, icon: '🌀', baseHz: 200 },
      { id: 'alpha', hz: 11, label: '11Hz', name: { en: 'Concentration', es: 'Concentración' }, icon: '🎯', baseHz: 200 },
    ]
  },
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
  chakra: {
    title: { en: 'Chakra Frequencies', es: 'Frecuencias de Chakras' },
    subtitle: { en: 'Balance your energy centers', es: 'Equilibra tus centros de energía' },
    sounds: [
      { id: 'root', localPath: '/sounds/1st-Root-396Hz.mp3', label: '396Hz', name: { en: '1st - Root', es: '1° - Raíz' }, icon: '🔴', color: '#ef4444' },
      { id: 'sacral', localPath: '/sounds/2nd-Sacral-417Hz.mp3', label: '417Hz', name: { en: '2nd - Sacral', es: '2° - Sacro' }, icon: '🟠', color: '#f97316' },
      { id: 'solar', localPath: '/sounds/3rd-Solar-528Hz.mp3', label: '528Hz', name: { en: '3rd - Solar Plexus', es: '3° - Plexo Solar' }, icon: '🟡', color: '#eab308' },
      { id: 'heart', localPath: '/sounds/4th-Heart-639Hz.mp3', label: '639Hz', name: { en: '4th - Heart', es: '4° - Corazón' }, icon: '💚', color: '#22c55e' },
      { id: 'throat', localPath: '/sounds/5th-Throat-741Hz.mp3', label: '741Hz', name: { en: '5th - Throat', es: '5° - Garganta' }, icon: '🔵', color: '#3b82f6' },
      { id: 'third_eye', localPath: '/sounds/6th-ThirdEye-852Hz.mp3', label: '852Hz', name: { en: '6th - Third Eye', es: '6° - Tercer Ojo' }, icon: '💜', color: '#8b5cf6' },
      { id: 'crown', localPath: '/sounds/7th-Crown-963Hz.mp3', label: '963Hz', name: { en: '7th - Crown', es: '7° - Corona' }, icon: '⚪', color: '#a855f7' },
    ]
  },
  nature: {
    title: { en: 'Nature & ASMR', es: 'Naturaleza y ASMR' },
    subtitle: { en: 'Relaxing ambient sounds', es: 'Sonidos ambientales relajantes' },
    sounds: [
      { id: 'rain', localPath: '/sounds/GentleRain.mp3', name: { en: 'Gentle Rain', es: 'Lluvia Suave' }, icon: '🌧️' },
      { id: 'waves', localPath: '/sounds/OceanWaves.mp3', name: { en: 'Ocean Waves', es: 'Olas del Mar' }, icon: '🌊' },
      { id: 'fireplace', localPath: '/sounds/Fireplace.mp3', name: { en: 'Fireplace', es: 'Chimenea' }, icon: '🔥' },
      { id: 'crickets', localPath: '/sounds/NightCrickets.mp3', name: { en: 'Grillos Nocturnos', es: 'Grillos Nocturnos' }, icon: '🦗' },
      { id: 'forest', localPath: '/sounds/ForestBirds.mp3', name: { en: 'Forest Birds', es: 'Pájaros del Bosque' }, icon: '🌲' },
      { id: 'wind', localPath: '/sounds/GentleWind.mp3', name: { en: 'Gentle Wind', es: 'Viento Suave' }, icon: '💨' },
    ]
  }
}