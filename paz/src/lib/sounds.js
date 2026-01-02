// Sound utility for Paz app
// Using free sounds from CDN

const SOUNDS = {
  // Welcome - soft bells chime
  welcome: 'https://assets.mixkit.co/active_storage/sfx/2515/2515-preview.mp3',
  
  // Breathing exercise sounds - nature loops
  relaxing: 'https://assets.mixkit.co/active_storage/sfx/1252/1252-preview.mp3', // Gentle rain
  energizing: 'https://assets.mixkit.co/active_storage/sfx/2827/2827-preview.mp3', // Fireplace crackling
  box: 'https://assets.mixkit.co/active_storage/sfx/189/189-preview.mp3', // Ocean waves
  sleep: 'https://assets.mixkit.co/active_storage/sfx/1251/1251-preview.mp3', // Night crickets
  
  // UI sounds
  success: 'https://assets.mixkit.co/active_storage/sfx/2190/2190-preview.mp3',
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
      // Reset and play
      sound.currentTime = 0
      sound.play().catch(err => {
        // Browser may block autoplay - that's okay
        console.log('Sound blocked by browser:', err.message)
      })
    }
  }
  
  playLoop(soundName) {
    if (!this.enabled) return
    
    // Stop any current loop
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
  
  // Fade out loop over duration (ms)
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
        sound.volume = this.volume // Reset volume for next play
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
}
