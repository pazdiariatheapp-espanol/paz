// Sound utility for Paz app
// Updated to use local high-quality files in public/sounds/

const SOUNDS = {
  // Nature & Meditation Loops
  gentlerain: '/sounds/gentlerain.mp3',
  forestbirds: '/sounds/forestbirds.mp3',
  gentlewind: '/sounds/gentlewind.mp3',
  oceanwaves: '/sounds/oceanwaves.mp3',
  nightcrickets: '/sounds/nightcrickets.mp3',
  fireplace: '/sounds/fireplace.mp3',

  // Chakra Frequencies (matching your actual files)
  crown: '/sounds/crown.mp3',
  thirdeye: '/sounds/thirdeye.mp3',
  throat: '/sounds/thoat.mp3',
  heart: '/sounds/heart.mp3',
  solar: '/sounds/solar.mp3',
  sacral: '/sounds/sacral.mp3',
  root: '/sounds/root.mp3',  // FIXED: This is your actual filename

  // UI Sounds
  welcome: '/sounds/welcome.mp3',
  success: '/sounds/success.mp3',
}

class SoundManager {
  constructor() {
    this.sounds = {}
    this.currentLoop = null
    this.enabled = true
    this.volume = 0.5
    this.preload()
  }
  
  preload() {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio()
      audio.src = url  // No need for encodeURI since we removed spaces
      audio.preload = 'auto'
      audio.volume = this.volume
      this.sounds[key] = audio
    })
  }
  
  setEnabled(enabled) {
    this.enabled = enabled
    if (!enabled && this.currentLoop) {
      this.stopLoop()
    }
  }
  
  setVolume(volume) {
    this.volume = volume
    Object.values(this.sounds).forEach(audio => {
      audio.volume = volume
    })
  }
  
  play(soundName) {
    if (!this.enabled) return
    const sound = this.sounds[soundName]
    if (sound) {
      sound.currentTime = 0
      sound.play().catch(err => console.warn('Autoplay prevented:', err.message))
    }
  }
  
  playLoop(soundName) {
    if (!this.enabled) return
    this.stopLoop()
    const sound = this.sounds[soundName]
    if (sound) {
      sound.loop = true
      sound.currentTime = 0
      sound.play().catch(err => console.warn('Loop prevented:', err.message))
      this.currentLoop = sound
    }
  }
  
  stopLoop() {
    if (this.currentLoop) {
      this.currentLoop.pause()
      this.currentLoop.currentTime = 0
      this.currentLoop.loop = false
      this.currentLoop = null
    }
  }
  
  fadeOutLoop(duration = 1000) {
    if (!this.currentLoop) return
    const sound = this.currentLoop
    const startVolume = sound.volume
    const steps = 20
    const stepTime = duration / steps
    const volumeStep = startVolume / steps
    let currentStep = 0
    const fadeInterval = setInterval(() => {
      currentStep++
      sound.volume = Math.max(0, startVolume - (volumeStep * currentStep))
      if (currentStep >= steps) {
        clearInterval(fadeInterval)
        this.stopLoop()
        sound.volume = this.volume 
      }
    }, stepTime)
  }
}

export const soundManager = new SoundManager()

// FIXED: Export names that match the SOUNDS keys above
export const SOUND_NAMES = {
  GENTLERAIN: 'gentlerain',
  FORESTBIRDS: 'forestbirds',
  GENTLEWIND: 'gentlewind',
  OCEANWAVES: 'oceanwaves',
  NIGHTCRICKETS: 'nightcrickets',
  FIREPLACE: 'fireplace',
  CROWN: 'crown',
  THIRDEYE: 'thirdeye',
  THROAT: 'throat',
  HEART: 'heart',
  SOLAR: 'solar',
  SACRAL: 'sacral',
  ROOT: 'root',
  WELCOME: 'welcome',
  SUCCESS: 'success'
}