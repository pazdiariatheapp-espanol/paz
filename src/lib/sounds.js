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
  crown: '/sounds/7th-Crown-963Hz.mp3',
  thirdeye: '/sounds/6th-ThirdEye-852Hz.mp3',
  throat: '/sounds/5th-Throat-741Hz.mp3',
  heart: '/sounds/4th-Heart-639Hz.mp3',
  solar: '/sounds/3rd-Solar-528Hz.mp3',
  sacral: '/sounds/2nd-Sacral-417Hz.mp3',
  root: '/sounds/1st-Crown-396Hz.mp3',  // FIXED: This is your actual filename

  // UI Sounds
  welcome: '/sounds/7th-Crown-963Hz.mp3',
  success: '/sounds/6th-ThirdEye-852Hz.mp3',
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