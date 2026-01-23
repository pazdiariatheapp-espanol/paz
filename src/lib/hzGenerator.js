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
      { id: 'root', localPath: '/sounds/root.mp3', label: '396Hz', name: { en: '1st - root', es: '1° - raíz' }, icon: '🔴', color: '#ef4444' },
      { id: 'sacral', localPath: '/sounds/sacral.mp3', label: '417Hz', name: { en: '2nd - racral', es: '2° - sacro' }, icon: '🟠', color: '#f97316' },
      { id: 'solar', localPath: '/sounds/solar.mp3', label: '528Hz', name: { en: '3rd - solar', es: '3° - solar' }, icon: '🟡', color: '#eab308' },
      { id: 'heart', localPath: '/sounds/heart.mp3', label: '639Hz', name: { en: '4th - heart', es: '4° - corazón' }, icon: '💚', color: '#22c55e' },
      { id: 'throat', localPath: '/sounds/throat.mp3', label: '741Hz', name: { en: '5th - throat', es: '5° - garganta' }, icon: '🔵', color: '#3b82f6' },
      { id: 'thirdeye', localPath: '/sounds/thirdeye.mp3', label: '852Hz', name: { en: '6th - thirdeye', es: '6° - tercerojo' }, icon: '💜', color: '#8b5cf6' },
      { id: 'crown', localPath: '/sounds/crown.mp3', label: '963Hz', name: { en: '7th - crown', es: '7° - corona' }, icon: '⚪', color: '#a855f7' },
    ]
  },
  nature: {
    title: { en: 'Nature & ASMR', es: 'Naturaleza y ASMR' },
    subtitle: { en: 'Relaxing ambient sounds', es: 'Sonidos ambientales relajantes' },
    sounds: [
      { id: 'gentlerain', localPath: '/sounds/gentlerain.mp3', name: { en: 'gentle rain', es: 'lluvia suave' }, icon: '🌧️' },
      { id: 'oceanwaves', localPath: '/sounds/oceanwaves.mp3', name: { en: 'ocean waves', es: 'olas del mar' }, icon: '🌊' },
      { id: 'fireplace', localPath: '/sounds/fireplace.mp3', name: { en: 'fireplace', es: 'chimenea' }, icon: '🔥' },
      { id: 'nightcrickets', localPath: '/sounds/nightcrickets.mp3', name: { en: 'grillos nocturnos', es: 'grillos nocturnos' }, icon: '🦗' },
      { id: 'forestbirds', localPath: '/sounds/forestbirds.mp3', name: { en: 'forest Birds', es: 'pájaros del bosque' }, icon: '🌲' },
      { id: 'gentlewind', localPath: '/sounds/gentlewind.mp3', name: { en: 'gentle wind', es: 'viento suave' }, icon: '💨' },
    ]
  }
}