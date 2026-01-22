// Sound utility for Paz app
// Updated to use local high-quality files in public/sounds/

const SOUNDS = {
  // Nature & Meditation Loops (Used in Breathe/Home)
  relaxing: '/sounds/ForestBirds_.mp3',
  energizing: '/sounds/GentleWind_.mp3',
  box: '/sounds/OceanWaves_.mp3',
  sleep: '/sounds/NightCrickets_.mp3',
  fireplace: '/sounds/Fireplace_.mp3',

  // Chakra Frequencies (Specific Healing Sounds)
  crown: '/sounds/7th-Crown-963Hz_.mp3',
  thirdeye: '/sounds/6th-ThirdEye-852Hz_.mp3',
  throat: '/sounds/5th-Throat-741Hz_.mp3',
  heart: '/sounds/4th-Heart-639Hz_.mp3',
  solar: '/sounds/3rd-Solar-528Hz_.mp3',
  sacral: '/sounds/2nd-Sacral-417Hz_.mp3',

  // UI Sounds (Assigning specific frequencies to app actions)
  welcome: '/sounds/7th-Crown-963Hz_.mp3',
  success: '/sounds/6th-ThirdEye-852Hz_.mp3'
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
      audio.src = encodeURI (url) 
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
  WELCOME: 'welcome',
  SUCCESS: 'success'
}