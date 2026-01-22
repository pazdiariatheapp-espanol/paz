// Sound utility for Paz app
// Updated to use local high-quality files in public/sounds/

const SOUNDS = {
  // Nature & Meditation Loops (Used in Breathe/Home)
  relaxing: '/sounds/ForestBirds.mp3',
  energizing: '/sounds/GentleWind.mp3',
  box: '/sounds/OceanWaves.mp3',
  sleep: '/sounds/NightCrickets.mp3',
  fireplace: '/sounds/Fireplace.mp3',

  // Chakra Frequencies (Specific Healing Sounds)
  crown: '/sounds/7th-Crown-963Hz.mp3',
  thirdeye: '/sounds/6th-ThirdEye-852Hz.mp3',
  throat: '/sounds/5th-Throat-741Hz.mp3',
  heart: '/sounds/4th-Heart-639Hz.mp3',
  solar: '/sounds/3rd-Solar-528Hz.mp3',
  sacral: '/sounds/2nd-Sacral-417Hz.mp3',
  root: '/sounds/1st-Root-396Hz.mp3', // FIXED: Corrected path to 396Hz Root file

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
      audio.src = encodeURI(url) 
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

export const SOUND_NAMES = {
  RELAXING: 'relaxing',
  ENERGIZING: 'energizing',
  BOX: 'box',
  SLEEP: 'sleep',
  FIREPLACE: 'fireplace',
  CROWN: 'crown',
  THIRDEYE: 'thirdeye',
  THROAT: 'throat',
  HEART: 'heart',
  SOLAR: 'solar',
  SACRAL: 'sacral',
  ROOT: 'root', // ADDED: Root name
  WELCOME: 'welcome',
  SUCCESS: 'success' // FIXED: Added missing comma
}