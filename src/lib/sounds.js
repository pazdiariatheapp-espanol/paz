// Sound utility for Paz app
// Updated to use local high-quality files in public/sounds/

const SOUNDS = {
  // UI & Welcome
  welcome: '/sounds/7th Crown 963Hz_.mp3',
  success: '/sounds/6th Third Eye 852 Hz_.mp3',
  
  // Breathing exercise sounds (Nature Loops)
  relaxing: '/sounds/Forest birds_.mp3',
  energizing: '/sounds/Gentle Wind_.mp3',
  box: '/sounds/Ocean waves_.mp3',
  sleep: '/sounds/Night Crickets_.mp3',

  // Chakra Frequencies (New!)
  throat: '/sounds/5th Throat 741Hz_.mp3',
  heart: '/sounds/4th Heart 639 Hz_ .mp3',
  solar: '/sounds/3rd Solar plexus_528 Hz_.mp3',
  sacral: '/sounds/2nd Sacral 417 Hz_.mp3'
}

class SoundManager {
  constructor() {
    this.sounds = {}
    this.currentLoop = null
    this.enabled = true
    this.volume = 0.5
    
    // Preload sounds
    this.preload()
  }
  
  preload() {
    Object.entries(SOUNDS).forEach(([key, url]) => {
      const audio = new Audio()
      audio.src = url
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
      sound.play().catch(err => {
        console.log('Sound blocked by browser:', err.message)
      })
    }
  }
  
  playLoop(soundName) {
    if (!this.enabled) return
    
    this.stopLoop()
    
    const sound = this.sounds[soundName]
    if (sound) {
      sound.loop = true
      sound.currentTime = 0
      sound.play().catch(err => {
        console.log('Sound blocked by browser:', err.message)
      })
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

// Create singleton instance
export const soundManager = new SoundManager()

// Export sound names for easy access
export const SOUND_NAMES = {
  WELCOME: 'welcome',
  RELAXING: 'relaxing',
  ENERGIZING: 'energizing',
  BOX: 'box',
  SLEEP: 'sleep',
  SUCCESS: 'success',
  THROAT: 'throat',
  HEART: 'heart',
  SOLAR: 'solar',
  SACRAL: 'sacral'
}